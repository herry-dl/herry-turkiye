const RADII_METERS = [50, 150, 400, 1000, 2500];

/** Mapillary Graph API — ücretsiz client token gerekir */
export async function fetchNearestMapillaryImageId(
  accessToken: string,
  lat: number,
  lng: number
): Promise<string | null> {
  for (const radius of RADII_METERS) {
    const u = new URL('https://graph.mapillary.com/images');
    u.searchParams.set('access_token', accessToken);
    u.searchParams.set('fields', 'id');
    u.searchParams.set('lat', String(lat));
    u.searchParams.set('lng', String(lng));
    u.searchParams.set('radius', String(radius));
    u.searchParams.set('limit', '1');

    const res = await fetch(u.toString());
    if (!res.ok) continue;
    const json = (await res.json()) as { data?: { id: string }[] };
    const id = json.data?.[0]?.id;
    if (id != null) return String(id);
  }
  return null;
}
