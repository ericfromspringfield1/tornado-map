import type { TornadoFilters } from '../types/tornado';

type Props = { filters: TornadoFilters; onChange: (patch: Partial<TornadoFilters>) => void };
const numberValue = (value: string) => (value ? Number(value) : undefined);

export function PathFilter({ filters, onChange }: Props) {
  return (
    <section className="space-y-3" aria-labelledby="path-filter-heading">
      <h3 id="path-filter-heading" className="text-sm font-semibold text-slate-800">Path and damage</h3>
      <div className="grid grid-cols-2 gap-3">
        <label className="text-sm font-medium text-slate-700" htmlFor="min-length">Min length (mi)
          <input id="min-length" type="number" min="0" step="0.1" value={filters.minPathLength ?? ''} onChange={(event) => onChange({ minPathLength: numberValue(event.target.value) })} className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm" />
        </label>
        <label className="text-sm font-medium text-slate-700" htmlFor="max-length">Max length (mi)
          <input id="max-length" type="number" min="0" step="0.1" value={filters.maxPathLength ?? ''} onChange={(event) => onChange({ maxPathLength: numberValue(event.target.value) })} className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm" />
        </label>
        <label className="text-sm font-medium text-slate-700" htmlFor="min-width">Min width (yd)
          <input id="min-width" type="number" min="0" value={filters.minPathWidth ?? ''} onChange={(event) => onChange({ minPathWidth: numberValue(event.target.value) })} className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm" />
        </label>
        <label className="text-sm font-medium text-slate-700" htmlFor="max-width">Max width (yd)
          <input id="max-width" type="number" min="0" value={filters.maxPathWidth ?? ''} onChange={(event) => onChange({ maxPathWidth: numberValue(event.target.value) })} className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm" />
        </label>
      </div>
      <label className="block text-sm font-medium text-slate-700" htmlFor="min-damage">Minimum property damage (USD)
        <input id="min-damage" type="number" min="0" step="1000" value={filters.minPropertyDamage ?? ''} onChange={(event) => onChange({ minPropertyDamage: numberValue(event.target.value) })} className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm" />
      </label>
    </section>
  );
}
