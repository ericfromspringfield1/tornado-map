import type { TornadoFilters } from '../types/tornado';

type Props = { filters: TornadoFilters; onChange: (patch: Partial<TornadoFilters>) => void };

export function CasualtyFilter({ filters, onChange }: Props) {
  return (
    <section className="space-y-3" aria-labelledby="casualty-filter-heading">
      <h3 id="casualty-filter-heading" className="text-sm font-semibold text-slate-800">Casualties</h3>
      <div className="grid grid-cols-2 gap-3">
        <label className="text-sm font-medium text-slate-700" htmlFor="min-fatalities">Minimum fatalities
          <input id="min-fatalities" type="number" min="0" value={filters.minFatalities ?? ''} onChange={(event) => onChange({ minFatalities: event.target.value ? Number(event.target.value) : undefined })} className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm" />
        </label>
        <label className="text-sm font-medium text-slate-700" htmlFor="min-injuries">Minimum injuries
          <input id="min-injuries" type="number" min="0" value={filters.minInjuries ?? ''} onChange={(event) => onChange({ minInjuries: event.target.value ? Number(event.target.value) : undefined })} className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm" />
        </label>
      </div>
      <label className="flex items-center gap-2 text-sm font-medium text-slate-700"><input type="checkbox" checked={filters.fatalOnly} onChange={(event) => onChange({ fatalOnly: event.target.checked })} /> Fatal tornadoes only</label>
    </section>
  );
}
