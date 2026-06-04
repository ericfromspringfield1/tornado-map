import { useMemo, useState } from 'react';
import sampleCsv from './data/sample-tornadoes.csv?raw';
import { FilterPanel } from './components/FilterPanel';
import { MapView } from './components/MapView';
import { SummaryPanel } from './components/SummaryPanel';
import type { TornadoEvent, TornadoFilters } from './types/tornado';
import { DEFAULT_FILTERS, filterTornadoes, getAvailableCounties, getAvailableOutbreaks, getAvailableStates, validateDateRange } from './utils/filterTornadoes';
import { parseTornadoData } from './utils/parseTornadoData';
import { summarizeTornadoes } from './utils/summarizeTornadoes';

function loadSampleData(): { events: TornadoEvent[]; error?: string } {
  try {
    return { events: parseTornadoData(sampleCsv) };
  } catch (error) {
    return { events: [], error: error instanceof Error ? error.message : 'Unable to parse tornado data.' };
  }
}

export default function App() {
  const [{ events, error }] = useState(loadSampleData);
  const [filters, setFilters] = useState<TornadoFilters>(DEFAULT_FILTERS);

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
              Explore a normalized local sample of NOAA/SPC-style tornado records. Filters combine with AND logic, while multiple selections inside a category behave as OR. The data layer is isolated so a future API can replace the CSV loader.
            </p>
          </header>
          {error ? <div className="rounded-xl bg-red-50 p-4 text-sm font-medium text-red-700" role="alert">{error}</div> : null}
          {!events.length && !error ? <div className="rounded-xl bg-white p-4 text-sm text-slate-600">Loading tornado data…</div> : null}
          <MapView events={filteredEvents} />
          <SummaryPanel summary={summary} />
        </div>
      </div>
    </main>
  );
}
