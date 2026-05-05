import type { ChatOptions, StreamEvent } from './types';

/**
 * Cliente OpenAI-compatible para chat completions con streaming SSE.
 * Sirve a Cerebras, Groq, Gemini (compat endpoint), OpenRouter y endpoints custom.
 */
export async function* streamOpenAICompatible(
  endpoint: string,
  key: string,
  opts: ChatOptions,
  extraHeaders: Record<string, string> = {},
): AsyncGenerator<StreamEvent> {
  let response: Response;
  try {
    response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${key}`,
        ...extraHeaders,
      },
      body: JSON.stringify({
        model: opts.model,
        messages: opts.messages,
        temperature: opts.temperature ?? 0.6,
        max_tokens: opts.maxTokens,
        stream: true,
      }),
      signal: opts.signal,
    });
  } catch (e) {
    yield {
      type: 'error',
      error: e instanceof Error ? e.message : 'network error',
      retryable: true,
    };
    return;
  }

  if (!response.ok) {
    let errMsg = `HTTP ${response.status}`;
    try {
      const body = await response.text();
      errMsg = parseProviderError(body) || errMsg;
    } catch {
      /* noop */
    }
    yield {
      type: 'error',
      error: errMsg,
      status: response.status,
      retryable: response.status === 429 || response.status >= 500,
    };
    return;
  }

  const reader = response.body?.getReader();
  if (!reader) {
    yield { type: 'error', error: 'no response body' };
    return;
  }

  const decoder = new TextDecoder();
  let buffer = '';
  let inputTokens = 0;
  let outputTokens = 0;

  try {
    while (true) {
      const { value, done } = await reader.read();
      if (done) break;
      buffer += decoder.decode(value, { stream: true });

      let nlIdx;
      while ((nlIdx = buffer.indexOf('\n')) !== -1) {
        const line = buffer.slice(0, nlIdx).trim();
        buffer = buffer.slice(nlIdx + 1);
        if (!line.startsWith('data:')) continue;
        const data = line.slice(5).trim();
        if (data === '[DONE]') {
          if (inputTokens || outputTokens)
            yield { type: 'usage', inputTokens, outputTokens };
          yield { type: 'done' };
          return;
        }
        try {
          const json = JSON.parse(data) as {
            choices?: Array<{ delta?: { content?: string } }>;
            usage?: { prompt_tokens?: number; completion_tokens?: number };
          };
          const delta = json.choices?.[0]?.delta?.content;
          if (delta) yield { type: 'delta', text: delta };
          if (json.usage) {
            inputTokens = json.usage.prompt_tokens ?? inputTokens;
            outputTokens = json.usage.completion_tokens ?? outputTokens;
          }
        } catch {
          // SSE malformado: ignoramos la línea
        }
      }
    }
  } catch (e) {
    yield {
      type: 'error',
      error: e instanceof Error ? e.message : 'stream read error',
    };
    return;
  }

  if (inputTokens || outputTokens) yield { type: 'usage', inputTokens, outputTokens };
  yield { type: 'done' };
}

function parseProviderError(body: string): string | null {
  try {
    const j = JSON.parse(body) as {
      error?: { message?: string } | string;
    };
    if (typeof j.error === 'string') return j.error;
    if (j.error?.message) return j.error.message;
  } catch {
    /* noop */
  }
  return body.slice(0, 200) || null;
}

export async function validateOpenAICompatible(
  endpoint: string,
  key: string,
  model: string,
  extraHeaders: Record<string, string> = {},
): Promise<{ ok: boolean; error?: string }> {
  try {
    const res = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${key}`,
        ...extraHeaders,
      },
      body: JSON.stringify({
        model,
        messages: [{ role: 'user', content: 'ping' }],
        max_tokens: 1,
        stream: false,
      }),
    });
    if (res.ok) return { ok: true };
    const txt = await res.text();
    return { ok: false, error: parseProviderError(txt) ?? `HTTP ${res.status}` };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : 'network error' };
  }
}
