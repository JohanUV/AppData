import type { ComponentType } from 'react';
import type { MDXComponents } from 'mdx/types';
import type { Locale } from '@/lib/i18n/config';
import type { Translations } from '@/lib/db/schema';
import { LessonStub } from '@/components/content/lesson-stub';
import { lessonMetadata, type LessonMetaEntry } from './lessons-meta';
import { moduleOrder } from './modules';

type MDXContent = ComponentType<{ components?: MDXComponents }>;

// ──────────────────────────────────────────────────────────────────────
// Imports estáticos por locale.
// Sólo importamos las lecciones realmente escritas. El resto cae a stub.
// ──────────────────────────────────────────────────────────────────────
import IntroEs from './intro/what-is-data-engineering.mdx';
import IntroEn from './intro/what-is-data-engineering.en.mdx';
import IntroPt from './intro/what-is-data-engineering.pt.mdx';

// Módulo git
import GitWhatEs from './git/git-what-and-why.mdx';
import GitWhatEn from './git/git-what-and-why.en.mdx';
import GitWhatPt from './git/git-what-and-why.pt.mdx';
import GitInstallEs from './git/git-install-config.mdx';
import GitInstallEn from './git/git-install-config.en.mdx';
import GitInstallPt from './git/git-install-config.pt.mdx';
import GitFirstEs from './git/git-first-repo.mdx';
import GitFirstEn from './git/git-first-repo.en.mdx';
import GitFirstPt from './git/git-first-repo.pt.mdx';
import GitEssEs from './git/git-essentials.mdx';
import GitEssEn from './git/git-essentials.en.mdx';
import GitEssPt from './git/git-essentials.pt.mdx';
import GitBranchesEs from './git/git-branches-merge.mdx';
import GitBranchesEn from './git/git-branches-merge.en.mdx';
import GitBranchesPt from './git/git-branches-merge.pt.mdx';
import GitRemoteEs from './git/git-remote-github.mdx';
import GitRemoteEn from './git/git-remote-github.en.mdx';
import GitRemotePt from './git/git-remote-github.pt.mdx';
import GitPrEs from './git/git-pull-requests.mdx';
import GitPrEn from './git/git-pull-requests.en.mdx';
import GitPrPt from './git/git-pull-requests.pt.mdx';
import GitBpEs from './git/git-best-practices.mdx';
import GitBpEn from './git/git-best-practices.en.mdx';
import GitBpPt from './git/git-best-practices.pt.mdx';

// Módulo sql
import SqlSelectEs from './sql/sql-select-where-orderby.mdx';
import SqlSelectEn from './sql/sql-select-where-orderby.en.mdx';
import SqlSelectPt from './sql/sql-select-where-orderby.pt.mdx';
import SqlJoinsEs from './sql/sql-joins-deep.mdx';
import SqlJoinsEn from './sql/sql-joins-deep.en.mdx';
import SqlJoinsPt from './sql/sql-joins-deep.pt.mdx';
import SqlAggEs from './sql/sql-aggregations.mdx';
import SqlAggEn from './sql/sql-aggregations.en.mdx';
import SqlAggPt from './sql/sql-aggregations.pt.mdx';
import SqlSubEs from './sql/sql-subqueries.mdx';
import SqlSubEn from './sql/sql-subqueries.en.mdx';
import SqlSubPt from './sql/sql-subqueries.pt.mdx';
import SqlCtesEs from './sql/sql-ctes.mdx';
import SqlCtesEn from './sql/sql-ctes.en.mdx';
import SqlCtesPt from './sql/sql-ctes.pt.mdx';
import SqlW1Es from './sql/sql-windows-1.mdx';
import SqlW1En from './sql/sql-windows-1.en.mdx';
import SqlW1Pt from './sql/sql-windows-1.pt.mdx';
import SqlW2Es from './sql/sql-windows-2.mdx';
import SqlW2En from './sql/sql-windows-2.en.mdx';
import SqlW2Pt from './sql/sql-windows-2.pt.mdx';
import SqlCaseEs from './sql/sql-case-when.mdx';
import SqlCaseEn from './sql/sql-case-when.en.mdx';
import SqlCasePt from './sql/sql-case-when.pt.mdx';
import SqlIdxEs from './sql/sql-indexes.mdx';
import SqlIdxEn from './sql/sql-indexes.en.mdx';
import SqlIdxPt from './sql/sql-indexes.pt.mdx';
import SqlOptEs from './sql/sql-query-optimization.mdx';
import SqlOptEn from './sql/sql-query-optimization.en.mdx';
import SqlOptPt from './sql/sql-query-optimization.pt.mdx';

