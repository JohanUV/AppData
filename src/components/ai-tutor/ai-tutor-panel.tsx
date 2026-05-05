'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import {
  Bot,
  Eraser,
  Expand,
  Send,
  Settings as SettingsIcon,
  Sparkles,
  Square,
  X,
} from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { useAIChat, type ChatMsg } from '@/hooks/use-ai-chat';
import { providers as providerMeta } from '@/lib/ai/providers-meta';
import { cn } from '@/lib/utils';

interface AITutorPanelProps {
  lessonSlug: string;
  lessonTitle?: string;
  lessonExcerpt?: string;
}

const QUICK_ACTIONS = [
  { id: 'simpler', label: 'Explícame esto más simple' },
  { id: 'example', label: 'Dame un ejemplo' },
  { id: 'why', label: '¿Por qué esto funciona así?' },
  { id: 'quiz', label: 'Quiz sobre lo que acabo de leer' },
  { id: 'translate', label: 'Tradúceme este concepto' },
] as const;

export function AITutorPanel({ lessonSlug, lessonTitle, lessonExcerpt }: AITutorPanelProps) {
  const chat = useAIChat({ lessonSlug, lessonTitle, lessonExcerpt });
  const [input, setInput] = useState('');
  const [expanded, setExpanded] = useState(false);

  const inner = (
    <ChatContent
      chat={chat}
      input={input}
      setInput={setInput}
      onExpand={() => setExpanded(true)}
      expanded={false}
    />
  );

  return (
    <>
      {inner}
      <Dialog open={expanded} onOpenChange={(o) => !o && setExpanded(false)}>
        <DialogContent className="max-w-3xl">
          <ChatContent
            chat={chat}
            input={input}
            setInput={setInput}
            onExpand={() => setExpanded(false)}
            expanded
          />
        </DialogContent>
      </Dialog>
    </>
  );
}

interface ChatContentProps {
  chat: ReturnType<typeof useAIChat>;
  input: string;
  setInput: (v: string) => void;
  onExpand: () => void;
  expanded: boolean;
}

