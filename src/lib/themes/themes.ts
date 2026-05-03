// Definición de temas. Cada tema ofrece variantes light + dark.
// Los valores son tokens HSL "H S% L%" para componer con hsl(var(--token)).

export type ThemeId = 'default' | 'forest' | 'sunset' | 'monochrome';
export type ThemeMode = 'light' | 'dark';

export interface ThemeTokens {
  background: string;
  foreground: string;
  card: string;
  cardForeground: string;
  popover: string;
  popoverForeground: string;
  primary: string;
  primaryForeground: string;
  secondary: string;
  secondaryForeground: string;
  muted: string;
  mutedForeground: string;
  accent: string;
  accentForeground: string;
  destructive: string;
  destructiveForeground: string;
  success: string;
  successForeground: string;
  warning: string;
  warningForeground: string;
  info: string;
  infoForeground: string;
  border: string;
  input: string;
  ring: string;
  radius: string;
}

export interface ThemeDefinition {
  id: ThemeId;
  name: string;
  description: string;
  preview: { light: string; dark: string };
  light: ThemeTokens;
  dark: ThemeTokens;
}

const baseRadius = '0.625rem';

const defaultTheme: ThemeDefinition = {
  id: 'default',
  name: 'Default',
  description: 'Azul profesional, inspirado en Linear y Vercel.',
  preview: { light: '#3b82f6', dark: '#60a5fa' },
  light: {
    background: '0 0% 100%',
    foreground: '224 71% 4%',
    card: '0 0% 100%',
    cardForeground: '224 71% 4%',
    popover: '0 0% 100%',
    popoverForeground: '224 71% 4%',
    primary: '221 83% 53%',
    primaryForeground: '210 40% 98%',
    secondary: '220 14% 96%',
    secondaryForeground: '220 9% 16%',
    muted: '220 14% 96%',
    mutedForeground: '220 9% 46%',
    accent: '220 14% 96%',
    accentForeground: '220 9% 16%',
    destructive: '0 84% 60%',
    destructiveForeground: '0 0% 98%',
    success: '142 71% 38%',
    successForeground: '0 0% 100%',
    warning: '38 92% 50%',
    warningForeground: '0 0% 100%',
    info: '199 89% 48%',
    infoForeground: '0 0% 100%',
    border: '220 13% 91%',
    input: '220 13% 91%',
    ring: '221 83% 53%',
    radius: baseRadius,
  },
  dark: {
    background: '224 71% 4%',
    foreground: '210 40% 98%',
    card: '224 47% 7%',
    cardForeground: '210 40% 98%',
    popover: '224 47% 7%',
    popoverForeground: '210 40% 98%',
    primary: '217 91% 60%',
    primaryForeground: '224 71% 4%',
    secondary: '215 28% 17%',
    secondaryForeground: '210 40% 98%',
    muted: '215 28% 17%',
    mutedForeground: '217 11% 65%',
    accent: '215 28% 17%',
    accentForeground: '210 40% 98%',
    destructive: '0 63% 45%',
    destructiveForeground: '0 0% 98%',
    success: '142 71% 45%',
    successForeground: '0 0% 100%',
    warning: '38 92% 55%',
    warningForeground: '224 71% 4%',
    info: '199 89% 56%',
    infoForeground: '224 71% 4%',
    border: '215 28% 17%',
    input: '215 28% 17%',
    ring: '217 91% 60%',
    radius: baseRadius,
  },
};

