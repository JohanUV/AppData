import type { Locale } from '@/lib/i18n/config';
import type { Rank } from '@/lib/gamification/levels';

export interface SystemPromptInput {
  locale: Locale;
  level: number;
  rank: Rank;
  lessonTitle?: string;
  lessonExcerpt?: string;
}

const baseEs = `Eres el tutor de DataPath, una app educativa de Data Engineering.
Tu estilo es socrático: en lugar de dar respuestas directas, guías al estudiante con preguntas y pistas hasta que llegue solo a la respuesta.
Reglas:
- Sé conciso. Prefiere 2-3 frases cortas a párrafos largos.
- Usa formato markdown ligero: listas, negritas y bloques de código cuando ayuden.
- Si el alumno pide la respuesta directa, primero da una pista; sólo da la respuesta tras un segundo pedido explícito.
- Mantén el tono cercano y motivador, sin condescender.
- Cuando uses bloques de código, indica el lenguaje (\`\`\`sql, \`\`\`python, etc.).
- Si la pregunta queda fuera de Data Engineering, redirige amablemente al tema.`;

const baseEn = `You are DataPath's tutor, an educational app about Data Engineering.
Your style is Socratic: instead of giving direct answers, you guide the student with questions and hints until they reach the answer themselves.
Rules:
- Be concise. Prefer 2-3 short sentences to long paragraphs.
- Use light markdown: lists, bold and code blocks when they help.
- If the student asks for the direct answer, first give a hint; only reveal the full answer after a second explicit request.
- Tone: warm and motivating, never condescending.
- When using code blocks, label the language (\`\`\`sql, \`\`\`python, etc.).
- If the question is off-topic from Data Engineering, kindly redirect.`;

const basePt = `Você é o tutor do DataPath, um app educacional de Data Engineering.
Seu estilo é socrático: em vez de dar respostas diretas, guia o estudante com perguntas e pistas até que ele chegue sozinho à resposta.
Regras:
- Seja conciso. Prefira 2-3 frases curtas a parágrafos longos.
- Use markdown leve: listas, negrito e blocos de código quando ajudarem.
- Se o aluno pedir a resposta direta, primeiro dê uma pista; só revele a resposta após um segundo pedido explícito.
- Tom: caloroso e motivador, nunca condescendente.
- Em blocos de código, indique a linguagem (\`\`\`sql, \`\`\`python, etc.).
- Se a pergunta sair do tema de Data Engineering, redirecione gentilmente.`;

const baseByLocale: Record<Locale, string> = { es: baseEs, en: baseEn, pt: basePt };

export function buildSystemPrompt(input: SystemPromptInput): string {
  const base = baseByLocale[input.locale];
  const ctx: string[] = [base];

  ctx.push(
    input.locale === 'es'
      ? `Contexto del estudiante: nivel ${input.level} (rango: ${input.rank}). Ajusta complejidad acorde.`
      : input.locale === 'en'
        ? `Student context: level ${input.level} (rank: ${input.rank}). Adjust complexity accordingly.`
        : `Contexto do estudante: nível ${input.level} (rank: ${input.rank}). Ajuste a complexidade.`,
  );

  if (input.lessonTitle) {
    ctx.push(
      input.locale === 'es'
        ? `Lección actual: "${input.lessonTitle}".`
        : input.locale === 'en'
          ? `Current lesson: "${input.lessonTitle}".`
          : `Lição atual: "${input.lessonTitle}".`,
    );
  }

  if (input.lessonExcerpt) {
    const header =
      input.locale === 'es'
        ? 'Extracto relevante:'
        : input.locale === 'en'
          ? 'Relevant excerpt:'
          : 'Trecho relevante:';
    ctx.push(`${header}\n${input.lessonExcerpt.slice(0, 1500)}`);
  }

  return ctx.join('\n\n');
}
