'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useTranslations } from 'next-intl';
import { ArrowLeft, ArrowRight, CheckCircle2, Clock, ListChecks, Sparkles } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { AITutorPanel } from '@/components/ai-tutor/ai-tutor-panel';
import {
  getLesson,
  getLessonsByModule,
  getNextLesson,
  getPrevLesson,
} from '@/content/data-engineering/registry';
import { useGamification } from '@/hooks/use-gamification';
import { usePreferences } from '@/stores/preferences-store';
import { useMDXComponents } from '@/mdx-components';
import { cn } from '@/lib/utils';

interface LessonViewProps {
  slug: string;
}

export function LessonView({ slug }: LessonViewProps) {
  const t = useTranslations('common');
  const locale = usePreferences((s) => s.locale);
  const lesson = getLesson(slug);
  const next = lesson ? getNextLesson(slug) : null;
  const prev = lesson ? getPrevLesson(slug) : null;
  const moduleLessons = useMemo(
    () => (lesson ? getLessonsByModule(lesson.meta.module) : []),
    [lesson],
  );

  const { completeLesson, badges } = useGamification();
  // Lazy init: Date.now() corre una sola vez al montar (la regla de pureza de
  // React 19 no permite llamarlo durante el render normal).
  const [startTime] = useState(() => Date.now());
  const [readingPct, setReadingPct] = useState(0);
  const [completed, setCompleted] = useState(false);

  // Track scroll progress within the AppShell's main scrollable.
  useEffect(() => {
    const main = document.querySelector('main');
    if (!main) return;
    function onScroll() {
      if (!main) return;
      const max = main.scrollHeight - main.clientHeight;
      const pct = max <= 0 ? 100 : Math.min(100, Math.max(0, (main.scrollTop / max) * 100));
      setReadingPct(pct);
    }
    main.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
    return () => main.removeEventListener('scroll', onScroll);
  }, [slug]);

  const components = useMDXComponents({});

  if (!lesson) return null;
  const Mdx = lesson.components[locale];

  async function markComplete() {
    if (!lesson || completed) return;
    const elapsedSec = Math.max(1, Math.round((Date.now() - startTime) / 1000));
    await completeLesson(`lesson:${slug}`, lesson.meta.xpReward, elapsedSec, 100);
    setCompleted(true);
  }

  const earnedRecent = badges.filter((b) => b.earned).slice(-3);

  return (
    <>
      {/* Reading progress bar — sticky en el top del shell */}
      <div className="sticky top-0 z-20 h-1">
        <div
          className="h-full bg-primary transition-[width] duration-150"
          style={{ width: `${readingPct}%` }}
        />
      </div>

      <div className="grid grid-cols-1 gap-6 px-6 py-6 lg:grid-cols-[240px_minmax(0,1fr)_300px]">
        {/* Sidebar: módulo */}
        <aside className="hidden lg:block">
          <div className="sticky top-6 space-y-4">
            <div>
              <div className="text-[11px] uppercase tracking-wider text-muted-foreground">
                Módulo
              </div>
              <div className="text-sm font-semibold capitalize">{lesson.meta.module}</div>
            </div>
            <ul className="space-y-1">
              {moduleLessons.map((l) => {
                const active = l.meta.slug === slug;
                return (
                  <li key={l.meta.slug}>
                    <Link
                      href={`/lessons/${l.meta.slug}`}
                      className={cn(
                        'flex items-start gap-2 rounded-md px-2.5 py-2 text-sm transition',
                        active
                          ? 'bg-primary/15 text-primary'
                          : 'text-muted-foreground hover:bg-accent hover:text-foreground',
                      )}
                    >
                      <span className="mt-0.5 text-[10px] font-mono">{l.meta.order}.</span>
                      <span className="flex-1 leading-snug">{l.meta.title[locale]}</span>
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        </aside>

        {/* Contenido principal */}
        <article className="mx-auto w-full max-w-3xl">
          <header className="mb-6 space-y-3">
            <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
              <Badge variant="secondary" className="capitalize">
                {lesson.meta.module}
              </Badge>
              <span className="inline-flex items-center gap-1">
                <Clock className="h-3 w-3" />
                {lesson.meta.estimatedMinutes} min
              </span>
              <span className="inline-flex items-center gap-1">
                <Sparkles className="h-3 w-3" />
                +{lesson.meta.xpReward} XP
              </span>
            </div>
            <h1 className="text-3xl font-bold tracking-tight">{lesson.meta.title[locale]}</h1>
            <p className="text-muted-foreground">{lesson.meta.description[locale]}</p>
          </header>

          <Mdx components={components} />

          <footer className="mt-10 space-y-4">
            <Card
              className={cn(
                'transition-colors',
                completed && 'border-success/50 bg-success/5',
              )}
            >
              <CardContent className="flex flex-wrap items-center gap-3 p-4">
                {completed ? (
                  <>
                    <CheckCircle2 className="h-5 w-5 text-success" />
                    <span className="text-sm font-medium text-success">
                      Lección completada · +{lesson.meta.xpReward} XP
                    </span>
                  </>
                ) : (
                  <>
                    <ListChecks className="h-5 w-5 text-primary" />
                    <span className="text-sm font-medium">
                      ¿Listo? Marca la lección como completada para reclamar tu XP.
                    </span>
                    <div className="ml-auto">
                      <Button onClick={markComplete}>
                        Marcar como completada
                        <Sparkles className="h-4 w-4" />
                      </Button>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>

            <div className="flex items-center justify-between gap-2">
              <Button variant="outline" disabled={!prev} asChild={!!prev}>
                {prev ? (
                  <Link href={`/lessons/${prev.meta.slug}`}>
                    <ArrowLeft className="h-4 w-4" />
                    <span className="ml-2">{t('actions.back')}</span>
                  </Link>
                ) : (
                  <span>
                    <ArrowLeft className="h-4 w-4" />
                    <span className="ml-2">{t('actions.back')}</span>
                  </span>
                )}
              </Button>
              <Button disabled={!next} asChild={!!next}>
                {next ? (
                  <Link href={`/lessons/${next.meta.slug}`}>
                    <span className="mr-2">{t('actions.continue')}</span>
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                ) : (
                  <span>
                    <span className="mr-2">{t('actions.continue')}</span>
                    <ArrowRight className="h-4 w-4" />
                  </span>
                )}
              </Button>
            </div>
          </footer>
        </article>

        {/* AI tutor */}
        <aside className="hidden lg:block">
          <div className="sticky top-6 space-y-3">
            <AITutorPanel
              lessonSlug={slug}
              lessonTitle={lesson.meta.title[locale]}
              lessonExcerpt={lesson.meta.description[locale]}
            />
            <Card>
              <CardContent className="space-y-2 p-3">
                <div className="text-[10px] uppercase tracking-wider text-muted-foreground">
                  Progreso de lectura
                </div>
                <Progress value={readingPct} />
                <div className="text-right text-[10px] text-muted-foreground">
                  {Math.round(readingPct)}%
                </div>
              </CardContent>
            </Card>
            {earnedRecent.length > 0 && (
              <Card>
                <CardContent className="space-y-1.5 p-4">
                  <div className="text-[10px] uppercase tracking-wider text-muted-foreground">
                    Logros recientes
                  </div>
                  <ul className="space-y-0.5">
                    {earnedRecent.map((b) => (
                      <li key={b.id} className="text-xs text-foreground/90">
                        · {b.nameTranslations[locale]}
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            )}
          </div>
        </aside>
      </div>
    </>
  );
}
