// Catálogo declarativo de las lecciones del curso. La estructura aquí es
// puramente metadata: titles, slugs, módulo, XP, etc. El registry combina
// esto con los componentes MDX (reales o stub) por idioma.

import type { Translations } from '@/lib/db/schema';

export interface LessonMetaEntry {
  slug: string;
  module: string;
  order: number;
  xpReward: number;
  estimatedMinutes: number;
  prerequisites: string[];
  type: 'theory' | 'exercise' | 'quiz' | 'project';
  title: Translations;
  description: Translations;
}

// ──────────────────────────────────────────────────────────────────────
// Módulo 0 (intro) — ya existe "what-is-data-engineering" como lección 1.
// Lo dejamos en su archivo original; no se replica aquí.
// ──────────────────────────────────────────────────────────────────────

export const lessonMetadata: LessonMetaEntry[] = [
  // ────────────────────────── Módulo: git ────────────────────────────
  {
    slug: 'git-what-and-why',
    module: 'git',
    order: 1,
    xpReward: 100,
    estimatedMinutes: 15,
    prerequisites: [],
    type: 'theory',
    title: {
      es: '¿Qué es Git y por qué importa?',
      en: 'What is Git and why does it matter?',
      pt: 'O que é Git e por que importa?',
    },
    description: {
      es: 'Versionado distribuido, snapshots y por qué Git ganó la guerra.',
      en: 'Distributed versioning, snapshots and why Git won the war.',
      pt: 'Versionamento distribuído, snapshots e por que Git venceu.',
    },
  },
  {
    slug: 'git-install-config',
    module: 'git',
    order: 2,
    xpReward: 100,
    estimatedMinutes: 12,
    prerequisites: ['git-what-and-why'],
    type: 'theory',
    title: {
      es: 'Instalación y configuración inicial',
      en: 'Installation and initial setup',
      pt: 'Instalação e configuração inicial',
    },
    description: {
      es: 'Instalar Git en Windows/macOS/Linux + identidad y editor por defecto.',
      en: 'Installing Git on Windows/macOS/Linux + identity and default editor.',
      pt: 'Instalar Git em Windows/macOS/Linux + identidade e editor padrão.',
    },
  },
  {
    slug: 'git-first-repo',
    module: 'git',
    order: 3,
    xpReward: 120,
    estimatedMinutes: 18,
    prerequisites: ['git-install-config'],
    type: 'theory',
    title: {
      es: 'Tu primer repositorio',
      en: 'Your first repository',
      pt: 'Seu primeiro repositório',
    },
    description: {
      es: 'git init, working tree, staging area y el primer commit.',
      en: 'git init, working tree, staging area and the first commit.',
      pt: 'git init, working tree, staging area e o primeiro commit.',
    },
  },
  {
    slug: 'git-essentials',
    module: 'git',
    order: 4,
    xpReward: 130,
    estimatedMinutes: 20,
    prerequisites: ['git-first-repo'],
    type: 'theory',
    title: {
      es: 'Comandos esenciales: status, add, commit, log',
      en: 'Essential commands: status, add, commit, log',
      pt: 'Comandos essenciais: status, add, commit, log',
    },
    description: {
      es: 'El día a día con Git: inspeccionar, registrar y revisar historia.',
      en: 'Day-to-day Git: inspect, record and review history.',
      pt: 'O dia a dia com Git: inspecionar, registrar e revisar o histórico.',
    },
  },
  {
    slug: 'git-branches-merge',
    module: 'git',
    order: 5,
    xpReward: 150,
    estimatedMinutes: 22,
    prerequisites: ['git-essentials'],
    type: 'theory',
    title: {
      es: 'Branches y merge',
      en: 'Branches and merge',
      pt: 'Branches e merge',
    },
    description: {
      es: 'Trabajar en paralelo, fusionar cambios y entender los conflictos.',
      en: 'Work in parallel, merge changes and understand conflicts.',
      pt: 'Trabalhar em paralelo, fazer merge e entender conflitos.',
    },
  },
  {
    slug: 'git-remote-github',
    module: 'git',
    order: 6,
    xpReward: 140,
    estimatedMinutes: 20,
    prerequisites: ['git-branches-merge'],
    type: 'theory',
    title: {
      es: 'Trabajando con GitHub remoto',
      en: 'Working with GitHub remotes',
      pt: 'Trabalhando com GitHub remoto',
    },
    description: {
      es: 'Push, pull, fetch, clone y autenticación con SSH/HTTPS.',
      en: 'Push, pull, fetch, clone and SSH/HTTPS authentication.',
      pt: 'Push, pull, fetch, clone e autenticação SSH/HTTPS.',
    },
  },
  {
    slug: 'git-pull-requests',
    module: 'git',
    order: 7,
    xpReward: 150,
    estimatedMinutes: 22,
    prerequisites: ['git-remote-github'],
    type: 'theory',
    title: {
      es: 'Pull Requests y colaboración',
      en: 'Pull Requests and collaboration',
      pt: 'Pull Requests e colaboração',
    },
    description: {
      es: 'PRs, code review, fork-vs-branch y la cultura de revisión.',
      en: 'PRs, code review, fork-vs-branch and review culture.',
      pt: 'PRs, code review, fork-vs-branch e a cultura de revisão.',
    },
  },
  {
    slug: 'git-best-practices',
    module: 'git',
    order: 8,
    xpReward: 160,
    estimatedMinutes: 20,
    prerequisites: ['git-pull-requests'],
    type: 'theory',
    title: {
      es: 'Buenas prácticas y .gitignore',
      en: 'Best practices and .gitignore',
      pt: 'Boas práticas e .gitignore',
    },
    description: {
      es: 'Mensajes de commit, atomicidad, archivos a ignorar y secretos fuera del repo.',
      en: 'Commit messages, atomicity, files to ignore and secrets out of the repo.',
      pt: 'Mensagens de commit, atomicidade, arquivos a ignorar e segredos fora do repo.',
    },
  },

  // ────────────────────────── Módulo: sql ────────────────────────────
  ...moduleStubs('sql', [
    ['sql-select-where-orderby', 'Repaso de SELECT, WHERE, ORDER BY', 'Review of SELECT, WHERE, ORDER BY', 'Revisão de SELECT, WHERE, ORDER BY'],
    ['sql-joins-deep', 'JOINs en profundidad', 'JOINs in depth', 'JOINs em profundidade'],
    ['sql-aggregations', 'Agregaciones y GROUP BY', 'Aggregations and GROUP BY', 'Agregações e GROUP BY'],
    ['sql-subqueries', 'Subqueries', 'Subqueries', 'Subqueries'],
    ['sql-ctes', 'CTEs (WITH)', 'CTEs (WITH)', 'CTEs (WITH)'],
    ['sql-windows-1', 'Window functions I: ROW_NUMBER, RANK', 'Window functions I: ROW_NUMBER, RANK', 'Window functions I: ROW_NUMBER, RANK'],
    ['sql-windows-2', 'Window functions II: LAG, LEAD, SUM OVER', 'Window functions II: LAG, LEAD, SUM OVER', 'Window functions II: LAG, LEAD, SUM OVER'],
    ['sql-case-when', 'CASE WHEN y lógica condicional', 'CASE WHEN and conditional logic', 'CASE WHEN e lógica condicional'],
    ['sql-indexes', 'Índices y rendimiento', 'Indexes and performance', 'Índices e performance'],
    ['sql-query-optimization', 'Optimización de queries', 'Query optimization', 'Otimização de queries'],
  ]),

  // ──────────────────────── Módulo: python ───────────────────────────
  ...moduleStubs('python', [
    ['python-pandas-basics', 'Pandas fundamentos', 'Pandas fundamentals', 'Pandas fundamentos'],
    ['python-pandas-advanced', 'Pandas avanzado: merge, pivot, groupby', 'Advanced Pandas: merge, pivot, groupby', 'Pandas avançado: merge, pivot, groupby'],
    ['python-numpy', 'NumPy para operaciones vectorizadas', 'NumPy for vectorized operations', 'NumPy para operações vetorizadas'],
    ['python-apis-requests', 'Consumo de APIs con requests', 'Consuming APIs with requests', 'Consumo de APIs com requests'],
    ['python-sqlalchemy', 'SQLAlchemy y conexión a BDs', 'SQLAlchemy and DB connections', 'SQLAlchemy e conexão a BDs'],
    ['python-parquet', 'Parquet y formatos columnares', 'Parquet and columnar formats', 'Parquet e formatos colunares'],
    ['python-testing', 'Testing de pipelines con pytest', 'Pipeline testing with pytest', 'Testing de pipelines com pytest'],
    ['python-venv-deps', 'Entornos virtuales y dependencias', 'Virtual environments and dependencies', 'Ambientes virtuais e dependências'],
  ]),

  // ──────────────────────── Módulo: modeling ─────────────────────────
  ...moduleStubs('modeling', [
    ['modeling-normalization', 'Normalización (1FN, 2FN, 3FN)', 'Normalization (1NF, 2NF, 3NF)', 'Normalização (1FN, 2FN, 3FN)'],
    ['modeling-oltp-vs-olap', 'OLTP vs OLAP', 'OLTP vs OLAP', 'OLTP vs OLAP'],
    ['modeling-star-schema', 'Star schema', 'Star schema', 'Star schema'],
    ['modeling-snowflake-schema', 'Snowflake schema', 'Snowflake schema', 'Snowflake schema'],
    ['modeling-scd', 'Slowly Changing Dimensions (SCD)', 'Slowly Changing Dimensions (SCD)', 'Slowly Changing Dimensions (SCD)'],
    ['modeling-ecommerce-case', 'Caso práctico: modelar un e-commerce', 'Hands-on: model an e-commerce', 'Caso prático: modelar um e-commerce'],
  ]),

  // ────────────────────────── Módulo: etl ────────────────────────────
  ...moduleStubs('etl', [
    ['etl-vs-elt', 'ETL vs ELT: cuándo usar cada uno', 'ETL vs ELT: when to use each', 'ETL vs ELT: quando usar cada um'],
    ['etl-airflow-intro', 'Introducción a Apache Airflow', 'Intro to Apache Airflow', 'Introdução ao Apache Airflow'],
    ['etl-first-dag', 'Tu primer DAG', 'Your first DAG', 'Seu primeiro DAG'],
    ['etl-operators-sensors', 'Operadores y sensores', 'Operators and sensors', 'Operadores e sensores'],
    ['etl-xcoms-deps', 'XComs y dependencias', 'XComs and dependencies', 'XComs e dependências'],
    ['etl-dbt-intro', 'Introducción a dbt', 'Intro to dbt', 'Introdução ao dbt'],
    ['etl-dbt-models-tests', 'dbt: models, tests y docs', 'dbt: models, tests and docs', 'dbt: models, tests e docs'],
    ['etl-e2e-pipeline', 'Caso práctico: pipeline E2E', 'Hands-on: end-to-end pipeline', 'Caso prático: pipeline E2E'],
  ]),

  // ────────────────────────── Módulo: warehouse ──────────────────────
  ...moduleStubs('warehouse', [
    ['wh-concepts', 'Conceptos de Data Warehouse', 'Data Warehouse concepts', 'Conceitos de Data Warehouse'],
    ['wh-bigquery', 'BigQuery hands-on', 'BigQuery hands-on', 'BigQuery hands-on'],
    ['wh-snowflake', 'Snowflake hands-on', 'Snowflake hands-on', 'Snowflake hands-on'],
    ['wh-partitioning', 'Particionamiento y clustering', 'Partitioning and clustering', 'Particionamento e clustering'],
    ['wh-cost-optimization', 'Cost optimization', 'Cost optimization', 'Otimização de custos'],
    ['wh-reverse-etl', 'Reverse ETL', 'Reverse ETL', 'Reverse ETL'],
  ]),

  // ────────────────────────── Módulo: bigdata ────────────────────────
  ...moduleStubs('bigdata', [
    ['bd-why', 'Por qué Big Data: límites de una sola máquina', 'Why Big Data: single-machine limits', 'Por que Big Data: limites de uma máquina'],
    ['bd-spark-basics', 'Spark fundamentos: RDDs vs DataFrames', 'Spark basics: RDDs vs DataFrames', 'Spark básico: RDDs vs DataFrames'],
    ['bd-spark-transformations', 'Transformaciones y acciones', 'Transformations and actions', 'Transformações e ações'],
    ['bd-spark-sql', 'Spark SQL', 'Spark SQL', 'Spark SQL'],
    ['bd-spark-partitions', 'Particiones y shuffle', 'Partitions and shuffle', 'Partições e shuffle'],
    ['bd-kafka-basics', 'Kafka fundamentos', 'Kafka fundamentals', 'Kafka fundamentos'],
    ['bd-kafka-producer-consumer', 'Producers y consumers', 'Producers and consumers', 'Producers e consumers'],
    ['bd-streaming-e2e', 'Streaming end-to-end', 'End-to-end streaming', 'Streaming end-to-end'],
  ]),

  // ────────────────────────── Módulo: cloud ──────────────────────────
  ...moduleStubs('cloud', [
    ['cloud-intro-iam', 'Introducción a la nube y IAM', 'Cloud intro and IAM', 'Introdução à nuvem e IAM'],
    ['cloud-s3-datalake', 'S3 como Data Lake', 'S3 as a Data Lake', 'S3 como Data Lake'],
    ['cloud-ec2-emr', 'EC2 y EMR', 'EC2 and EMR', 'EC2 e EMR'],
    ['cloud-glue', 'Glue para ETL', 'Glue for ETL', 'Glue para ETL'],
    ['cloud-redshift', 'Redshift Data Warehouse', 'Redshift Data Warehouse', 'Redshift Data Warehouse'],
    ['cloud-lambda', 'Lambda para event-driven pipelines', 'Lambda for event-driven pipelines', 'Lambda para pipelines event-driven'],
    ['cloud-step-functions', 'Step Functions para orquestación', 'Step Functions for orchestration', 'Step Functions para orquestração'],
    ['cloud-costs', 'Costos y mejores prácticas', 'Costs and best practices', 'Custos e melhores práticas'],
  ]),

  // ────────────────────────── Módulo: devops ─────────────────────────
  ...moduleStubs('devops', [
    ['devops-docker', 'Docker para Data Engineers', 'Docker for Data Engineers', 'Docker para Data Engineers'],
    ['devops-compose', 'docker-compose en pipelines', 'docker-compose in pipelines', 'docker-compose em pipelines'],
    ['devops-cicd', 'CI/CD con GitHub Actions', 'CI/CD with GitHub Actions', 'CI/CD com GitHub Actions'],
    ['devops-terraform', 'Infrastructure as Code con Terraform', 'Infrastructure as Code with Terraform', 'Infrastructure as Code com Terraform'],
    ['devops-monitoring', 'Monitoring y alerting', 'Monitoring and alerting', 'Monitoring e alerting'],
    ['devops-prod-deploy', 'Caso práctico: deploy a producción', 'Hands-on: production deploy', 'Caso prático: deploy em produção'],
  ]),
];

function moduleStubs(
  module: string,
  rows: Array<readonly [slug: string, es: string, en: string, pt: string]>,
): LessonMetaEntry[] {
  return rows.map(([slug, es, en, pt], i) => ({
    slug,
    module,
    order: i + 1,
    xpReward: 120,
    estimatedMinutes: 18,
    prerequisites: [],
    type: 'theory' as const,
    title: { es, en, pt },
    description: {
      es: 'Contenido en producción — disponible próximamente.',
      en: 'Content in production — coming soon.',
      pt: 'Conteúdo em produção — em breve.',
    },
  }));
}

// El orden global se computa en registry.ts respetando moduleOrder.

