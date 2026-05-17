/** Google Street View embed (svembed) — API anahtarı gerekmez. */
export function googleStreetViewEmbedUrl(lat: number, lng: number): string {
  const params = new URLSearchParams({
    layer: 'c',
    cbll: `${lat},${lng}`,
    cbp: '12,0,0,0,0',
    output: 'svembed',
    hl: 'tr',
  });
  return `https://maps.google.com/maps?${params.toString()}`;
}
