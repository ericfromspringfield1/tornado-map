# Historical Tornado Map

A production-ready Vite + React + TypeScript web app for exploring historical United States tornado events on an interactive Leaflet map. The first version loads a local NOAA/SPC-style CSV sample, normalizes the records into an internal data model, and applies client-side filters and summary statistics.

## Features

- Interactive Leaflet map with OpenStreetMap tiles.
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

Run the development server:

```bash
npm run dev
```

Build for production:

```bash
npm run build
```

Run tests:

```bash
npm test
```

## Data files

The app currently imports `src/data/sample-tornadoes.csv` directly with Vite's `?raw` loader. Replace that file with a larger historical tornado CSV, or add another CSV/JSON file under `src/data/` and update the import in `src/App.tsx`.

The parser is intentionally isolated in `src/utils/parseTornadoData.ts`, so a future API-backed version can replace the local file loader without changing the filter, summary, or map components.

## Expected data fields

The normalizer accepts the internal field names and common NOAA/SPC-style aliases, including:

| Internal field | Accepted CSV aliases |
| --- | --- |
| `id` | `id`, `om`, `event_id`, `eventid`, `source_id` |
| `date` | `date`, `date_time`, `begin_date_time`; or `yr`, `mo`, `dy` |
| `time` | `time`, `begin_time` |
| `state` | `st`, `state`, `state_abbr` |
| `rating` | `mag`, `rating`, `ef_rating`, `f_scale` |
| `injuries` | `inj`, `injuries` |
| `fatalities` | `fat`, `fatalities`, `deaths` |
| `startLat` / `startLon` | `slat`, `slon`, `start_lat`, `start_lon`, `begin_lat`, `begin_lon` |
| `endLat` / `endLon` | `elat`, `elon`, `end_lat`, `end_lon` |
| `pathLengthMiles` | `len`, `length`, `path_length`, `path_length_miles` |
| `pathWidthYards` | `wid`, `width`, `path_width`, `path_width_yards` |
| `county` / `counties` | `county`, `cz_name`, `county_name`, `county1`, `county_list` |
| `propertyDamage` | `propertyDamage`, `property_damage`, `damage_property`, `damage`, `propdmg` |
| `cropDamage` | `cropDamage`, `crop_damage`, `damage_crops`, `cropdmg` |
| `remarks` | `remarks`, `remark`, `episode_narrative`, `event_narrative` |
| `source` | `source`, `source_dataset`, `fc` |
| `outbreakId` / `outbreakName` | `outbreak_id`, `episode_id`, `outbreak_name`, `episode_name` |

Damage values may be plain numbers or use `K`, `M`, or `B` suffixes. Multi-county fields can be separated with semicolons, commas, or pipes.

## Known limitations

- The bundled dataset is a small demonstration sample and is not a complete historical archive.
- All filtering is currently client-side; very large datasets may need pagination, vector tiles, or an API-backed search endpoint.
- The map uses simple straight-line start-to-end tracks because most tornado CSVs do not include detailed path geometry.
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
