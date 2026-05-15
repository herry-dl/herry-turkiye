/**
 * KartaView (eski adı OpenStreetCam) — topluluk sokak fotoğrafları.
 * POST /1.0/list/nearby-photos/ ve GET /2.0/photo/ herkese açık; API anahtarı gerekmez.
 * @see https://api.openstreetcam.org/api/doc.html
 */

const NEARBY_URL = 'https://api.openstreetcam.org/1.0/list/nearby-photos/';
const PHOTO_URL = 'https://api.openstreetcam.org/2.0/photo/';
const REQUEST_TIMEOUT_MS = 12_000;

type NearbyResponse = {
  currentPageItems?: { id: string }[];
};

type PhotoResult = {
  result?: {
    data?: {
      imageProcUrl?: string;
      fileurlProc?: string;
    }[];
  };
};

async function fetchWithTimeout(url: string, init: RequestInit): Promise<Response> {
  const ctrl = new AbortController();
  const t = window.setTimeout(() => ctrl.abort(), REQUEST_TIMEOUT_MS);
  try {
    return await fetch(url, { ...init, signal: ctrl.signal });
  } finally {
    clearTimeout(t);
  }
}

export async function fetchKartaViewImageUrl(lat: number, lng: number): Promise<string | null> {
  const radii = [80, 160, 320, 500];

  for (const radius of radii) {
    try {
      const form = new FormData();
      form.append('lat', String(lat));
      form.append('lng', String(lng));
      form.append('radius', String(radius));

      const nearbyRes = await fetchWithTimeout(NEARBY_URL, { method: 'POST', body: form });
      if (!nearbyRes.ok) continue;

      const nearby = (await nearbyRes.json()) as NearbyResponse;
      const first = nearby.currentPageItems?.[0];
      if (!first?.id) continue;

      const photoRes = await fetchWithTimeout(`${PHOTO_URL}?id=${encodeURIComponent(first.id)}`, {
        method: 'GET',
      });
      if (!photoRes.ok) continue;

      const photoJson = (await photoRes.json()) as PhotoResult;
      const row = photoJson.result?.data?.[0];
      const url = row?.imageProcUrl || row?.fileurlProc;
      if (url) return url;
    } catch {
      continue;
    }
  }

  return null;
}
