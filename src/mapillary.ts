const RADII_METERS = [50, 150, 400, 1000, 2500];
const REQUEST_TIMEOUT_MS = 12_000;

async function fetchJsonWithTimeout(url: string): Promise<unknown> {
  const ctrl = new AbortController();
  const t = window.setTimeout(() => ctrl.abort(), REQUEST_TIMEOUT_MS);
  try {
    const res = await fetch(url, { signal: ctrl.signal });
    if (!res.ok) throw new Error(String(res.status));
    return await res.json();
  } finally {
    clearTimeout(t);
  }
}

/** Mapillary Graph API — ücretsiz client token gerekir */
export async function fetchNearestMapillaryImageId(
  accessToken: string,
  lat: number,
  lng: number
): Promise<string | null> {
  for (const radius of RADII_METERS) {
    try {
      const u = new URL('https://graph.mapillary.com/images');
      u.searchParams.set('access_token', accessToken);
      u.searchParams.set('fields', 'id');
      u.searchParams.set('lat', String(lat));
      u.searchParams.set('lng', String(lng));
      u.searchParams.set('radius', String(radius));
      u.searchParams.set('limit', '1');

      const json = (await fetchJsonWithTimeout(u.toString())) as { data?: { id: string }[] };
      const id = json.data?.[0]?.id;
      if (id != null) return String(id);
    } catch {
      continue;
    }
  }
  return null;
}
