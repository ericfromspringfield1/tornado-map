# Tornado data

The app first looks for `public/data/tornado-events.json`. That generated file is intentionally not committed because the NOAA/NCEI bulk dataset is large and changes as NOAA republishes yearly files.

To create it from the NOAA Storm Events bulk CSV archive, run:

```bash
npm run import:noaa
```

The import script downloads the latest `StormEvents_details-ftp` CSV gzip for every available year from the NCEI bulk directory, keeps only rows where `EVENT_TYPE` is `Tornado`, normalizes the records for the app, and writes:

- `public/data/tornado-events.json`
- `public/data/tornado-events.metadata.json`

If `tornado-events.json` is missing, the app falls back to `src/data/sample-tornadoes.csv` so local development still works immediately.
