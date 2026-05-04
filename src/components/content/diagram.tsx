'use client';

import { useEffect, useId, useRef, useState } from 'react';
import { usePreferences } from '@/stores/preferences-store';

interface DiagramProps {
  type?: 'mermaid';
  children: string;
}

export function Diagram({ type = 'mermaid', children }: DiagramProps) {
  const id = useId().replace(/[^a-zA-Z0-9]/g, '');
  const ref = useRef<HTMLDivElement>(null);
  const mode = usePreferences((s) => s.mode);
  const [svg, setSvg] = useState<string>('');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (type !== 'mermaid') return;
    let cancelled = false;
    (async () => {
      try {
        const mermaid = (await import('mermaid')).default;
        mermaid.initialize({
          startOnLoad: false,
          theme: mode === 'dark' ? 'dark' : 'default',
          fontFamily: 'inherit',
          securityLevel: 'strict',
        });
        const cleaned = children.trim();
        const { svg: out } = await mermaid.render(`mermaid-${id}`, cleaned);
        if (!cancelled) {
          setSvg(out);
          setError(null);
        }
      } catch (e) {
        if (!cancelled) setError(e instanceof Error ? e.message : 'render error');
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [children, id, mode, type]);

  if (error) {
    return (
      <div className="my-4 rounded-md border border-destructive/30 bg-destructive/10 p-3 text-xs text-destructive">
        Mermaid error: {error}
      </div>
    );
  }

  return (
    <div
      ref={ref}
      className="my-4 flex justify-center overflow-auto rounded-md border border-border/60 bg-card/50 p-4 [&>svg]:h-auto [&>svg]:max-w-full"
      dangerouslySetInnerHTML={{ __html: svg }}
    />
  );
}
