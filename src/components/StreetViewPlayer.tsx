import { useEffect, useRef, useState } from 'react';
import { MapHintView } from './MapHintView';
import { fetchFreeStreetImage, type StreetImageSource } from '../streetImagery';
import { fetchNearestMapillaryImageId } from '../mapillary';

type Layer =
  | { kind: 'loading' }
  | { kind: 'photo'; url: string; source: StreetImageSource }
  | { kind: 'mapillary' }
  | { kind: 'map-hint' };

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
 * 1) Panoramax + KartaView (paralel, ücretsiz)
 * 2) İsteğe bağlı Mapillary (token)
 * 3) OSM harita ipucu (siyah ekran yok)
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

  const [layer, setLayer] = useState<Layer>({ kind: 'loading' });

  useEffect(() => {
    let cancelled = false;
    setLayer({ kind: 'loading' });

    (async () => {
      try {
        const free = await fetchFreeStreetImage(lat, lng);
        if (cancelled) return;
        if (free) {
          setLayer({ kind: 'photo', url: free.url, source: free.source });
          return;
        }
        if (mapillaryAccessToken) {
          setLayer({ kind: 'mapillary' });
          return;
        }
        setLayer({ kind: 'map-hint' });
        onLoadFailedRef.current?.();
      } catch {
        if (!cancelled) {
          if (mapillaryAccessToken) setLayer({ kind: 'mapillary' });
          else {
            setLayer({ kind: 'map-hint' });
            onLoadFailedRef.current?.();
          }
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [lat, lng, locationKey, mapillaryAccessToken]);

  useEffect(() => {
    if (layer.kind !== 'mapillary') return;

    const el = containerRef.current;
    if (!el || !mapillaryAccessToken) return;

    let cancelled = false;
    let readyFired = false;
    el.innerHTML = '';

    const fireReady = () => {
      if (cancelled || readyFired) return;
      readyFired = true;
      onReadyRef.current();
    };

    (async () => {
      try {
        const { Viewer, CameraControls } = await import('mapillary-js');
        await import('mapillary-js/dist/mapillary.css');

        const imageId = await fetchNearestMapillaryImageId(mapillaryAccessToken, lat, lng);
        if (cancelled) return;
        if (!imageId) {
          setLayer({ kind: 'map-hint' });
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
          setLayer({ kind: 'map-hint' });
          onLoadFailedRef.current?.();
        }
      }
    })();

    return () => {
      cancelled = true;
      viewerRef.current?.remove();
      viewerRef.current = null;
      el.innerHTML = '';
    };
  }, [layer.kind, lat, lng, locationKey, mapillaryAccessToken]);

  const failPhoto = () => {
    if (mapillaryAccessToken) setLayer({ kind: 'mapillary' });
    else {
      setLayer({ kind: 'map-hint' });
      onLoadFailed?.();
    }
  };

  if (layer.kind === 'loading') {
    return (
      <div
        className="street-view-loading-shell"
        style={{ position: 'absolute', inset: 0, zIndex: 1, background: '#1a1a1a' }}
        aria-hidden
      />
    );
  }

  if (layer.kind === 'photo') {
    const attrib = ATTRIB[layer.source];
    return (
      <div className="street-photo-wrap" style={{ position: 'absolute', inset: 0, zIndex: 1, background: '#111' }}>
        <img
          src={layer.url}
          alt=""
          decoding="async"
          style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
          onLoad={() => onReady()}
          onError={failPhoto}
        />
        <a className="street-photo-attrib" href={attrib.href} target="_blank" rel="noreferrer noopener">
          {attrib.label}
        </a>
      </div>
    );
  }

  if (layer.kind === 'mapillary') {
    return (
      <div
        ref={containerRef}
        className="street-view-panorama-root"
        style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', zIndex: 1 }}
      />
    );
  }

  return <MapHintView key={locationKey} lat={lat} lng={lng} onReady={onReady} />;
}
