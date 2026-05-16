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

/**
 * Sokak görünümü: round başında Mapillary'den taze fotoğraf URL'leri çeker.
 * URL'ler kısa ömürlü olduğu için cache'lenmez — her seferinde fetch.
 */
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

  const [scene, setScene] = useState<StreetScene | null>(null);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    let cancelled = false;
    setScene(null);
    setFailed(false);

    (async () => {
      const result = await fetchStreetScene(lat, lng);
      if (cancelled) return;
      if (result && result.images.length > 0) {
        setScene(result);
        return;
      }
      setFailed(true);
      onLoadFailedRef.current?.();
      onReadyRef.current();
    })();

    return () => {
      cancelled = true;
    };
  }, [lat, lng, locationKey]);

  if (failed) {
    return (
      <div className="street-empty">
        <p>Bu konumda sokak fotoğrafı bulunamadı.</p>
        <p className="street-empty-hint">ATLA ile başka bir konum dene.</p>
      </div>
    );
  }

  if (scene) {
    return (
      <PhotoStreetView
        key={locationKey}
        images={scene.images}
        source={scene.source}
        onReady={onReady}
      />
    );
  }

  return (
    <div className="street-loading">
      <div className="loader-spinner" />
    </div>
  );
}
