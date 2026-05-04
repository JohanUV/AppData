'use client';

import { useTranslations } from 'next-intl';
import type { Rank } from '@/lib/gamification/levels';
import { cn } from '@/lib/utils';

interface LevelBadgeProps {
  level: number;
  rank: Rank;
  className?: string;
}

const rankStyle: Record<Rank, string> = {
  apprentice: 'from-zinc-500/20 to-zinc-500/5 text-zinc-200 ring-zinc-500/40',
  practitioner: 'from-info/30 to-info/5 text-info ring-info/40',
  expert: 'from-primary/30 to-primary/5 text-primary ring-primary/40',
  master: 'from-warning/30 to-warning/5 text-warning ring-warning/40',
  enlightened: 'from-fuchsia-500/30 to-fuchsia-500/5 text-fuchsia-300 ring-fuchsia-500/40',
};

export function LevelBadge({ level, rank, className }: LevelBadgeProps) {
  const t = useTranslations('gamification.ranks');
  return (
    <div
      className={cn(
        'flex items-center gap-3 rounded-xl border border-border/60 bg-gradient-to-br p-3 shadow-sm ring-1',
        rankStyle[rank],
        className,
      )}
    >
      <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-background/40 text-xl font-bold tabular-nums shadow-inner">
        {level}
      </div>
      <div className="leading-tight">
        <div className="text-[11px] uppercase tracking-wider opacity-70">Rango</div>
        <div className="font-semibold">{t(rank)}</div>
      </div>
    </div>
  );
}
