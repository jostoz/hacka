export class ForexApplicationError extends Error {
  constructor(message: string, public readonly cause?: unknown) {
    super(message);
    this.name = 'ForexApplicationError';
    
    // Mantener la stack trace correcta
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, ForexApplicationError);
    }
  }
} 