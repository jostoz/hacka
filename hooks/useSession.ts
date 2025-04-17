import { useEffect, useState } from 'react';
import { auth } from '@/app/(auth)/auth';
import { logger } from '@/lib/utils/logger';

interface SessionState {
  isValid: boolean;
  isLoading: boolean;
  error: string | null;
  userId?: string;
}

export function useSession() {
  const [sessionState, setSessionState] = useState<SessionState>({
    isValid: false,
    isLoading: true,
    error: null
  });

  useEffect(() => {
    const validateSession = async () => {
      try {
        const session = await auth();
        setSessionState({
          isValid: Boolean(session?.user?.id),
          isLoading: false,
          error: null,
          userId: session?.user?.id
        });
      } catch (error) {
        logger.error('Error validating session', error);
        setSessionState({
          isValid: false,
          isLoading: false,
          error: 'Error al validar la sesión'
        });
      }
    };

    validateSession();
  }, []);

  const refreshSession = async () => {
    setSessionState(prev => ({ ...prev, isLoading: true, error: null }));
    try {
      const session = await auth();
      setSessionState({
        isValid: Boolean(session?.user?.id),
        isLoading: false,
        error: null,
        userId: session?.user?.id
      });
      return true;
    } catch (error) {
      logger.error('Error refreshing session', error);
      setSessionState(prev => ({
        ...prev,
        isLoading: false,
        error: 'Error al actualizar la sesión'
      }));
      return false;
    }
  };

  return {
    ...sessionState,
    refreshSession
  };
} 