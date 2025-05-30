import type {
  CoreAssistantMessage,
  CoreMessage,
  CoreToolMessage,
  Message,
  ToolInvocation,
} from 'ai';
import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

import type { Message as DBMessage, Document } from '@/lib/db/schema';
import type { ToolResult } from '@/lib/types/types';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface ApplicationError extends Error {
  info: string;
  status: number;
}

export class ForexApplicationError extends Error {
  constructor(
    message: string,
    public info: string,
    public status: number,
    public toolName?: string
  ) {
    super(message);
    this.name = 'ForexApplicationError';
  }
}

export const handleForexError = (error: unknown) => {
  if (error instanceof ForexApplicationError) {
    console.error(`Forex Tool Error: ${error.toolName}`, error);
    return {
      error: true,
      message: error.message,
      info: error.info,
      status: error.status
    };
  }
  return {
    error: true,
    message: 'Unknown forex error',
    status: 500
  };
};

export async function fetcher<T>(
  url: string,
  options: RequestInit = {}
): Promise<T> {
  const response = await fetch(url, {
    ...options,
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
  });

  if (!response.ok) {
    const error = new Error('An error occurred while fetching the data.');
    error.message = await response.text();
    throw error;
  }

  return response.json();
}

export function getLocalStorage(key: string) {
  if (typeof window !== 'undefined') {
    return JSON.parse(localStorage.getItem(key) || '[]');
  }
  return [];
}

export function generateUUID(): string {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

function addToolMessageToChat({
  toolMessage,
  messages,
}: {
  toolMessage: CoreToolMessage;
  messages: Array<Message>;
}): Array<Message> {
  return messages.map((message) => {
    if (message.toolInvocations) {
      return {
        ...message,
        toolInvocations: message.toolInvocations.map((toolInvocation) => {
          const toolResult = toolMessage.content.find(
            (tool) => tool.toolCallId === toolInvocation.toolCallId,
          );

          if (toolResult) {
            return {
              ...toolInvocation,
              state: 'result',
              result: toolResult.result,
            };
          }

          return toolInvocation;
        }),
      };
    }

    return message;
  });
}

export function convertToUIMessages(
  messages: Array<DBMessage>,
): Array<Message> {
  return messages.reduce((chatMessages: Array<Message>, message) => {
    if (message.role === 'tool') {
      return addToolMessageToChat({
        toolMessage: message as CoreToolMessage,
        messages: chatMessages,
      });
    }

    let textContent = '';
    const toolInvocations: Array<ToolInvocation> = [];

    if (typeof message.content === 'string') {
      textContent = message.content;
    } else if (Array.isArray(message.content)) {
      for (const content of message.content) {
        if (content.type === 'text') {
          textContent += content.text;
        } else if (content.type === 'tool-call') {
          toolInvocations.push({
            state: 'call',
            toolCallId: content.toolCallId,
            toolName: content.toolName,
            args: content.args,
          });
        }
      }
    }

    chatMessages.push({
      id: message.id,
      role: message.role as Message['role'],
      content: textContent,
      toolInvocations,
    });

    return chatMessages;
  }, []);
}

export function sanitizeResponseMessages(
  messages: Array<CoreToolMessage | CoreAssistantMessage>,
): Array<CoreToolMessage | CoreAssistantMessage> {
  const toolResultIds: Array<string> = [];

  for (const message of messages) {
    if (message.role === 'tool') {
      for (const content of message.content) {
        if (content.type === 'tool-result') {
          toolResultIds.push(content.toolCallId);
        }
      }
    }
  }

  const messagesBySanitizedContent = messages.map((message) => {
    if (message.role !== 'assistant') return message;

    if (typeof message.content === 'string') return message;

    const sanitizedContent = message.content.filter((content) =>
      content.type === 'tool-call'
        ? toolResultIds.includes(content.toolCallId)
        : content.type === 'text'
          ? content.text.length > 0
          : true,
    );

    return {
      ...message,
      content: sanitizedContent,
    };
  });

  return messagesBySanitizedContent.filter(
    (message) => message.content.length > 0,
  );
}

export function sanitizeUIMessages(messages: Array<Message>): Array<Message> {
  const messagesBySanitizedToolInvocations = messages.map((message) => {
    if (message.role !== 'assistant') return message;

    if (!message.toolInvocations) return message;

    const toolResultIds: Array<string> = [];

    for (const toolInvocation of message.toolInvocations) {
      if (toolInvocation.state === 'result') {
        toolResultIds.push(toolInvocation.toolCallId);
      }
    }

    const sanitizedToolInvocations = message.toolInvocations.filter(
      (toolInvocation) =>
        toolInvocation.state === 'result' ||
        toolResultIds.includes(toolInvocation.toolCallId),
    );

    return {
      ...message,
      toolInvocations: sanitizedToolInvocations,
    };
  });

  return messagesBySanitizedToolInvocations.filter(
    (message) =>
      message.content.length > 0 ||
      (message.toolInvocations && message.toolInvocations.length > 0),
  );
}

export function getMostRecentUserMessage(messages: Array<CoreMessage>) {
  const userMessages = messages.filter((message) => message.role === 'user');
  return userMessages.at(-1);
}

export function getDocumentTimestampByIndex(
  documents: Array<Document>,
  index: number,
) {
  if (!documents) return new Date();
  if (index > documents.length) return new Date();

  return documents[index].createdAt;
}

interface MessageAnnotation {
  messageIdFromServer?: string;
}

export function getMessageIdFromAnnotations(message: Message) {
  if (!message.annotations) return message.id;

  const [annotation] = message.annotations as MessageAnnotation[];
  if (!annotation) return message.id;

  return annotation.messageIdFromServer || message.id;
}

export const formatForexNumber = (value: number, decimals = 4) => {
  return value.toFixed(decimals);
};

export const formatPipValue = (value: number) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD'
  }).format(value);
};

export const validateForexMessage = (message: CoreMessage): boolean => {
  return message.role === 'tool' && 
         message.content?.some(c => 
           ['fx-data', 'quant-signal', 'forecast', 'technical-analysis']
           .includes(c.type)
         );
};

interface ToolResponseValidation {
  type: string;
  data: unknown;
}

export const validateToolResponse = (response: unknown): boolean => {
  if (!response || typeof response !== 'object') {
    return false;
  }
  
  const toolResponse = response as ToolResponseValidation;
  return 'type' in toolResponse && 'data' in toolResponse;
};

interface ForexToolCall {
  name: string;
  arguments: Record<string, unknown>;
}

export const validateForexToolCall = (toolCall: unknown): boolean => {
  if (!toolCall || typeof toolCall !== 'object') {
    return false;
  }
  
  const forexCall = toolCall as ForexToolCall;
  return (
    'name' in forexCall &&
    typeof forexCall.name === 'string' &&
    'arguments' in forexCall &&
    typeof forexCall.arguments === 'object'
  );
};

export const createForexToolMessage = (
  toolName: string,
  result: unknown
): CoreToolMessage => {
  return {
    role: 'tool',
    content: [{
      type: 'tool-result',
      toolCallId: generateUUID(),
      toolName,
      result: result as ToolResult<unknown>
    }]
  };
};