// Módulo python (solo ES en fase 6.2)
import PyBasicsEs from './python/python-pandas-basics.mdx';
import PyAdvEs from './python/python-pandas-advanced.mdx';
import PyNumpyEs from './python/python-numpy.mdx';
import PyApisEs from './python/python-apis-requests.mdx';
import PySqlAlcEs from './python/python-sqlalchemy.mdx';
import PyParquetEs from './python/python-parquet.mdx';
import PyTestEs from './python/python-testing.mdx';
import PyVenvEs from './python/python-venv-deps.mdx';

// Módulo modeling
import ModNormEs from './modeling/modeling-normalization.mdx';
import ModOltpEs from './modeling/modeling-oltp-vs-olap.mdx';
import ModStarEs from './modeling/modeling-star-schema.mdx';
import ModSnowEs from './modeling/modeling-snowflake-schema.mdx';
import ModScdEs from './modeling/modeling-scd.mdx';
import ModEcomEs from './modeling/modeling-ecommerce-case.mdx';

// Módulo etl
import EtlVsEs from './etl/etl-vs-elt.mdx';
import EtlAirfEs from './etl/etl-airflow-intro.mdx';
import EtlDagEs from './etl/etl-first-dag.mdx';
import EtlOpEs from './etl/etl-operators-sensors.mdx';
import EtlXcomEs from './etl/etl-xcoms-deps.mdx';
import EtlDbtIntroEs from './etl/etl-dbt-intro.mdx';
import EtlDbtModelsEs from './etl/etl-dbt-models-tests.mdx';
import EtlE2eEs from './etl/etl-e2e-pipeline.mdx';

// Módulo warehouse
import WhConcEs from './warehouse/wh-concepts.mdx';
import WhBqEs from './warehouse/wh-bigquery.mdx';
import WhSnowEs from './warehouse/wh-snowflake.mdx';
import WhPartEs from './warehouse/wh-partitioning.mdx';
import WhCostEs from './warehouse/wh-cost-optimization.mdx';
import WhRevEs from './warehouse/wh-reverse-etl.mdx';

export interface LessonMeta {
  slug: string;
  module: string;
  course: string;
  order: number;
  xpReward: number;
  estimatedMinutes: number;
  prerequisites: string[];
  title: Translations;
  description: Translations;
  type: 'theory' | 'exercise' | 'quiz' | 'project';
}

export interface LessonEntry {
  meta: LessonMeta;
  components: Record<Locale, MDXContent>;
  isStub: boolean;
}

