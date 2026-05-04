'use client';

import { useState } from 'react';
import { Eye, Lightbulb, Play, RotateCcw, CheckCircle2, XCircle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { MonacoEditor, type MonacoLanguage } from '@/components/editor/monaco-editor';
import { runJs } from '@/components/editor/js-runner';
import { useGamification } from '@/hooks/use-gamification';
import { cn } from '@/lib/utils';

export interface ExerciseTest {
  description: string;
  // assertion ejecutada con el código del usuario en scope. Ej.: "answer === 42".
  assert: string;
}

interface ExerciseProps {
  id: string;
  title: string;
  description: string;
  language?: MonacoLanguage; // default 'javascript'
  starterCode: string;
  solution: string;
  hints?: string[];
  tests?: ExerciseTest[]; // sólo se ejecutan para JS/TS
  xpReward?: number;
}

export function Exercise({
  id,
  title,
  description,
  language = 'javascript',
  starterCode,
  solution,
  hints = [],
  tests = [],
  xpReward = 75,
}: ExerciseProps) {
  const { completeLesson } = useGamification();
  const [code, setCode] = useState(starterCode);
  const [output, setOutput] = useState<string>('');
  const [running, setRunning] = useState(false);
  const [attempts, setAttempts] = useState(0);
  const [hintsRevealed, setHintsRevealed] = useState(0);
  const [showSolution, setShowSolution] = useState(false);
  const [solved, setSolved] = useState(false);
  const [testResults, setTestResults] = useState<{ desc: string; pass: boolean; err?: string }[]>([]);

  const isJs = language === 'javascript' || language === 'typescript';

  async function run() {
    setRunning(true);
    setAttempts((a) => a + 1);
    setTestResults([]);
    try {
      if (isJs) {
        const r = await runJs(code);
        setOutput(r.output || (r.ok ? '(sin salida)' : ''));
        if (!r.ok && r.error) {
          setOutput((prev) => prev + (prev ? '\n' : '') + 'Error: ' + r.error);
        }

        if (r.ok && tests.length > 0) {
          const results = await runTests(code, tests);
          setTestResults(results);
          const allPass = results.every((t) => t.pass);
          if (allPass && !solved) {
            setSolved(true);
            const xp = Math.max(10, xpReward - hintsRevealed * 10);
            await completeLesson(`exercise:${id}`, xp, 0, 100);
          }
        }
      } else {
        setOutput(
          `Para ejecutar código ${language.toUpperCase()} usa tu entorno local. Aquí guardamos tu progreso y te damos pistas/solución.`,
        );
      }
    } finally {
      setRunning(false);
    }
  }

  function reset() {
    setCode(starterCode);
    setOutput('');
    setTestResults([]);
    setSolved(false);
  }

  function revealHint() {
    setHintsRevealed((h) => Math.min(hints.length, h + 1));
  }

  const canShowSolution = attempts >= 2 || hintsRevealed >= hints.length;

  return (
    <Card className="my-6">
      <CardHeader className="space-y-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base">Ejercicio: {title}</CardTitle>
          <Badge variant="secondary" className="text-xs">
            +{xpReward} XP
          </Badge>
        </div>
        <p className="text-sm text-muted-foreground">{description}</p>
      </CardHeader>
      <CardContent className="space-y-3">
        <MonacoEditor
          language={language}
          value={code}
          onChange={setCode}
          height={260}
          className="overflow-hidden rounded-md border border-border/60"
        />

        <div className="flex flex-wrap gap-2">
          <Button onClick={run} disabled={running} size="sm">
            <Play className="h-4 w-4" />
            <span className="ml-2">{running ? 'Ejecutando…' : 'Ejecutar'}</span>
          </Button>
          <Button onClick={reset} variant="outline" size="sm">
            <RotateCcw className="h-4 w-4" />
            <span className="ml-2">Reset</span>
          </Button>
          {hints.length > 0 && hintsRevealed < hints.length && (
            <Button onClick={revealHint} variant="ghost" size="sm">
              <Lightbulb className="h-4 w-4" />
              <span className="ml-2">
                Pista ({hintsRevealed}/{hints.length})
              </span>
            </Button>
          )}
          {canShowSolution && (
            <Button onClick={() => setShowSolution((s) => !s)} variant="ghost" size="sm">
              <Eye className="h-4 w-4" />
              <span className="ml-2">{showSolution ? 'Ocultar solución' : 'Ver solución'}</span>
            </Button>
          )}
        </div>

        {hintsRevealed > 0 && (
          <div className="space-y-1.5">
            {hints.slice(0, hintsRevealed).map((h, i) => (
              <div
                key={i}
                className="flex gap-2 rounded-md border border-warning/30 bg-warning/10 p-2.5 text-sm text-warning"
              >
                <Lightbulb className="mt-0.5 h-4 w-4 shrink-0" />
                <span>{h}</span>
              </div>
            ))}
          </div>
        )}

        {output && (
          <div className="rounded-md border border-border/60 bg-muted/30 p-3 text-sm">
            <div className="mb-1 text-[10px] uppercase tracking-wider text-muted-foreground">
              Salida
            </div>
            <pre className="whitespace-pre-wrap font-mono text-xs">{output}</pre>
          </div>
        )}

        {testResults.length > 0 && (
          <div className="rounded-md border border-border/60 p-3">
            <div className="mb-2 text-xs font-medium uppercase tracking-wider text-muted-foreground">
              Tests ({testResults.filter((t) => t.pass).length} / {testResults.length})
            </div>
            <ul className="space-y-1.5 text-sm">
              {testResults.map((r, i) => (
                <li key={i} className="flex items-start gap-2">
                  {r.pass ? (
                    <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-success" />
                  ) : (
                    <XCircle className="mt-0.5 h-4 w-4 shrink-0 text-destructive" />
                  )}
                  <span className={cn(r.pass ? 'text-success' : 'text-destructive')}>
                    {r.desc}
                    {r.err && <span className="ml-2 text-xs opacity-70">— {r.err}</span>}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {solved && (
          <div className="rounded-md border border-success/40 bg-success/10 p-3 text-sm text-success">
            ¡Ejercicio resuelto! Intentos: {attempts}, pistas usadas: {hintsRevealed}.
          </div>
        )}

        {showSolution && (
          <div className="space-y-2">
            <div className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
              Solución sugerida
            </div>
            <MonacoEditor
              language={language}
              value={solution}
              height={220}
              readOnly
              className="overflow-hidden rounded-md border border-border/60"
            />
          </div>
        )}
      </CardContent>
    </Card>
  );
}

async function runTests(
  userCode: string,
  tests: ExerciseTest[],
): Promise<{ desc: string; pass: boolean; err?: string }[]> {
  const results: { desc: string; pass: boolean; err?: string }[] = [];
  for (const t of tests) {
    try {
      // Evalúa el código del usuario y la aserción en un mismo scope.
      const fn = new Function(
        `${userCode}\n;return (function(){return Boolean(${t.assert});})();`,
      );
      const ok = Boolean(fn());
      results.push({ desc: t.description, pass: ok });
    } catch (e) {
      results.push({
        desc: t.description,
        pass: false,
        err: e instanceof Error ? e.message : String(e),
      });
    }
  }
  return results;
}
