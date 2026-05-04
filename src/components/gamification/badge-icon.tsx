'use client';

import * as Lucide from 'lucide-react';
import { cn } from '@/lib/utils';

const tierStyles = {
  bronze: 'from-amber-700/40 to-amber-900/20 text-amber-400 ring-amber-600/40',
  silver: 'from-slate-300/40 to-slate-500/10 text-slate-200 ring-slate-400/40',
  gold: 'from-yellow-400/40 to-yellow-600/10 text-yellow-300 ring-yellow-400/50',
  platinum: 'from-fuchsia-400/40 to-cyan-400/10 text-fuchsia-200 ring-fuchsia-400/50',
} as const;

interface BadgeIconProps {
  icon: string;
  tier: 'bronze' | 'silver' | 'gold' | 'platinum';
  earned: boolean;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export function BadgeIcon({ icon, tier, earned, size = 'md', className }: BadgeIconProps) {
  const Lookup = Lucide as unknown as Record<string, Lucide.LucideIcon | undefined>;
  const Icon = Lookup[icon] ?? Lucide.Trophy;
  const sizing = size === 'sm' ? 'h-9 w-9' : size === 'lg' ? 'h-16 w-16' : 'h-12 w-12';
  const iconSize =
    size === 'sm' ? 'h-4 w-4' : size === 'lg' ? 'h-7 w-7' : 'h-5 w-5';
  return (
    <div
      className={cn(
        'flex items-center justify-center rounded-xl bg-gradient-to-br ring-1 transition',
        sizing,
        earned ? tierStyles[tier] : 'from-muted to-muted/50 text-muted-foreground ring-border grayscale',
        className,
      )}
      aria-hidden
    >
      <Icon className={iconSize} />
    </div>
  );
}
