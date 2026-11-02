import { getCollection, type CollectionEntry } from 'astro:content';
import { parseEventId, localizePath } from '../i18n/utils';
import type { Lang } from '../i18n/ui';

export type WinnerEntry = CollectionEntry<'winners'>;

/**
 * Collection ids look like 'zh-Hant/2024-lin-kai-yu'. The year gets its own URL segment,
 * so the slug is the part after the language with the leading year dropped: 'lin-kai-yu'.
 */
export function winnerSlug(entry: WinnerEntry): string {
  const slug = parseEventId(entry.id).slug;
  const yearPrefix = `${entry.data.year}-`;
  return slug.startsWith(yearPrefix) ? slug.slice(yearPrefix.length) : slug;
}

/** Localized path to a winner's project page, e.g. '/en/winners/2024/lin-kai-yu'. */
export function winnerPath(entry: WinnerEntry, lang: Lang): string {
  return localizePath(`/winners/${entry.data.year}/${winnerSlug(entry)}`, lang);
}

/** Winners for one language, newest challenge year first, then by name. */
export async function getWinnersByLang(lang: Lang): Promise<WinnerEntry[]> {
  const all = await getCollection('winners');
  return all
    .filter((e) => parseEventId(e.id).lang === lang)
    .sort((a, b) => b.data.year - a.data.year || a.data.name.localeCompare(b.data.name));
}
