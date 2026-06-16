import { getCollection, type CollectionEntry } from 'astro:content';
import { parseEventId } from '../i18n/utils';
import type { Lang } from '../i18n/ui';

export type EventEntry = CollectionEntry<'events'>;

export function eventSlug(entry: EventEntry): string {
  return parseEventId(entry.id).slug;
}

export async function getEventsByLang(lang: Lang): Promise<EventEntry[]> {
  const all = await getCollection('events');
  return all
    .filter((e) => parseEventId(e.id).lang === lang)
    .sort((a, b) => b.data.date.getTime() - a.data.date.getTime());
}
