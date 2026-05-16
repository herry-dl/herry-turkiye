import { findNearestImageId, mapillaryHasCoverage } from './mapillary';

export type StreetScene = {
  imageId: string;
  source: 'mapillary';
};

/** En yakın Mapillary panoramasını bul (Mapillary JS viewer için image ID). */
export async function fetchStreetScene(lat: number, lng: number): Promise<StreetScene | null> {
  const imageId = await findNearestImageId(lat, lng);
  if (imageId) {
    return { imageId, source: 'mapillary' };
  }
  return null;
}

/** Hızlı var/yok kontrolü — oyun başlamadan konum doğrulama. */
export async function hasStreetCoverage(lat: number, lng: number): Promise<boolean> {
  return mapillaryHasCoverage(lat, lng);
}
