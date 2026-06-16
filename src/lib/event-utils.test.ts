import { describe, it, expect } from 'vitest';
import { splitEvents } from './event-utils';

const ev = (iso: string) => ({ data: { date: new Date(iso) } });

describe('splitEvents', () => {
  const now = new Date('2026-06-16T00:00:00Z');

  it('splits upcoming (>= now) and past (< now)', () => {
    const { upcoming, past } = splitEvents([ev('2026-01-01'), ev('2026-12-01'), ev('2026-07-01')], now);
    expect(upcoming.map((e) => e.data.date.getFullYear())).toHaveLength(2);
    expect(past).toHaveLength(1);
    expect(past[0].data.date.toISOString().slice(0, 10)).toBe('2026-01-01');
  });

  it('sorts upcoming ascending and past descending', () => {
    const events = [ev('2026-08-01'), ev('2026-07-01'), ev('2026-03-01'), ev('2026-01-01')];
    const { upcoming, past } = splitEvents(events, now);
    expect(upcoming.map((e) => e.data.date.toISOString().slice(0, 10))).toEqual(['2026-07-01', '2026-08-01']);
    expect(past.map((e) => e.data.date.toISOString().slice(0, 10))).toEqual(['2026-03-01', '2026-01-01']);
  });
});
