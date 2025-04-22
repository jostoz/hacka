'use client';

import type { Attachment, Message, ChatRequestOptions } from 'ai';
import { useChat } from 'ai/react';
import { AnimatePresence } from 'framer-motion';
import { useState, useCallback } from 'react';
import useSWR, { useSWRConfig } from 'swr';
import { useWindowSize } from 'usehooks-ts';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';

import { ChatHeader } from '@/components/chat-header';
import { PreviewMessage, ThinkingMessage } from '@/components/message';
import { useScrollToBottom } from '@/components/use-scroll-to-bottom';
import type { Vote } from '@/lib/db/schema';
import { fetcher } from '@/lib/utils';
import { useSession } from '@/hooks/useSession';

import { Block, type UIBlock } from './block';
import { BlockStreamHandler } from './block-stream-handler';
import { MultimodalInput } from './multimodal-input';
import { Overview } from './overview';

interface ChatError extends Error {
  code?: string;
  details?: string;
  status?: number;
}

export function Chat({
  id,
  initialMessages,
  selectedModelId,
}: {
  id: string;
  initialMessages: Array<Message>;
  selectedModelId: string;
}) {
  const router = useRouter();
  const { mutate } = useSWRConfig();
  const [error, setError] = useState<string | null>(null);
  const [isRetrying, setIsRetrying] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const { isValid: isSessionValid, error: sessionError, refreshSession } = useSession();

  const {
    messages,
    setMessages,
    handleSubmit: originalHandleSubmit,
    input,
    setInput,
    append,
    isLoading,
    stop,
    data: streamingData,
  } = useChat({
    body: { id, modelId: selectedModelId },
    initialMessages,
    onFinish: () => {
      setIsProcessing(false);
      mutate('/api/history');
    },
    onError: async (error: ChatError) => {
      setIsProcessing(false);
      console.error('Chat error:', error);
      
      // Añadir más información de diagnóstico
      console.debug('Error context:', {
        isOnline: navigator.onLine,
        sessionValid: isSessionValid,
        messageCount: messages.length,
        lastMessageType: messages.length > 0 ? messages[messages.length - 1].role : 'none'
      });
      
      // Manejar errores de timeout
      if (error.message?.includes('timeout') || error.message?.includes('aborted')) {
        setError('La respuesta está tomando demasiado tiempo. Por favor, intenta con una pregunta más corta o específica.');
        return;
      }

      // Manejar errores de streaming
      if (error.message?.includes('stream') || error.message?.includes('connection closed')) {
        setError('Se perdió la conexión con el servidor. Intentando reconectar...');
        await handleRetry();
        return;
      }

      // Manejar errores de autenticación
      if (error.status === 401 || error.message?.includes('401') || error.message?.includes('No autorizado')) {
        setError('Sesión expirada. Por favor, vuelve a iniciar sesión.');
        const sessionRefreshed = await refreshSession();
        if (!sessionRefreshed) {
          toast.error('No se pudo restaurar la sesión. Por favor, vuelve a iniciar sesión.');
          router.push('/login');
        }
        return;
      }

      // Manejar errores de red
      if (!navigator.onLine) {
        setError('Error de conexión. Por favor, verifica tu conexión a internet.');
        return;
      }

      // Manejar errores específicos de la aplicación
      if (error.code) {
        setError(`Error: ${error.message || 'Error desconocido'} (${error.code})`);
        if (error.details) {
          console.error('Detalles del error:', error.details);
        }
        return;
      }

      // Error genérico
      setError(error.message || 'Error en la comunicación con el servidor');
    },
    credentials: 'include',
  });

  const { width: windowWidth = 1920, height: windowHeight = 1080 } =
    useWindowSize();

  const [block, setBlock] = useState<UIBlock>({
    documentId: 'init',
    content: '',
    title: '',
    status: 'idle',
    isVisible: false,
    boundingBox: {
      top: windowHeight / 4,
      left: windowWidth / 4,
      width: 250,
      height: 50,
    },
  });

  const { data: votes } = useSWR<Array<Vote>>(
    `/api/vote?chatId=${id}`,
    async (url: string) => fetcher<Array<Vote>>(url, { credentials: 'include' })
  );

  const [messagesContainerRef, messagesEndRef] =
    useScrollToBottom<HTMLDivElement>();

  const [attachments, setAttachments] = useState<Array<Attachment>>([]);

  // Envolver handleSubmit para manejar el estado de procesamiento
  const handleSubmit = useCallback(async (
    event?: { preventDefault?: () => void },
    chatRequestOptions?: ChatRequestOptions,
  ) => {
    if (isProcessing || isLoading) {
      toast.error('Por favor espera a que termine la respuesta actual');
      return;
    }

    try {
      setIsProcessing(true);
      await originalHandleSubmit(event, chatRequestOptions);
    } catch (error) {
      console.error('Error in handleSubmit:', error);
      setIsProcessing(false);
      toast.error('Error al procesar tu mensaje');
    }
  }, [isProcessing, isLoading, originalHandleSubmit]);

  // Mejorar la función de stop
  const handleStop = useCallback(() => {
    stop();
    setIsProcessing(false);
    setMessages((messages) => messages.filter(m => m.role !== 'assistant' || m.content));
  }, [stop, setMessages]);

  // Función para reintentar mejorada
  const handleRetry = async () => {
    if (isRetrying) return;
    setIsRetrying(true);
    setError(null);
    
    let retryCount = 0;
    const maxRetries = 3;
    
    while (retryCount < maxRetries) {
      try {
        if (!navigator.onLine) {
          throw new Error('Sin conexión a internet');
        }

        // Esperar un tiempo exponencial entre reintentos
        if (retryCount > 0) {
          await new Promise(resolve => setTimeout(resolve, Math.pow(2, retryCount) * 1000));
        }

        if (!isSessionValid) {
          const sessionRefreshed = await refreshSession();
          if (!sessionRefreshed) {
            throw new Error('No se pudo restaurar la sesión');
          }
        }
        
        await mutate('/api/chat');
        toast.success('Conexión restaurada');
        return;
      } catch (err) {
        console.error(`Retry attempt ${retryCount + 1} failed:`, err);
        retryCount++;
        
        if (retryCount === maxRetries) {
          setError(err instanceof Error ? 
            err.message : 
            'No se pudo restablecer la conexión después de varios intentos'
          );
          toast.error('No se pudo restablecer la conexión');
        }
      }
    }
    
    setIsRetrying(false);
  };

  return (
    <>
      <div className="flex flex-col min-w-0 h-dvh bg-background">
        <ChatHeader selectedModelId={selectedModelId} />
        
        {error && (
          <div className="bg-red-50 p-4 rounded-md m-4">
            <div className="flex items-center">
              <div className="ml-3">
                <h3 className="text-sm font-medium text-red-800">
                  Error en la comunicación
                </h3>
                <div className="mt-2 text-sm text-red-700">
                  <p>{error}</p>
                </div>
                <div className="mt-4">
                  <button
                    type="button"
                    onClick={handleRetry}
                    disabled={isRetrying}
                    className="rounded-md bg-red-50 px-2 py-1.5 text-sm font-medium text-red-800 hover:bg-red-100 focus:outline-none focus:ring-2 focus:ring-red-600 focus:ring-offset-2"
                  >
                    {isRetrying ? 'Reintentando...' : 'Reintentar'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        <div
          ref={messagesContainerRef}
          className="flex flex-col min-w-0 gap-6 flex-1 overflow-y-scroll pt-4"
        >
          {messages.length === 0 && <Overview />}

          {messages.map((message, index) => (
            <PreviewMessage
              key={message.id}
              chatId={id}
              message={message}
              block={block}
              setBlock={setBlock}
              isLoading={isLoading && messages.length - 1 === index}
              vote={
                votes
                  ? votes.find((vote) => vote.messageId === message.id)
                  : undefined
              }
            />
          ))}

          {(isLoading || isProcessing) &&
            messages.length > 0 &&
            messages[messages.length - 1].role === 'user' && (
              <ThinkingMessage />
            )}

          <div
            ref={messagesEndRef}
            className="shrink-0 min-w-[24px] min-h-[24px]"
          />
        </div>

        <form className="flex mx-auto px-4 bg-background pb-4 md:pb-6 gap-2 w-full md:max-w-3xl">
          <MultimodalInput
            chatId={id}
            input={input}
            setInput={setInput}
            handleSubmit={handleSubmit}
            isLoading={isLoading || isProcessing}
            stop={handleStop}
            attachments={attachments}
            setAttachments={setAttachments}
            messages={messages}
            setMessages={setMessages}
            append={append}
          />
        </form>
      </div>

      <AnimatePresence>
        {block?.isVisible && (
          <Block
            chatId={id}
            input={input}
            setInput={setInput}
            handleSubmit={handleSubmit}
            isLoading={isLoading || isProcessing}
            stop={handleStop}
            attachments={attachments}
            setAttachments={setAttachments}
            append={append}
            block={block}
            setBlock={setBlock}
            messages={messages}
            setMessages={setMessages}
            votes={votes}
          />
        )}
      </AnimatePresence>

      <BlockStreamHandler streamingData={streamingData} setBlock={setBlock} />
    </>
  );
}
