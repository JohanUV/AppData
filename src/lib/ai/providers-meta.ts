// Metadata pública de cada provider, usable desde renderer (sin secretos).

export type ProviderId = 'cerebras' | 'groq' | 'gemini' | 'openrouter' | 'custom';

export interface ProviderMeta {
  id: ProviderId;
  name: string;
  endpoint: string;
  signupUrl: string;
  defaultModel: string;
  models: string[];
  rateLimits: { perMinute?: number; perDay?: number; tokensPerDay?: number };
  privacyNote?: string;
  notes?: string;
}

export const providers: Record<ProviderId, ProviderMeta> = {
  cerebras: {
    id: 'cerebras',
    name: 'Cerebras',
    endpoint: 'https://api.cerebras.ai/v1/chat/completions',
    signupUrl: 'https://cloud.cerebras.ai',
    defaultModel: 'llama-3.3-70b',
    models: ['llama-3.3-70b', 'llama3.1-8b', 'llama-4-scout-17b-16e-instruct'],
    rateLimits: { perMinute: 30, perDay: 14_400, tokensPerDay: 1_000_000 },
  },
  groq: {
    id: 'groq',
    name: 'Groq',
    endpoint: 'https://api.groq.com/openai/v1/chat/completions',
    signupUrl: 'https://console.groq.com',
    defaultModel: 'llama-3.3-70b-versatile',
    models: ['llama-3.3-70b-versatile', 'llama-3.1-8b-instant', 'mixtral-8x7b-32768'],
    rateLimits: { perMinute: 30, perDay: 1_000 },
    notes: '14.400 req/día disponibles para Llama 3.1 8B Instant',
  },
  gemini: {
    id: 'gemini',
    name: 'Google Gemini',
    endpoint: 'https://generativelanguage.googleapis.com/v1beta/openai/chat/completions',
    signupUrl: 'https://aistudio.google.com',
    defaultModel: 'gemini-2.5-flash',
    models: ['gemini-2.5-flash', 'gemini-2.5-pro', 'gemini-2.0-flash'],
    rateLimits: { perMinute: 15, perDay: 1_500 },
    privacyNote: 'Google puede usar tus datos para entrenar modelos.',
  },
  openrouter: {
    id: 'openrouter',
    name: 'OpenRouter',
    endpoint: 'https://openrouter.ai/api/v1/chat/completions',
    signupUrl: 'https://openrouter.ai',
    defaultModel: 'meta-llama/llama-3.3-70b-instruct:free',
    models: [
      'meta-llama/llama-3.3-70b-instruct:free',
      'google/gemini-2.0-flash-exp:free',
      'mistralai/mistral-7b-instruct:free',
    ],
    rateLimits: { perMinute: 20, perDay: 50 },
    notes: 'Modelos :free son gratuitos pero con límites más estrictos.',
  },
  custom: {
    id: 'custom',
    name: 'Custom (OpenAI-compatible)',
    endpoint: '',
    signupUrl: '',
    defaultModel: '',
    models: [],
    rateLimits: {},
    notes: 'Cualquier endpoint compatible con la API de OpenAI Chat Completions.',
  },
};

export const providerOrder: ProviderId[] = [
  'cerebras',
  'groq',
  'gemini',
  'openrouter',
  'custom',
];

export function getProviderMeta(id: ProviderId): ProviderMeta {
  return providers[id];
}
