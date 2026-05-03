# DataPath

App de escritorio educativa para aprender **Data Engineering** desde cero. Local-first, gamificada, con tutor IA integrado.

> Estado actual: **Fase 1 — Setup inicial completado**.

## Stack

- **Electron 33** — runtime de escritorio (Windows / macOS / Linux).
- **Next.js 14** (App Router, exportación estática) + **React 18**.
- **TypeScript** en modo `strict`.
- **Tailwind CSS** + **shadcn/ui** (Radix primitives).
- **Zustand** para state management _(se agrega en Fase 3)_.
- **SQLite** + **Drizzle ORM** _(Fase 4)_.
- **next-intl** para i18n ES / EN / PT _(Fase 2)_.
- **Monaco Editor** + **Mermaid** _(fases posteriores)_.
- **Framer Motion** para animaciones _(fases posteriores)_.
- **OpenAI SDK** (provider-agnostic: Cerebras, Groq, Gemini, OpenRouter) _(fases posteriores)_.

## Requisitos

- Node.js >= 20
- pnpm >= 9 (`npm install -g pnpm`)

## Desarrollo

```bash
pnpm install
pnpm dev
```

`pnpm dev` arranca en paralelo el servidor Next.js (http://localhost:3000) y la ventana de Electron en modo desarrollo con DevTools abiertos.

## Build de producción

```bash
pnpm build        # Compila Next (export estático) + main process de Electron
pnpm dist         # Empaqueta instaladores con electron-builder
pnpm dist:win     # Solo Windows
```

Los artefactos quedan en `release/`.

## Scripts útiles

| Script | Descripción |
| --- | --- |
| `pnpm dev` | Next + Electron en modo dev |
| `pnpm build` | Build completo (Next export + Electron compile) |
| `pnpm dist` | Empaqueta instaladores |
| `pnpm lint` | ESLint |
| `pnpm type-check` | Verificación de tipos (renderer + main) |
| `pnpm format` | Prettier |
| `pnpm test` | Tests con Vitest |

## Estructura

```
datapath/
├── electron/               # Main process (Node)
│   ├── main.ts             # Bootstrap de la BrowserWindow
│   ├── preload.ts          # Bridge contextIsolation
│   ├── ipc/                # Handlers IPC (DB, AI, settings…)
│   └── tsconfig.json
├── src/
│   ├── app/                # Next.js App Router (renderer)
│   │   ├── layout.tsx
│   │   ├── page.tsx
│   │   ├── globals.css
│   │   └── api/
│   ├── components/
│   │   ├── ui/             # shadcn primitives
│   │   ├── lessons/
│   │   ├── gamification/
│   │   ├── editor/
│   │   └── ai-tutor/
│   ├── lib/
│   │   ├── db/             # Drizzle schema + queries
│   │   ├── i18n/
│   │   ├── themes/
│   │   ├── ai/             # Abstracción de providers LLM
│   │   └── utils.ts
│   ├── content/            # MDX/JSON de cursos + traducciones
│   ├── hooks/
│   ├── stores/             # Zustand
│   └── types/
├── public/
├── next.config.mjs
├── tailwind.config.ts
├── tsconfig.json
└── package.json
```

## Arquitectura

- **Renderer** (Next.js export estático) corre en la BrowserWindow.
- **Main process** (Electron) maneja filesystem, SQLite, llamadas a LLM y secretos cifrados con `safeStorage`.
- **IPC** en `electron/ipc/` expone capacidades del main al renderer vía `preload.ts` y `contextBridge`.
- **API keys** de los providers de IA se guardan cifradas (no en SQLite plano).

## Licencia

Privado — proyecto de portafolio.
