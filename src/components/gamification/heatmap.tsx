'use client';

import { useMemo } from 'react';
import type { DailyActivityPoint } from '@/types/datapath-api';
import { cn } from '@/lib/utils';

interface HeatmapProps {
  data: DailyActivityPoint[];
  days?: number;
  className?: string;
}

// Genera una grilla días×7 estilo GitHub. Días más recientes a la derecha.
export function Heatmap({ data, days = 90, className }: HeatmapProps) {
  const map = useMemo(() => {
    const m = new Map<string, DailyActivityPoint>();
    for (const d of data) m.set(d.date, d);
    return m;
  }, [data]);

  const cells = useMemo(() => {
    const arr: { date: string; xp: number }[] = [];
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    for (let i = days - 1; i >= 0; i--) {
      const d = new Date(today);
      d.setDate(today.getDate() - i);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
      arr.push({ date: key, xp: map.get(key)?.xp ?? 0 });
    }
    return arr;
  }, [map, days]);

  const maxXp = cells.reduce((m, c) => Math.max(m, c.xp), 0);

  function intensity(xp: number): number {
    if (xp === 0) return 0;
    const ratio = maxXp === 0 ? 0 : xp / maxXp;
    if (ratio < 0.25) return 1;
    if (ratio < 0.5) return 2;
    if (ratio < 0.75) return 3;
    return 4;
  }

  const tones = [
    'bg-secondary',
    'bg-primary/20',
    'bg-primary/40',
    'bg-primary/70',
    'bg-primary',
  ];

  return (
    <div className={cn('w-full', className)}>
      <div className="flex flex-wrap gap-[3px]">
        {cells.map((c) => {
          const lvl = intensity(c.xp);
          return (
            <div
              key={c.date}
              title={`${c.date} — ${c.xp} XP`}
              className={cn(
                'h-3 w-3 rounded-[2px] ring-1 ring-border/40',
                tones[lvl] ?? 'bg-secondary',
              )}
            />
          );
        })}
      </div>
      <div className="mt-2 flex items-center gap-2 text-xs text-muted-foreground">
        <span>Menos</span>
        <div className="flex gap-[3px]">
          {tones.map((t, i) => (
            <span key={i} className={cn('h-3 w-3 rounded-[2px] ring-1 ring-border/40', t)} />
          ))}
        </div>
        <span>Más</span>
      </div>
    </div>
  );
}
