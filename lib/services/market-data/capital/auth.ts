import { CapitalSession, CapitalSessionConfig, CapitalSessionConfigSchema } from '@/lib/types/capital';
import { ForexApplicationError } from '@/lib/types/errors';

export class CapitalAuthService {
    private static instance: CapitalAuthService;
    private session: CapitalSession | null = null;
    private config: CapitalSessionConfig | null = null;
    private baseUrl: string;

    private constructor() {
        this.baseUrl = 'https://api-capital.backend-capital.com/api/v1';
    }

    public static getInstance(): CapitalAuthService {
        if (!CapitalAuthService.instance) {
            CapitalAuthService.instance = new CapitalAuthService();
        }
        return CapitalAuthService.instance;
    }

    public async initialize(config: CapitalSessionConfig): Promise<void> {
        try {
            const validatedConfig = CapitalSessionConfigSchema.parse(config);
            this.config = validatedConfig;
            await this.authenticate();
        } catch (error) {
            if (error instanceof Error) {
                throw new ForexApplicationError('AUTH_ERROR', `Failed to initialize Capital.com service: ${error.message}`);
            }
            throw error;
        }
    }

    public async authenticate(): Promise<void> {
        if (!this.config) {
            throw new ForexApplicationError('AUTH_ERROR', 'Capital.com service not initialized');
        }

        try {
            const response = await fetch(`${this.baseUrl}/session`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CAP-API-KEY': this.config.apiKey,
                },
                body: JSON.stringify({
                    identifier: this.config.identifier,
                    password: this.config.password,
                }),
            });

            if (!response.ok) {
                throw new ForexApplicationError(
                    'AUTH_ERROR',
                    `Authentication failed: ${response.statusText}`
                );
            }

            const cst = response.headers.get('CST');
            const securityToken = response.headers.get('X-SECURITY-TOKEN');

            if (!cst || !securityToken) {
                throw new ForexApplicationError(
                    'AUTH_ERROR',
                    'Missing authentication tokens in response'
                );
            }

            this.session = {
                cst,
                securityToken,
                expires: Date.now() + 4 * 60 * 60 * 1000 // 4 hours
            };
        } catch (error) {
            if (error instanceof ForexApplicationError) {
                throw error;
            }
            throw new ForexApplicationError(
                'AUTH_ERROR',
                `Failed to authenticate with Capital.com: ${error instanceof Error ? error.message : 'Unknown error'}`
            );
        }
    }

    public async getAuthHeaders(): Promise<Record<string, string>> {
        if (!this.session || Date.now() >= this.session.expires) {
            await this.authenticate();
        }

        if (!this.session) {
            throw new ForexApplicationError('AUTH_ERROR', 'No valid session available');
        }

        return {
            'X-SECURITY-TOKEN': this.session.securityToken,
            'CST': this.session.cst,
            'X-CAP-API-KEY': this.config?.apiKey || '',
        };
    }

    public isAuthenticated(): boolean {
        return this.session !== null && Date.now() < this.session.expires;
    }
} 