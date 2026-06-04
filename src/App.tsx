import { useEffect, useMemo, useState } from 'react';
import sampleCsv from './data/sample-tornadoes.csv?raw';
import { FilterPanel } from './components/FilterPanel';
import { MapView } from './components/MapView';
import { SummaryPanel } from './components/SummaryPanel';
import type { TornadoEvent, TornadoFilters } from './types/tornado';
import { DEFAULT_FILTERS, filterTornadoes, getAvailableCounties, getAvailableOutbreaks, getAvailableStates, validateDateRange } from './utils/filterTornadoes';
import { parseTornadoData } from './utils/parseTornadoData';
import { summarizeTornadoes } from './utils/summarizeTornadoes';

type DatasetState = {
  events: TornadoEvent[];
  loading: boolean;
  error?: string;
  sourceLabel: string;
};

function loadSampleData(): TornadoEvent[] {
  return parseTornadoData(sampleCsv);
}

async function loadGeneratedNoaaDataset(signal: AbortSignal): Promise<TornadoEvent[] | undefined> {
  const response = await fetch('/data/tornado-events.json', { signal });
  if (response.status === 404) return undefined;
  if (!response.ok) throw new Error(`Unable to load generated NOAA dataset: ${response.status} ${response.statusText}`);
  const payload = (await response.json()) as Record<string, unknown>[];
  return parseTornadoData(payload);
}

export default function App() {
  const [dataset, setDataset] = useState<DatasetState>(() => ({ events: loadSampleData(), loading: true, sourceLabel: 'Bundled sample CSV' }));
  const [filters, setFilters] = useState<TornadoFilters>(DEFAULT_FILTERS);

  useEffect(() => {
    const controller = new AbortController();

    loadGeneratedNoaaDataset(controller.signal)
      .then((events) => {
        if (controller.signal.aborted) return;

        setDataset({
          events: events?.length ? events : loadSampleData(),
          loading: false,
          sourceLabel: events?.length ? 'Generated NOAA/NCEI Storm Events tornado dataset' : 'Bundled sample CSV',
        });
      })
      .catch((error) => {
        if (controller.signal.aborted) return;

        setDataset({
          events: loadSampleData(),
          loading: false,
          error: error instanceof Error ? error.message : 'Unable to load tornado data.',
          sourceLabel: 'Bundled sample CSV fallback',
        });
      });

    return () => controller.abort();
  }, []);

  const { events, error, loading, sourceLabel } = dataset;
  const dateError = validateDateRange(filters);
  const filteredEvents = useMemo(() => filterTornadoes(events, filters), [events, filters]);
  const summary = useMemo(() => summarizeTornadoes(filteredEvents), [filteredEvents]);
  const stateOptions = useMemo(() => getAvailableStates(events), [events]);
  const countyOptions = useMemo(() => getAvailableCounties(events, filters.states), [events, filters.states]);
  const outbreakOptions = useMemo(() => getAvailableOutbreaks(events), [events]);

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-100 via-storm-50 to-white p-3 lg:p-4">
      <div className="mx-auto grid max-w-[1800px] gap-4 lg:grid-cols-[25rem_minmax(0,1fr)]">
        <FilterPanel
          filters={filters}
          total={events.length}
          matching={filteredEvents.length}
          stateOptions={stateOptions}
          countyOptions={countyOptions}
          outbreakOptions={outbreakOptions}
          dateError={dateError}
          onChange={setFilters}
        />
        <div className="space-y-4">
          <header className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-storm-700">Historical tornado explorer</p>
            <h1 className="mt-1 text-3xl font-black tracking-tight text-slate-950">United States tornado tracks and events</h1>
            <p className="mt-2 max-w-4xl text-sm leading-6 text-slate-600">
              Explore normalized NOAA/SPC-style tornado records. Filters combine with AND logic, while multiple selections inside a category behave as OR. The app loads a generated NOAA/NCEI bulk dataset when available and falls back to the bundled sample CSV.
            </p>
            <p className="mt-3 inline-flex rounded-full bg-storm-50 px-3 py-1 text-xs font-semibold text-storm-700" aria-live="polite">
              Data source: {sourceLabel}{loading ? ' (checking for generated NOAA data...)' : ''}
            </p>
          </header>
          {error ? <div className="rounded-xl bg-amber-50 p-4 text-sm font-medium text-amber-800" role="status">{error} Using bundled sample data instead.</div> : null}
          {!events.length && !error ? <div className="rounded-xl bg-white p-4 text-sm text-slate-600">Loading tornado data…</div> : null}
          <MapView events={filteredEvents} />
          <SummaryPanel summary={summary} />
        </div>
      </div>
    </main>
  );
}
