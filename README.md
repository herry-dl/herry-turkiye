# Türkiye Kâşifi (HERRY)

GeoGuessr benzeri Türkiye konum tahmin oyunu — Mapillary sokak panoramaları + Leaflet harita.

**Canlı oyun:** [herry-dl.github.io/herry-turkiye](https://herry-dl.github.io/herry-turkiye/)

## Nasıl oynanır

1. Sokak panoramasında etrafa bak (sürükle, ok tuşlarıyla ilerle)
2. **Haritayı aç** → Türkiye haritasında pin koy
3. **Tahmin et** → mesafe ve skor

## Yerel çalıştırma

```bash
npm ci
npm run dev
```

Sokak görüntüsü: **Mapillary JS** (360° viewer). Token `.env` içinde `VITE_MAPILLARY_ACCESS_TOKEN` ile override edilebilir; yoksa projede gömülü client token kullanılır.

## Mimari

| Katman | Dosya | Görev |
|--------|-------|--------|
| Oyun akışı | `App.tsx` | Tur, skor, timer, harita modal |
| Sokak | `MapillaryViewer.tsx` | Resmi Mapillary JS viewer (`cover: false`) |
| Konum API | `mapillary.ts` | Graph API — image ID arama |
| Tahmin haritası | `GameMap.tsx` | Leaflet + OSM |

## Yayın (GitHub Pages)

`main` dalına push → [Deploy to GitHub Pages](.github/workflows/deploy-pages.yml). Repo ayarında **Pages → gh-pages / (root)**.

## Yığın

React, Vite, Mapillary JS, Leaflet, OpenStreetMap
