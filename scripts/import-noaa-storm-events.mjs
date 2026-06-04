#!/usr/bin/env node
import { createGunzip } from 'node:zlib';
import { mkdir, writeFile } from 'node:fs/promises';
import { Readable } from 'node:stream';
import { execFile } from 'node:child_process';
import { promisify } from 'node:util';

const DEFAULT_BASE_URL = 'https://www.ncei.noaa.gov/pub/data/swdi/stormevents/csvfiles/';
const OUTPUT_FILE = new URL('../public/data/tornado-events.json', import.meta.url);
const METADATA_FILE = new URL('../public/data/tornado-events.metadata.json', import.meta.url);

const execFileAsync = promisify(execFile);

const args = new Map(
  process.argv.slice(2).flatMap((arg) => {
    const match = arg.match(/^--([^=]+)=(.*)$/);
    return match ? [[match[1], match[2]]] : [];
  }),
);

const baseUrl = args.get('base-url') ?? DEFAULT_BASE_URL;
const startYear = args.has('start-year') ? Number(args.get('start-year')) : undefined;
const endYear = args.has('end-year') ? Number(args.get('end-year')) : undefined;

function get(row, keys) {
  for (const key of keys) {
    const value = row[key];
    if (value !== undefined && value !== null && String(value).trim() !== '') return String(value).trim();
  }
  return undefined;
}

function toNumber(value) {
  if (value === undefined) return undefined;
  const cleaned = String(value).replace(/[$,]/g, '').trim().toUpperCase();
  if (!cleaned) return undefined;
  const multiplier = cleaned.endsWith('K') ? 1_000 : cleaned.endsWith('M') ? 1_000_000 : cleaned.endsWith('B') ? 1_000_000_000 : 1;
  const parsed = Number.parseFloat(cleaned.replace(/[KMB]$/, ''));
  return Number.isFinite(parsed) ? parsed * multiplier : undefined;
}

function sumNumbers(...values) {
  const numbers = values.map(toNumber).filter((value) => value !== undefined);
  return numbers.length ? numbers.reduce((sum, value) => sum + value, 0) : undefined;
}

function normalizeRating(value) {
  const raw = String(value ?? '').trim().toUpperCase();
  if (!raw || ['UNK', 'UNKNOWN', 'UNRATED', 'NA', 'N/A', '-9', '-'].includes(raw)) return 'UNKNOWN';
  const digit = raw.match(/[0-5]/)?.[0];
  if (!digit) return 'UNKNOWN';
  return raw.startsWith('F') ? `F${digit}` : `EF${digit}`;
}

function monthNumber(row) {
  const beginYearMonth = get(row, ['BEGIN_YEARMONTH']);
  if (beginYearMonth && /^\d{6}$/.test(beginYearMonth)) return Number(beginYearMonth.slice(4, 6));
  const monthName = get(row, ['MONTH_NAME']);
  if (monthName) {
    const index = ['JANUARY', 'FEBRUARY', 'MARCH', 'APRIL', 'MAY', 'JUNE', 'JULY', 'AUGUST', 'SEPTEMBER', 'OCTOBER', 'NOVEMBER', 'DECEMBER'].indexOf(monthName.toUpperCase());
    if (index >= 0) return index + 1;
  }
  return undefined;
}

function normalizeRow(row) {
  const year = toNumber(get(row, ['YEAR'])) ?? toNumber(get(row, ['BEGIN_YEARMONTH']))?.toString().slice(0, 4);
  const numericYear = Number(year);
  const month = monthNumber(row) ?? 1;
  const day = toNumber(get(row, ['BEGIN_DAY'])) ?? 1;
  const eventId = get(row, ['EVENT_ID']);
  const episodeId = get(row, ['EPISODE_ID']);
  const state = get(row, ['STATE']) ?? 'Unknown';
  const county = get(row, ['CZ_NAME', 'TOR_OTHER_CZ_NAME']);
  const beginTime = get(row, ['BEGIN_TIME']);
  const paddedTime = beginTime?.padStart(4, '0');
  const time = paddedTime ? `${paddedTime.slice(0, 2)}:${paddedTime.slice(2, 4)}` : undefined;
  const fatalities = sumNumbers(get(row, ['DEATHS_DIRECT']), get(row, ['DEATHS_INDIRECT']));
  const injuries = sumNumbers(get(row, ['INJURIES_DIRECT']), get(row, ['INJURIES_INDIRECT']));

  return {
    id: eventId ? `NOAA-${eventId}` : `NOAA-${numericYear}-${state}-${county ?? 'unknown'}-${day}`,
    date: `${numericYear.toString().padStart(4, '0')}-${month.toString().padStart(2, '0')}-${String(day).padStart(2, '0')}`,
    year: numericYear,
    month,
    day,
    time,
    state: state.toUpperCase(),
    county,
    counties: county ? [county] : undefined,
    rating: normalizeRating(get(row, ['TOR_F_SCALE', 'MAGNITUDE'])),
    fatalities,
    injuries,
    propertyDamage: toNumber(get(row, ['DAMAGE_PROPERTY'])),
    cropDamage: toNumber(get(row, ['DAMAGE_CROPS'])),
    pathLengthMiles: toNumber(get(row, ['TOR_LENGTH'])),
    pathWidthYards: toNumber(get(row, ['TOR_WIDTH'])),
    startLat: toNumber(get(row, ['BEGIN_LAT'])),
    startLon: toNumber(get(row, ['BEGIN_LON'])),
    endLat: toNumber(get(row, ['END_LAT'])),
    endLon: toNumber(get(row, ['END_LON'])),
    remarks: [get(row, ['EPISODE_NARRATIVE']), get(row, ['EVENT_NARRATIVE'])].filter(Boolean).join('\n\n') || undefined,
    source: `NOAA Storm Events details bulk${get(row, ['DATA_SOURCE']) ? ` (${get(row, ['DATA_SOURCE'])})` : ''}`,
    outbreakId: episodeId ? `NOAA-EPISODE-${episodeId}` : undefined,
    outbreakName: episodeId ? `NOAA episode ${episodeId}` : undefined,
  };
}

