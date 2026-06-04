import type { TornadoEvent } from '../types/tornado';
import { normalizeRating } from './ratings';

type RawRow = Record<string, unknown>;

const valueFor = (row: RawRow, keys: string[]): unknown => {
  const normalized = Object.fromEntries(Object.entries(row).map(([key, value]) => [key.toLowerCase().trim(), value]));
  return keys.map((key) => normalized[key.toLowerCase()]).find((value) => value !== undefined && value !== null && String(value).trim() !== '');
};

const numberFor = (row: RawRow, keys: string[]): number | undefined => {
  const value = valueFor(row, keys);
  if (value === undefined) return undefined;
  const cleaned = String(value).replace(/[$,]/g, '').trim();
  if (!cleaned) return undefined;
  const multiplier = cleaned.endsWith('K') ? 1_000 : cleaned.endsWith('M') ? 1_000_000 : cleaned.endsWith('B') ? 1_000_000_000 : 1;
  const parsed = Number.parseFloat(cleaned.replace(/[KMB]$/i, ''));
  return Number.isFinite(parsed) ? parsed * multiplier : undefined;
};

const stringFor = (row: RawRow, keys: string[]): string | undefined => {
  const value = valueFor(row, keys);
  return value === undefined ? undefined : String(value).trim() || undefined;
};

const splitCounties = (value?: string): string[] | undefined => {
  if (!value) return undefined;
  const counties = value
    .split(/[;,|]/)
    .map((county) => county.trim())
    .filter(Boolean);
  return counties.length ? counties : undefined;
};

function parseCsv(text: string): RawRow[] {
  const rows: string[][] = [];
  let field = '';
  let row: string[] = [];
  let quoted = false;

  for (let index = 0; index < text.length; index += 1) {
    const char = text[index];
    const next = text[index + 1];
    if (char === '"' && quoted && next === '"') {
      field += '"';
      index += 1;
    } else if (char === '"') {
      quoted = !quoted;
    } else if (char === ',' && !quoted) {
      row.push(field);
      field = '';
    } else if ((char === '\n' || char === '\r') && !quoted) {
      if (char === '\r' && next === '\n') index += 1;
      row.push(field);
      if (row.some((cell) => cell.trim())) rows.push(row);
      row = [];
      field = '';
    } else {
      field += char;
    }
  }
  if (field || row.length) {
    row.push(field);
    rows.push(row);
  }

  const [headers = [], ...body] = rows;
  return body.map((cells) => Object.fromEntries(headers.map((header, index) => [header.trim(), cells[index]?.trim() ?? ''])));
}

function buildIsoDate(row: RawRow): { date: string; year: number; month: number; day: number } {
  const dateValue = stringFor(row, ['date', 'date_time', 'begin_date_time']);
  if (dateValue) {
    const parsed = new Date(dateValue);
    if (!Number.isNaN(parsed.getTime())) {
      return {
        date: parsed.toISOString().slice(0, 10),
        year: parsed.getUTCFullYear(),
        month: parsed.getUTCMonth() + 1,
        day: parsed.getUTCDate(),
      };
    }
  }
  const year = numberFor(row, ['yr', 'year']) ?? new Date().getUTCFullYear();
  const month = numberFor(row, ['mo', 'month']) ?? 1;
  const day = numberFor(row, ['dy', 'day']) ?? 1;
  return {
    date: `${year.toString().padStart(4, '0')}-${month.toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}`,
    year,
    month,
    day,
  };
}

export function normalizeTornadoRow(row: RawRow, index = 0): TornadoEvent {
  const date = buildIsoDate(row);
  const county = stringFor(row, ['county', 'cz_name', 'county_name', 'county1']);
  const counties = splitCounties(stringFor(row, ['counties', 'county_list'])) ?? splitCounties(county);
  const id = stringFor(row, ['id', 'om', 'event_id', 'eventid', 'source_id']) ?? `row-${index + 1}`;

  return {
    id,
    ...date,
    time: stringFor(row, ['time', 'begin_time']),
    state: (stringFor(row, ['st', 'state', 'state_abbr']) ?? 'Unknown').toUpperCase(),
    county,
    counties,
    rating: normalizeRating(valueFor(row, ['mag', 'rating', 'ef_rating', 'f_scale'])),
    fatalities: numberFor(row, ['fat', 'fatalities', 'deaths']),
    injuries: numberFor(row, ['inj', 'injuries']),
    propertyDamage: numberFor(row, ['propertyDamage', 'property_damage', 'damage_property', 'damage', 'propdmg']),
    cropDamage: numberFor(row, ['cropDamage', 'crop_damage', 'damage_crops', 'cropdmg']),
    pathLengthMiles: numberFor(row, ['len', 'length', 'pathLengthMiles', 'path_length', 'path_length_miles']),
    pathWidthYards: numberFor(row, ['wid', 'width', 'pathWidthYards', 'path_width', 'path_width_yards']),
    startLat: numberFor(row, ['slat', 'start_lat', 'startLat', 'begin_lat']),
    startLon: numberFor(row, ['slon', 'start_lon', 'startLon', 'begin_lon']),
    endLat: numberFor(row, ['elat', 'end_lat', 'endLat', 'end_latitude']),
    endLon: numberFor(row, ['elon', 'end_lon', 'endLon', 'end_longitude']),
    remarks: stringFor(row, ['remarks', 'remark', 'episode_narrative', 'event_narrative']),
    source: stringFor(row, ['source', 'source_dataset', 'fc']),
    outbreakId: stringFor(row, ['outbreak_id', 'episode_id', 'outbreakId']),
    outbreakName: stringFor(row, ['outbreak_name', 'episode_name', 'outbreakName']),
  };
}

export function parseTornadoData(input: string | RawRow[]): TornadoEvent[] {
  const rows = typeof input === 'string' ? parseCsv(input) : input;
  return rows.map((row, index) => normalizeTornadoRow(row, index));
}
