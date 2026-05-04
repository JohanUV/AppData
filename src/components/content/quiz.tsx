'use client';

import { useMemo, useState } from 'react';
import { Check, RotateCcw, X } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useGamification } from '@/hooks/use-gamification';
import { cn } from '@/lib/utils';

// ──────────────────────────────────────────────────────────────────────────
// Tipos de pregunta
// ──────────────────────────────────────────────────────────────────────────
export type Question =
  | {
      type: 'multiple_choice';
      id: string;
      prompt: string;
      options: string[];
      correctIndex: number;
      explanation?: string;
    }
  | {
      type: 'true_false';
      id: string;
      prompt: string;
      correct: boolean;
      explanation?: string;
    }
  | {
      type: 'fill_code';
      id: string;
      prompt: string;
      template: string; // contiene "___" donde va la respuesta
      answer: string;
      caseSensitive?: boolean;
      explanation?: string;
    }
  | {
      type: 'order_steps';
      id: string;
      prompt: string;
      steps: string[]; // orden correcto
      explanation?: string;
    };

interface QuizProps {
  id: string;
  questions: Question[];
  xpReward?: number;
  passingScore?: number;
}

export function Quiz({ id, questions, xpReward = 50, passingScore = 70 }: QuizProps) {
  const { completeLesson } = useGamification();
  const [answers, setAnswers] = useState<Record<string, unknown>>({});
  const [submitted, setSubmitted] = useState(false);
  const [awardedXp, setAwardedXp] = useState<number | null>(null);

  const score = useMemo(() => {
    if (!submitted) return 0;
    let correct = 0;
    for (const q of questions) {
      if (isCorrect(q, answers[q.id])) correct++;
    }
    return Math.round((correct / questions.length) * 100);
  }, [submitted, answers, questions]);

  const passed = score >= passingScore;

  function setAnswer(qid: string, value: unknown) {
    if (submitted) return;
    setAnswers((a) => ({ ...a, [qid]: value }));
  }

  async function submit() {
    if (submitted) return;
    setSubmitted(true);
    const correctCount = questions.filter((q) => isCorrect(q, answers[q.id])).length;
    const finalScore = Math.round((correctCount / questions.length) * 100);
    if (finalScore >= passingScore) {
      const xp = Math.round(xpReward * (finalScore / 100));
      await completeLesson(`quiz:${id}`, xp, 0, finalScore);
      setAwardedXp(xp);
    }
  }

  function reset() {
    setAnswers({});
    setSubmitted(false);
    setAwardedXp(null);
  }

  const allAnswered = questions.every((q) => answers[q.id] !== undefined);

  return (
    <Card className="my-6">
      <CardHeader className="flex-row items-center justify-between">
        <CardTitle className="text-base">Quiz · {questions.length} preguntas</CardTitle>
        <Badge variant="secondary" className="text-xs">
          Aprueba con ≥ {passingScore}% · {xpReward} XP máx
        </Badge>
      </CardHeader>
      <CardContent className="space-y-6">
        {questions.map((q, idx) => (
          <QuestionView
            key={q.id}
            index={idx + 1}
            question={q}
            answer={answers[q.id]}
            submitted={submitted}
            onChange={(v) => setAnswer(q.id, v)}
          />
        ))}

        {!submitted && (
          <Button onClick={submit} disabled={!allAnswered} className="w-full">
            Enviar respuestas
          </Button>
        )}

        {submitted && (
          <div
            className={cn(
              'flex items-center justify-between rounded-md border p-4',
              passed
                ? 'border-success/40 bg-success/10 text-success'
                : 'border-destructive/40 bg-destructive/10 text-destructive',
            )}
          >
            <div>
              <div className="text-sm font-semibold">
                Puntaje: {score}% — {passed ? '¡Aprobado!' : 'No aprobado'}
              </div>
              {awardedXp !== null && <div className="text-xs">+{awardedXp} XP otorgados</div>}
            </div>
            <Button variant="outline" size="sm" onClick={reset}>
              <RotateCcw className="h-4 w-4" />
              <span className="ml-2">Reintentar</span>
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// ──────────────────────────────────────────────────────────────────────────
// Vistas por tipo
// ──────────────────────────────────────────────────────────────────────────
interface QuestionViewProps {
  index: number;
  question: Question;
  answer: unknown;
  submitted: boolean;
  onChange: (value: unknown) => void;
}

function QuestionView({ index, question, answer, submitted, onChange }: QuestionViewProps) {
  const correct = isCorrect(question, answer);

  return (
    <div className="space-y-3">
      <div className="flex items-baseline gap-2">
        <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          {index}.
        </span>
        <h4 className="font-medium">{question.prompt}</h4>
      </div>

      {question.type === 'multiple_choice' && (
        <div className="space-y-1.5">
          {question.options.map((opt, i) => {
            const selected = answer === i;
            const isThisCorrect = i === question.correctIndex;
            return (
              <button
                key={i}
                type="button"
                onClick={() => onChange(i)}
                disabled={submitted}
                className={cn(
                  'flex w-full items-center gap-3 rounded-md border p-3 text-left text-sm transition',
                  !submitted && selected && 'border-primary bg-primary/5',
                  !submitted && !selected && 'border-border/60 hover:bg-accent',
                  submitted && isThisCorrect && 'border-success/50 bg-success/10',
                  submitted && selected && !isThisCorrect && 'border-destructive/50 bg-destructive/10',
                )}
              >
                <span className="flex h-5 w-5 items-center justify-center rounded-full border border-current text-[10px] font-bold">
                  {String.fromCharCode(65 + i)}
                </span>
                <span className="flex-1">{opt}</span>
                {submitted && isThisCorrect && <Check className="h-4 w-4 text-success" />}
                {submitted && selected && !isThisCorrect && (
                  <X className="h-4 w-4 text-destructive" />
                )}
              </button>
            );
          })}
        </div>
      )}

      {question.type === 'true_false' && (
        <div className="flex gap-2">
          {[true, false].map((val) => {
            const selected = answer === val;
            const isThisCorrect = val === question.correct;
            return (
              <button
                key={String(val)}
                type="button"
                onClick={() => onChange(val)}
                disabled={submitted}
                className={cn(
                  'flex-1 rounded-md border p-3 text-sm font-medium transition',
                  !submitted && selected && 'border-primary bg-primary/5',
                  !submitted && !selected && 'border-border/60 hover:bg-accent',
                  submitted && isThisCorrect && 'border-success/50 bg-success/10',
                  submitted && selected && !isThisCorrect && 'border-destructive/50 bg-destructive/10',
                )}
              >
                {val ? 'Verdadero' : 'Falso'}
              </button>
            );
          })}
        </div>
      )}

      {question.type === 'fill_code' && (
        <FillCode question={question} answer={answer as string | undefined} submitted={submitted} onChange={onChange} />
      )}

      {question.type === 'order_steps' && (
        <OrderSteps question={question} answer={answer as string[] | undefined} submitted={submitted} onChange={onChange} />
      )}

      {submitted && question.explanation && (
        <div
          className={cn(
            'rounded-md border p-3 text-xs',
            correct ? 'border-success/30 bg-success/5' : 'border-info/30 bg-info/5',
          )}
        >
          <span className="font-semibold">Explicación: </span>
          {question.explanation}
        </div>
      )}
    </div>
  );
}

function FillCode({
  question,
  answer,
  submitted,
  onChange,
}: {
  question: Extract<Question, { type: 'fill_code' }>;
  answer: string | undefined;
  submitted: boolean;
  onChange: (v: string) => void;
}) {
  const [before, after] = question.template.split('___');
  const correct = isCorrect(question, answer);
  return (
    <div className="rounded-md border border-border/60 bg-muted/30 p-3 font-mono text-sm">
      <code className="whitespace-pre-wrap">{before ?? ''}</code>
      <input
        type="text"
        value={answer ?? ''}
        onChange={(e) => onChange(e.target.value)}
        disabled={submitted}
        className={cn(
          'mx-1 inline-block min-w-[8rem] rounded border bg-background px-2 py-0.5 font-mono outline-none transition',
          !submitted && 'border-input focus:border-primary focus:ring-1 focus:ring-ring',
          submitted && correct && 'border-success/50 bg-success/10 text-success',
          submitted && !correct && 'border-destructive/50 bg-destructive/10 text-destructive',
        )}
        placeholder="..."
      />
      <code className="whitespace-pre-wrap">{after ?? ''}</code>
      {submitted && !correct && (
        <div className="mt-2 text-xs text-destructive">Respuesta correcta: {question.answer}</div>
      )}
    </div>
  );
}

function OrderSteps({
  question,
  answer,
  submitted,
  onChange,
}: {
  question: Extract<Question, { type: 'order_steps' }>;
  answer: string[] | undefined;
  submitted: boolean;
  onChange: (v: string[]) => void;
}) {
  // Inicializar con orden aleatorio una vez.
  const [order, setOrder] = useState<string[]>(() => {
    if (answer) return answer;
    const shuffled = [...question.steps];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j]!, shuffled[i]!];
    }
    return shuffled;
  });

  function move(idx: number, dir: -1 | 1) {
    if (submitted) return;
    const next = [...order];
    const target = idx + dir;
    if (target < 0 || target >= next.length) return;
    [next[idx], next[target]] = [next[target]!, next[idx]!];
    setOrder(next);
    onChange(next);
  }

  return (
    <div className="space-y-1.5">
      {order.map((step, i) => {
        const isThisCorrect = step === question.steps[i];
        return (
          <div
            key={step}
            className={cn(
              'flex items-center gap-2 rounded-md border p-2 text-sm',
              !submitted && 'border-border/60',
              submitted && isThisCorrect && 'border-success/50 bg-success/10',
              submitted && !isThisCorrect && 'border-destructive/50 bg-destructive/10',
            )}
          >
            <span className="font-mono text-xs text-muted-foreground">{i + 1}.</span>
            <span className="flex-1">{step}</span>
            {!submitted && (
              <div className="flex gap-1">
                <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => move(i, -1)}>
                  ↑
                </Button>
                <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => move(i, 1)}>
                  ↓
                </Button>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

function isCorrect(q: Question, answer: unknown): boolean {
  switch (q.type) {
    case 'multiple_choice':
      return answer === q.correctIndex;
    case 'true_false':
      return answer === q.correct;
    case 'fill_code': {
      if (typeof answer !== 'string') return false;
      const a = q.caseSensitive ? answer : answer.toLowerCase().trim();
      const b = q.caseSensitive ? q.answer : q.answer.toLowerCase().trim();
      return a === b;
    }
    case 'order_steps': {
      if (!Array.isArray(answer)) return false;
      if (answer.length !== q.steps.length) return false;
      return answer.every((s, i) => s === q.steps[i]);
    }
  }
}
