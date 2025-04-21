interface ForexToolError extends Error {
  code: string;
  details?: unknown;
}

export interface LogContext {
  timestamp: string;
  component?: string;
  action?: string;
  [key: string]: unknown;
}

export const logger = {
  error: (message: string, error: unknown, context?: Record<string, unknown>) => {
    const errorDetails = error instanceof Error ? {
      name: error.name,
      message: error.message,
      stack: error.stack,
      ...(error as ForexToolError).code ? { code: (error as ForexToolError).code } : {},
      ...(error as ForexToolError).details ? { details: (error as ForexToolError).details } : {}
    } : error;

    console.error({
      message,
      error: errorDetails,
      context: {
        ...context,
        timestamp: new Date().toISOString()
      }
    });
  },
  
  info: (message: string, data?: Record<string, unknown>) => {
    console.log({
      message,
      data,
      timestamp: new Date().toISOString()
    });
  },

  warn: (message: string, data?: Record<string, unknown>) => {
    console.warn({
      message,
      data,
      timestamp: new Date().toISOString()
    });
  },

  debug: (message: string, data?: Record<string, unknown>) => {
    if (process.env.NODE_ENV === 'development') {
      console.debug({
        message,
        data,
        timestamp: new Date().toISOString()
      });
    }
  }
}; 