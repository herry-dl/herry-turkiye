import { useEffect, useRef, useState } from 'react';
import { LeafletScene } from './LeafletScene';
import { fetchFreeStreetImage, type StreetImageSource } from '../streetImagery';
import { fetchNearestMapillaryImageId } from '../mapillary';

type PhotoOverlay = { url: string; source: StreetImageSource };

interface StreetViewPlayerProps {
  lat: number;
  lng: number;
  locationKey: string;
  mapillaryAccessToken: string | undefined;
  onReady: () => void;
  onLoadFailed?: () => void;
}

const ATTRIB: Record<StreetImageSource, { href: string; label: string }> = {
  panoramax: { href: 'https://panoramax.fr', label: 'Panoramax' },
  kartaview: { href: 'https://kartaview.org', label: 'KartaView' },
};

/**
 * Ana görünüm: Leaflet (https://leafletjs.com/) — anında yüklenir, siyah ekran yok.
 * Üstüne isteğe bağlı topluluk sokak fotoğrafı veya Mapillary panoraması bindirilir.
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
  const viewerRef = useRef<{ remove: () => void } | null>(null);
  const onReadyRef = useRef(onReady);
  const onLoadFailedRef = useRef(onLoadFailed);
  onReadyRef.current = onReady;
  onLoadFailedRef.current = onLoadFailed;

  const [mapReady, setMapReady] = useState(false);
  const [photo, setPhoto] = useState<PhotoOverlay | null>(null);
  const [mapillaryActive, setMapillaryActive] = useState(false);

  const handleMapReady = () => {
    setMapReady(true);
    onReadyRef.current();
  };

  // Ücretsiz sokak fotoğrafını arka planda dene (Leaflet’i bloklamaz)
  useEffect(() => {
    let cancelled = false;
    setPhoto(null);

    (async () => {
      const free = await fetchFreeStreetImage(lat, lng);
      if (cancelled || !free) return;
      setPhoto(free);
    })();

    return () => {
      cancelled = true;
    };
  }, [lat, lng, locationKey]);

  // Mapillary (token varsa ve fotoğraf yoksa)
  useEffect(() => {
    if (!mapillaryAccessToken || photo) {
      setMapillaryActive(false);
      return;
    }

    let cancelled = false;
    let readyFired = false;

    const tryMapillary = async () => {
      await new Promise((r) => setTimeout(r, 2500));
      if (cancelled || photo) return;

      const el = containerRef.current;
      if (!el) return;

      try {
        const imageId = await fetchNearestMapillaryImageId(mapillaryAccessToken, lat, lng);
        if (cancelled || photo || !imageId) return;

        const { Viewer, CameraControls } = await import('mapillary-js');
        await import('mapillary-js/dist/mapillary.css');

        if (cancelled || photo) return;

        el.innerHTML = '';
        setMapillaryActive(true);

        const viewer = new Viewer({
          accessToken: mapillaryAccessToken,
          container: el,
          imageId,
          cameraControls: CameraControls.Street,
        });
        viewerRef.current = viewer;

        const fireReady = () => {
          if (cancelled || readyFired) return;
          readyFired = true;
          onReadyRef.current();
        };
        viewer.on('load', fireReady);
        window.setTimeout(fireReady, 4000);
      } catch {
        if (!cancelled) onLoadFailedRef.current?.();
      }
    };

    tryMapillary();

    return () => {
      cancelled = true;
      setMapillaryActive(false);
      viewerRef.current?.remove();
      viewerRef.current = null;
      if (containerRef.current) containerRef.current.innerHTML = '';
    };
  }, [lat, lng, locationKey, mapillaryAccessToken, photo]);

  const failPhoto = () => {
    setPhoto(null);
    onLoadFailedRef.current?.();
  };

  return (
    <div className="street-scene-wrap" style={{ position: 'absolute', inset: 0, zIndex: 1 }}>
      {!mapillaryActive && (
        <LeafletScene
          lat={lat}
          lng={lng}
          locationKey={locationKey}
          onReady={handleMapReady}
        />
      )}

      {photo && !mapillaryActive && (
        <div className="street-photo-overlay">
          <img src={photo.url} alt="" decoding="async" onError={failPhoto} />
          <a
            className="street-photo-attrib"
            href={ATTRIB[photo.source].href}
            target="_blank"
            rel="noreferrer noopener"
          >
            {ATTRIB[photo.source].label}
          </a>
        </div>
      )}

      {mapillaryActive && (
        <div
          ref={containerRef}
          className="street-view-panorama-root"
          style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }}
        />
      )}

      {mapReady && !photo && !mapillaryActive && (
        <div className="map-hint-banner">Harita modu — etrafa kaydırarak bak</div>
      )}
    </div>
  );
}