async function* parseCsvRecords(readable) {
  let field = '';
  let row = [];
  let quoted = false;
  let pendingCr = false;

  for await (const chunk of readable) {
    const text = chunk.toString('utf8');
    for (let index = 0; index < text.length; index += 1) {
      const char = text[index];
      const next = text[index + 1];

      if (pendingCr) {
        pendingCr = false;
        if (char === '\n') continue;
      }

      if (char === '"' && quoted && next === '"') {
        field += '"';
        index += 1;
      } else if (char === '"') {
        quoted = !quoted;
      } else if (char === ',' && !quoted) {
        row.push(field);
        field = '';
      } else if ((char === '\n' || char === '\r') && !quoted) {
        row.push(field);
        if (row.some((cell) => cell.trim())) yield row;
        row = [];
        field = '';
        pendingCr = char === '\r';
      } else {
        field += char;
      }
    }
  }

  if (field || row.length) {
    row.push(field);
    if (row.some((cell) => cell.trim())) yield row;
  }
}

async function fetchBuffer(url) {
  try {
    const response = await fetch(url);
    if (!response.ok) throw new Error(`Unable to fetch ${url}: ${response.status} ${response.statusText}`);
    return Buffer.from(await response.arrayBuffer());
  } catch (error) {
    // Some corporate/container environments expose internet access only through
    // proxy variables that curl honors but Node's built-in fetch does not.
    // Falling back to curl keeps the importer usable without adding a runtime
    // dependency to the web app.
    const { stdout } = await execFileAsync('curl', ['-fsSL', url], { encoding: 'buffer', maxBuffer: 128 * 1024 * 1024 });
    return stdout;
  }
}

async function fetchText(url) {
  return (await fetchBuffer(url)).toString('utf8');
}

function findLatestDetailFiles(indexHtml) {
  const filesByYear = new Map();
  const pattern = /StormEvents_details-ftp_v1\.0_d(\d{4})_c(\d{8})\.csv\.gz/g;
  for (const match of indexHtml.matchAll(pattern)) {
    const [, yearText, created] = match;
    const year = Number(yearText);
    if ((startYear && year < startYear) || (endYear && year > endYear)) continue;
    const existing = filesByYear.get(year);
    const fileName = match[0];
    if (!existing || created > existing.created) filesByYear.set(year, { year, created, fileName });
  }
  return [...filesByYear.values()].sort((a, b) => a.year - b.year);
}

async function importFile(file) {
  const url = new URL(file.fileName, baseUrl).toString();
  console.log(`Downloading ${file.fileName}`);
  const gunzip = Readable.from(await fetchBuffer(url)).pipe(createGunzip());
  let headers;
  const events = [];

  for await (const record of parseCsvRecords(gunzip)) {
    if (!headers) {
      headers = record.map((header) => header.trim());
      continue;
    }
    const row = Object.fromEntries(headers.map((header, index) => [header, record[index] ?? '']));
    if ((row.EVENT_TYPE ?? '').trim().toUpperCase() !== 'TORNADO') continue;
    events.push(normalizeRow(row));
  }

  console.log(`  kept ${events.length.toLocaleString()} tornado rows`);
  return events;
}

async function main() {
  const indexHtml = await fetchText(baseUrl);
  const files = findLatestDetailFiles(indexHtml);
  if (!files.length) throw new Error('No StormEvents_details CSV gzip files found in the NCEI directory.');

  const events = [];
  for (const file of files) {
    events.push(...(await importFile(file)));
  }

  const metadata = {
    source: baseUrl,
    generatedAt: new Date().toISOString(),
    files: files.map(({ year, created, fileName }) => ({ year, created, fileName })),
    eventType: 'Tornado',
    count: events.length,
  };

  await mkdir(new URL('../public/data/', import.meta.url), { recursive: true });
  await writeFile(OUTPUT_FILE, `${JSON.stringify(events)}\n`);
  await writeFile(METADATA_FILE, `${JSON.stringify(metadata, null, 2)}\n`);
  console.log(`Wrote ${events.length.toLocaleString()} tornado events to ${OUTPUT_FILE.pathname}`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
