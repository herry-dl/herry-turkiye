import { useEffect, useRef } from 'react';
import { Viewer, RenderMode, isSupported, isFallbackSupported } from 'mapillary-js';
import 'mapillary-js/dist/mapillary.css';
import { MAPILLARY_TOKEN } from '../mapillary';

interface MapillaryViewerProps {
  imageId: string;
  locationKey: string;
  onReady: () => void;
  onFailed?: () => void;
}

function waitForSize(el: HTMLElement, maxMs = 5000): Promise<void> {
  return new Promise((resolve, reject) => {
    const start = Date.now();
    const tick = () => {
      if (el.offsetWidth > 0 && el.offsetHeight > 0) {
        resolve();
        return;
      }
      if (Date.now() - start > maxMs) {
        reject(new Error('Panorama alanı boyutlanamadı'));
        return;
      }
      requestAnimationFrame(tick);
    };
    tick();
  });
}

/**
 * Resmi Mapillary JS viewer — 360° sokak panoraması.
 * cover:false: varsayılan true iken tıklanana kadar siyah kalır.
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
    let loadTimeout = 0;
    let resizeObserver: ResizeObserver | null = null;

    const fireReady = () => {
      if (cancelled || readyFired) return;
      readyFired = true;
      viewer?.resize();
      console.log(
        `[MapillaryViewer] ready ${el.offsetWidth}x${el.offsetHeight} imageId=${imageId}`
      );
      onReadyRef.current();
    };

    const fail = (reason: string) => {
      if (cancelled) return;
      console.warn('[MapillaryViewer]', reason);
      onFailedRef.current?.();
    };

    (async () => {
      try {
        await waitForSize(el);
        if (cancelled) return;

        viewer = new Viewer({
          accessToken: MAPILLARY_TOKEN,
          container: el,
          imageId,
          imageTiling: true,
          renderMode: RenderMode.Fill,
          component: {
            cover: false,
            attribution: true,
            bearing: false,
            zoom: true,
            cache: true,
            sequence: true,
            direction: true,
            keyboard: true,
            pointer: true,
          },
        });

        viewer.on('load', fireReady);
        viewer.on('image', fireReady);

        resizeObserver = new ResizeObserver(() => {
          if (!cancelled) viewer?.resize();
        });
        resizeObserver.observe(el);

        loadTimeout = window.setTimeout(() => {
          if (!readyFired) fail(`load timeout imageId=${imageId}`);
        }, 25_000);
      } catch (err) {
        fail(err instanceof Error ? err.message : String(err));
      }
    })();

    return () => {
      cancelled = true;
      clearTimeout(loadTimeout);
      resizeObserver?.disconnect();
      try {
        viewer?.remove();
      } catch {
        /* StrictMode / hızlı tur değişiminde Mapillary iptal hatası */
      }
      viewer = null;
    };
  }, [imageId, locationKey]);

  return (
    <div className="mapillary-street-view">
      <div ref={containerRef} className="mapillary-viewer-root" />
      <p className="street-hint">Sürükle · Ok tuşları · Yakınlaştır (+/−)</p>
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
