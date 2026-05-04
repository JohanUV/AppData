'use client';

import { Lock } from 'lucide-react';
import type { BadgeRow } from '@/types/datapath-api';
import { usePreferences } from '@/stores/preferences-store';
import { BadgeIcon } from './badge-icon';
import { cn } from '@/lib/utils';

interface BadgeGridProps {
  badges: BadgeRow[];
  compact?: boolean;
  className?: string;
}

export function BadgeGrid({ badges, compact, className }: BadgeGridProps) {
  const locale = usePreferences((s) => s.locale);

  return (
    <div
      className={cn(
        'grid gap-3',
        compact
          ? 'grid-cols-5 sm:grid-cols-6 md:grid-cols-8'
          : 'grid-cols-2 sm:grid-cols-3 md:grid-cols-4',
        className,
      )}
    >
      {badges.map((b) => {
        const name = b.nameTranslations[locale];
        const description = b.descriptionTranslations[locale];
        return (
          <div
            key={b.id}
            className={cn(
              'group relative flex items-center gap-3 rounded-lg border border-border/60 p-3 transition',
              b.earned ? 'bg-card hover:border-primary/40' : 'bg-card/40 opacity-60 hover:opacity-100',
              compact && 'flex-col items-center gap-1.5 p-2 text-center',
            )}
            title={`${name} — ${description}`}
          >
            <BadgeIcon icon={b.icon} tier={b.tier} earned={b.earned} size={compact ? 'sm' : 'md'} />
            <div className={cn('min-w-0 flex-1 leading-tight', compact && 'flex-none')}>
              <div className={cn('truncate text-sm font-medium', compact && 'text-[11px]')}>
                {name}
              </div>
              {!compact && (
                <div className="line-clamp-2 text-xs text-muted-foreground">{description}</div>
              )}
            </div>
            {!b.earned && !compact && (
              <Lock className="h-4 w-4 shrink-0 text-muted-foreground" aria-hidden />
            )}
          </div>
        );
      })}
    </div>
  );
}
