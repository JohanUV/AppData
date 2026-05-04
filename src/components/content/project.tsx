'use client';

import { useEffect, useMemo, useState } from 'react';
import { CheckCircle2, Circle, ExternalLink, Trophy } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { useGamification } from '@/hooks/use-gamification';
import { cn } from '@/lib/utils';

export interface ProjectStep {
  id: string;
  title: string;
  description?: string;
  resources?: { label: string; href: string }[];
  successCriteria?: string;
}

interface ProjectProps {
  id: string;
  title: string;
  description: string;
  steps: ProjectStep[];
  xpReward?: number;
}

// Persistencia de checklist: localStorage por slug. La integración con la
// tabla project_progress de la DB se hará cuando los proyectos se carguen
// desde DB; por ahora el contenido de los proyectos vive en MDX.
const storageKey = (id: string) => `datapath:project:${id}`;

interface SavedState {
  completed: string[];
  awarded: boolean;
}

function load(id: string): SavedState {
  if (typeof localStorage === 'undefined') return { completed: [], awarded: false };
  try {
    const raw = localStorage.getItem(storageKey(id));
    if (!raw) return { completed: [], awarded: false };
    const parsed = JSON.parse(raw) as SavedState;
    return { completed: parsed.completed ?? [], awarded: Boolean(parsed.awarded) };
  } catch {
    return { completed: [], awarded: false };
  }
}

function save(id: string, state: SavedState) {
  if (typeof localStorage === 'undefined') return;
  localStorage.setItem(storageKey(id), JSON.stringify(state));
}

export function Project({ id, title, description, steps, xpReward = 200 }: ProjectProps) {
  const { completeLesson } = useGamification();
  const [completed, setCompleted] = useState<Set<string>>(new Set());
  const [awarded, setAwarded] = useState(false);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    // Hidratación inicial desde localStorage (sólo cliente).
    /* eslint-disable react-hooks/set-state-in-effect */
    const s = load(id);
    setCompleted(new Set(s.completed));
    setAwarded(s.awarded);
    setHydrated(true);
    /* eslint-enable react-hooks/set-state-in-effect */
  }, [id]);

  useEffect(() => {
    if (!hydrated) return;
    save(id, { completed: Array.from(completed), awarded });
  }, [id, completed, awarded, hydrated]);

  const allDone = completed.size === steps.length && steps.length > 0;
  const percent = useMemo(
    () => (steps.length === 0 ? 0 : Math.round((completed.size / steps.length) * 100)),
    [completed.size, steps.length],
  );

  function toggle(stepId: string) {
    setCompleted((set) => {
      const next = new Set(set);
      if (next.has(stepId)) next.delete(stepId);
      else next.add(stepId);
      return next;
    });
  }

  async function claim() {
    if (!allDone || awarded) return;
    await completeLesson(`project:${id}`, xpReward, 0, 100);
    setAwarded(true);
  }

  return (
    <Card className="my-6">
      <CardHeader className="space-y-2">
        <div className="flex items-center justify-between gap-2">
          <CardTitle className="text-base">Proyecto: {title}</CardTitle>
          <Badge variant="secondary" className="text-xs">
            +{xpReward} XP
          </Badge>
        </div>
        <p className="text-sm text-muted-foreground">{description}</p>
        <div className="space-y-1.5 pt-2">
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>
              {completed.size} / {steps.length} pasos
            </span>
            <span>{percent}%</span>
          </div>
          <Progress value={percent} />
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        <ul className="space-y-2">
          {steps.map((step) => {
            const done = completed.has(step.id);
            return (
              <li
                key={step.id}
                className={cn(
                  'rounded-md border p-3 transition',
                  done ? 'border-success/40 bg-success/5' : 'border-border/60',
                )}
              >
                <button
                  type="button"
                  onClick={() => toggle(step.id)}
                  className="flex w-full items-start gap-3 text-left"
                >
                  {done ? (
                    <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-success" />
                  ) : (
                    <Circle className="mt-0.5 h-5 w-5 shrink-0 text-muted-foreground" />
                  )}
                  <div className="min-w-0 flex-1 space-y-1">
                    <div
                      className={cn(
                        'text-sm font-medium',
                        done && 'text-muted-foreground line-through',
                      )}
                    >
                      {step.title}
                    </div>
                    {step.description && (
                      <div className="text-xs text-muted-foreground">{step.description}</div>
                    )}
                    {step.successCriteria && (
                      <div className="text-xs text-info">✓ {step.successCriteria}</div>
                    )}
                    {step.resources && step.resources.length > 0 && (
                      <div className="flex flex-wrap gap-2 pt-1">
                        {step.resources.map((r) => (
                          <a
                            key={r.href}
                            href={r.href}
                            target="_blank"
                            rel="noreferrer"
                            className="inline-flex items-center gap-1 rounded-md bg-secondary px-2 py-0.5 text-xs hover:bg-accent"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <ExternalLink className="h-3 w-3" />
                            {r.label}
                          </a>
                        ))}
                      </div>
                    )}
                  </div>
                </button>
              </li>
            );
          })}
        </ul>

        {allDone && (
          <Button onClick={claim} disabled={awarded} className="w-full">
            <Trophy className="h-4 w-4" />
            <span className="ml-2">
              {awarded ? `Proyecto completado (+${xpReward} XP)` : `Reclamar ${xpReward} XP`}
            </span>
          </Button>
        )}
      </CardContent>
    </Card>
  );
}
