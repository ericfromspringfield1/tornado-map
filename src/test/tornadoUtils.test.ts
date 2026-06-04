import { describe, expect, it } from 'vitest';
import type { TornadoEvent } from '../types/tornado';
import { DEFAULT_FILTERS, filterTornadoes } from '../utils/filterTornadoes';
import { parseTornadoData } from '../utils/parseTornadoData';
import { normalizeRating } from '../utils/ratings';
import { summarizeTornadoes } from '../utils/summarizeTornadoes';

const events: TornadoEvent[] = [
  {
    id: 'a',
    date: '2011-04-27',
    year: 2011,
    month: 4,
    day: 27,
    state: 'AL',
    county: 'Tuscaloosa',
    counties: ['Tuscaloosa', 'Jefferson'],
    rating: 'EF4',
    fatalities: 64,
    injuries: 1500,
    pathLengthMiles: 80,
    pathWidthYards: 2600,
    propertyDamage: 2_200_000_000,
  },
  {
    id: 'b',
    date: '2013-05-20',
    year: 2013,
    month: 5,
    day: 20,
    state: 'OK',
    county: 'Cleveland',
    rating: 'EF5',
    fatalities: 24,
    injuries: 212,
    pathLengthMiles: 14,
    pathWidthYards: 1900,
    propertyDamage: 2_000_000_000,
  },
  {
    id: 'c',
    date: '2023-06-22',
    year: 2023,
    month: 6,
    day: 22,
    state: 'CO',
    county: 'Logan',
    rating: 'EF0',
    fatalities: 0,
    injuries: 0,
    pathLengthMiles: 1.2,
    pathWidthYards: 50,
    propertyDamage: 10_000,
  },
];

describe('tornado utilities', () => {
  it('normalizes common EF/F and unknown rating values', () => {
    expect(normalizeRating('ef4')).toBe('EF4');
    expect(normalizeRating('F5')).toBe('F5');
    expect(normalizeRating('3')).toBe('EF3');
    expect(normalizeRating('-9')).toBe('UNKNOWN');
    expect(normalizeRating(undefined)).toBe('UNKNOWN');
  });

  it('normalizes NOAA Storm Events detail rows for tornado imports', () => {
    const [event] = parseTornadoData([
      {
        BEGIN_YEARMONTH: '201104',
        BEGIN_DAY: '27',
        BEGIN_TIME: '1505',
        EVENT_ID: '12345',
        EPISODE_ID: '99',
        STATE: 'ALABAMA',
        EVENT_TYPE: 'Tornado',
        CZ_NAME: 'TUSCALOOSA',
        TOR_F_SCALE: 'EF4',
        INJURIES_DIRECT: '10',
        INJURIES_INDIRECT: '2',
        DEATHS_DIRECT: '3',
        DEATHS_INDIRECT: '1',
        DAMAGE_PROPERTY: '2.5M',
        TOR_LENGTH: '12.4',
        TOR_WIDTH: '880',
        BEGIN_LAT: '33.1',
        BEGIN_LON: '-87.5',
        END_LAT: '33.3',
        END_LON: '-87.1',
        DATA_SOURCE: 'CSV',
      },
    ]);

    expect(event.date).toBe('2011-04-27');
    expect(event.rating).toBe('EF4');
    expect(event.fatalities).toBe(4);
    expect(event.injuries).toBe(12);
    expect(event.propertyDamage).toBe(2_500_000);
    expect(event.pathLengthMiles).toBe(12.4);
    expect(event.startLat).toBe(33.1);
  });

  it('filters by inclusive date ranges', () => {
    const results = filterTornadoes(events, { ...DEFAULT_FILTERS, startDate: '2011-01-01', endDate: '2013-12-31' });
    expect(results.map((event) => event.id)).toEqual(['a', 'b']);
  });

  it('filters states and counties with OR within each category and AND across categories', () => {
    const results = filterTornadoes(events, { ...DEFAULT_FILTERS, states: ['AL', 'OK'], counties: ['Jefferson', 'Cleveland'] });
    expect(results.map((event) => event.id)).toEqual(['a', 'b']);
  });

  it('filters by casualties and fatal-only toggles', () => {
    const fatalResults = filterTornadoes(events, { ...DEFAULT_FILTERS, fatalOnly: true, minFatalities: 30 });
    expect(fatalResults.map((event) => event.id)).toEqual(['a']);
    const injuryResults = filterTornadoes(events, { ...DEFAULT_FILTERS, minInjuries: 200 });
    expect(injuryResults.map((event) => event.id)).toEqual(['a', 'b']);
  });

  it('calculates summary totals, strongest rating, and top locations', () => {
    const summary = summarizeTornadoes(events);
    expect(summary.total).toBe(3);
    expect(summary.totalFatalities).toBe(88);
    expect(summary.totalInjuries).toBe(1712);
    expect(summary.strongestRating).toBe('EF5');
    expect(summary.topStates[0]).toEqual({ name: 'AL', count: 1 });
    expect(summary.dateRange).toEqual({ start: '2011-04-27', end: '2023-06-22' });
  });
});
