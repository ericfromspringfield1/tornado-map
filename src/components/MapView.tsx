import { useEffect, useMemo } from 'react';
import { MapContainer, Polyline, Popup, TileLayer, useMap } from 'react-leaflet';
import type { LatLngBoundsExpression } from 'leaflet';
import type { TornadoEvent } from '../types/tornado';
import { getRatingColor, getRatingWeight } from '../utils/ratings';
import { ClusteredMarkers } from './ClusteredMarkers';
import { Legend } from './Legend';
import { TornadoPopup } from './TornadoPopup';

const US_CENTER: [number, number] = [39.5, -98.35];

type BoundsControllerProps = { events: TornadoEvent[] };

function BoundsController({ events }: BoundsControllerProps) {
  const map = useMap();

  useEffect(() => {
    const points = events.flatMap((event) => {
      const coords: Array<[number, number]> = [];
      if (event.startLat !== undefined && event.startLon !== undefined) coords.push([event.startLat, event.startLon]);
      if (event.endLat !== undefined && event.endLon !== undefined) coords.push([event.endLat, event.endLon]);
      return coords;
    });

    if (!points.length) {
      map.setView(US_CENTER, 4);
      return;
    }
    if (points.length === 1) {
      map.setView(points[0], 7, { animate: true });
      return;
    }
    map.fitBounds(points as LatLngBoundsExpression, { padding: [32, 32], maxZoom: 8, animate: true });
  }, [events, map]);

  return null;
}

export function MapView({ events }: { events: TornadoEvent[] }) {
  const trackEvents = useMemo(
    () => events.filter((event) => event.startLat !== undefined && event.startLon !== undefined && event.endLat !== undefined && event.endLon !== undefined),
    [events],
  );

  return (
    <section className="relative h-[60vh] min-h-[32rem] overflow-hidden rounded-2xl border border-slate-200 bg-slate-200 shadow-sm lg:h-[calc(100vh-2rem)]" aria-label="Interactive tornado map">
      <MapContainer center={US_CENTER} zoom={4} scrollWheelZoom preferCanvas className="z-0">
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <BoundsController events={events} />
        <ClusteredMarkers events={events} />
        {trackEvents.map((event) => (
          <Polyline
            key={`${event.id}-track`}
            pathOptions={{ color: getRatingColor(event.rating), weight: getRatingWeight(event.rating), opacity: 0.8 }}
            positions={[
              [event.startLat!, event.startLon!],
              [event.endLat!, event.endLon!],
            ]}
          >
            <Popup maxWidth={380}><TornadoPopup event={event} /></Popup>
          </Polyline>
        ))}
      </MapContainer>
      <Legend />
      {!events.length ? (
        <div className="pointer-events-none absolute inset-x-4 top-4 z-[500] rounded-xl bg-white/95 p-4 text-center text-sm font-medium text-slate-700 shadow-lg">
          No tornadoes match the selected filters.
        </div>
      ) : null}
    </section>
  );
}
