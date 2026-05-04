'use client';

import { motion } from 'framer-motion';
import type { LevelProgress } from '@/lib/gamification/levels';
import { cn } from '@/lib/utils';

interface XPBarProps {
  progress: LevelProgress;
  className?: string;
}

export function XPBar({ progress, className }: XPBarProps) {
  return (
    <div className={cn('w-full space-y-1.5', className)}>
      <div className="flex items-baseline justify-between text-xs">
        <span className="font-medium text-muted-foreground">
          Nivel {progress.level}
        </span>
        <span className="tabular-nums text-muted-foreground">
          {progress.isMaxLevel
            ? `${progress.totalXp.toLocaleString()} XP · MAX`
            : `${progress.xpInLevel.toLocaleString()} / ${(progress.xpInLevel + progress.xpForNextLevel).toLocaleString()} XP`}
        </span>
      </div>
      <div className="relative h-3 w-full overflow-hidden rounded-full bg-secondary ring-1 ring-border">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${progress.percent}%` }}
          transition={{ type: 'spring', stiffness: 120, damping: 22 }}
          className="h-full rounded-full bg-gradient-to-r from-primary/80 via-primary to-primary/80 shadow-[0_0_12px_hsl(var(--primary)/0.5)]"
        />
      </div>
    </div>
  );
}
