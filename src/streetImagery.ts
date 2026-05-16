import { fetchKartaViewSequence } from './kartaview';
import { fetchNearestPanoramaxImageUrl } from './panoramax';

export type StreetImageSource = 'panoramax' | 'kartaview';

export type StreetScene = {
  images: string[];
  source: StreetImageSource;
};

const TOTAL_TIMEOUT_MS = 9_000;

/**
 * Sokak sahnesi: KartaView dizisi (dolaşılabilir) veya tek Panoramax fotoğrafı.
 */
export async function fetchStreetScene(lat: number, lng: number): Promise<StreetScene | null> {
  const timeout = new Promise<null>((resolve) => {
    window.setTimeout(() => resolve(null), TOTAL_TIMEOUT_MS);
  });

  const work = async (): Promise<StreetScene | null> => {
    const kv = await fetchKartaViewSequence(lat, lng);
    if (kv.length) return { images: kv, source: 'kartaview' };

    const px = await fetchNearestPanoramaxImageUrl(lat, lng);
    if (px) return { images: [px], source: 'panoramax' };

    return null;
  };

  return Promise.race([work(), timeout]);
}
