import { Database, CheckCircle2 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export default function HomePage() {
  return (
    <main className="flex min-h-screen items-center justify-center p-8">
      <Card className="max-w-xl border-border/60 shadow-2xl">
        <CardHeader className="space-y-4">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/15 text-primary ring-1 ring-primary/30">
              <Database className="h-6 w-6" />
            </div>
            <div>
              <CardTitle className="text-2xl tracking-tight">DataPath</CardTitle>
              <CardDescription>Aprende Data Engineering desde cero</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-2 rounded-md border border-emerald-500/20 bg-emerald-500/10 px-3 py-2 text-sm text-emerald-300">
            <CheckCircle2 className="h-4 w-4" />
            <span className="font-medium">Setup completo</span>
          </div>
          <div className="flex flex-wrap gap-2">
            <Badge variant="secondary">Electron 33</Badge>
            <Badge variant="secondary">Next.js 14</Badge>
            <Badge variant="secondary">TypeScript</Badge>
            <Badge variant="secondary">Tailwind</Badge>
            <Badge variant="secondary">shadcn/ui</Badge>
          </div>
          <p className="text-sm text-muted-foreground">
            Fase 1 completada. La estructura base está lista para empezar a construir el resto del
            producto.
          </p>
        </CardContent>
      </Card>
    </main>
  );
}
