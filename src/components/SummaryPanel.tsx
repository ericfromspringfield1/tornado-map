import type { TornadoSummary } from '../types/tornado';
import { formatDate, formatNumber } from '../utils/format';

function Stat({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-3 shadow-sm">
      <dt className="text-xs font-semibold uppercase tracking-wide text-slate-500">{label}</dt>
      <dd className="mt-1 text-xl font-bold text-slate-900">{value}</dd>
    </div>
  );
}

function TopList({ label, items }: { label: string; items: Array<{ name: string; count: number }> }) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-3 shadow-sm">
      <h3 className="text-xs font-semibold uppercase tracking-wide text-slate-500">{label}</h3>
      {items.length ? (
        <ol className="mt-2 space-y-1 text-sm text-slate-700">
          {items.map((item) => <li key={item.name} className="flex justify-between gap-3"><span>{item.name}</span><strong>{item.count}</strong></li>)}
        </ol>
      ) : <p className="mt-2 text-sm text-slate-500">No matches</p>}
    </div>
  );
}

export function SummaryPanel({ summary }: { summary: TornadoSummary }) {
  return (
    <section className="space-y-3" aria-labelledby="summary-heading">
      <div>
        <h2 id="summary-heading" className="text-lg font-bold text-slate-900">Summary</h2>
        <p className="text-sm text-slate-600">Statistics update as filters change.</p>
      </div>
      <dl className="grid grid-cols-2 gap-3 xl:grid-cols-3">
        <Stat label="Matching tornadoes" value={formatNumber(summary.total)} />
        <Stat label="Date range" value={summary.dateRange ? `${formatDate(summary.dateRange.start)} – ${formatDate(summary.dateRange.end)}` : 'No matches'} />
        <Stat label="Fatal tornadoes" value={formatNumber(summary.fatalTornadoes)} />
        <Stat label="Total fatalities" value={formatNumber(summary.totalFatalities)} />
        <Stat label="Total injuries" value={formatNumber(summary.totalInjuries)} />
        <Stat label="Strongest rating" value={summary.strongestRating ?? 'Unknown'} />
      </dl>
      <div className="grid gap-3 xl:grid-cols-2">
        <TopList label="Top states" items={summary.topStates} />
        <TopList label="Top counties" items={summary.topCounties} />
      </div>
    </section>
  );
}
