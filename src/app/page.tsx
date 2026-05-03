'use client';

import { CheckCircle2, Database, Languages, Palette } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { themes } from '@/lib/themes/themes';
import { localeMeta } from '@/lib/i18n/config';
import { usePreferences } from '@/stores/preferences-store';

export default function HomePage() {
  const t = useTranslations('common');
  const themeId = usePreferences((s) => s.themeId);
  const locale = usePreferences((s) => s.locale);

  return (
    <div className="mx-auto flex max-w-4xl flex-col gap-6 p-8">
      <Card className="border-border/60 shadow-2xl">
        <CardHeader className="space-y-3">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/15 text-primary ring-1 ring-primary/30">
              <Database className="h-6 w-6" />
            </div>
            <div>
              <CardTitle className="text-2xl tracking-tight">{t('home.welcome')}</CardTitle>
              <CardDescription>{t('app.tagline')}</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-5">
          <div className="flex items-center gap-2 rounded-md border border-success/30 bg-success/10 px-3 py-2 text-sm text-success">
            <CheckCircle2 className="h-4 w-4" />
            <span className="font-medium">{t('status.phase2Done')}</span>
          </div>
          <p className="text-sm text-muted-foreground">{t('home.description')}</p>
          <div className="flex flex-wrap gap-2">
            <Badge variant="secondary">Electron 33</Badge>
            <Badge variant="secondary">Next.js 14</Badge>
            <Badge variant="secondary">TypeScript</Badge>
            <Badge variant="secondary">Tailwind</Badge>
            <Badge variant="secondary">shadcn/ui</Badge>
            <Badge variant="secondary">next-intl</Badge>
            <Badge variant="secondary">Zustand</Badge>
            <Badge variant="secondary">Framer Motion</Badge>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Palette className="h-4 w-4 text-primary" />
              <CardTitle className="text-base">{t('home.currentTheme')}</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-3">
              <span
                aria-hidden
                className="h-8 w-8 rounded-md ring-1 ring-border"
                style={{ background: themes[themeId].preview.dark }}
              />
              <div>
                <div className="font-medium">{themes[themeId].name}</div>
                <div className="text-xs text-muted-foreground">{themes[themeId].description}</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Languages className="h-4 w-4 text-primary" />
              <CardTitle className="text-base">{t('home.currentLanguage')}</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-3">
              <span aria-hidden className="text-3xl">
                {localeMeta[locale].flag}
              </span>
              <div>
                <div className="font-medium">{localeMeta[locale].label}</div>
                <div className="text-xs uppercase text-muted-foreground">{locale}</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
