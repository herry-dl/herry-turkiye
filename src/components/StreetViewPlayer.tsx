import { useEffect, useRef, useState } from 'react';
import { Loader } from '@googlemaps/js-api-loader';

const RADII_METERS = [50, 150, 400, 1000, 2500];

function findNearestPanoId(
  service: google.maps.StreetViewService,
  lat: number,
  lng: number
): Promise<string | null> {
  const tryAtIndex = (i: number): Promise<string | null> => {
    if (i >= RADII_METERS.length) return Promise.resolve(null);
    const radius = RADII_METERS[i];
    return new Promise<string | null>((resolve) => {
      service.getPanorama(
        {
          location: { lat, lng },
          radius,
          source: google.maps.StreetViewSource.DEFAULT,
        },
        (data, status) => {
          if (status === google.maps.StreetViewStatus.OK && data?.location?.pano) {
            resolve(data.location.pano);
          } else {
            void tryAtIndex(i + 1).then(resolve);
          }
        }
      );
    });
  };
  return tryAtIndex(0);
}

interface StreetViewPlayerProps {
  lat: number;
  lng: number;
  locationKey: string;
  apiKey: string | undefined;
  onReady: () => void;
  /** API veya iframe yüklenemediğinde (veya anahtar yokken iframe hatası) */
  onLoadFailed?: () => void;
}

/**
 * Anahtar varsa: resmi Panorama API — yakın sokak görüntüsüne snap.
 * Anahtar yoksa: eski svembed iframe (aynı riskler korunur).
 */
export function StreetViewPlayer({
  lat,
  lng,
  locationKey,
  apiKey,
  onReady,
  onLoadFailed,
}: StreetViewPlayerProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const panoramaRef = useRef<google.maps.StreetViewPanorama | null>(null);
  const onReadyRef = useRef(onReady);
  const onLoadFailedRef = useRef(onLoadFailed);
  onReadyRef.current = onReady;
  onLoadFailedRef.current = onLoadFailed;
  const [iframeFallback, setIframeFallback] = useState(!apiKey);

  useEffect(() => {
    if (iframeFallback) return;

    const container = containerRef.current;
    if (!container || !apiKey) return;

    let cancelled = false;
    let readyNotified = false;
    panoramaRef.current = null;
    container.innerHTML = '';

    const safeReady = (pano: google.maps.StreetViewPanorama) => {
      if (cancelled || readyNotified) return;
      if (pano.getStatus() === google.maps.StreetViewStatus.OK) {
        readyNotified = true;
        onReadyRef.current();
      }
    };

    const run = async () => {
      try {
        const loader = new Loader({ apiKey, version: 'weekly' });
        await loader.load();
        if (cancelled || !containerRef.current) return;

        const panoId = await findNearestPanoId(
          new google.maps.StreetViewService(),
          lat,
          lng
        );
        if (cancelled || !containerRef.current) return;

        if (!panoId) {
          setIframeFallback(true);
          onLoadFailedRef.current?.();
          return;
        }

        const pano = new google.maps.StreetViewPanorama(containerRef.current, {
          pano: panoId,
          addressControl: false,
          linksControl: true,
          panControl: true,
          enableCloseButton: false,
          fullscreenControl: true,
          motionTracking: false,
          motionTrackingControl: false,
        });
        panoramaRef.current = pano;

        pano.addListener('status_changed', () => safeReady(pano));
        google.maps.event.addListenerOnce(pano, 'pano_changed', () => safeReady(pano));

        window.setTimeout(() => safeReady(pano), 2500);
      } catch {
        if (!cancelled) {
          setIframeFallback(true);
          onLoadFailedRef.current?.();
        }
      }
    };

    void run();

    return () => {
      cancelled = true;
      if (panoramaRef.current) {
        panoramaRef.current.setVisible(false);
        panoramaRef.current = null;
      }
      if (containerRef.current) containerRef.current.innerHTML = '';
    };
  }, [lat, lng, locationKey, apiKey, iframeFallback]);

  if (iframeFallback) {
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
      style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }}
    />
  );
}
