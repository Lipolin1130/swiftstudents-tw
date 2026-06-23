import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

const events = defineCollection({
  loader: glob({
    pattern: '**/*.md',
    base: './src/content/events',
    generateId: ({ entry }) => entry.replace(/\.md$/, ''),
  }),
  schema: z.object({
    title: z.string(),
    date: z.coerce.date(),
    endDate: z.coerce.date().optional(),
    location: z.string(),
    summary: z.string(),
    image: z.string().url().optional(),
    tags: z.array(z.string()).default([]),
    registerUrl: z.string().url().optional(),
    featured: z.boolean().default(false),
  }),
});

export const collections = { events };
