import { useEffect } from 'react';
import { PhotoStreetView } from './PhotoStreetView';
import type { StreetImageSource } from '../streetImagery';

interface StreetViewPlayerProps {
  images: string[];
  source: StreetImageSource;
  locationKey: string;
  onReady: () => void;
}

/**
 * Sokak görünümü: önceden doğrulanmış fotoğraflarda gezinme.
 * Hiç fetch yapmaz — App seviyesinde pre-validation ile gelen URL'leri kullanır.
 */
export function StreetViewPlayer({ images, source, locationKey, onReady }: StreetViewPlayerProps) {
  useEffect(() => {
    if (images.length === 0) onReady();
  }, [images, onReady]);

  if (images.length === 0) {
    return (
      <div className="street-empty">
        <p>Bu konumda sokak fotoğrafı bulunamadı.</p>
        <p className="street-empty-hint">ATLA ile başka bir konum dene.</p>
      </div>
    );
  }

  return (
    <PhotoStreetView
      key={locationKey}
      images={images}
      source={source}
      onReady={onReady}
    />
  );
}
