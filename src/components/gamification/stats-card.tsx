'use client';

import { type LucideIcon } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';

interface StatsCardProps {
  icon: LucideIcon;
  label: string;
  value: string | number;
  hint?: string;
  accent?: 'primary' | 'success' | 'warning' | 'info';
  className?: string;
}

const accents = {
  primary: 'bg-primary/15 text-primary ring-primary/30',
  success: 'bg-success/15 text-success ring-success/30',
  warning: 'bg-warning/15 text-warning ring-warning/30',
  info: 'bg-info/15 text-info ring-info/30',
} as const;

export function StatsCard({
  icon: Icon,
  label,
  value,
  hint,
  accent = 'primary',
  className,
}: StatsCardProps) {
  return (
    <Card className={cn('overflow-hidden', className)}>
      <CardContent className="flex items-center gap-3 p-4">
        <div
          className={cn(
            'flex h-10 w-10 shrink-0 items-center justify-center rounded-lg ring-1',
            accents[accent],
          )}
        >
          <Icon className="h-5 w-5" />
        </div>
        <div className="min-w-0 flex-1">
          <div className="truncate text-xs uppercase tracking-wider text-muted-foreground">
            {label}
          </div>
          <div className="text-xl font-semibold tabular-nums">{value}</div>
          {hint && <div className="truncate text-xs text-muted-foreground">{hint}</div>}
        </div>
      </CardContent>
    </Card>
  );
}
