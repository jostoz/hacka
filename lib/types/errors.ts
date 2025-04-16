export type ErrorCode = 
    | 'AUTH_ERROR'
    | 'API_ERROR'
    | 'VALIDATION_ERROR'
    | 'DATA_ERROR'
    | 'NETWORK_ERROR'
    | 'UNKNOWN_ERROR';

export class ForexApplicationError extends Error {
    public readonly code: ErrorCode;

    constructor(code: ErrorCode, message: string) {
        super(message);
        this.code = code;
        this.name = 'ForexApplicationError';
        Object.setPrototypeOf(this, ForexApplicationError.prototype);
    }
} 