// ──────────────────────────────────────────────────────────────────────
// Mapa de componentes MDX reales por slug.
// Una entrada puede ser parcial (solo es): los locales faltantes caen
// a stub localizado.
// ──────────────────────────────────────────────────────────────────────
const realComponents: Record<string, Partial<Record<Locale, MDXContent>>> = {
  'what-is-data-engineering': {
    es: IntroEs as MDXContent,
    en: IntroEn as MDXContent,
    pt: IntroPt as MDXContent,
  },
  'git-what-and-why': {
    es: GitWhatEs as MDXContent,
    en: GitWhatEn as MDXContent,
    pt: GitWhatPt as MDXContent,
  },
  'git-install-config': {
    es: GitInstallEs as MDXContent,
    en: GitInstallEn as MDXContent,
    pt: GitInstallPt as MDXContent,
  },
  'git-first-repo': {
    es: GitFirstEs as MDXContent,
    en: GitFirstEn as MDXContent,
    pt: GitFirstPt as MDXContent,
  },
  'git-essentials': {
    es: GitEssEs as MDXContent,
    en: GitEssEn as MDXContent,
    pt: GitEssPt as MDXContent,
  },
  'git-branches-merge': {
    es: GitBranchesEs as MDXContent,
    en: GitBranchesEn as MDXContent,
    pt: GitBranchesPt as MDXContent,
  },
  'git-remote-github': {
    es: GitRemoteEs as MDXContent,
    en: GitRemoteEn as MDXContent,
    pt: GitRemotePt as MDXContent,
  },
  'git-pull-requests': {
    es: GitPrEs as MDXContent,
    en: GitPrEn as MDXContent,
    pt: GitPrPt as MDXContent,
  },
  'git-best-practices': {
    es: GitBpEs as MDXContent,
    en: GitBpEn as MDXContent,
    pt: GitBpPt as MDXContent,
  },
  'sql-select-where-orderby': {
    es: SqlSelectEs as MDXContent,
    en: SqlSelectEn as MDXContent,
    pt: SqlSelectPt as MDXContent,
  },
  'sql-joins-deep': {
    es: SqlJoinsEs as MDXContent,
    en: SqlJoinsEn as MDXContent,
    pt: SqlJoinsPt as MDXContent,
  },
  'sql-aggregations': {
    es: SqlAggEs as MDXContent,
    en: SqlAggEn as MDXContent,
    pt: SqlAggPt as MDXContent,
  },
  'sql-subqueries': {
    es: SqlSubEs as MDXContent,
    en: SqlSubEn as MDXContent,
    pt: SqlSubPt as MDXContent,
  },
  'sql-ctes': {
    es: SqlCtesEs as MDXContent,
    en: SqlCtesEn as MDXContent,
    pt: SqlCtesPt as MDXContent,
  },
  'sql-windows-1': {
    es: SqlW1Es as MDXContent,
    en: SqlW1En as MDXContent,
    pt: SqlW1Pt as MDXContent,
  },
  'sql-windows-2': {
    es: SqlW2Es as MDXContent,
    en: SqlW2En as MDXContent,
    pt: SqlW2Pt as MDXContent,
  },
  'sql-case-when': {
    es: SqlCaseEs as MDXContent,
    en: SqlCaseEn as MDXContent,
    pt: SqlCasePt as MDXContent,
  },
  'sql-indexes': {
    es: SqlIdxEs as MDXContent,
    en: SqlIdxEn as MDXContent,
    pt: SqlIdxPt as MDXContent,
  },
  'sql-query-optimization': {
    es: SqlOptEs as MDXContent,
    en: SqlOptEn as MDXContent,
    pt: SqlOptPt as MDXContent,
  },
  // ── Módulos 2-5: solo ES en fase 6.2 (EN/PT caen a stub localizado) ──
  'python-pandas-basics': { es: PyBasicsEs as MDXContent },
  'python-pandas-advanced': { es: PyAdvEs as MDXContent },
  'python-numpy': { es: PyNumpyEs as MDXContent },
  'python-apis-requests': { es: PyApisEs as MDXContent },
  'python-sqlalchemy': { es: PySqlAlcEs as MDXContent },
  'python-parquet': { es: PyParquetEs as MDXContent },
  'python-testing': { es: PyTestEs as MDXContent },
  'python-venv-deps': { es: PyVenvEs as MDXContent },

  'modeling-normalization': { es: ModNormEs as MDXContent },
  'modeling-oltp-vs-olap': { es: ModOltpEs as MDXContent },
  'modeling-star-schema': { es: ModStarEs as MDXContent },
  'modeling-snowflake-schema': { es: ModSnowEs as MDXContent },
  'modeling-scd': { es: ModScdEs as MDXContent },
  'modeling-ecommerce-case': { es: ModEcomEs as MDXContent },

  'etl-vs-elt': { es: EtlVsEs as MDXContent },
  'etl-airflow-intro': { es: EtlAirfEs as MDXContent },
  'etl-first-dag': { es: EtlDagEs as MDXContent },
  'etl-operators-sensors': { es: EtlOpEs as MDXContent },
  'etl-xcoms-deps': { es: EtlXcomEs as MDXContent },
  'etl-dbt-intro': { es: EtlDbtIntroEs as MDXContent },
  'etl-dbt-models-tests': { es: EtlDbtModelsEs as MDXContent },
  'etl-e2e-pipeline': { es: EtlE2eEs as MDXContent },

  'wh-concepts': { es: WhConcEs as MDXContent },
  'wh-bigquery': { es: WhBqEs as MDXContent },
  'wh-snowflake': { es: WhSnowEs as MDXContent },
  'wh-partitioning': { es: WhPartEs as MDXContent },
  'wh-cost-optimization': { es: WhCostEs as MDXContent },
  'wh-reverse-etl': { es: WhRevEs as MDXContent },
};

