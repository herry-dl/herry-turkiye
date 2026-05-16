import { fetchMapillaryScene, mapillaryHasCoverage } from './mapillary';

export type StreetImageSource = 'mapillary' | 'kartaview' | 'panoramax';

export type StreetScene = {
  images: string[];
  source: StreetImageSource;
};

/**
 * Sokak fotoğrafları — Mapillary öncelikli (Türkiye'de en geniş kapsama).
 */
export async function fetchStreetScene(lat: number, lng: number): Promise<StreetScene | null> {
  const mly = await fetchMapillaryScene(lat, lng);
  if (mly.length > 0) {
    return { images: mly.map((m) => m.thumbUrl), source: 'mapillary' };
  }
  return null;
}

/** Hızlı var/yok kontrolü — validation için. */
export async function hasStreetCoverage(lat: number, lng: number): Promise<boolean> {
  return mapillaryHasCoverage(lat, lng);
}
