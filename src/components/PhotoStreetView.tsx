import { useCallback, useEffect, useRef, useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import type { StreetImageSource } from '../streetImagery';

const ATTRIB: Record<StreetImageSource, { href: string; label: string }> = {
  mapillary: { href: 'https://www.mapillary.com', label: 'Mapillary' },
  panoramax: { href: 'https://panoramax.fr', label: 'Panoramax' },
  kartaview: { href: 'https://kartaview.org', label: 'KartaView' },
};

interface PhotoStreetViewProps {
  images: string[];
  source: StreetImageSource;
  onReady: () => void;
}

/** Sokak fotoğrafında sürükleyerek etrafa bakma + dizide ileri/geri. */
export function PhotoStreetView({ images, source, onReady }: PhotoStreetViewProps) {
  const [index, setIndex] = useState(0);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [loaded, setLoaded] = useState(false);
  const dragRef = useRef<{ x: number; y: number; px: number; py: number } | null>(null);
  const readyRef = useRef(false);
  const onReadyRef = useRef(onReady);
  onReadyRef.current = onReady;

  const url = images[index] ?? images[0];
  const hasNav = images.length > 1;

  const fireReady = useCallback(() => {
    if (readyRef.current) return;
    readyRef.current = true;
    onReadyRef.current();
  }, []);

  useEffect(() => {
    readyRef.current = false;
    setLoaded(false);
    setPan({ x: 0, y: 0 });
    setIndex(0);
  }, [images]);

  useEffect(() => {
    const t = window.setTimeout(fireReady, 4000);
    return () => clearTimeout(t);
  }, [url, fireReady]);

  const onPointerDown = (e: React.PointerEvent) => {
    dragRef.current = { x: e.clientX, y: e.clientY, px: pan.x, py: pan.y };
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
  };

  const onPointerMove = (e: React.PointerEvent) => {
    if (!dragRef.current) return;
    const dx = e.clientX - dragRef.current.x;
    const dy = e.clientY - dragRef.current.y;
    setPan({
      x: Math.max(-120, Math.min(120, dragRef.current.px + dx * 0.6)),
      y: Math.max(-60, Math.min(60, dragRef.current.py + dy * 0.4)),
    });
  };

  const onPointerUp = () => {
    dragRef.current = null;
  };

  const attrib = ATTRIB[source];

  return (
    <div className="photo-street-view">
      <div
        className="photo-street-pan"
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={onPointerUp}
        style={{ touchAction: 'none' }}
      >
        <div
          className="photo-street-img-wrap"
          style={{ transform: `translate(${pan.x}px, ${pan.y}px) scale(1.15)` }}
        >
          <img
            key={url}
            src={url}
            alt=""
            className={`photo-street-img ${loaded ? 'loaded' : ''}`}
            draggable={false}
            referrerPolicy="no-referrer"
            crossOrigin="anonymous"
            onLoad={() => {
              console.log('[PhotoStreetView] image loaded');
              setLoaded(true);
              fireReady();
            }}
            onError={(e) => {
              console.error('[PhotoStreetView] image error', e);
              fireReady();
            }}
          />
        </div>
      </div>

      {hasNav && (
        <>
          <button
            type="button"
            className="street-nav street-nav-prev"
            disabled={index <= 0}
            onClick={() => {
              setIndex((i) => Math.max(0, i - 1));
              setPan({ x: 0, y: 0 });
              setLoaded(false);
            }}
            aria-label="Önceki"
          >
            <ChevronLeft size={28} />
          </button>
          <button
            type="button"
            className="street-nav street-nav-next"
            disabled={index >= images.length - 1}
            onClick={() => {
              setIndex((i) => Math.min(images.length - 1, i + 1));
              setPan({ x: 0, y: 0 });
              setLoaded(false);
            }}
            aria-label="Sonraki"
          >
            <ChevronRight size={28} />
          </button>
          <div className="street-nav-counter">
            {index + 1} / {images.length}
          </div>
        </>
      )}

      {!hasNav && (
        <p className="street-hint">Sürükleyerek etrafa bak · Yeri tahmin edince haritayı aç</p>
      )}

      <a className="street-photo-attrib" href={attrib.href} target="_blank" rel="noreferrer noopener">
        {attrib.label}
      </a>
    </div>
  );
}
