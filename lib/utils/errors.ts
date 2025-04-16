import { ForexApplicationError } from '../types/errors';

export function isForexError(error: unknown): error is ForexApplicationError {
    return error instanceof ForexApplicationError;
}

export function handleFetchError(error: unknown): never {
    if (error instanceof Error) {
        throw new ForexApplicationError(
            'NETWORK_ERROR',
            `Network request failed: ${error.message}`
        );
    }
    throw new ForexApplicationError(
        'UNKNOWN_ERROR',
        'Unknown network error occurred'
    );
}

export function handleResponseError(response: Response): never {
    throw new ForexApplicationError(
        'API_ERROR',
        `API request failed with status ${response.status}`
    );
}

export function handleJsonError(error: unknown): never {
    throw new ForexApplicationError(
        'API_ERROR',
        `Failed to parse JSON response: ${error instanceof Error ? error.message : 'Unknown error'}`
    );
} 