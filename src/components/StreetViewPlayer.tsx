import { useEffect, useRef } from 'react';
import { googleStreetViewEmbedUrl } from '../googleStreetView';

interface StreetViewPlayerProps {
  lat: number;
  lng: number;
  locationKey: string;
  onReady: () => void;
  onLoadFailed?: () => void;
}

/** Google Street View — svembed iframe (ilk sürümdeki gibi). */
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

  const src = googleStreetViewEmbedUrl(lat, lng);

  useEffect(() => {
    console.log(`[StreetView] Google iframe lat=${lat} lng=${lng}`);
  }, [lat, lng, locationKey]);

  return (
    <div className="google-street-view">
      <iframe
        key={locationKey}
        title="Sokak görüntüsü"
        className="google-street-iframe"
        src={src}
        allowFullScreen
        referrerPolicy="no-referrer-when-downgrade"
        onLoad={() => onReadyRef.current()}
        onError={() => onLoadFailedRef.current?.()}
      />
      <p className="street-hint">Sürükleyerek etrafa bak</p>
      <a
        className="street-photo-attrib"
        href="https://www.google.com/maps"
        target="_blank"
        rel="noreferrer noopener"
      >
        Google Street View
      </a>
    </div>
  );
}
