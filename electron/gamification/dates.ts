// Helpers de fecha en hora local. Streaks y heatmap usan YYYY-MM-DD local.

export function todayKey(date: Date = new Date()): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

export function dateKeyOffset(daysBack: number): string {
  const d = new Date();
  d.setDate(d.getDate() - daysBack);
  return todayKey(d);
}

export function diffDays(fromKey: string, toKey: string): number {
  const a = new Date(fromKey + 'T00:00:00').getTime();
  const b = new Date(toKey + 'T00:00:00').getTime();
  return Math.round((b - a) / 86_400_000);
}

export function isWeekend(date: Date = new Date()): boolean {
  const d = date.getDay();
  return d === 0 || d === 6;
}
