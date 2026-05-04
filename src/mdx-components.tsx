import type { MDXComponents } from 'mdx/types';
import { Callout } from '@/components/content/callout';
import { CodeBlock } from '@/components/content/code-block';
import { AnnotatedCode } from '@/components/content/annotated-code';
import { Diagram } from '@/components/content/diagram';
import { Quiz } from '@/components/content/quiz';
import { Exercise } from '@/components/content/exercise';
import { Project } from '@/components/content/project';

// Mapeo global de componentes MDX. Tipografía base + componentes custom.
export function useMDXComponents(components: MDXComponents): MDXComponents {
  return {
    h1: (props) => (
      <h1
        className="mt-2 scroll-mt-20 text-3xl font-bold tracking-tight first:mt-0"
        {...props}
      />
    ),
    h2: (props) => (
      <h2
        className="mt-8 scroll-mt-20 border-b border-border/60 pb-2 text-2xl font-semibold tracking-tight"
        {...props}
      />
    ),
    h3: (props) => (
      <h3 className="mt-6 scroll-mt-20 text-xl font-semibold tracking-tight" {...props} />
    ),
    p: (props) => <p className="my-3 leading-7 text-foreground/90" {...props} />,
    ul: (props) => <ul className="my-4 ml-6 list-disc space-y-2" {...props} />,
    ol: (props) => <ol className="my-4 ml-6 list-decimal space-y-2" {...props} />,
    li: (props) => <li className="leading-7" {...props} />,
    a: (props) => <a className="text-primary underline-offset-4 hover:underline" {...props} />,
    code: (props) => (
      <code
        className="rounded bg-muted px-1.5 py-0.5 font-mono text-[0.9em] text-foreground"
        {...props}
      />
    ),
    pre: (props) => (
      <pre
        className="my-4 overflow-x-auto rounded-md border border-border/60 bg-muted/40 p-4 text-sm"
        {...props}
      />
    ),
    blockquote: (props) => (
      <blockquote
        className="my-4 border-l-4 border-primary/40 bg-muted/30 px-4 py-2 italic text-muted-foreground"
        {...props}
      />
    ),
    hr: (props) => <hr className="my-8 border-border/60" {...props} />,
    Callout,
    CodeBlock,
    AnnotatedCode,
    Diagram,
    Quiz,
    Exercise,
    Project,
    ...components,
  };
}