const forestTheme: ThemeDefinition = {
  id: 'forest',
  name: 'Forest',
  description: 'Verdes naturales, inspirado en GitHub Dark Dimmed.',
  preview: { light: '#16a34a', dark: '#4ade80' },
  light: {
    background: '120 17% 98%',
    foreground: '140 30% 8%',
    card: '0 0% 100%',
    cardForeground: '140 30% 8%',
    popover: '0 0% 100%',
    popoverForeground: '140 30% 8%',
    primary: '142 71% 38%',
    primaryForeground: '120 17% 98%',
    secondary: '120 14% 94%',
    secondaryForeground: '140 25% 14%',
    muted: '120 14% 94%',
    mutedForeground: '140 8% 45%',
    accent: '142 50% 92%',
    accentForeground: '142 71% 25%',
    destructive: '0 84% 55%',
    destructiveForeground: '0 0% 98%',
    success: '142 76% 35%',
    successForeground: '0 0% 100%',
    warning: '32 95% 48%',
    warningForeground: '0 0% 100%',
    info: '195 89% 42%',
    infoForeground: '0 0% 100%',
    border: '120 13% 88%',
    input: '120 13% 88%',
    ring: '142 71% 38%',
    radius: baseRadius,
  },
  dark: {
    background: '150 15% 6%',
    foreground: '120 12% 95%',
    card: '150 14% 9%',
    cardForeground: '120 12% 95%',
    popover: '150 14% 9%',
    popoverForeground: '120 12% 95%',
    primary: '142 60% 52%',
    primaryForeground: '150 15% 6%',
    secondary: '150 10% 16%',
    secondaryForeground: '120 12% 95%',
    muted: '150 10% 16%',
    mutedForeground: '140 7% 62%',
    accent: '150 10% 16%',
    accentForeground: '120 12% 95%',
    destructive: '0 62% 45%',
    destructiveForeground: '0 0% 98%',
    success: '142 65% 48%',
    successForeground: '150 15% 6%',
    warning: '36 90% 55%',
    warningForeground: '150 15% 6%',
    info: '195 80% 55%',
    infoForeground: '150 15% 6%',
    border: '150 10% 16%',
    input: '150 10% 16%',
    ring: '142 60% 52%',
    radius: baseRadius,
  },
};

const sunsetTheme: ThemeDefinition = {
  id: 'sunset',
  name: 'Sunset',
  description: 'Naranja-rojo cálido, atardecer.',
  preview: { light: '#ea580c', dark: '#fb923c' },
  light: {
    background: '30 50% 98%',
    foreground: '15 25% 12%',
    card: '0 0% 100%',
    cardForeground: '15 25% 12%',
    popover: '0 0% 100%',
    popoverForeground: '15 25% 12%',
    primary: '20 90% 48%',
    primaryForeground: '30 50% 98%',
    secondary: '30 30% 94%',
    secondaryForeground: '15 25% 18%',
    muted: '30 30% 94%',
    mutedForeground: '20 8% 45%',
    accent: '20 80% 92%',
    accentForeground: '20 90% 30%',
    destructive: '358 80% 52%',
    destructiveForeground: '0 0% 98%',
    success: '142 71% 38%',
    successForeground: '0 0% 100%',
    warning: '38 92% 50%',
    warningForeground: '0 0% 100%',
    info: '199 89% 48%',
    infoForeground: '0 0% 100%',
    border: '20 20% 88%',
    input: '20 20% 88%',
    ring: '20 90% 48%',
    radius: baseRadius,
  },
  dark: {
    background: '15 30% 7%',
    foreground: '30 40% 95%',
    card: '15 30% 10%',
    cardForeground: '30 40% 95%',
    popover: '15 30% 10%',
    popoverForeground: '30 40% 95%',
    primary: '24 95% 58%',
    primaryForeground: '15 30% 7%',
    secondary: '15 20% 16%',
    secondaryForeground: '30 40% 95%',
    muted: '15 20% 16%',
    mutedForeground: '20 12% 65%',
    accent: '15 20% 16%',
    accentForeground: '30 40% 95%',
    destructive: '0 65% 50%',
    destructiveForeground: '0 0% 98%',
    success: '142 65% 48%',
    successForeground: '0 0% 100%',
    warning: '38 92% 55%',
    warningForeground: '15 30% 7%',
    info: '199 89% 56%',
    infoForeground: '15 30% 7%',
    border: '15 20% 18%',
    input: '15 20% 18%',
    ring: '24 95% 58%',
    radius: baseRadius,
  },
};

