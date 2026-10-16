import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

const projects = defineCollection({
  loader: glob({ pattern: '**/*.mdx', base: './src/content/projects' }),
  schema: z.object({
    title: z.string(),
    description: z.string(),
    date: z.date(),
    tags: z.array(z.string()),
    category: z.enum(['network', 'dev', 'hybrid', 'cyber']),
    featured: z.boolean().default(false),
    draft: z.boolean().default(false),

    // Meta
    role: z.string().optional(),
    duration: z.string().optional(),
    team: z.string().optional(),
    year: z.string().optional(),
    heroImage: z.string().optional(),

    // Liens
    repo: z.string().url().optional(),
    demo: z.string().url().optional(),
    docs: z.string().url().optional(),

    // Features
    features: z
      .array(z.object({ icon: z.string(), title: z.string(), text: z.string() }))
      .optional(),

    // Previews (zigzag)
    previews: z
      .array(z.object({ title: z.string(), text: z.string(), visual: z.string().optional() }))
      .optional(),

    // Process (timeline)
    process: z
      .array(z.object({ step: z.string(), title: z.string(), description: z.string() }))
      .optional(),

    // Flow (démonstration)
    flow: z.array(z.object({ num: z.number(), title: z.string(), text: z.string() })).optional(),

    // Architecture
    architecture: z.string().optional(),

    // Métriques
    metrics: z.array(z.object({ value: z.string(), label: z.string() })).optional(),
  }),
});

export const collections = { projects };
