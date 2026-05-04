'use client';

import dynamic from 'next/dynamic';
import { useEffect, useRef } from 'react';
import type { OnMount } from '@monaco-editor/react';
import { usePreferences } from '@/stores/preferences-store';

// Carga diferida — Monaco pesa ~5MB. Lo bajamos sólo cuando se renderiza.
const Editor = dynamic(() => import('@monaco-editor/react').then((m) => m.default), {
  ssr: false,
  loading: () => (
    <div className="flex h-[280px] items-center justify-center text-xs text-muted-foreground">
      Cargando editor…
    </div>
  ),
});

export type MonacoLanguage = 'python' | 'sql' | 'javascript' | 'typescript';

interface MonacoEditorProps {
  language: MonacoLanguage;
  value: string;
  onChange?: (value: string) => void;
  height?: number | string;
  readOnly?: boolean;
  className?: string;
}

export function MonacoEditor({
  language,
  value,
  onChange,
  height = 280,
  readOnly = false,
  className,
}: MonacoEditorProps) {
  const mode = usePreferences((s) => s.mode);
  const monacoRef = useRef<Parameters<OnMount>[1] | null>(null);

  useEffect(() => {
    monacoRef.current?.editor?.setTheme(mode === 'dark' ? 'vs-dark' : 'vs');
  }, [mode]);

  const handleMount: OnMount = (_editor, monaco) => {
    monacoRef.current = monaco;
    monaco.editor.setTheme(mode === 'dark' ? 'vs-dark' : 'vs');
  };

  return (
    <div className={className}>
      <Editor
        height={height}
        language={language}
        value={value}
        onChange={(v) => onChange?.(v ?? '')}
        onMount={handleMount}
        theme={mode === 'dark' ? 'vs-dark' : 'vs'}
        options={{
          readOnly,
          minimap: { enabled: false },
          fontSize: 13,
          fontFamily:
            'ui-monospace, "Cascadia Code", "JetBrains Mono", Menlo, Monaco, Consolas, monospace',
          scrollBeyondLastLine: false,
          tabSize: 2,
          wordWrap: 'on',
          automaticLayout: true,
          padding: { top: 12, bottom: 12 },
          smoothScrolling: true,
          cursorBlinking: 'smooth',
          renderLineHighlight: 'gutter',
        }}
      />
    </div>
  );
}
