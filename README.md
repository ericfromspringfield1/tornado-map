# Historical Tornado Map

A production-ready Vite + React + TypeScript web app for exploring historical United States tornado events on an interactive Leaflet map. The first version loads a local NOAA/SPC-style CSV sample, normalizes the records into an internal data model, and applies client-side filters and summary statistics.

## Features

- Interactive Leaflet map with OpenStreetMap tiles.
- Optional NOAA/NCEI Storm Events bulk importer that downloads all latest yearly detail CSV gzip files and generates an app-ready tornado dataset.
- Tornado tracks drawn as lines when start and end coordinates are present.
- Point markers with clustering for single-location records and track start points.
- Popups with date, time, state, counties, rating, casualties, damage, path dimensions, coordinates, source, and outbreak details.
- Filter panel for rating, state, county, date range, year range, month/season, casualties, path characteristics, property damage, text search, and outbreak/event grouping.
- Summary panel for matching count, date range, fatal tornadoes, total fatalities/injuries, strongest rating, and top states/counties.
- Component-based architecture with separate parsing, filtering, map rendering, and UI modules.
- Basic Vitest coverage for rating normalization, filtering, and summary calculations.

## Tech stack

- React with TypeScript
- Vite
- Leaflet, React Leaflet, and Leaflet.markercluster
- Tailwind CSS
- Vitest

## Getting started

Install dependencies:

```bash
npm install
```

Generate the full NOAA/NCEI tornado dataset (optional but recommended for real data):

```bash
npm run import:noaa
```

Run the development server:

```bash
npm run dev
```

If `public/data/tornado-events.json` exists, the app uses that generated NOAA dataset. Otherwise it falls back to the bundled sample CSV.

Build for production:

```bash
npm run build
```

Run tests:

```bash
npm test
```

## Data files

The best way to use the NOAA/NCEI Storm Events bulk archive is not to commit every source CSV file into the repository or load hundreds of compressed CSVs in the browser. Instead, run the importer and generate one compact app-ready JSON file locally:

```bash
npm run import:noaa
```

The script in `scripts/import-noaa-storm-events.mjs` reads the NCEI bulk directory index, selects the latest `StormEvents_details-ftp` CSV gzip for each available data year, streams and decompresses each file, keeps only rows where `EVENT_TYPE` is `Tornado`, normalizes the fields, and writes:

- `public/data/tornado-events.json`
- `public/data/tornado-events.metadata.json`

The importer uses the `details` table because it contains the event-level tornado fields needed by the map, including rating, casualties, damage, path length/width, begin/end coordinates, narratives, source, and episode ID. The NOAA `fatalities` and `locations` tables can be joined in a future enhancement if person-level fatality records or detailed multi-point paths are needed.

These generated files are git-ignored because the full dataset is large and NOAA republishes yearly files as corrections are made. The app automatically loads `public/data/tornado-events.json` when present. If it is missing, the app falls back to `src/data/sample-tornadoes.csv` so the project works immediately after install.

For a partial import during development, pass a year range:

```bash
npm run import:noaa -- --start-year=2011 --end-year=2013
```

The parser is intentionally isolated in `src/utils/parseTornadoData.ts`, and the importer produces the same normalized shape, so a future API-backed version can replace the local file loader without changing the filter, summary, or map components.

## Expected data fields

The normalizer accepts the internal field names and common NOAA/SPC-style aliases, including:

| Internal field | Accepted CSV aliases |
| --- | --- |
| `id` | `id`, `om`, `event_id`, `eventid`, `source_id` |
| `date` | `date`, `date_time`, `begin_date_time`; or `yr`, `year`, `mo`, `dy`, `begin_yearmonth`, `begin_day`, `month_name` |
| `time` | `time`, `begin_time` |
| `state` | `st`, `state`, `state_abbr` |
| `rating` | `mag`, `magnitude`, `tor_f_scale`, `rating`, `ef_rating`, `f_scale` |
| `injuries` | `inj`, `injuries`, `injuries_direct`, `injuries_indirect` |
| `fatalities` | `fat`, `fatalities`, `deaths`, `deaths_direct`, `deaths_indirect` |
| `startLat` / `startLon` | `slat`, `slon`, `start_lat`, `start_lon`, `begin_lat`, `begin_lon` |
| `endLat` / `endLon` | `elat`, `elon`, `end_lat`, `end_lon` |
| `pathLengthMiles` | `len`, `length`, `tor_length`, `path_length`, `path_length_miles` |
| `pathWidthYards` | `wid`, `width`, `tor_width`, `path_width`, `path_width_yards` |
| `county` / `counties` | `county`, `cz_name`, `county_name`, `county1`, `county_list` |
| `propertyDamage` | `propertyDamage`, `property_damage`, `damage_property`, `damage`, `propdmg` |
| `cropDamage` | `cropDamage`, `crop_damage`, `damage_crops`, `cropdmg` |
| `remarks` | `remarks`, `remark`, `episode_narrative`, `event_narrative` |
| `source` | `source`, `source_dataset`, `data_source`, `fc` |
| `outbreakId` / `outbreakName` | `outbreak_id`, `episode_id`, `outbreak_name`, `episode_name` |

Damage values may be plain numbers or use `K`, `M`, or `B` suffixes. Multi-county fields can be separated with semicolons, commas, or pipes.

## Known limitations

- The bundled dataset is a small demonstration sample and is not a complete historical archive; run `npm run import:noaa` for the full generated NOAA/NCEI tornado dataset.
- All filtering is currently client-side; very large datasets may need pagination, vector tiles, or an API-backed search endpoint.
- The map uses simple straight-line start-to-end tracks from the NOAA details table; importing and joining the NOAA locations table would allow richer multi-point paths later.
- County names are displayed as provided by the source data and are not yet reconciled to FIPS identifiers.
- URL query parameter serialization is intentionally deferred, although the filter state is structured to support it.

## Suggested future enhancements

- NOAA/SPC data import workflow.
- URL-shareable filters.
- Animation by year/date.
- Heatmap mode.
- Outbreak grouping with richer metadata and timeline views.
- Convective outlook overlay.
- Radar archive links.
- County warning area filters.
- Export filtered results to CSV.
- Compare two date ranges.
- Mobile geolocation to show nearby historical tornadoes.
