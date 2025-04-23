import fetch from 'node-fetch';
import type { CapitalSession, CapitalSessionConfig } from '../../../types/capital';
import { CapitalSessionConfigSchema } from '../../../types/capital';
import { ForexApplicationError } from '../../../errors/forex-application-error';

export class CapitalAuthService {
    private static instance: CapitalAuthService;
    private session: CapitalSession | null = null;
    private apiKey: string | null = null;
    private readonly baseUrl = 'https://api.capital.com/v1';

    private constructor() {}

    static getInstance(): CapitalAuthService {
        if (!CapitalAuthService.instance) {
            CapitalAuthService.instance = new CapitalAuthService();
        }
        return CapitalAuthService.instance;
    }

    async initialize(config: CapitalSessionConfig): Promise<void> {
        try {
            // Validate config
            CapitalSessionConfigSchema.parse(config);
            
            // Store API key
            this.apiKey = config.apiKey;

            const response = await fetch(`${this.baseUrl}/session`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CAP-API-KEY': config.apiKey
                },
                body: JSON.stringify({
                    identifier: config.identifier,
                    password: config.password
                })
            });

            if (!response.ok) {
                throw new ForexApplicationError({
                    message: 'Authentication failed',
                    code: 'AUTH_ERROR',
                    details: { status: response.status }
                });
            }

            const data = await response.json();
            this.session = {
                sessionToken: data.token,
                expires: Date.now() + (data.expires * 1000)
            };
        } catch (error) {
            if (error instanceof ForexApplicationError) {
                throw error;
            }
            throw new ForexApplicationError({
                message: 'Failed to initialize Capital.com session',
                code: 'AUTH_ERROR',
                details: error instanceof Error ? { message: error.message } : undefined
            });
        }
    }

    async getToken(): Promise<string> {
        if (!this.session || Date.now() >= this.session.expires) {
            throw new ForexApplicationError({
                message: 'No valid session available',
                code: 'AUTH_ERROR'
            });
        }
        return this.session.sessionToken;
    }

    async getApiKey(): Promise<string> {
        if (!this.apiKey) {
            throw new ForexApplicationError({
                message: 'API Key not available',
                code: 'AUTH_ERROR'
            });
        }
        return this.apiKey;
    }

    async getAuthHeaders(): Promise<Record<string, string>> {
        if (!this.session || Date.now() >= this.session.expires) {
            throw new ForexApplicationError({
                message: 'No valid session available',
                code: 'AUTH_ERROR'
            });
        }

        return {
            'Authorization': `Bearer ${this.session.sessionToken}`,
            'Content-Type': 'application/json'
        };
    }
} 