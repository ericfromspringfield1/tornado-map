import type { TornadoEvent } from '../types/tornado';
import { formatDamage, formatDate, formatNumber } from '../utils/format';

function Row({ label, value }: { label: string; value?: string | number }) {
  if (value === undefined || value === '') return null;
  return (
    <div className="grid grid-cols-[8rem_1fr] gap-2 border-b border-slate-100 py-1 last:border-0">
      <dt className="font-semibold text-slate-600">{label}</dt>
      <dd className="text-slate-900">{value}</dd>
    </div>
  );
}

export function TornadoPopup({ event }: { event: TornadoEvent }) {
  return (
    <article className="min-w-72 max-w-sm text-sm">
      <h3 className="mb-1 text-base font-bold text-slate-900">{event.rating ?? 'Unknown'} tornado · {event.state}</h3>
      <p className="mb-2 text-xs text-slate-500">{event.id}</p>
      <dl>
        <Row label="Date" value={formatDate(event.date)} />
        <Row label="Time" value={event.time} />
        <Row label="County/counties" value={event.counties?.join(', ') ?? event.county} />
        <Row label="Injuries" value={formatNumber(event.injuries)} />
        <Row label="Fatalities" value={formatNumber(event.fatalities)} />
        <Row label="Property damage" value={formatDamage(event.propertyDamage)} />
        <Row label="Path length" value={event.pathLengthMiles !== undefined ? `${event.pathLengthMiles} mi` : undefined} />
        <Row label="Path width" value={event.pathWidthYards !== undefined ? `${event.pathWidthYards} yd` : undefined} />
        <Row label="Start" value={event.startLat !== undefined && event.startLon !== undefined ? `${event.startLat}, ${event.startLon}` : undefined} />
        <Row label="End" value={event.endLat !== undefined && event.endLon !== undefined ? `${event.endLat}, ${event.endLon}` : undefined} />
        <Row label="Outbreak" value={event.outbreakName} />
        <Row label="Source" value={event.source} />
      </dl>
      {event.remarks ? <p className="mt-2 rounded-lg bg-slate-50 p-2 text-xs text-slate-700">{event.remarks}</p> : null}
    </article>
  );
}
