'use client';

import { useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';
import {
  ArrowRight,
  BookOpen,
  Clock,
  Sparkles,
  Trophy,
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { XPBar } from '@/components/gamification/xp-bar';
import { LevelBadge } from '@/components/gamification/level-badge';
import { StreakCounter } from '@/components/gamification/streak-counter';
import { StatsCard } from '@/components/gamification/stats-card';
import { Heatmap } from '@/components/gamification/heatmap';
import { BadgeGrid } from '@/components/gamification/badge-grid';
import { BadgeIcon } from '@/components/gamification/badge-icon';
import { BadgeUnlockModal } from '@/components/gamification/badge-unlock-modal';
import { useGamification } from '@/hooks/use-gamification';
import { usePreferences } from '@/stores/preferences-store';

function formatTime(seconds: number): string {
  if (seconds < 60) return `${seconds}s`;
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m`;
  const hours = Math.floor(minutes / 60);
  const remMin = minutes % 60;
  return remMin > 0 ? `${hours}h ${remMin}m` : `${hours}h`;
}

export default function DashboardPage() {
  const t = useTranslations('gamification.dashboard');
  const { stats, badges, heatmap, activity, completeLesson, currentUnlock, dismissUnlock, trackLocale, refresh } =
    useGamification();
  const locale = usePreferences((s) => s.locale);
  const [demoLoading, setDemoLoading] = useState(false);

  // Cada vez que el usuario cambie idioma, lo reportamos al backend para
  // alimentar los badges polyglot/cosmopolitan.
  useEffect(() => {
    void trackLocale(locale);
  }, [locale, trackLocale]);

  if (!stats) {
    return (
      <div className="flex h-full items-center justify-center text-sm text-muted-foreground">
        Cargando…
      </div>
    );
  }

  const earnedBadges = badges.filter((b) => b.earned);
  const recentBadges = [...earnedBadges]
    .sort((a, b) => (b.earnedAt ?? 0) - (a.earnedAt ?? 0))
    .slice(0, 6);

  async function runDemo() {
    setDemoLoading(true);
    try {
      const slug = `demo-${Date.now()}`;
      await completeLesson(slug, 50, 90, 100);
    } finally {
      setDemoLoading(false);
    }
  }

  return (
    <div className="mx-auto flex max-w-6xl flex-col gap-6 p-8">
      <header className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight">{t('title')}</h1>
          <p className="text-muted-foreground">{t('subtitle')}</p>
        </div>
        <Button onClick={runDemo} disabled={demoLoading}>
          <Sparkles className="h-4 w-4" />
          <span className="ml-2">{t('demoButton')}</span>
        </Button>
      </header>

      {/* Hero: nivel + XP + racha */}
      <Card className="overflow-hidden">
        <CardContent className="grid gap-4 p-4 md:grid-cols-[auto_1fr_auto] md:items-center">
          <LevelBadge level={stats.level} rank={stats.rank} />
          <div className="min-w-0 px-1">
            <XPBar progress={stats.levelProgress} />
            <div className="mt-2 text-xs text-muted-foreground">
              {stats.totalXp.toLocaleString()} XP totales · {stats.user.name}
            </div>
          </div>
          <StreakCounter current={stats.currentStreak} longest={stats.longestStreak} />
        </CardContent>
      </Card>

      {/* Stats cards */}
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <StatsCard icon={Sparkles} label={t('stats.totalXp')} value={stats.totalXp.toLocaleString()} accent="primary" />
        <StatsCard icon={BookOpen} label={t('stats.lessons')} value={stats.lessonsCompleted} accent="info" />
        <StatsCard icon={Clock} label={t('stats.time')} value={formatTime(stats.totalTimeSeconds)} accent="success" />
        <StatsCard
          icon={Trophy}
          label={t('stats.rank')}
          value={`${stats.badgesEarned}/${stats.badgesTotal}`}
          hint="Logros"
          accent="warning"
        />
      </div>

      {/* Heatmap */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">{t('heatmap')}</CardTitle>
        </CardHeader>
        <CardContent>
          <Heatmap data={heatmap} days={90} />
        </CardContent>
      </Card>

      {/* Recent activity + Suggested */}
      <div className="grid gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-base">{t('recent')}</CardTitle>
          </CardHeader>
          <CardContent>
            {activity.length === 0 ? (
              <p className="text-sm text-muted-foreground">{t('recentEmpty')}</p>
            ) : (
              <ul className="space-y-2">
                {activity.map((a, i) => (
                  <li
                    key={`${a.type}-${a.date}-${i}`}
                    className="flex items-center gap-3 rounded-md border border-border/50 p-2.5"
                  >
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-primary/15 text-primary">
                      {a.type === 'badge' ? (
                        <Trophy className="h-4 w-4" />
                      ) : (
                        <BookOpen className="h-4 w-4" />
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="truncate text-sm font-medium">{a.title}</div>
                      <div className="text-xs text-muted-foreground">{a.detail}</div>
                    </div>
                    <Badge variant="secondary" className="text-xs">
                      {new Date(a.date).toLocaleDateString(locale)}
                    </Badge>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">{t('suggested')}</CardTitle>
            <CardDescription>{t('suggestedDescription')}</CardDescription>
          </CardHeader>
          <CardContent>
            <Button variant="outline" disabled className="w-full">
              {t('suggestedCta')}
              <ArrowRight className="h-4 w-4" />
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Recent badges */}
      <Card>
        <CardHeader className="flex-row items-center justify-between">
          <CardTitle className="text-base">{t('achievements')}</CardTitle>
          <span className="text-xs text-muted-foreground">
            {stats.badgesEarned} / {stats.badgesTotal}
          </span>
        </CardHeader>
        <CardContent>
          {recentBadges.length === 0 ? (
            <div className="rounded-md border border-dashed border-border p-6 text-center text-sm text-muted-foreground">
              Aún no has desbloqueado logros. Empieza con la lección demo arriba.
            </div>
          ) : (
            <div className="flex flex-wrap gap-3">
              {recentBadges.map((b) => (
                <div
                  key={b.id}
                  className="flex flex-col items-center gap-1.5"
                  title={b.descriptionTranslations[locale]}
                >
                  <BadgeIcon icon={b.icon} tier={b.tier} earned size="md" />
                  <div className="max-w-[80px] truncate text-center text-[11px] text-muted-foreground">
                    {b.nameTranslations[locale]}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Full badge grid */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Todos los logros</CardTitle>
          <CardDescription>
            {stats.badgesEarned} desbloqueados · {stats.badgesTotal - stats.badgesEarned} por descubrir
          </CardDescription>
        </CardHeader>
        <CardContent>
          <BadgeGrid badges={badges} />
        </CardContent>
      </Card>

      <BadgeUnlockModal badge={currentUnlock} onClose={dismissUnlock} />

      {/* Refresh on focus to pick up changes from other windows/tabs (no-op normally) */}
      <button hidden onClick={() => refresh()} />
    </div>
  );
}
