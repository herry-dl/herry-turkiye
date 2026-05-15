# Türkiye Kâşifi (HERRY)

Sokak görüntüsünden konumu tahmin et; skor mesafeye göre hesaplanır.

**Canlı oyun:** [herry-dl.github.io/herry-turkiye](https://herry-dl.github.io/herry-turkiye/)

## Yerel çalıştırma

```bash
npm ci
npm run dev
```

İsteğe bağlı: proje kökünde `.env` oluşturup `VITE_MAPILLARY_ACCESS_TOKEN` ekleyebilirsin ([Mapillary Developers](https://www.mapillary.com/dashboard/developers)). Yoksa sırayla KartaView ve Google iframe kullanılır.

## Yayın (GitHub Pages)

`main` dalına push sonrası [Deploy to GitHub Pages](.github/workflows/deploy-pages.yml) çalışır; site `gh-pages` dalına yazılır. Repo ayarında **Pages → Deploy from branch → gh-pages / (root)** olmalıdır.

İstersen aynı workflow’u Actions sekmesinden **Run workflow** ile elle de tetikleyebilirsin.

## Yığın

React, Vite, Leaflet (OpenStreetMap), KartaView API, isteğe bağlı MapillaryJS, PWA.
