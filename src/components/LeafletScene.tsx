import { useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { ensureLeafletIcons, OSM_ATTRIBUTION, OSM_TILE_URL } from '../leaflet-config';

interface LeafletSceneProps {
  lat: number;
  lng: number;
  locationKey: string;
  zoom?: number;
  /** Oyuncu haritayı hafifçe kaydırabilsin */
  interactive?: boolean;
  onReady: () => void;
  className?: string;
}

/**
 * Imperatif Leaflet — react-leaflet ile ikinci MapContainer çakışmasını önler.
 * Flex layout’ta siyah/gri karo sorununu invalidateSize ile giderir.
 */
export function LeafletScene({
  lat,
  lng,
  locationKey,
  zoom = 17,
  interactive = true,
  onReady,
  className = 'leaflet-scene',
}: LeafletSceneProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const onReadyRef = useRef(onReady);
  onReadyRef.current = onReady;

  useEffect(() => {
    ensureLeafletIcons();
    const el = containerRef.current;
    if (!el) return;

    const map = L.map(el, {
      center: [lat, lng],
      zoom,
      zoomControl: false,
      attributionControl: true,
      dragging: interactive,
      scrollWheelZoom: interactive,
      doubleClickZoom: interactive,
      touchZoom: interactive,
      boxZoom: false,
      keyboard: false,
    });

    L.tileLayer(OSM_TILE_URL, { attribution: OSM_ATTRIBUTION, maxZoom: 19 }).addTo(map);

    let ready = false;
    const fireReady = () => {
      if (ready) return;
      ready = true;
      map.invalidateSize();
      onReadyRef.current();
    };

    map.whenReady(fireReady);
    const t = window.setTimeout(fireReady, 600);

    const ro = new ResizeObserver(() => map.invalidateSize());
    ro.observe(el);

    return () => {
      ready = true;
      clearTimeout(t);
      ro.disconnect();
      map.remove();
    };
  }, [lat, lng, locationKey, zoom, interactive]);

  return <div ref={containerRef} className={className} />;
}
