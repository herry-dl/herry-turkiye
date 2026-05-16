import { useLayoutEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { ensureLeafletIcons, OSM_ATTRIBUTION, OSM_TILE_URL } from '../leaflet-config';

interface LeafletSceneProps {
  lat: number;
  lng: number;
  locationKey: string;
  zoom?: number;
  interactive?: boolean;
  onReady: () => void;
  className?: string;
}

function fitMapToParent(map: L.Map, el: HTMLElement) {
  const parent = el.parentElement;
  if (!parent) return;
  const h = parent.clientHeight;
  const w = parent.clientWidth;
  if (h > 0) el.style.height = `${h}px`;
  if (w > 0) el.style.width = `${w}px`;
  map.invalidateSize(true);
}

/**
 * Imperatif Leaflet — tam ekran sahne; flex içinde şerit/siyah ekran olmaz.
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

  useLayoutEffect(() => {
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
      fitMapToParent(map, el);
      onReadyRef.current();
    };

    const resize = () => fitMapToParent(map, el);

    map.whenReady(() => {
      resize();
      fireReady();
    });

    const t1 = window.setTimeout(resize, 50);
    const t2 = window.setTimeout(resize, 300);
    const t3 = window.setTimeout(fireReady, 800);

    const ro = new ResizeObserver(resize);
    ro.observe(el);
    if (el.parentElement) ro.observe(el.parentElement);

    return () => {
      ready = true;
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
      ro.disconnect();
      map.remove();
    };
  }, [lat, lng, locationKey, zoom, interactive]);

  return <div ref={containerRef} className={className} />;
}
