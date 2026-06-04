import type { TornadoEvent, TornadoSummary } from '../types/tornado';
import { compareRatings } from './ratings';

function topCounts(values: string[], limit = 5): Array<{ name: string; count: number }> {
  const counts = values.reduce<Record<string, number>>((acc, value) => {
    if (value) acc[value] = (acc[value] ?? 0) + 1;
    return acc;
  }, {});
  return Object.entries(counts)
    .sort(([, a], [, b]) => b - a)
    .slice(0, limit)
    .map(([name, count]) => ({ name, count }));
}

export function summarizeTornadoes(events: TornadoEvent[]): TornadoSummary {
  if (!events.length) {
    return { total: 0, fatalTornadoes: 0, totalFatalities: 0, totalInjuries: 0, topStates: [], topCounties: [] };
  }

  const dates = events.map((event) => event.date).sort();
  const strongest = events.reduce((best, event) => (compareRatings(event.rating, best.rating) > 0 ? event : best), events[0]);

  return {
    total: events.length,
    dateRange: { start: dates[0], end: dates[dates.length - 1] },
    fatalTornadoes: events.filter((event) => (event.fatalities ?? 0) > 0).length,
    totalFatalities: events.reduce((sum, event) => sum + (event.fatalities ?? 0), 0),
    totalInjuries: events.reduce((sum, event) => sum + (event.injuries ?? 0), 0),
    strongestRating: strongest.rating,
    topStates: topCounts(events.map((event) => event.state)),
    topCounties: topCounts(events.flatMap((event) => (event.counties?.length ? event.counties : event.county ? [event.county] : []))),
  };
}
