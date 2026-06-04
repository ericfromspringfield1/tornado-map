import type { TornadoEvent, TornadoFilters, SelectOption } from '../types/tornado';
import { normalizeRating } from './ratings';

export const DEFAULT_FILTERS: TornadoFilters = {
  ratings: [],
  states: [],
  counties: [],
  startDate: '',
  endDate: '',
  months: [],
  fatalOnly: false,
  query: '',
  outbreakIds: [],
};

const includesAny = (selected: string[], value?: string): boolean => !selected.length || (value ? selected.includes(value) : false);
const asNumber = (value?: number): number => value ?? 0;

function eventMatchesCounty(event: TornadoEvent, counties: string[]): boolean {
  if (!counties.length) return true;
  const eventCounties = event.counties?.length ? event.counties : event.county ? [event.county] : [];
  return eventCounties.some((county) => counties.includes(county));
}

function eventMatchesText(event: TornadoEvent, query: string): boolean {
  if (!query.trim()) return true;
  const haystack = [event.id, event.state, event.county, ...(event.counties ?? []), event.rating, event.remarks, event.source, event.outbreakName]
    .filter(Boolean)
    .join(' ')
    .toLowerCase();
  return haystack.includes(query.trim().toLowerCase());
}

export function validateDateRange(filters: TornadoFilters): string | undefined {
  if (filters.startDate && filters.endDate && filters.startDate > filters.endDate) {
    return 'Start date must be before or equal to end date.';
  }
  if (filters.minYear && filters.maxYear && filters.minYear > filters.maxYear) {
    return 'Minimum year must be before or equal to maximum year.';
  }
  return undefined;
}

export function filterTornadoes(events: TornadoEvent[], filters: TornadoFilters): TornadoEvent[] {
  if (validateDateRange(filters)) return [];

  return events.filter((event) => {
    if (!includesAny(filters.ratings, normalizeRating(event.rating))) return false;
    if (!includesAny(filters.states, event.state)) return false;
    if (!eventMatchesCounty(event, filters.counties)) return false;
    if (filters.startDate && event.date < filters.startDate) return false;
    if (filters.endDate && event.date > filters.endDate) return false;
    if (filters.minYear !== undefined && event.year < filters.minYear) return false;
    if (filters.maxYear !== undefined && event.year > filters.maxYear) return false;
    if (filters.months.length && !filters.months.includes(event.month)) return false;
    if (filters.minFatalities !== undefined && asNumber(event.fatalities) < filters.minFatalities) return false;
    if (filters.minInjuries !== undefined && asNumber(event.injuries) < filters.minInjuries) return false;
    if (filters.fatalOnly && asNumber(event.fatalities) <= 0) return false;
    if (filters.minPathLength !== undefined && asNumber(event.pathLengthMiles) < filters.minPathLength) return false;
    if (filters.maxPathLength !== undefined && asNumber(event.pathLengthMiles) > filters.maxPathLength) return false;
    if (filters.minPathWidth !== undefined && asNumber(event.pathWidthYards) < filters.minPathWidth) return false;
    if (filters.maxPathWidth !== undefined && asNumber(event.pathWidthYards) > filters.maxPathWidth) return false;
    if (filters.minPropertyDamage !== undefined && asNumber(event.propertyDamage) < filters.minPropertyDamage) return false;
    if (!eventMatchesText(event, filters.query)) return false;
    if (filters.outbreakIds.length && !includesAny(filters.outbreakIds, event.outbreakId)) return false;
    return true;
  });
}

function countedOptions(values: string[]): SelectOption[] {
  const counts = values.reduce<Record<string, number>>((acc, value) => {
    if (value) acc[value] = (acc[value] ?? 0) + 1;
    return acc;
  }, {});
  return Object.entries(counts)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([value, count]) => ({ value, label: value, count }));
}

export function getAvailableStates(events: TornadoEvent[]): SelectOption[] {
  return countedOptions(events.map((event) => event.state));
}

export function getAvailableCounties(events: TornadoEvent[], states: string[] = []): SelectOption[] {
  const scopedEvents = states.length ? events.filter((event) => states.includes(event.state)) : events;
  return countedOptions(scopedEvents.flatMap((event) => (event.counties?.length ? event.counties : event.county ? [event.county] : [])));
}

export function getAvailableOutbreaks(events: TornadoEvent[]): SelectOption[] {
  const counts = events.reduce<Record<string, { name: string; count: number }>>((acc, event) => {
    if (!event.outbreakId) return acc;
    acc[event.outbreakId] = { name: event.outbreakName ?? event.outbreakId, count: (acc[event.outbreakId]?.count ?? 0) + 1 };
    return acc;
  }, {});
  return Object.entries(counts)
    .sort(([, a], [, b]) => a.name.localeCompare(b.name))
    .map(([value, { name, count }]) => ({ value, label: name, count }));
}
