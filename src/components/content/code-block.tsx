'use client';

import { useState } from 'react';
import { Check, Copy } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface CodeBlockProps {
  language?: 'python' | 'sql' | 'js' | 'ts' | 'bash' | 'yaml' | 'json' | 'text';
  filename?: string;
  children: string;
}

// Bloque de código simple (sin highlight server-side; el editor Monaco lo cubre
// para casos editables). Aquí sólo mostramos código read-only con copy button.
export function CodeBlock({ language = 'text', filename, children }: CodeBlockProps) {
  const [copied, setCopied] = useState(false);

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
      <div className="flex items-center justify-between border-b border-border/60 bg-muted/40 px-3 py-1.5 text-xs">
        <span className="font-mono text-muted-foreground">
          {filename ?? language}
        </span>
        <Button variant="ghost" size="sm" className="h-7 gap-1 px-2" onClick={copy}>
          {copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
          <span className="text-xs">{copied ? 'Copiado' : 'Copiar'}</span>
        </Button>
      </div>
      <pre className={cn('overflow-x-auto p-4 text-sm leading-6', `language-${language}`)}>
        <code className="font-mono">{children}</code>
      </pre>
    </div>
  );
}
