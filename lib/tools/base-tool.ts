export interface ToolResultPart<T = unknown> {
  type: string;
  content: T;
}

export interface ToolResult {
  success: boolean;
  parts: ToolResultPart[];
  error?: Error;
}

export interface BaseTool {
  name: string;
  description: string;
  parameters: Record<string, unknown>;
  execute(params: Record<string, unknown>): Promise<ToolResult>;
} 