const monochromeTheme: ThemeDefinition = {
  id: 'monochrome',
  name: 'Monochrome',
  description: 'Grises elegantes, sin acentos de color.',
  preview: { light: '#525252', dark: '#a3a3a3' },
  light: {
    background: '0 0% 100%',
    foreground: '0 0% 8%',
    card: '0 0% 100%',
    cardForeground: '0 0% 8%',
    popover: '0 0% 100%',
    popoverForeground: '0 0% 8%',
    primary: '0 0% 18%',
    primaryForeground: '0 0% 98%',
    secondary: '0 0% 96%',
    secondaryForeground: '0 0% 14%',
    muted: '0 0% 96%',
    mutedForeground: '0 0% 45%',
    accent: '0 0% 92%',
    accentForeground: '0 0% 14%',
    destructive: '0 70% 45%',
    destructiveForeground: '0 0% 98%',
    success: '0 0% 28%',
    successForeground: '0 0% 98%',
    warning: '0 0% 35%',
    warningForeground: '0 0% 98%',
    info: '0 0% 40%',
    infoForeground: '0 0% 98%',
    border: '0 0% 88%',
    input: '0 0% 88%',
    ring: '0 0% 18%',
    radius: baseRadius,
  },
  dark: {
    background: '0 0% 7%',
    foreground: '0 0% 95%',
    card: '0 0% 10%',
    cardForeground: '0 0% 95%',
    popover: '0 0% 10%',
    popoverForeground: '0 0% 95%',
    primary: '0 0% 90%',
    primaryForeground: '0 0% 10%',
    secondary: '0 0% 16%',
    secondaryForeground: '0 0% 95%',
    muted: '0 0% 16%',
    mutedForeground: '0 0% 65%',
    accent: '0 0% 16%',
    accentForeground: '0 0% 95%',
    destructive: '0 60% 50%',
    destructiveForeground: '0 0% 98%',
    success: '0 0% 75%',
    successForeground: '0 0% 10%',
    warning: '0 0% 70%',
    warningForeground: '0 0% 10%',
    info: '0 0% 80%',
    infoForeground: '0 0% 10%',
    border: '0 0% 18%',
    input: '0 0% 18%',
    ring: '0 0% 90%',
    radius: baseRadius,
  },
};

export const themes: Record<ThemeId, ThemeDefinition> = {
  default: defaultTheme,
  forest: forestTheme,
  sunset: sunsetTheme,
  monochrome: monochromeTheme,
};

export const themeOrder: ThemeId[] = ['default', 'forest', 'sunset', 'monochrome'];

const tokenKeyToCssVar: Record<keyof ThemeTokens, string> = {
  background: '--background',
  foreground: '--foreground',
  card: '--card',
  cardForeground: '--card-foreground',
  popover: '--popover',
  popoverForeground: '--popover-foreground',
  primary: '--primary',
  primaryForeground: '--primary-foreground',
  secondary: '--secondary',
  secondaryForeground: '--secondary-foreground',
  muted: '--muted',
  mutedForeground: '--muted-foreground',
  accent: '--accent',
  accentForeground: '--accent-foreground',
  destructive: '--destructive',
  destructiveForeground: '--destructive-foreground',
  success: '--success',
  successForeground: '--success-foreground',
  warning: '--warning',
  warningForeground: '--warning-foreground',
  info: '--info',
  infoForeground: '--info-foreground',
  border: '--border',
  input: '--input',
  ring: '--ring',
  radius: '--radius',
};

export function applyTheme(themeId: ThemeId, mode: ThemeMode): void {
  if (typeof document === 'undefined') return;
  const theme = themes[themeId];
  const tokens = theme[mode];
  const root = document.documentElement;

  for (const key of Object.keys(tokens) as (keyof ThemeTokens)[]) {
    root.style.setProperty(tokenKeyToCssVar[key], tokens[key]);
  }

  root.classList.toggle('dark', mode === 'dark');
  root.dataset.theme = themeId;
  root.dataset.mode = mode;
}
