// Curva de niveles balanceada: nivel = floor(sqrt(xp / 100)) + 1.
// Ejemplos: 0 XP → nivel 1, 100 XP → nivel 2, 400 XP → nivel 3, 2500 → nivel 6,
// 10000 → nivel 11, 90000 → nivel 31, 990000 → nivel 100.
// La curva crece cuadráticamente: cada nivel exige más XP que el anterior.

export const MAX_LEVEL = 100;

export function calculateLevel(xp: number): number {
  if (xp < 0) return 1;
  const level = Math.floor(Math.sqrt(xp / 100)) + 1;
  return Math.min(level, MAX_LEVEL);
}

// XP acumulado mínimo necesario para alcanzar `level`.
export function xpForLevel(level: number): number {
  if (level <= 1) return 0;
  return Math.pow(level - 1, 2) * 100;
}

// Progreso del usuario dentro de su nivel actual.
export interface LevelProgress {
  level: number;
  totalXp: number;
  xpInLevel: number; // XP ganado dentro del nivel actual
  xpForNextLevel: number; // XP necesario para alcanzar el siguiente
  percent: number; // 0-100
  isMaxLevel: boolean;
}

export function getLevelProgress(totalXp: number): LevelProgress {
  const level = calculateLevel(totalXp);
  const isMaxLevel = level >= MAX_LEVEL;
  const currentLevelStart = xpForLevel(level);
  const nextLevelStart = isMaxLevel ? currentLevelStart : xpForLevel(level + 1);
  const span = Math.max(1, nextLevelStart - currentLevelStart);
  const xpInLevel = totalXp - currentLevelStart;
  const xpForNextLevel = isMaxLevel ? 0 : nextLevelStart - totalXp;
  const percent = isMaxLevel ? 100 : Math.min(100, Math.max(0, (xpInLevel / span) * 100));
  return { level, totalXp, xpInLevel, xpForNextLevel, percent, isMaxLevel };
}

// Rangos para mostrar como "título" del usuario.
export type Rank = 'apprentice' | 'practitioner' | 'expert' | 'master' | 'enlightened';

export function getRank(level: number): Rank {
  if (level >= 100) return 'enlightened';
  if (level >= 50) return 'master';
  if (level >= 25) return 'expert';
  if (level >= 10) return 'practitioner';
  return 'apprentice';
}
