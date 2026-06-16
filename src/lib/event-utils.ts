export interface DatedEntry {
  data: { date: Date };
}

export function splitEvents<T extends DatedEntry>(
  events: T[],
  now: Date = new Date(),
): { upcoming: T[]; past: T[] } {
  const upcoming = events
    .filter((e) => e.data.date.getTime() >= now.getTime())
    .sort((a, b) => a.data.date.getTime() - b.data.date.getTime());
  const past = events
    .filter((e) => e.data.date.getTime() < now.getTime())
    .sort((a, b) => b.data.date.getTime() - a.data.date.getTime());
  return { upcoming, past };
}
