import { providers as meta, type ProviderId } from '../../src/lib/ai/providers-meta';
import type { AIProvider, ChatOptions, StreamEvent, ValidationResult } from './types';
import { streamOpenAICompatible, validateOpenAICompatible } from './openai-stream';

class OpenAICompatProvider implements AIProvider {
  constructor(
    public readonly id: ProviderId,
    public readonly endpoint: string,
  ) {}

  async *chat(opts: ChatOptions, key: string): AsyncGenerator<StreamEvent> {
    yield* streamOpenAICompatible(this.endpoint, key, opts);
  }

  async validateKey(key: string): Promise<ValidationResult> {
    const m = meta[this.id];
    return validateOpenAICompatible(this.endpoint, key, m.defaultModel);
  }
}

class CustomProvider implements AIProvider {
  readonly id: ProviderId = 'custom';
  readonly endpoint = '';

  async *chat(opts: ChatOptions, key: string): AsyncGenerator<StreamEvent> {
    // El endpoint custom se inyecta a través del orchestrator vía customEndpoint.
    void opts;
    void key;
    yield {
      type: 'error',
      error: 'custom provider necesita customEndpoint configurado en ai_keys',
    };
  }

  async validateKey(key: string, customEndpoint?: string): Promise<ValidationResult> {
    if (!customEndpoint) return { ok: false, error: 'falta customEndpoint' };
    return validateOpenAICompatible(customEndpoint, key, 'gpt-4o-mini');
  }
}

const registry: Record<ProviderId, AIProvider> = {
  cerebras: new OpenAICompatProvider('cerebras', meta.cerebras.endpoint),
  groq: new OpenAICompatProvider('groq', meta.groq.endpoint),
  gemini: new OpenAICompatProvider('gemini', meta.gemini.endpoint),
  openrouter: new OpenAICompatProvider('openrouter', meta.openrouter.endpoint),
  custom: new CustomProvider(),
};

export function getProvider(id: ProviderId): AIProvider {
  return registry[id];
}

export async function* chatWithCustomEndpoint(
  endpoint: string,
  key: string,
  opts: ChatOptions,
): AsyncGenerator<StreamEvent> {
  yield* streamOpenAICompatible(endpoint, key, opts);
}
