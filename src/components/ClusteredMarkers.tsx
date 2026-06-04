import { useEffect } from 'react';
import L from 'leaflet';
import 'leaflet.markercluster';
import { useMap } from 'react-leaflet';
import type { TornadoEvent } from '../types/tornado';
import { getRatingColor, getRatingWeight } from '../utils/ratings';
import { TornadoPopup } from './TornadoPopup';
import { createRoot } from 'react-dom/client';

type Props = { events: TornadoEvent[] };

function markerIcon(event: TornadoEvent) {
  const size = getRatingWeight(event.rating) * 3 + 8;
  return L.divIcon({
    className: 'tornado-marker',
    html: `<span class="sr-only">${event.rating ?? 'Unknown'} tornado</span>`,
    iconSize: [size, size],
    iconAnchor: [size / 2, size / 2],
    popupAnchor: [0, -size / 2],
    bgPos: [0, 0],
  });
}

export function ClusteredMarkers({ events }: Props) {
  const map = useMap();

  useEffect(() => {
    const clusterGroup = L.markerClusterGroup({ chunkedLoading: true, maxClusterRadius: 48 });
    const roots: Array<ReturnType<typeof createRoot>> = [];

    events.forEach((event) => {
      if (event.startLat === undefined || event.startLon === undefined) return;
      const marker = L.marker([event.startLat, event.startLon], { icon: markerIcon(event), title: `${event.rating ?? 'Unknown'} tornado in ${event.state}` });
      const element = marker.getElement();
      marker.on('add', () => {
        marker.getElement()?.style.setProperty('background-color', getRatingColor(event.rating));
      });
      element?.style.setProperty('background-color', getRatingColor(event.rating));
      const popupContainer = document.createElement('div');
      const root = createRoot(popupContainer);
      root.render(<TornadoPopup event={event} />);
      roots.push(root);
      marker.bindPopup(popupContainer, { maxWidth: 380 });
      clusterGroup.addLayer(marker);
    });

    map.addLayer(clusterGroup);
    return () => {
      roots.forEach((root) => root.unmount());
      map.removeLayer(clusterGroup);
    };
  }, [events, map]);

  return null;
}
