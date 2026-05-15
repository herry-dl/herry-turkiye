import { useEffect, useRef, useState } from 'react';
import { fetchKartaViewImageUrl } from '../kartaview';
import { fetchNearestMapillaryImageId } from '../mapillary';

type Layer =
  | { kind: 'loading' }
  | { kind: 'kartaview'; url: string }
  | { kind: 'mapillary' }
  | { kind: 'iframe' };

interface StreetViewPlayerProps {
  lat: number;
  lng: number;
  locationKey: string;
  /** İsteğe bağlı; yoksa KartaView → iframe */
  mapillaryAccessToken: string | undefined;
  onReady: () => void;
  onLoadFailed?: () => void;
}

/**
 * 1) KartaView (OpenStreetCam) — ücretsiz, kayıt/anahtar gerekmez
 * 2) İsteğe bağlı Mapillary (token ile panoramik)
 * 3) Google svembed iframe (anahtarsız yedek)
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

  // Tur değişince: önce KartaView dene
  useEffect(() => {
    let cancelled = false;
    setLayer({ kind: 'loading' });

    (async () => {
      try {
        const kv = await fetchKartaViewImageUrl(lat, lng);
        if (cancelled) return;
        if (kv) {
          setLayer({ kind: 'kartaview', url: kv });
          return;
        }
        if (mapillaryAccessToken) {
          setLayer({ kind: 'mapillary' });
          return;
        }
        setLayer({ kind: 'iframe' });
      } catch {
        if (!cancelled) {
          if (mapillaryAccessToken) setLayer({ kind: 'mapillary' });
          else {
            setLayer({ kind: 'iframe' });
            onLoadFailedRef.current?.();
          }
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [lat, lng, locationKey, mapillaryAccessToken]);

  // Mapillary katmanı
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
          setLayer({ kind: 'iframe' });
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
          setLayer({ kind: 'iframe' });
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

  const failKartaView = () => {
    if (mapillaryAccessToken) setLayer({ kind: 'mapillary' });
    else {
      setLayer({ kind: 'iframe' });
      onLoadFailed?.();
    }
  };

  if (layer.kind === 'loading') {
    return null;
  }

  if (layer.kind === 'kartaview') {
    return (
      <div className="kartaview-wrap" style={{ position: 'absolute', inset: 0, zIndex: 1, background: '#000' }}>
        <img
          src={layer.url}
          alt=""
          decoding="async"
          style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
          onLoad={() => onReady()}
          onError={failKartaView}
        />
        <a
          className="kartaview-attrib"
          href="https://kartaview.org"
          target="_blank"
          rel="noreferrer noopener"
        >
          KartaView
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
