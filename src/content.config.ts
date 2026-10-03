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
    image: z.union([z.string().url(), z.string().regex(/^\/[^/]/)]).optional(),
    /** CSS object-position for the cropped thumbnail, e.g. 'left center'. */
    imagePosition: z.string().optional(),
    tags: z.array(z.string()).default([]),
    registerUrl: z.string().url().optional(),
    featured: z.boolean().default(false),
  }),
});

export const collections = { events };
