import {
  type Message,
  StreamData,
  convertToCoreMessages,
  streamObject,
  streamText,
  CoreMessage,
  type CoreAssistantMessage,
  type CoreToolMessage,
} from 'ai';
import { z } from 'zod';

import { auth } from '@/app/(auth)/auth';
import { customModel } from '@/lib/ai';
import { models } from '@/lib/ai/models';
import { systemPrompt } from '@/lib/ai/prompts';
import {
  deleteChatById,
  getChatById,
  getDocumentById,
  saveChat,
  saveDocument,
  saveMessages,
  saveSuggestions,
} from '@/lib/db/queries';
import type { Suggestion } from '@/lib/db/schema';
import {
  generateUUID,
  getMostRecentUserMessage,
  sanitizeResponseMessages,
} from '@/lib/utils';

import { generateTitleFromUserMessage } from '../../actions';
import { tools } from '@/lib/tools';
import { forexTools } from '@/lib/tools/forex';
import { type ToolResultPart, type ToolResult, type FxData, type QuantSignal, type Forecast } from '@/lib/types/types';

export const maxDuration = 60;

type AllowedTools =
  | 'createDocument'
  | 'updateDocument'
  | 'requestSuggestions'
  | 'getWeather'
  | 'calculatePipValue'
  | 'fetchFxRates'
  | 'fetchTechnicalAnalysis';

const forexToolNames: AllowedTools[] = [
  'calculatePipValue', 
  'fetchFxRates', 
  'fetchTechnicalAnalysis'
];

const blocksTools: AllowedTools[] = [
  'createDocument',
  'updateDocument',
  'requestSuggestions',
];

const weatherTools: AllowedTools[] = ['getWeather'];

const allTools: AllowedTools[] = [
  ...blocksTools, 
  ...weatherTools, 
  ...forexToolNames
];

const analysisPrompt = `
Bienvenido a FXperto, una plataforma de estrategias cambiarias. Por favor, genera un análisis financiero con la siguiente estructura:

1. **Introducción**: Breve descripción del contexto actual del mercado.
2. **Análisis de Datos**: Presenta los datos financieros relevantes, incluyendo tendencias y patrones observados.
3. **Estrategias Recomendadas**: Ofrece estrategias basadas en los datos analizados.
4. **Conclusiones**: Resumen de los hallazgos clave y recomendaciones finales.

Asegúrate de utilizar encabezados para cada sección y presentar los datos de manera clara y concisa.
`;

// Definir las interfaces necesarias
interface FunctionCall {
  name: string;
  arguments: string;
}

interface ToolCallMessage extends CoreToolMessage {
  function_call: FunctionCall;
}

interface ToolMessage {
  role: 'tool';
  name: string;
  content: Array<{
    type: 'tool-result';
    toolCallId: string;
    result: any;
  }>;
}

