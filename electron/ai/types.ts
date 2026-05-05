import type { ProviderId } from '../../src/lib/ai/providers-meta';

export type AIRole = 'system' | 'user' | 'assistant';

export interface AIMessage {
  role: AIRole;
  content: string;
}

export interface ChatOptions {
  model: string;
  messages: AIMessage[];
  temperature?: number;
  maxTokens?: number;
  signal?: AbortSignal;
}

export type StreamEvent =
  | { type: 'delta'; text: string }
  | { type: 'usage'; inputTokens: number; outputTokens: number }
  | { type: 'done' }
  | { type: 'error'; error: string; status?: number; retryable?: boolean };

export interface ValidationResult {
  ok: boolean;
  error?: string;
  models?: string[];
}

export interface AIProvider {
  readonly id: ProviderId;
  readonly endpoint: string;
  chat(opts: ChatOptions, key: string): AsyncGenerator<StreamEvent>;
  validateKey(key: string, customEndpoint?: string): Promise<ValidationResult>;
}
