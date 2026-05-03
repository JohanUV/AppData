'use client';

import { Moon, Sun } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { usePreferences } from '@/stores/preferences-store';

export function ModeToggle() {
  const mode = usePreferences((s) => s.mode);
  const toggle = usePreferences((s) => s.toggleMode);

  return (
    <Button
      variant="outline"
      size="icon"
      onClick={toggle}
      aria-label={mode === 'dark' ? 'Activar modo claro' : 'Activar modo oscuro'}
    >
      {mode === 'dark' ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
    </Button>
  );
}
