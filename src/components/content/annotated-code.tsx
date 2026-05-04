'use client';

import { useMemo, useState } from 'react';
import { Check, Copy, HelpCircle } from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

export interface CodeAnnotation {
  /** Substring del código a anotar. La búsqueda es literal. */
  match: string;
  /** Si el match aparece varias veces, cuál ocurrencia (1-indexed). Default: 1. */
  occurrence?: number;
  title: string;
  body: React.ReactNode;
}

interface AnnotatedCodeProps {
  language?: 'python' | 'sql' | 'js' | 'ts' | 'bash' | 'yaml' | 'json' | 'text';
  filename?: string;
  annotations: CodeAnnotation[];
  children: string;
}

interface Span {
  text: string;
  annotation: CodeAnnotation | null;
  key: number;
}

// Construye una secuencia de spans donde algunos están "anotados". Resuelve
// posiciones por substring + occurrence; ignora silenciosamente anotaciones
// cuyo match no aparezca.
function buildSpans(code: string, annotations: CodeAnnotation[]): Span[] {
  type Range = { start: number; end: number; annotation: CodeAnnotation };
  const ranges: Range[] = [];

  for (const a of annotations) {
    if (!a.match) continue;
    const target = a.occurrence ?? 1;
    let from = 0;
    let found = 0;
    while (from <= code.length) {
      const idx = code.indexOf(a.match, from);
      if (idx === -1) break;
      found += 1;
      if (found === target) {
        ranges.push({ start: idx, end: idx + a.match.length, annotation: a });
        break;
      }
      from = idx + a.match.length;
    }
  }

  ranges.sort((x, y) => x.start - y.start);
  // Filtra solapamientos: la primera gana.
  const filtered: Range[] = [];
  for (const r of ranges) {
    if (filtered.length === 0 || r.start >= filtered[filtered.length - 1]!.end) {
      filtered.push(r);
    }
  }

  const spans: Span[] = [];
  let cursor = 0;
  let key = 0;
  for (const r of filtered) {
    if (r.start > cursor) {
      spans.push({ text: code.slice(cursor, r.start), annotation: null, key: key++ });
    }
    spans.push({ text: code.slice(r.start, r.end), annotation: r.annotation, key: key++ });
    cursor = r.end;
  }
  if (cursor < code.length) {
    spans.push({ text: code.slice(cursor), annotation: null, key: key++ });
  }
  return spans;
}

export function AnnotatedCode({
  language = 'text',
  filename,
  annotations,
  children,
}: AnnotatedCodeProps) {
  const [copied, setCopied] = useState(false);
  const spans = useMemo(() => buildSpans(children, annotations), [children, annotations]);
  const annotated = spans.filter((s) => s.annotation).length;

  async function copy() {
    try {
      await navigator.clipboard.writeText(children);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      /* noop */
    }
  }

  return (
    <div className="my-4 overflow-hidden rounded-lg border border-border/60 bg-muted/30">
      <div className="flex items-center justify-between gap-2 border-b border-border/60 bg-muted/40 px-3 py-1.5 text-xs">
        <div className="flex items-center gap-2">
          <span className="font-mono text-muted-foreground">{filename ?? language}</span>
          {annotated > 0 && (
            <span className="inline-flex items-center gap-1 rounded-full bg-primary/15 px-1.5 py-0.5 text-[10px] font-medium text-primary">
              <HelpCircle className="h-3 w-3" />
              {annotated} {annotated === 1 ? 'nota' : 'notas'}
            </span>
          )}
        </div>
        <Button variant="ghost" size="sm" className="h-7 gap-1 px-2" onClick={copy}>
          {copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
          <span className="text-xs">{copied ? 'Copiado' : 'Copiar'}</span>
        </Button>
      </div>
      <pre className={cn('overflow-x-auto p-4 text-sm leading-6', `language-${language}`)}>
        <code className="font-mono">
          {spans.map((s) =>
            s.annotation ? (
              <Popover key={s.key}>
                <PopoverTrigger asChild>
                  <button
                    type="button"
                    className="group relative cursor-help bg-primary/15 align-baseline outline-none transition hover:bg-primary/25 focus-visible:ring-2 focus-visible:ring-ring"
                    style={{
                      borderBottom: '1px dashed hsl(var(--primary))',
                      padding: '0 1px',
                    }}
                  >
                    {s.text}
                    <HelpCircle className="ml-0.5 inline h-3 w-3 align-middle text-primary opacity-70 group-hover:opacity-100" />
                  </button>
                </PopoverTrigger>
                <PopoverContent align="center" className="w-80">
                  <div className="space-y-2">
                    <h4 className="text-sm font-semibold">{s.annotation.title}</h4>
                    <div className="text-xs leading-relaxed text-muted-foreground">
                      {s.annotation.body}
                    </div>
                  </div>
                </PopoverContent>
              </Popover>
            ) : (
              <span key={s.key}>{s.text}</span>
            ),
          )}
        </code>
      </pre>
    </div>
  );
}
