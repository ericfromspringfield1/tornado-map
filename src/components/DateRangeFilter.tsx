import type { TornadoFilters } from '../types/tornado';

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const SEASONS = [
  { label: 'Winter', months: [12, 1, 2] },
  { label: 'Spring', months: [3, 4, 5] },
  { label: 'Summer', months: [6, 7, 8] },
  { label: 'Fall', months: [9, 10, 11] },
  { label: 'Peak season', months: [4, 5, 6] },
];

type Props = {
  filters: TornadoFilters;
  onChange: (patch: Partial<TornadoFilters>) => void;
  error?: string;
};

export function DateRangeFilter({ filters, onChange, error }: Props) {
  const toggleMonth = (month: number) => {
    onChange({ months: filters.months.includes(month) ? filters.months.filter((item) => item !== month) : [...filters.months, month] });
  };

  return (
    <section className="space-y-3" aria-labelledby="date-filter-heading">
      <h3 id="date-filter-heading" className="text-sm font-semibold text-slate-800">Date and season</h3>
      <div className="grid grid-cols-2 gap-3">
        <label className="text-sm font-medium text-slate-700" htmlFor="start-date">Start date
          <input id="start-date" type="date" value={filters.startDate} onChange={(event) => onChange({ startDate: event.target.value })} className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm" />
        </label>
        <label className="text-sm font-medium text-slate-700" htmlFor="end-date">End date
          <input id="end-date" type="date" value={filters.endDate} onChange={(event) => onChange({ endDate: event.target.value })} className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm" />
        </label>
        <label className="text-sm font-medium text-slate-700" htmlFor="min-year">Min year
          <input id="min-year" type="number" value={filters.minYear ?? ''} onChange={(event) => onChange({ minYear: event.target.value ? Number(event.target.value) : undefined })} className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm" />
        </label>
        <label className="text-sm font-medium text-slate-700" htmlFor="max-year">Max year
          <input id="max-year" type="number" value={filters.maxYear ?? ''} onChange={(event) => onChange({ maxYear: event.target.value ? Number(event.target.value) : undefined })} className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm" />
        </label>
      </div>
      {error ? <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700" role="alert">{error}</p> : null}
      <div className="flex flex-wrap gap-2" aria-label="Season presets">
        {SEASONS.map((season) => (
          <button key={season.label} type="button" onClick={() => onChange({ months: season.months })} className="rounded-full border border-slate-300 bg-white px-3 py-1 text-xs font-medium hover:bg-slate-50">{season.label}</button>
        ))}
      </div>
      <fieldset>
        <legend className="sr-only">Months</legend>
        <div className="grid grid-cols-4 gap-2">
          {MONTHS.map((label, index) => {
            const month = index + 1;
            return <label key={label} className="flex items-center gap-2 text-xs"><input type="checkbox" checked={filters.months.includes(month)} onChange={() => toggleMonth(month)} />{label}</label>;
          })}
        </div>
      </fieldset>
    </section>
  );
}