// ──────────────────────────────────────────────────────────────────────
// Componentes stub (uno por locale) — mismo placeholder con copy traducido.
// ──────────────────────────────────────────────────────────────────────
const StubEs: MDXContent = function () {
  return <LessonStub locale="es" />;
};
const StubEn: MDXContent = function () {
  return <LessonStub locale="en" />;
};
const StubPt: MDXContent = function () {
  return <LessonStub locale="pt" />;
};
const stubComponents: Record<Locale, MDXContent> = { es: StubEs, en: StubEn, pt: StubPt };

// ──────────────────────────────────────────────────────────────────────
// Catálogo "intro" — la única lección que vivía en el registry original.
// Se materializa con el mismo shape que las del array lessonMetadata.
// ──────────────────────────────────────────────────────────────────────
const introMeta: LessonMetaEntry = {
  slug: 'what-is-data-engineering',
  module: 'intro',
  order: 1,
  xpReward: 100,
  estimatedMinutes: 15,
  prerequisites: [],
  type: 'theory',
  title: {
    es: '¿Qué es Data Engineering?',
    en: 'What is Data Engineering?',
    pt: 'O que é Data Engineering?',
  },
  description: {
    es: 'Visión general del rol, el ciclo de vida del dato y el stack moderno.',
    en: 'Overview of the role, the data lifecycle and the modern stack.',
    pt: 'Visão geral do papel, do ciclo de vida do dado e da stack moderna.',
  },
};

// ──────────────────────────────────────────────────────────────────────
// Construcción del registry combinando metadata + componentes.
// ──────────────────────────────────────────────────────────────────────
function buildEntry(meta: LessonMetaEntry): LessonEntry {
  const real = realComponents[meta.slug];
  // Mezcla real + stub localizado por cada locale faltante.
  const components: Record<Locale, MDXContent> = {
    es: real?.es ?? stubComponents.es,
    en: real?.en ?? stubComponents.en,
    pt: real?.pt ?? stubComponents.pt,
  };
  // isStub = true sólo si NINGUNA locale tiene contenido real (pure stub).
  const isStub = !real || (!real.es && !real.en && !real.pt);
  return {
    meta: {
      slug: meta.slug,
      module: meta.module,
      course: 'data-engineering',
      order: meta.order,
      xpReward: meta.xpReward,
      estimatedMinutes: meta.estimatedMinutes,
      prerequisites: meta.prerequisites,
      type: meta.type,
      title: meta.title,
      description: meta.description,
    },
    components,
    isStub,
  };
}

const allMeta: LessonMetaEntry[] = [introMeta, ...lessonMetadata];
const lessons: Record<string, LessonEntry> = Object.fromEntries(
  allMeta.map((m) => [m.slug, buildEntry(m)]),
);

// Orden global respetando moduleOrder + order dentro del módulo.
const moduleIndex = new Map<string, number>(moduleOrder.map((m, i) => [m, i]));
export const lessonOrder: string[] = allMeta
  .slice()
  .sort((a, b) => {
    const mi = (moduleIndex.get(a.module) ?? 99) - (moduleIndex.get(b.module) ?? 99);
    if (mi !== 0) return mi;
    return a.order - b.order;
  })
  .map((m) => m.slug);

export type LessonSlug = string;

export function getLesson(slug: string): LessonEntry | null {
  return lessons[slug] ?? null;
}

export function getAllLessonSlugs(): string[] {
  return Object.keys(lessons);
}

export function getNextLesson(slug: string): LessonEntry | null {
  const idx = lessonOrder.indexOf(slug);
  if (idx === -1 || idx === lessonOrder.length - 1) return null;
  return getLesson(lessonOrder[idx + 1]!);
}

export function getPrevLesson(slug: string): LessonEntry | null {
  const idx = lessonOrder.indexOf(slug);
  if (idx <= 0) return null;
  return getLesson(lessonOrder[idx - 1]!);
}

export function getLessonsByModule(moduleSlug: string): LessonEntry[] {
  return Object.values(lessons)
    .filter((l) => l.meta.module === moduleSlug)
    .sort((a, b) => a.meta.order - b.meta.order);
}
