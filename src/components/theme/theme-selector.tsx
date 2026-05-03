'use client';

import { Check, Palette } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { themeOrder, themes } from '@/lib/themes/themes';
import { usePreferences } from '@/stores/preferences-store';
import { cn } from '@/lib/utils';

interface ThemeSelectorProps {
  variant?: 'icon' | 'full';
}

export function ThemeSelector({ variant = 'icon' }: ThemeSelectorProps) {
  const themeId = usePreferences((s) => s.themeId);
  const mode = usePreferences((s) => s.mode);
  const setTheme = usePreferences((s) => s.setTheme);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          size={variant === 'icon' ? 'icon' : 'default'}
          aria-label="Seleccionar tema"
        >
          <Palette className="h-4 w-4" />
          {variant === 'full' && (
            <span className="ml-2 truncate">{themes[themeId].name}</span>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-64">
        <DropdownMenuLabel>Temas</DropdownMenuLabel>
        <DropdownMenuSeparator />
        {themeOrder.map((id) => {
          const t = themes[id];
          const swatch = t.preview[mode];
          const active = id === themeId;
          return (
            <DropdownMenuItem
              key={id}
              onSelect={() => setTheme(id)}
              className="flex items-center gap-3 py-2"
            >
              <span
                aria-hidden
                className="h-6 w-6 rounded-md ring-1 ring-border"
                style={{ background: swatch }}
              />
              <span className="flex-1">
                <span className="block text-sm font-medium">{t.name}</span>
                <span className="block text-xs text-muted-foreground">{t.description}</span>
              </span>
              <Check className={cn('h-4 w-4 shrink-0', active ? 'opacity-100' : 'opacity-0')} />
            </DropdownMenuItem>
          );
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
