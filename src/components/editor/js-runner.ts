// Runner de JS/TS minimalista en el mismo proceso del renderer.
// Captura console.* y devuelve los logs como string. Hay un timeout simple
// pero no es un sandbox de seguridad — esto es código que el propio usuario
// ejecuta sobre su propia máquina.

export interface RunResult {
  ok: boolean;
  output: string;
  error: string | null;
  durationMs: number;
}

export async function runJs(source: string, timeoutMs = 3000): Promise<RunResult> {
  const buffer: string[] = [];
  const sink = (level: string) =>
    (...args: unknown[]) => {
      buffer.push(args.map(stringify).join(' '));
      void level;
    };

  const ctx = {
    console: {
      log: sink('log'),
      info: sink('info'),
      warn: sink('warn'),
      error: sink('error'),
      debug: sink('debug'),
    },
  };

  const start = performance.now();
  try {
    const fn = new Function('console', `'use strict';\n${source}\n//# sourceURL=user-code.js`);
    const result = await Promise.race([
      Promise.resolve().then(() => fn(ctx.console)),
      new Promise<never>((_, reject) =>
        setTimeout(() => reject(new Error('Timeout: ejecución > ' + timeoutMs + 'ms')), timeoutMs),
      ),
    ]);
    if (result !== undefined) buffer.push('=> ' + stringify(result));
    return {
      ok: true,
      output: buffer.join('\n'),
      error: null,
      durationMs: Math.round(performance.now() - start),
    };
  } catch (e) {
    return {
      ok: false,
      output: buffer.join('\n'),
      error: e instanceof Error ? e.message : String(e),
      durationMs: Math.round(performance.now() - start),
    };
  }
}

function stringify(v: unknown): string {
  if (typeof v === 'string') return v;
  if (v === null || v === undefined) return String(v);
  if (typeof v === 'function') return v.toString();
  try {
    return JSON.stringify(v, null, 2);
  } catch {
    return String(v);
  }
}
