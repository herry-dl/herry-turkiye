import { useEffect, useRef } from 'react';
import { Viewer, isSupported, isFallbackSupported } from 'mapillary-js';
import 'mapillary-js/dist/mapillary.css';
import { MAPILLARY_TOKEN } from '../mapillary';

interface MapillaryViewerProps {
  imageId: string;
  locationKey: string;
  onReady: () => void;
  onFailed?: () => void;
}

/**
 * Resmi Mapillary JS viewer — 360° sokak panoraması.
 * cover:false zorunlu: varsayılan true iken viewer tıklanana kadar siyah kalır.
 */
export function MapillaryViewer({
  imageId,
  locationKey,
  onReady,
  onFailed,
}: MapillaryViewerProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const onReadyRef = useRef(onReady);
  const onFailedRef = useRef(onFailed);
  onReadyRef.current = onReady;
  onFailedRef.current = onFailed;

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    if (!isSupported() && !isFallbackSupported()) {
      console.error('[MapillaryViewer] WebGL desteklenmiyor');
      onFailedRef.current?.();
      return;
    }

    let cancelled = false;
    let viewer: Viewer | null = null;
    let readyFired = false;

    const fireReady = () => {
      if (cancelled || readyFired) return;
      readyFired = true;
      onReadyRef.current();
    };

    const fail = () => {
      if (cancelled) return;
      onFailedRef.current?.();
    };

    try {
      viewer = new Viewer({
        accessToken: MAPILLARY_TOKEN,
        container: el,
        imageId,
        component: {
          cover: false,
          attribution: true,
          bearing: false,
          zoom: false,
          sequence: true,
          direction: true,
          keyboard: true,
          pointer: true,
        },
      });

      viewer.on('load', fireReady);
      viewer.on('image', fireReady);

      const timeout = window.setTimeout(() => {
        if (!readyFired) {
          console.warn('[MapillaryViewer] load timeout for', imageId);
          fail();
        }
      }, 20_000);

      return () => {
        cancelled = true;
        clearTimeout(timeout);
        viewer?.remove();
      };
    } catch (err) {
      console.error('[MapillaryViewer] init failed', err);
      fail();
      return undefined;
    }
  }, [imageId, locationKey]);

  return (
    <div className="mapillary-street-view">
      <div ref={containerRef} className="mapillary-viewer-root" />
      <p className="street-hint">Sürükleyerek etrafa bak · Ok tuşlarıyla ilerle</p>
      <a
        className="street-photo-attrib"
        href="https://www.mapillary.com"
        target="_blank"
        rel="noreferrer noopener"
      >
        Mapillary
      </a>
    </div>
  );
}
