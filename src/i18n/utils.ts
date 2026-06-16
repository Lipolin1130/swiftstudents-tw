import { ui, defaultLang, type Lang } from './ui';

export function getLangFromUrl(url: URL): Lang {
  const seg = url.pathname.split('/').filter(Boolean)[0];
  return seg === 'en' ? 'en' : defaultLang;
}

export function stripLocale(pathname: string): string {
  const segments = pathname.split('/').filter(Boolean);
  if (segments[0] === 'en') segments.shift();
  return '/' + segments.join('/');
}

export function localizePath(path: string, lang: Lang): string {
  const withSlash = path.startsWith('/') ? path : '/' + path;
  const logical = stripLocale(withSlash);
  if (lang === 'en') return logical === '/' ? '/en' : '/en' + logical;
  return logical;
}

export function localizedPaths(pathname: string): Record<Lang, string> {
  return {
    'zh-Hant': localizePath(pathname, 'zh-Hant'),
    en: localizePath(pathname, 'en'),
  };
}

export function getAltLangUrl(url: URL): string {
  const lang = getLangFromUrl(url);
  const other: Lang = lang === 'en' ? 'zh-Hant' : 'en';
  return localizePath(url.pathname, other);
}

export function useTranslations(lang: Lang) {
  return function t(key: string): string {
    return ui[lang][key] ?? ui[defaultLang][key] ?? key;
  };
}

export function parseEventId(id: string): { lang: Lang; slug: string } {
  const [first, ...rest] = id.split('/');
  const lang: Lang = first === 'en' ? 'en' : 'zh-Hant';
  return { lang, slug: rest.join('/') };
}
