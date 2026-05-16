import { fetchKartaViewImageUrl } from './kartaview';
import { fetchNearestPanoramaxImageUrl } from './panoramax';

export type StreetImageSource = 'panoramax' | 'kartaview';

export type StreetImageResult = {
  url: string;
  source: StreetImageSource;
};

/**
 * Ücretsiz kaynaklardan ilk bulunan sokak fotoğrafı.
 * Panoramax ve KartaView paralel; biri döner dönmez kullanılır.
 */
export async function fetchFreeStreetImage(lat: number, lng: number): Promise<StreetImageResult | null> {
  const tasks = [
    fetchNearestPanoramaxImageUrl(lat, lng).then((url) =>
      url ? ({ url, source: 'panoramax' as const }) : Promise.reject()
    ),
    fetchKartaViewImageUrl(lat, lng).then((url) =>
      url ? ({ url, source: 'kartaview' as const }) : Promise.reject()
    ),
  ];

  try {
    return await Promise.any(tasks);
  } catch {
    return null;
  }
}
