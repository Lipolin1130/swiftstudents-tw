import type { Lang } from '../i18n/ui';

export interface Person {
  name: string;
  /** School, company, or other short affiliation shown under the name. */
  affiliation?: Record<Lang, string>;
  /** Image path under public/ (e.g. '/people/jane.jpg') or a full URL. */
  photo?: string;
  url?: string;
}

export interface Winner extends Person {
  year: number;
  /** Swift Student Challenge Distinguished Winner. */
  distinguished?: boolean;
}

export const sscWinners: Winner[] = [];
