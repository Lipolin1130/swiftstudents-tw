import { describe, it, expect } from 'vitest';
import {
  getLangFromUrl,
  useTranslations,
  localizePath,
  stripLocale,
  localizedPaths,
  getAltLangUrl,
  parseEventId,
} from './utils';

describe('getLangFromUrl', () => {
  it('returns en for /en paths', () => {
    expect(getLangFromUrl(new URL('https://x.tw/en'))).toBe('en');
    expect(getLangFromUrl(new URL('https://x.tw/en/events'))).toBe('en');
  });
  it('returns zh-Hant for root paths', () => {
    expect(getLangFromUrl(new URL('https://x.tw/'))).toBe('zh-Hant');
    expect(getLangFromUrl(new URL('https://x.tw/events'))).toBe('zh-Hant');
  });
  it('does not treat /energy as a locale', () => {
    expect(getLangFromUrl(new URL('https://x.tw/energy'))).toBe('zh-Hant');
  });
});

describe('stripLocale', () => {
  it('removes the en segment only', () => {
    expect(stripLocale('/en/events')).toBe('/events');
    expect(stripLocale('/en')).toBe('/');
    expect(stripLocale('/energy')).toBe('/energy');
    expect(stripLocale('/events')).toBe('/events');
    expect(stripLocale('/')).toBe('/');
  });
});

describe('localizePath', () => {
  it('keeps zh-Hant unprefixed', () => {
    expect(localizePath('/events', 'zh-Hant')).toBe('/events');
    expect(localizePath('/', 'zh-Hant')).toBe('/');
  });
  it('prefixes en', () => {
    expect(localizePath('/events', 'en')).toBe('/en/events');
    expect(localizePath('/', 'en')).toBe('/en');
  });
  it('is idempotent regardless of incoming locale prefix', () => {
    expect(localizePath('/en/events', 'zh-Hant')).toBe('/events');
    expect(localizePath('/en/events', 'en')).toBe('/en/events');
  });
});

describe('localizedPaths', () => {
  it('maps both locales from a zh path', () => {
    expect(localizedPaths('/events')).toEqual({ 'zh-Hant': '/events', en: '/en/events' });
  });
  it('maps both locales from an en path', () => {
    expect(localizedPaths('/en/events')).toEqual({ 'zh-Hant': '/events', en: '/en/events' });
  });
});

describe('getAltLangUrl', () => {
  it('switches en to zh', () => {
    expect(getAltLangUrl(new URL('https://x.tw/en/events'))).toBe('/events');
  });
  it('switches zh to en', () => {
    expect(getAltLangUrl(new URL('https://x.tw/events'))).toBe('/en/events');
  });
});

describe('useTranslations', () => {
  it('returns the string for a key', () => {
    expect(useTranslations('en')('nav.about')).toBe('About');
    expect(useTranslations('zh-Hant')('nav.about')).toBe('關於');
  });
  it('falls back to the key when missing', () => {
    expect(useTranslations('en')('does.not.exist')).toBe('does.not.exist');
  });
});

describe('parseEventId', () => {
  it('parses lang and slug from the collection id', () => {
    expect(parseEventId('en/2026-07-wwdc-recap')).toEqual({ lang: 'en', slug: '2026-07-wwdc-recap' });
    expect(parseEventId('zh-Hant/2026-07-wwdc-recap')).toEqual({ lang: 'zh-Hant', slug: '2026-07-wwdc-recap' });
  });
});