function ChatContent({ chat, input, setInput, onExpand, expanded }: ChatContentProps) {
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
  }, [chat.messages]);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!input.trim()) return;
    const text = input;
    setInput('');
    await chat.send(text);
  }

  if (!chat.isConfigured) {
    return (
      <Card className={cn(expanded ? 'border-0 shadow-none' : '')}>
        <CardContent className="space-y-3 p-4">
          <div className="flex items-center gap-2">
            <Bot className="h-4 w-4 text-primary" />
            <span className="text-sm font-medium">Tutor IA</span>
            {!expanded && (
              <Button
                variant="ghost"
                size="icon"
                className="ml-auto h-7 w-7"
                onClick={onExpand}
                aria-label="Expandir"
              >
                <Expand className="h-3.5 w-3.5" />
              </Button>
            )}
          </div>
          <div className="rounded-md border border-info/30 bg-info/10 p-3 text-xs">
            Configura tu API gratuita para activar el tutor IA. Cerebras y Groq
            ofrecen acceso gratuito a modelos como Llama 3.3 70B.
          </div>
          <Button asChild className="w-full" size="sm">
            <Link href="/settings#ai">
              <SettingsIcon className="h-4 w-4" />
              <span className="ml-2">Configurar tutor IA</span>
            </Link>
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={cn('flex flex-col', expanded ? 'h-[70vh] border-0 shadow-none' : 'max-h-[600px]')}>
      <CardContent className="flex flex-1 flex-col gap-3 p-3">
        {/* Header */}
        <header className="flex items-center gap-2 border-b border-border/60 pb-2">
          <Bot className="h-4 w-4 text-primary" />
          <div className="flex flex-col leading-tight">
            <span className="text-sm font-medium">
              {chat.activeProvider
                ? providerMeta[chat.activeProvider].name
                : chat.settings
                  ? providerMeta[chat.settings.activeProvider].name
                  : 'Tutor IA'}
            </span>
            <span className="text-[10px] text-muted-foreground">
              {chat.activeModel ?? '—'}
            </span>
          </div>
          {chat.streaming && (
            <Badge variant="secondary" className="ml-2 animate-pulse text-[10px]">
              escribiendo…
            </Badge>
          )}
          <div className="ml-auto flex gap-1">
            {!expanded && (
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7"
                onClick={onExpand}
                aria-label="Expandir"
              >
                <Expand className="h-3.5 w-3.5" />
              </Button>
            )}
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7"
              onClick={() => void chat.clear()}
              aria-label="Limpiar conversación"
              disabled={chat.streaming || chat.messages.length === 0}
            >
              <Eraser className="h-3.5 w-3.5" />
            </Button>
            {expanded && (
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7"
                onClick={onExpand}
                aria-label="Cerrar"
              >
                <X className="h-3.5 w-3.5" />
              </Button>
            )}
          </div>
        </header>

        {/* Mensajes */}
        <div ref={scrollRef} className="flex-1 space-y-3 overflow-y-auto pr-1">
          {chat.messages.length === 0 && (
            <div className="space-y-2 rounded-md border border-dashed border-border/60 p-3 text-xs text-muted-foreground">
              <p>Pregúntame sobre la lección actual. Te guío con pistas en lugar de darte la respuesta directamente.</p>
            </div>
          )}
          {chat.messages.map((m, i) => (
            <Bubble key={i} msg={m} streaming={chat.streaming && i === chat.messages.length - 1} />
          ))}
        </div>

        {/* Quick actions */}
        {chat.messages.length === 0 && !chat.streaming && (
          <div className="flex flex-wrap gap-1.5">
            {QUICK_ACTIONS.map((q) => (
              <button
                key={q.id}
                type="button"
                onClick={() => void chat.send(q.label)}
                className="rounded-full border border-border/60 bg-background px-2.5 py-1 text-[11px] text-muted-foreground transition hover:border-primary/40 hover:text-foreground"
              >
                {q.label}
              </button>
            ))}
          </div>
        )}

        {/* Input */}
        <form onSubmit={submit} className="flex gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Pregúntame algo…"
            disabled={chat.streaming}
            className="flex-1 rounded-md border border-input bg-background px-3 py-1.5 text-sm shadow-sm outline-none transition focus:border-primary focus:ring-1 focus:ring-ring disabled:opacity-50"
          />
          {chat.streaming ? (
            <Button type="button" size="icon" variant="destructive" onClick={() => void chat.stop()}>
              <Square className="h-3.5 w-3.5" />
            </Button>
          ) : (
            <Button type="submit" size="icon" disabled={!input.trim()}>
              <Send className="h-3.5 w-3.5" />
            </Button>
          )}
        </form>
      </CardContent>
    </Card>
  );
}

function Bubble({ msg, streaming }: { msg: ChatMsg; streaming: boolean }) {
  const isUser = msg.role === 'user';
  return (
    <div className={cn('flex', isUser ? 'justify-end' : 'justify-start')}>
      <div
        className={cn(
          'max-w-[85%] rounded-lg px-3 py-2 text-sm',
          isUser
            ? 'bg-primary text-primary-foreground'
            : 'border border-border/60 bg-card',
        )}
      >
        {isUser ? (
          <span className="whitespace-pre-wrap">{msg.content}</span>
        ) : (
          <div className="prose-chat space-y-2 text-sm leading-relaxed">
            <ReactMarkdown
              remarkPlugins={[remarkGfm]}
              components={{
                p: ({ children }) => <p className="m-0">{children}</p>,
                code: ({ children, className }) => {
                  const isBlock = className?.includes('language-');
                  if (isBlock) {
                    return (
                      <pre className="my-2 overflow-x-auto rounded bg-muted/40 p-2 text-xs">
                        <code>{children}</code>
                      </pre>
                    );
                  }
                  return (
                    <code className="rounded bg-muted px-1 text-[12px]">{children}</code>
                  );
                },
                ul: ({ children }) => <ul className="m-0 list-disc pl-5">{children}</ul>,
                ol: ({ children }) => <ol className="m-0 list-decimal pl-5">{children}</ol>,
                a: ({ children, href }) => (
                  <a href={href} target="_blank" rel="noreferrer" className="text-primary underline">
                    {children}
                  </a>
                ),
              }}
            >
              {msg.content || (streaming ? '…' : '')}
            </ReactMarkdown>
            {streaming && msg.content && (
              <Sparkles className="inline h-3 w-3 animate-pulse text-primary" />
            )}
          </div>
        )}
      </div>
    </div>
  );
}
