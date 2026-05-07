import { Construction, Sparkles } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

interface LessonStubProps {
  locale: 'es' | 'en' | 'pt';
}

const COPY = {
  es: {
    title: 'Lección en producción',
    body: 'Esta lección está en cola para redacción. El curso completo se libera por sub-fases (ver Fase 6 en el README) — Módulos 0 y 1 ya están vivos en los 3 idiomas.',
    hint: 'Mientras tanto, repasa el módulo anterior o pide al tutor IA que te adelante el tema.',
  },
  en: {
    title: 'Lesson in production',
    body: 'This lesson is queued for writing. The full course is released in sub-phases (see Phase 6 in the README) — Modules 0 and 1 are already live in 3 languages.',
    hint: 'In the meantime, review the previous module or ask the AI tutor for a preview.',
  },
  pt: {
    title: 'Lição em produção',
    body: 'Esta lição está na fila para redação. O curso completo é liberado em sub-fases (veja a Fase 6 no README) — os Módulos 0 e 1 já estão no ar em 3 idiomas.',
    hint: 'Enquanto isso, revise o módulo anterior ou peça ao tutor IA uma prévia.',
  },
} as const;

export function LessonStub({ locale }: LessonStubProps) {
  const t = COPY[locale];
  return (
    <div className="my-8 space-y-4">
      <Card className="border-dashed">
        <CardContent className="flex items-start gap-4 p-6">
          <Construction className="mt-0.5 h-8 w-8 shrink-0 text-amber-500" />
          <div className="space-y-2">
            <h2 className="text-lg font-semibold">{t.title}</h2>
            <p className="text-sm text-muted-foreground">{t.body}</p>
            <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <Sparkles className="h-3 w-3" />
              {t.hint}
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
