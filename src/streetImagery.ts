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
const TOTAL_TIMEOUT_MS = 7_000;

export async function fetchFreeStreetImage(lat: number, lng: number): Promise<StreetImageResult | null> {
  const tasks = [
    fetchNearestPanoramaxImageUrl(lat, lng).then((url) =>
      url ? ({ url, source: 'panoramax' as const }) : Promise.reject()
    ),
    fetchKartaViewImageUrl(lat, lng).then((url) =>
      url ? ({ url, source: 'kartaview' as const }) : Promise.reject()
    ),
  ];

  const timeout = new Promise<never>((_, reject) => {
    window.setTimeout(() => reject(new Error('timeout')), TOTAL_TIMEOUT_MS);
  });

  try {
    return await Promise.race([Promise.any(tasks), timeout]);
  } catch {
    return null;
  }
}
