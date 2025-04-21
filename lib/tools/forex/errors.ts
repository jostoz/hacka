export const ErrorCodes = {
  INVALID_DATA: 'INVALID_DATA',
  API_ERROR: 'API_ERROR',
  NETWORK_ERROR: 'NETWORK_ERROR',
  TOOL_EXECUTION_ERROR: 'TOOL_EXECUTION_ERROR',
  VALIDATION_ERROR: 'VALIDATION_ERROR',
  INSUFFICIENT_DATA: 'INSUFFICIENT_DATA',
  UNAUTHORIZED: 'UNAUTHORIZED',
  RATE_LIMIT_EXCEEDED: 'RATE_LIMIT_EXCEEDED',
  UNKNOWN_ERROR: 'UNKNOWN_ERROR'
} as const;

export type ForexErrorCode = typeof ErrorCodes[keyof typeof ErrorCodes];

export class ForexToolError extends Error {
  constructor(
    message: string,
    public code: ForexErrorCode,
    public details?: unknown
  ) {
    super(message);
    this.name = 'ForexToolError';
  }
}

export function isForexToolError(error: unknown): error is ForexToolError {
  return error instanceof ForexToolError;
} 