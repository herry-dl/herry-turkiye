import { useEffect, useRef, useState } from 'react';
import { PhotoStreetView } from './PhotoStreetView';
import { fetchStreetScene, type StreetScene } from '../streetImagery';

interface StreetViewPlayerProps {
  lat: number;
  lng: number;
  locationKey: string;
  onReady: () => void;
  onLoadFailed?: () => void;
}

type Status =
  | { kind: 'loading' }
  | { kind: 'ready'; scene: StreetScene }
  | { kind: 'empty' }
  | { kind: 'error'; message: string };

export function StreetViewPlayer({
  lat,
  lng,
  locationKey,
  onReady,
  onLoadFailed,
}: StreetViewPlayerProps) {
  const onReadyRef = useRef(onReady);
  const onLoadFailedRef = useRef(onLoadFailed);
  onReadyRef.current = onReady;
  onLoadFailedRef.current = onLoadFailed;

  const [status, setStatus] = useState<Status>({ kind: 'loading' });

  useEffect(() => {
    let cancelled = false;
    setStatus({ kind: 'loading' });

    (async () => {
      try {
        console.log(`[StreetView] fetching scene lat=${lat} lng=${lng}`);
        const result = await fetchStreetScene(lat, lng);
        if (cancelled) return;

        if (result && result.images.length > 0) {
          console.log(`[StreetView] scene ready: ${result.images.length} images from ${result.source}`);
          setStatus({ kind: 'ready', scene: result });
          return;
        }

        console.warn(`[StreetView] no images for lat=${lat} lng=${lng}`);
        setStatus({ kind: 'empty' });
        onLoadFailedRef.current?.();
        onReadyRef.current();
      } catch (err) {
        const message = err instanceof Error ? err.message : String(err);
        console.error('[StreetView] fetch error', err);
        if (!cancelled) {
          setStatus({ kind: 'error', message });
          onLoadFailedRef.current?.();
          onReadyRef.current();
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [lat, lng, locationKey]);

  if (status.kind === 'ready') {
    return (
      <PhotoStreetView
        key={locationKey}
        images={status.scene.images}
        source={status.scene.source}
        onReady={onReady}
      />
    );
  }

  if (status.kind === 'empty') {
    return (
      <div className="street-empty">
        <p>📍 Bu konumda sokak fotoğrafı bulunamadı.</p>
        <p className="street-empty-hint">ATLA ile başka bir konum dene.</p>
      </div>
    );
  }

  if (status.kind === 'error') {
    return (
      <div className="street-empty">
        <p>⚠️ Sokak fotoğrafı yüklenemedi</p>
        <p className="street-empty-hint">{status.message}</p>
        <p className="street-empty-hint">ATLA ile başka bir konum dene.</p>
      </div>
    );
  }

  return (
    <div className="street-loading">
      <div className="loader-spinner" />
      <p className="street-loading-text">Sokak görüntüsü yükleniyor…</p>
    </div>
  );
}
