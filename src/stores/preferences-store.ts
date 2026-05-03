'use client';

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import type { ThemeId, ThemeMode } from '@/lib/themes/themes';
import type { Locale } from '@/lib/i18n/config';
import { defaultLocale, isLocale } from '@/lib/i18n/config';

interface PreferencesState {
  themeId: ThemeId;
  mode: ThemeMode;
  locale: Locale;
  sidebarCollapsed: boolean;
  hydrated: boolean;
  setTheme: (themeId: ThemeId) => void;
  setMode: (mode: ThemeMode) => void;
  toggleMode: () => void;
  setLocale: (locale: Locale) => void;
  toggleSidebar: () => void;
  setHydrated: () => void;
}

function detectInitialLocale(): Locale {
  if (typeof navigator === 'undefined') return defaultLocale;
  const lang = navigator.language.slice(0, 2).toLowerCase();
  return isLocale(lang) ? lang : defaultLocale;
}

function detectInitialMode(): ThemeMode {
  if (typeof window === 'undefined') return 'dark';
  return window.matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark';
}

export const usePreferences = create<PreferencesState>()(
  persist(
    (set) => ({
      themeId: 'default',
      mode: detectInitialMode(),
      locale: detectInitialLocale(),
      sidebarCollapsed: false,
      hydrated: false,
      setTheme: (themeId) => set({ themeId }),
      setMode: (mode) => set({ mode }),
      toggleMode: () => set((s) => ({ mode: s.mode === 'dark' ? 'light' : 'dark' })),
      setLocale: (locale) => set({ locale }),
      toggleSidebar: () => set((s) => ({ sidebarCollapsed: !s.sidebarCollapsed })),
      setHydrated: () => set({ hydrated: true }),
    }),
    {
      name: 'datapath-preferences',
      storage: createJSONStorage(() => localStorage),
      partialize: (s) => ({
        themeId: s.themeId,
        mode: s.mode,
        locale: s.locale,
        sidebarCollapsed: s.sidebarCollapsed,
      }),
      onRehydrateStorage: () => (state) => state?.setHydrated(),
    },
  ),
);
