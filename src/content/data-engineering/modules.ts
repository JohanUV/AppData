// Definición de los 9 módulos del curso "Data Engineering desde cero".
// El registry consume esto + las metadatas de cada lección para construir
// la navegación, sidebar y el orden global del curso.

import type { Translations } from '@/lib/db/schema';

export interface ModuleMeta {
  slug: string;
  order: number;
  title: Translations;
  description: Translations;
  icon: string; // nombre Lucide
  // Slug del badge que se desbloquea al completar el módulo (ver badges-data).
  completionBadge: string | null;
}

export const modules: ModuleMeta[] = [
  {
    slug: 'intro',
    order: 0,
    icon: 'Sparkles',
    completionBadge: null,
    title: {
      es: 'Introducción',
      en: 'Introduction',
      pt: 'Introdução',
    },
    description: {
      es: 'Bienvenida y panorama del rol de Data Engineer.',
      en: 'Welcome and overview of the Data Engineer role.',
      pt: 'Boas-vindas e panorama do papel de Data Engineer.',
    },
  },
  {
    slug: 'git',
    order: 1,
    icon: 'GitBranch',
    completionBadge: 'git-master',
    title: {
      es: 'Fundamentos de Git y GitHub',
      en: 'Git and GitHub fundamentals',
      pt: 'Fundamentos de Git e GitHub',
    },
    description: {
      es: 'Versionado de código: la habilidad #1 que te falta antes de tocar pipelines.',
      en: 'Code versioning: the #1 skill to nail before touching pipelines.',
      pt: 'Versionamento de código: a habilidade #1 antes de tocar em pipelines.',
    },
  },
  {
    slug: 'sql',
    order: 2,
    icon: 'Database',
    completionBadge: 'sql-master',
    title: {
      es: 'SQL Avanzado',
      en: 'Advanced SQL',
      pt: 'SQL Avançado',
    },
    description: {
      es: 'JOINs, CTEs, window functions y optimización para datos analíticos.',
      en: 'JOINs, CTEs, window functions and optimization for analytical data.',
      pt: 'JOINs, CTEs, window functions e otimização para dados analíticos.',
    },
  },
  {
    slug: 'python',
    order: 3,
    icon: 'Terminal',
    completionBadge: 'python-master',
    title: {
      es: 'Python para Data Engineering',
      en: 'Python for Data Engineering',
      pt: 'Python para Data Engineering',
    },
    description: {
      es: 'Pandas, NumPy, APIs y testing — el cuchillo suizo del Data Engineer.',
      en: 'Pandas, NumPy, APIs and testing — the Data Engineer Swiss army knife.',
      pt: 'Pandas, NumPy, APIs e testing — o canivete suíço do Data Engineer.',
    },
  },
  {
    slug: 'modeling',
    order: 4,
    icon: 'Network',
    completionBadge: 'modeling-master',
    title: {
      es: 'Modelado de datos',
      en: 'Data modeling',
      pt: 'Modelagem de dados',
    },
    description: {
      es: 'Normalización, OLAP, star schema y dimensiones lentamente cambiantes.',
      en: 'Normalization, OLAP, star schema and slowly changing dimensions.',
      pt: 'Normalização, OLAP, star schema e dimensões lentamente mutáveis.',
    },
  },
  {
    slug: 'etl',
    order: 5,
    icon: 'Workflow',
    completionBadge: 'etl-master',
    title: {
      es: 'ETL/ELT y orquestación',
      en: 'ETL/ELT and orchestration',
      pt: 'ETL/ELT e orquestração',
    },
    description: {
      es: 'Airflow, dbt y un pipeline E2E desde cero.',
      en: 'Airflow, dbt and a full E2E pipeline from scratch.',
      pt: 'Airflow, dbt e um pipeline E2E do zero.',
    },
  },
  {
    slug: 'warehouse',
    order: 6,
    icon: 'Warehouse',
    completionBadge: 'warehouse-master',
    title: {
      es: 'Data Warehouses',
      en: 'Data Warehouses',
      pt: 'Data Warehouses',
    },
    description: {
      es: 'BigQuery, Snowflake, particionamiento y optimización de costos.',
      en: 'BigQuery, Snowflake, partitioning and cost optimization.',
      pt: 'BigQuery, Snowflake, particionamento e otimização de custos.',
    },
  },
  {
    slug: 'bigdata',
    order: 7,
    icon: 'Zap',
    completionBadge: 'bigdata-master',
    title: {
      es: 'Big Data: Spark + Kafka',
      en: 'Big Data: Spark + Kafka',
      pt: 'Big Data: Spark + Kafka',
    },
    description: {
      es: 'Cuándo dejar de cabezar contra Pandas y pasar a procesamiento distribuido.',
      en: 'When to stop banging your head against Pandas and go distributed.',
      pt: 'Quando parar de bater cabeça com Pandas e ir para distribuído.',
    },
  },
  {
    slug: 'cloud',
    order: 8,
    icon: 'Cloud',
    completionBadge: 'cloud-master',
    title: {
      es: 'Cloud (AWS focus)',
      en: 'Cloud (AWS focus)',
      pt: 'Cloud (foco em AWS)',
    },
    description: {
      es: 'S3, Glue, Redshift, Lambda — el stack que verás en 8 de cada 10 ofertas.',
      en: 'S3, Glue, Redshift, Lambda — the stack on 8 of 10 job postings.',
      pt: 'S3, Glue, Redshift, Lambda — a stack em 8 de 10 vagas.',
    },
  },
  {
    slug: 'devops',
    order: 9,
    icon: 'Container',
    completionBadge: 'devops-master',
    title: {
      es: 'DevOps para Data',
      en: 'DevOps for Data',
      pt: 'DevOps para Data',
    },
    description: {
      es: 'Docker, CI/CD, Terraform, monitoring — pipelines a producción.',
      en: 'Docker, CI/CD, Terraform, monitoring — pipelines to production.',
      pt: 'Docker, CI/CD, Terraform, monitoring — pipelines em produção.',
    },
  },
];

export const moduleOrder = modules.map((m) => m.slug);

export function getModule(slug: string): ModuleMeta | null {
  return modules.find((m) => m.slug === slug) ?? null;
}
