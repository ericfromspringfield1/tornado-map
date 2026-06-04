import { useState } from 'react';
import type { SelectOption, TornadoFilters } from '../types/tornado';
import { DEFAULT_FILTERS } from '../utils/filterTornadoes';
import { CasualtyFilter } from './CasualtyFilter';
import { DateRangeFilter } from './DateRangeFilter';
import { LocationFilter } from './LocationFilter';
import { MultiSelect } from './MultiSelect';
import { PathFilter } from './PathFilter';
import { RatingFilter } from './RatingFilter';

type Props = {
  filters: TornadoFilters;
  total: number;
  matching: number;
  stateOptions: SelectOption[];
  countyOptions: SelectOption[];
  outbreakOptions: SelectOption[];
  dateError?: string;
  onChange: (filters: TornadoFilters) => void;
};

export function FilterPanel({ filters, total, matching, stateOptions, countyOptions, outbreakOptions, dateError, onChange }: Props) {
  const [open, setOpen] = useState(false);
  const patch = (change: Partial<TornadoFilters>) => onChange({ ...filters, ...change });

  return (
    <aside className="rounded-2xl border border-slate-200 bg-white shadow-sm lg:h-[calc(100vh-2rem)] lg:overflow-y-auto">
      <div className="flex items-center justify-between border-b border-slate-200 p-4">
        <div>
          <h2 className="text-lg font-bold text-slate-900">Filters</h2>
          <p className="text-sm text-slate-600"><strong>{matching}</strong> of {total} tornadoes match</p>
        </div>
        <button type="button" onClick={() => setOpen(!open)} className="rounded-lg border border-slate-300 px-3 py-2 text-sm font-medium lg:hidden" aria-expanded={open}>{open ? 'Hide' : 'Show'}</button>
      </div>
      <div className={`${open ? 'block' : 'hidden'} space-y-5 p-4 lg:block`}>
        <label className="block text-sm font-medium text-slate-700" htmlFor="search">Text search
          <input id="search" type="search" value={filters.query} onChange={(event) => patch({ query: event.target.value })} placeholder="State, county, event ID, remarks..." className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm" />
        </label>
        <RatingFilter selected={filters.ratings} onChange={(ratings) => patch({ ratings })} />
        <LocationFilter stateOptions={stateOptions} countyOptions={countyOptions} states={filters.states} counties={filters.counties} onStatesChange={(states) => patch({ states, counties: [] })} onCountiesChange={(counties) => patch({ counties })} />
        <MultiSelect id="outbreaks" label="Outbreak / event grouping" options={outbreakOptions} values={filters.outbreakIds} onChange={(outbreakIds) => patch({ outbreakIds })} helpText="Use this to show all tornado records associated with a grouped outbreak/event." />
        <DateRangeFilter filters={filters} onChange={patch} error={dateError} />
        <CasualtyFilter filters={filters} onChange={patch} />
        <PathFilter filters={filters} onChange={patch} />
        <button type="button" onClick={() => onChange(DEFAULT_FILTERS)} className="w-full rounded-lg bg-storm-700 px-4 py-2 text-sm font-semibold text-white transition hover:bg-storm-900">Reset filters</button>
      </div>
    </aside>
  );
}
