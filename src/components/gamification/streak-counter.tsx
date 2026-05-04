'use client';

import { Flame } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';

interface StreakCounterProps {
  current: number;
  longest?: number;
  className?: string;
}

export function StreakCounter({ current, longest, className }: StreakCounterProps) {
  const hot = current >= 7;
  return (
    <div
      className={cn(
        'flex items-center gap-3 rounded-xl border border-border/60 bg-card p-3 shadow-sm',
        className,
      )}
    >
      <motion.div
        animate={hot ? { scale: [1, 1.08, 1] } : { scale: 1 }}
        transition={{ duration: 1.4, repeat: Infinity, ease: 'easeInOut' }}
        className={cn(
          'flex h-12 w-12 items-center justify-center rounded-lg',
          hot
            ? 'bg-gradient-to-br from-warning/30 to-destructive/10 text-warning'
            : 'bg-secondary text-muted-foreground',
        )}
      >
        <Flame className="h-6 w-6" />
      </motion.div>
      <div className="leading-tight">
        <div className="text-[11px] uppercase tracking-wider text-muted-foreground">Racha</div>
        <AnimatePresence mode="popLayout">
          <motion.div
            key={current}
            initial={{ y: -8, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 8, opacity: 0 }}
            className="text-2xl font-semibold tabular-nums"
          >
            {current} <span className="text-sm font-normal text-muted-foreground">días</span>
          </motion.div>
        </AnimatePresence>
        {longest !== undefined && longest > 0 && (
          <div className="text-xs text-muted-foreground">Récord: {longest}</div>
        )}
      </div>
    </div>
  );
}
