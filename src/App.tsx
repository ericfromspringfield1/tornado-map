import { useEffect, useMemo, useState } from 'react';
import { FilterPanel } from './components/FilterPanel';
import { MapView } from './components/MapView';
import { SummaryPanel } from './components/SummaryPanel';
import type { TornadoEvent, TornadoFilters } from './types/tornado';
import { DEFAULT_FILTERS, filterTornadoes, getAvailableCounties, getAvailableOutbreaks, getAvailableStates, validateDateRange } from './utils/filterTornadoes';
import { loadTornadoDataset } from './utils/loadTornadoDataset';
import { summarizeTornadoes } from './utils/summarizeTornadoes';

type DatasetState = {
  events: TornadoEvent[];
  loading: boolean;
  error?: string;
  sourceLabel: string;
};

export default function App() {
  const [dataset, setDataset] = useState<DatasetState>({ events: [], loading: true, sourceLabel: 'Checking for generated NOAA/NCEI data' });
  const [filters, setFilters] = useState<TornadoFilters>(DEFAULT_FILTERS);

  useEffect(() => {
    const controller = new AbortController();

    loadTornadoDataset({ signal: controller.signal })
      .then((loadedDataset) => {
        if (controller.signal.aborted) return;
        setDataset({ ...loadedDataset, loading: false });
      })
      .catch((error) => {
        if (controller.signal.aborted) return;
        setDataset({
          events: [],
          loading: false,
          error: error instanceof Error ? error.message : 'Unable to load tornado data.',
          sourceLabel: 'No dataset loaded',
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
              Explore normalized NOAA/SPC-style tornado records. Filters combine with AND logic, while multiple selections inside a category behave as OR. The app loads <code className="rounded bg-slate-100 px-1">public/data/tornado-events.json</code> when you generate it with the NOAA importer and only falls back to the bundled sample CSV when that file is missing or invalid.
            </p>
            <p className="mt-3 inline-flex rounded-full bg-storm-50 px-3 py-1 text-xs font-semibold text-storm-700" aria-live="polite">
              Data source: {sourceLabel}{loading ? '…' : ''}
            </p>
          </header>
          {loading ? <div className="rounded-xl bg-white p-4 text-sm text-slate-600" role="status">Loading tornado data…</div> : null}
          {error ? <div className="rounded-xl bg-amber-50 p-4 text-sm font-medium text-amber-800" role="status">{error} Using bundled sample data instead.</div> : null}
          <MapView events={filteredEvents} />
          <SummaryPanel summary={summary} />
        </div>
      </div>
    </main>
  );
}
