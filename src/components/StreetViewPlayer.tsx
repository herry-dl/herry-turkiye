import { useEffect, useRef, useState } from 'react';
import { PhotoStreetView } from './PhotoStreetView';
import { fetchStreetScene, type StreetScene } from '../streetImagery';
import { fetchNearestMapillaryImageId } from '../mapillary';

interface StreetViewPlayerProps {
  lat: number;
  lng: number;
  locationKey: string;
  mapillaryAccessToken: string | undefined;
  onReady: () => void;
  onLoadFailed?: () => void;
}

/**
 * Sokak görünümü: topluluk fotoğraflarında gezinme (sürükle + ileri/geri).
 * Mapillary token varsa panoramik görüntü denenir.
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

  const [scene, setScene] = useState<StreetScene | null>(null);
  const [mapillaryActive, setMapillaryActive] = useState(false);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    let cancelled = false;
    setScene(null);
    setFailed(false);
    setMapillaryActive(false);

    (async () => {
      const result = await fetchStreetScene(lat, lng);
      if (cancelled) return;
      if (result) {
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

  useEffect(() => {
    if (!mapillaryAccessToken || scene || failed) {
      setMapillaryActive(false);
      return;
    }

    let cancelled = false;
    let readyFired = false;

    (async () => {
      try {
        const imageId = await fetchNearestMapillaryImageId(mapillaryAccessToken, lat, lng);
        if (cancelled || scene || !imageId) return;

        const el = containerRef.current;
        if (!el) return;

        const { Viewer, CameraControls } = await import('mapillary-js');
        await import('mapillary-js/dist/mapillary.css');

        if (cancelled) return;

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
        if (!cancelled) {
          setFailed(true);
          onLoadFailedRef.current?.();
          onReadyRef.current();
        }
      }
    })();

    return () => {
      cancelled = true;
      setMapillaryActive(false);
      viewerRef.current?.remove();
      viewerRef.current = null;
      if (containerRef.current) containerRef.current.innerHTML = '';
    };
  }, [lat, lng, locationKey, mapillaryAccessToken, scene, failed]);

  if (mapillaryActive) {
    return (
      <div ref={containerRef} className="street-view-panorama-root" />
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

  if (failed) {
    return (
      <div className="street-empty">
        <p>Bu konumda sokak fotoğrafı bulunamadı.</p>
        <p className="street-empty-hint">ATLA ile başka bir konum dene.</p>
      </div>
    );
  }

  return <div className="street-loading" aria-hidden />;
}
