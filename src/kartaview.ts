/**
 * KartaView (OpenStreetCam) — ücretsiz topluluk sokak fotoğrafları.
 * @see https://api.openstreetcam.org/api/doc.html
 */

const NEARBY_URL = 'https://api.openstreetcam.org/1.0/list/nearby-photos/';
const NEARBY_TIMEOUT_MS = 8_000;

export type NearbyItem = {
  id: string;
  name?: string;
  sequence_id?: string;
  sequence_index?: string;
};

type NearbyResponse = {
  currentPageItems?: NearbyItem[];
};

async function fetchNearbyItems(lat: number, lng: number, radius: number): Promise<NearbyItem[]> {
  const ctrl = new AbortController();
  const t = window.setTimeout(() => ctrl.abort(), NEARBY_TIMEOUT_MS);
  try {
    const form = new FormData();
    form.append('lat', String(lat));
    form.append('lng', String(lng));
    form.append('radius', String(radius));

    const res = await fetch(NEARBY_URL, { method: 'POST', body: form, signal: ctrl.signal });
    if (!res.ok) return [];

    const nearby = (await res.json()) as NearbyResponse;
    return nearby.currentPageItems ?? [];
  } catch {
    return [];
  } finally {
    clearTimeout(t);
  }
}

/** storage11/files/photo/... → cdn.kartaview.org (CORS uyumlu) */
export function cdnUrlFromStorageName(name: string): string | null {
  const m = name.match(/^storage(\d+)\/files\/photo\/(.+)$/);
  if (!m) return null;
  const origin = `https://storage${m[1]}.openstreetcam.org/files/photo/${m[2]}`;
  if (typeof btoa !== 'function') return null;
  return `https://cdn.kartaview.org/pr:sharp/${btoa(origin)}`;
}

/** Aynı sokak dizisindeki fotoğraflar — ileri/geri dolaşmak için */
export async function fetchKartaViewSequence(lat: number, lng: number): Promise<string[]> {
  const radii = [120, 320, 500, 800];

  for (const radius of radii) {
    const items = await fetchNearbyItems(lat, lng, radius);
    if (!items.length) continue;

    const bySeq = new Map<string, NearbyItem[]>();
    for (const item of items) {
      if (!item.name) continue;
      const key = item.sequence_id ?? item.id;
      const list = bySeq.get(key) ?? [];
      list.push(item);
      bySeq.set(key, list);
    }

    let best: NearbyItem[] = [];
    for (const list of bySeq.values()) {
      if (list.length > best.length) best = list;
    }

    best.sort((a, b) => Number(a.sequence_index ?? 0) - Number(b.sequence_index ?? 0));

    const urls = best.map((i) => (i.name ? cdnUrlFromStorageName(i.name) : null)).filter((u): u is string => !!u);

    if (urls.length) return urls;
  }

  return [];
}

export async function fetchKartaViewImageUrl(lat: number, lng: number): Promise<string | null> {
  const seq = await fetchKartaViewSequence(lat, lng);
  return seq[0] ?? null;
}
