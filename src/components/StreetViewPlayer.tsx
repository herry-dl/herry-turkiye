import { useEffect, useRef, useState } from 'react';
import { Viewer, CameraControls } from 'mapillary-js';
import 'mapillary-js/dist/mapillary.css';

async function fetchNearestMapillaryImageId(
  accessToken: string,
  lat: number,
  lng: number
): Promise<string | null> {
  const base = 'https://graph.mapillary.com/images';
  const run = async (search: URLSearchParams): Promise<string | null> => {
    const url = `${base}?${search.toString()}`;
    const res = await fetch(url);
    if (!res.ok) return null;
    const json = (await res.json()) as { data?: { id: string }[] };
    const id = json.data?.[0]?.id;
    return id != null ? String(id) : null;
  };

  const point = new URLSearchParams({
    access_token: accessToken,
    fields: 'id',
    lat: String(lat),
    lng: String(lng),
    radius: '50',
    limit: '1',
  });
  const idFromPoint = await run(point);
  if (idFromPoint) return idFromPoint;

  const d = 0.0009;
  const bbox = new URLSearchParams({
    access_token: accessToken,
    fields: 'id',
    bbox: `${lng - d},${lat - d},${lng + d},${lat + d}`,
    limit: '5',
  });
  return run(bbox);
}

interface StreetViewPlayerProps {
  lat: number;
  lng: number;
  locationKey: string;
  /** Ücretsiz client token: mapillary.com → Developers */
  mapillaryAccessToken: string | undefined;
  onReady: () => void;
  onLoadFailed?: () => void;
}

/**
 * Sokak görüntüsü: varsa ücretsiz Mapillary (Graph API + MapillaryJS),
 * yoksa veya görüntü bulunamazsa Google svembed iframe (API anahtarı gerekmez).
 * Tahmin haritası zaten OpenStreetMap (Leaflet).
 */
export function StreetViewPlayer({
  lat,
  lng,
  locationKey,
  mapillaryAccessToken,
  onReady,
  onLoadFailed,
}: StreetViewPlayerProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const viewerRef = useRef<Viewer | null>(null);
  const onReadyRef = useRef(onReady);
  const onLoadFailedRef = useRef(onLoadFailed);
  onReadyRef.current = onReady;
  onLoadFailedRef.current = onLoadFailed;

  const [iframeOnly, setIframeOnly] = useState(() => !mapillaryAccessToken);

  useEffect(() => {
    setIframeOnly(!mapillaryAccessToken);
  }, [locationKey, mapillaryAccessToken]);

  useEffect(() => {
    if (iframeOnly || !mapillaryAccessToken) return;

    const el = containerRef.current;
    if (!el) return;

    let cancelled = false;
    let readyFired = false;
    el.innerHTML = '';

    const fireReady = () => {
      if (cancelled || readyFired) return;
      readyFired = true;
      onReadyRef.current();
    };

    const run = async () => {
      try {
        const imageId = await fetchNearestMapillaryImageId(mapillaryAccessToken, lat, lng);
        if (cancelled) return;
        if (!imageId) {
          setIframeOnly(true);
          onLoadFailedRef.current?.();
          return;
        }

        el.innerHTML = '';
        const viewer = new Viewer({
          accessToken: mapillaryAccessToken,
          container: el,
          imageId,
          cameraControls: CameraControls.Street,
        });
        viewerRef.current = viewer;

        viewer.on('load', fireReady);
        window.setTimeout(fireReady, 4000);
      } catch {
        if (!cancelled) {
          setIframeOnly(true);
          onLoadFailedRef.current?.();
        }
      }
    };

    void run();

    return () => {
      cancelled = true;
      viewerRef.current?.remove();
      viewerRef.current = null;
      el.innerHTML = '';
    };
  }, [lat, lng, locationKey, mapillaryAccessToken, iframeOnly]);

  if (iframeOnly) {
    return (
      <iframe
        key={locationKey}
        title="Street View"
        width="100%"
        height="100%"
        style={{ border: 0, position: 'absolute', top: 0, left: 0, width: '100%', height: '100%' }}
        src={`https://maps.google.com/maps?layer=c&cbll=${lat},${lng}&output=svembed&hl=tr`}
        allowFullScreen
        onLoad={onReady}
        onError={() => onLoadFailed?.()}
      />
    );
  }

  return (
    <div
      ref={containerRef}
      className="street-view-panorama-root"
      style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', zIndex: 1 }}
    />
  );
}
