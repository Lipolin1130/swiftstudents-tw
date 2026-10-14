import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

/** Full URL or a path under public/ (e.g. '/events/foo.jpg'). */
const imagePath = z.union([z.string().url(), z.string().regex(/^\/[^/]/)]);

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
    image: imagePath.optional(),
    /** CSS object-position for the cropped thumbnail, e.g. 'left center'. */
    imagePosition: z.string().optional(),
    tags: z.array(z.string()).default([]),
    registerUrl: z.string().url().optional(),
    featured: z.boolean().default(false),
  }),
});

const winners = defineCollection({
  loader: glob({
    pattern: '**/*.md',
    base: './src/content/winners',
    generateId: ({ entry }) => entry.replace(/\.md$/, ''),
  }),
  schema: z.object({
    name: z.string(),
    /** Swift Student Challenge year, e.g. 2024. */
    year: z.number().int(),
    /** Name of the winning app playground. */
    project: z.string(),
    /** Short paragraph about the developer, shown in the hero under the subtitle. */
    bio: z.string().optional(),
    /** One-line description of the project (card + meta description). */
    summary: z.string(),
    /** Headshot; shown cropped to a circle on the winners page. */
    photo: imagePath.optional(),
    /** CSS object-position for the circular headshot crop, e.g. 'center top'. */
    photoPosition: z.string().optional(),
    /** Portrait for the detail page hero; it rests on the hero's bottom edge. */
    portrait: imagePath.optional(),
    /** Hero background color matching the portrait's backdrop (e.g. '#0e0210'). Setting it switches the hero to light text. */
    heroBackground: z.string().regex(/^#[0-9a-fA-F]{3,8}$/).optional(),
    /** App icon shown next to the project name on the detail page. */
    icon: imagePath.optional(),
    /** Wide photo used as the social preview image. */
    cover: imagePath.optional(),
    /** Swift Student Challenge Distinguished Winner. */
    distinguished: z.boolean().default(false),
    /** External links (App Store, GitHub, demo video…) shown as buttons. */
    links: z.array(z.object({ label: z.string(), url: z.string().url() })).default([]),
  }),
});

export const collections = { events, winners };