export async function POST(request: Request) {
  const {
    id,
    messages,
    modelId,
  }: { id: string; messages: Array<Message>; modelId: string } =
    await request.json();

  const session = await auth();

  if (!session || !session.user || !session.user.id) {
    return new Response('Unauthorized', { status: 401 });
  }

  const model = models.find((model) => model.id === modelId);

  if (!model) {
    return new Response('Model not found', { status: 404 });
  }

  const coreMessages = convertToCoreMessages(messages);
  const userMessage = getMostRecentUserMessage(coreMessages);

  if (!userMessage) {
    return new Response('No user message found', { status: 400 });
  }

  const chat = await getChatById({ id });

  if (!chat) {
    const title = await generateTitleFromUserMessage({ message: userMessage });
    await saveChat({ id, userId: session.user.id, title });
  }

  await saveMessages({
    messages: [
      { ...userMessage, id: generateUUID(), createdAt: new Date(), chatId: id },
    ],
  });

  const streamingData = new StreamData();

  const result = await streamText({
    model: customModel(model.apiIdentifier),
    system: systemPrompt(
      Array.isArray(userMessage.content) 
        ? userMessage.content
            .filter(part => typeof part === 'string' || 'text' in part)
            .map(part => typeof part === 'string' ? part : part.text)
            .join(' ')
        : userMessage.content
    ),
    messages: coreMessages,
    maxSteps: 5,
    experimental_activeTools: allTools,
    tools: {
      getWeather: {
        description: 'Get the current weather at a location',
        parameters: z.object({
          latitude: z.number(),
          longitude: z.number(),
        }),
        execute: async ({ latitude, longitude }) => {
          const response = await fetch(
            `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m&hourly=temperature_2m&daily=sunrise,sunset&timezone=auto`,
          );

          const weatherData = await response.json();
          return weatherData;
        },
      },
      createDocument: {
        description: 'Create a document for a writing activity',
        parameters: z.object({
          title: z.string(),
        }),
        execute: async ({ title }) => {
          const id = generateUUID();
          let draftText = '';

          streamingData.append({
            type: 'id',
            content: id,
          });

          streamingData.append({
            type: 'title',
            content: title,
          });

          streamingData.append({
            type: 'clear',
            content: '',
          });

          const { fullStream } = await streamText({
            model: customModel(model.apiIdentifier),
            system: analysisPrompt,
            prompt: title,
          });

          for await (const delta of fullStream) {
            const { type } = delta;

            if (type === 'text-delta') {
              const { textDelta } = delta;

              draftText += textDelta;
              streamingData.append({
                type: 'text-delta',
                content: textDelta,
              });
            }
          }

          streamingData.append({ type: 'finish', content: '' });

          if (session.user?.id) {
            await saveDocument({
              id,
              title,
              content: draftText,
              userId: session.user.id,
            });
          }

          return {
            id,
            title,
            content: 'A document was created and is now visible to the user.',
          };
        },
      },
      updateDocument: {
        description: 'Update a document with the given description',
        parameters: z.object({
          id: z.string().describe('The ID of the document to update'),
          description: z
            .string()
            .describe('The description of changes that need to be made'),
        }),
        execute: async ({ id, description }) => {
          const document = await getDocumentById({ id });

          if (!document) {
            return {
              error: 'Document not found',
            };
          }

          const { content: currentContent } = document;
          let draftText = '';

          streamingData.append({
            type: 'clear',
            content: document.title,
          });

          const { fullStream } = await streamText({
            model: customModel(model.apiIdentifier),
            system:
              'You are a helpful writing assistant. Based on the description, please update the piece of writing.',
            experimental_providerMetadata: {
              openai: {
                prediction: {
                  type: 'content',
                  content: currentContent,
                },
              },
            },
            messages: [
              {
                role: 'user',
                content: description,
              },
              { role: 'user', content: currentContent },
            ],
          });

          for await (const delta of fullStream) {
            const { type } = delta;

            if (type === 'text-delta') {
              const { textDelta } = delta;

              draftText += textDelta;
              streamingData.append({
                type: 'text-delta',
                content: textDelta,
              });
            }
          }

          streamingData.append({ type: 'finish', content: '' });

          if (session.user?.id) {
            await saveDocument({
              id,
              title: document.title,
              content: draftText,
              userId: session.user.id,
            });
          }

          return {
            id,
            title: document.title,
            content: 'The document has been updated successfully.',
          };
        },
      },
      requestSuggestions: {
        description: 'Request suggestions for a document',
        parameters: z.object({
          documentId: z
            .string()
            .describe('The ID of the document to request edits'),
        }),
        execute: async ({ documentId }) => {
          const document = await getDocumentById({ id: documentId });

          if (!document || !document.content) {
            return {
              error: 'Document not found',
            };
          }

          const suggestions: Array<
            Omit<Suggestion, 'userId' | 'createdAt' | 'documentCreatedAt'>
          > = [];

          const { elementStream } = await streamObject({
            model: customModel(model.apiIdentifier),
            system:
              'You are a help writing assistant. Given a piece of writing, please offer suggestions to improve the piece of writing and describe the change. It is very important for the edits to contain full sentences instead of just words. Max 5 suggestions.',
            prompt: document.content,
            output: 'array',
            schema: z.object({
              originalSentence: z.string().describe('The original sentence'),
              suggestedSentence: z.string().describe('The suggested sentence'),
              description: z
                .string()
                .describe('The description of the suggestion'),
            }),
          });

          for await (const element of elementStream) {
            const suggestion = {
              originalText: element.originalSentence,
              suggestedText: element.suggestedSentence,
              description: element.description,
              id: generateUUID(),
              documentId: documentId,
              isResolved: false,
            };

            streamingData.append({
              type: 'suggestion',
              content: suggestion,
            });

            suggestions.push(suggestion);
          }

          if (session.user?.id) {
            const userId = session.user.id;

            await saveSuggestions({
              suggestions: suggestions.map((suggestion) => ({
                ...suggestion,
                userId,
                createdAt: new Date(),
                documentCreatedAt: document.createdAt,
              })),
            });
          }

          return {
            id: documentId,
            title: document.title,
            message: 'Suggestions have been added to the document',
          };
        },
      },
      calculatePipValue: forexTools.calculate_quant_signal,
      fetchFxRates: forexTools.get_fx_data,
      fetchTechnicalAnalysis: forexTools.fetchTechnicalAnalysis
    },
    toolChoice: "auto",
    onFinish: async ({ responseMessages }) => {
      if (session.user?.id) {
        try {
          const toolCalls = responseMessages.filter((m): m is ToolCallMessage => {
            return m.role === 'tool' && 
                   'function_call' in m && 
                   typeof m.function_call === 'object' &&
                   m.function_call !== null &&
                   'name' in m.function_call &&
                   'arguments' in m.function_call;
          });

          if (toolCalls.length > 0) {
            for (const toolCall of toolCalls) {
              const { name: toolName, arguments: argsString } = toolCall.function_call;
              
              if (toolName in forexTools) {
                const typedToolName = toolName as keyof typeof forexTools;
                const args = JSON.parse(argsString);
                const result = await forexTools[typedToolName].execute(args);
                
                const toolContent: ToolResultPart = {
                  type: 'tool-result',
                  toolCallId: toolName,
                  toolName: toolName,
                  result: result
                };

                const toolMessage = {
                  role: "tool",
                  content: [toolContent]
                } as CoreToolMessage;

                responseMessages.push(toolMessage);
              }
            }
          }

          await saveMessages({
            messages: responseMessages.map((message) => ({
              ...message,
              id: generateUUID(),
              createdAt: new Date(),
              chatId: id,
            })),
          });
        } catch (error) {
          console.error('Failed to process tool calls:', error);
          responseMessages.push({
            role: "tool",
            content: [{
              type: 'tool-result',
              toolCallId: 'error',
              toolName: 'error',
              result: { error: 'Failed to process tool calls' }
            }]
          } as CoreToolMessage);
        }
      }

      streamingData.close();
    },
    experimental_telemetry: {
      isEnabled: true,
      functionId: 'stream-text',
    },
  });

  return result.toDataStreamResponse({
    data: streamingData,
  });
}

export async function DELETE(request: Request) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get('id');

  if (!id) {
    return new Response('Not Found', { status: 404 });
  }

  const session = await auth();

  if (!session || !session.user) {
    return new Response('Unauthorized', { status: 401 });
  }

  try {
    const chat = await getChatById({ id });

    if (chat.userId !== session.user.id) {
      return new Response('Unauthorized', { status: 401 });
    }

    await deleteChatById({ id });

    return new Response('Chat deleted', { status: 200 });
  } catch (error) {
    return new Response('An error occurred while processing your request', {
      status: 500,
    });
  }
}
