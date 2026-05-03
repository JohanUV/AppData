'use client';

import { useEffect } from 'react';
import { usePreferences } from '@/stores/preferences-store';
import { applyTheme } from './themes';

interface ThemeProviderProps {
  children: React.ReactNode;
}

export function ThemeProvider({ children }: ThemeProviderProps) {
  const themeId = usePreferences((s) => s.themeId);
  const mode = usePreferences((s) => s.mode);

  useEffect(() => {
    applyTheme(themeId, mode);
  }, [themeId, mode]);

  return <>{children}</>;
}
