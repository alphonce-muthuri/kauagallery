/**
 * Minimal structural types so schemas type-check without pulling in the
 * full `sanity` studio dependency. When dropping these files into a real
 * Sanity Studio project, replace the imports with `import type { SchemaTypeDefinition } from "sanity"`.
 */
export type Rule = {
  required(): Rule;
  min(n: number): Rule;
  max(n: number): Rule;
  [key: string]: unknown;
};

export type Field = {
  name?: string;
  title?: string;
  type: string;
  rows?: number;
  validation?: (rule: Rule) => Rule;
  options?: Record<string, unknown>;
  of?: Field[];
  to?: { type: string }[];
};

export type SchemaTypeDefinition = {
  name: string;
  title?: string;
  type: string;
  fields?: Field[];
  preview?: {
    select?: Record<string, string>;
  };
};
