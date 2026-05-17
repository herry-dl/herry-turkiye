/**
 * Türkiye — ~1000 konum (il merkezleri + ilçeler + çevre).
 * Google Street View kapsaması iyi olan bölgelere odaklanır.
 * Çalıştır: node scripts/generate-1000.cjs
 */
const fs = require('fs');
const path = require('path');

/** @type {{ name: string; lat: number; lng: number; diff: 1|2|3 }[]} */
const anchors = [
  // İstanbul ilçeleri
  { name: 'İstanbul Fatih', lat: 41.0186, lng: 28.9397, diff: 1 },
  { name: 'İstanbul Beyoğlu', lat: 41.0369, lng: 28.977, diff: 1 },
  { name: 'İstanbul Kadıköy', lat: 40.9906, lng: 29.0267, diff: 1 },
  { name: 'İstanbul Beşiktaş', lat: 41.0422, lng: 29.0067, diff: 1 },
  { name: 'İstanbul Üsküdar', lat: 41.0231, lng: 29.0151, diff: 1 },
  { name: 'İstanbul Bakırköy', lat: 40.9784, lng: 28.8697, diff: 1 },
  { name: 'İstanbul Şişli', lat: 41.0602, lng: 28.9872, diff: 1 },
  { name: 'İstanbul Maltepe', lat: 40.9342, lng: 29.1303, diff: 2 },
  { name: 'İstanbul Kartal', lat: 40.906, lng: 29.183, diff: 2 },
  { name: 'İstanbul Pendik', lat: 40.8765, lng: 29.2344, diff: 2 },
  { name: 'İstanbul Ümraniye', lat: 41.0161, lng: 29.1183, diff: 2 },
  { name: 'İstanbul Bağcılar', lat: 41.0353, lng: 28.855, diff: 2 },
  { name: 'İstanbul Esenyurt', lat: 41.027, lng: 28.674, diff: 2 },
  { name: 'İstanbul Avcılar', lat: 40.9797, lng: 28.7217, diff: 2 },
  { name: 'İstanbul Sarıyer', lat: 41.1672, lng: 29.0561, diff: 2 },
  { name: 'İstanbul Beylikdüzü', lat: 41.002, lng: 28.642, diff: 2 },
  { name: 'İstanbul Tuzla', lat: 40.823, lng: 29.3, diff: 3 },
  { name: 'İstanbul Silivri', lat: 41.073, lng: 28.246, diff: 3 },
  { name: 'İstanbul Çatalca', lat: 41.143, lng: 28.461, diff: 3 },
  { name: 'İstanbul Şile', lat: 41.175, lng: 29.613, diff: 3 },
  // Ankara
  { name: 'Ankara Çankaya', lat: 39.9179, lng: 32.8629, diff: 1 },
  { name: 'Ankara Kızılay', lat: 39.9212, lng: 32.854, diff: 1 },
  { name: 'Ankara Keçiören', lat: 39.9739, lng: 32.8683, diff: 2 },
  { name: 'Ankara Mamak', lat: 39.9169, lng: 32.9367, diff: 2 },
  { name: 'Ankara Etimesgut', lat: 39.9519, lng: 32.6803, diff: 2 },
  { name: 'Ankara Yenimahalle', lat: 39.965, lng: 32.754, diff: 2 },
  { name: 'Ankara Sincan', lat: 39.97, lng: 32.58, diff: 3 },
  { name: 'Ankara Polatlı', lat: 39.584, lng: 32.147, diff: 3 },
  { name: 'Ankara Beypazarı', lat: 40.167, lng: 31.921, diff: 3 },
  // İzmir
  { name: 'İzmir Konak', lat: 38.4189, lng: 27.1287, diff: 1 },
  { name: 'İzmir Karşıyaka', lat: 38.4575, lng: 27.1086, diff: 1 },
  { name: 'İzmir Bornova', lat: 38.4619, lng: 27.2147, diff: 1 },
  { name: 'İzmir Buca', lat: 38.3833, lng: 27.1833, diff: 2 },
  { name: 'İzmir Bayraklı', lat: 38.4733, lng: 27.1658, diff: 2 },
  { name: 'İzmir Çiğli', lat: 38.494, lng: 27.063, diff: 2 },
  { name: 'İzmir Torbalı', lat: 38.152, lng: 27.357, diff: 3 },
  { name: 'İzmir Selçuk', lat: 37.949, lng: 27.364, diff: 3 },
  { name: 'İzmir Çeşme', lat: 38.323, lng: 26.305, diff: 2 },
  // Antalya
  { name: 'Antalya Muratpaşa', lat: 36.8841, lng: 30.7056, diff: 1 },
  { name: 'Antalya Konyaaltı', lat: 36.8746, lng: 30.6374, diff: 1 },
  { name: 'Antalya Alanya', lat: 36.5433, lng: 31.9997, diff: 2 },
  { name: 'Antalya Manavgat', lat: 36.7836, lng: 31.4367, diff: 2 },
  { name: 'Antalya Serik', lat: 36.917, lng: 31.099, diff: 3 },
  { name: 'Antalya Kaş', lat: 36.2009, lng: 29.6377, diff: 3 },
  { name: 'Antalya Kemer', lat: 36.6, lng: 30.56, diff: 2 },
  // Bursa
  { name: 'Bursa Osmangazi', lat: 40.1826, lng: 29.0501, diff: 1 },
  { name: 'Bursa Nilüfer', lat: 40.2053, lng: 28.9647, diff: 2 },
  { name: 'Bursa İnegöl', lat: 40.078, lng: 29.513, diff: 3 },
  { name: 'Bursa Gemlik', lat: 40.431, lng: 29.157, diff: 3 },
  // Kocaeli / Sakarya
  { name: 'Kocaeli İzmit', lat: 40.7654, lng: 29.9408, diff: 2 },
  { name: 'Kocaeli Gebze', lat: 40.8017, lng: 29.4306, diff: 2 },
  { name: 'Kocaeli Gölcük', lat: 40.716, lng: 29.819, diff: 3 },
  { name: 'Sakarya Adapazarı', lat: 40.7731, lng: 30.3948, diff: 2 },
  { name: 'Sakarya Serdivan', lat: 40.773, lng: 30.348, diff: 3 },
  // Ege / Akdeniz kıyı
  { name: 'Muğla Bodrum', lat: 37.0342, lng: 27.43, diff: 1 },
  { name: 'Muğla Fethiye', lat: 36.6547, lng: 29.1242, diff: 2 },
  { name: 'Muğla Marmaris', lat: 36.8558, lng: 28.2722, diff: 2 },
  { name: 'Muğla Milas', lat: 37.3175, lng: 27.7842, diff: 3 },
  { name: 'Aydın Kuşadası', lat: 37.86, lng: 27.2599, diff: 2 },
  { name: 'Aydın Nazilli', lat: 37.916, lng: 28.321, diff: 3 },
  { name: 'Denizli Pamukkale', lat: 37.76, lng: 29.09, diff: 2 },
  { name: 'Denizli Merkez', lat: 37.7765, lng: 29.0864, diff: 2 },
  { name: 'Manisa Merkez', lat: 38.6191, lng: 27.4289, diff: 2 },
  { name: 'Manisa Salihli', lat: 38.482, lng: 28.132, diff: 3 },
  { name: 'Balıkesir Ayvalık', lat: 39.31, lng: 26.69, diff: 2 },
  { name: 'Balıkesir Bandırma', lat: 40.3508, lng: 27.9767, diff: 3 },
  { name: 'Çanakkale Merkez', lat: 40.1553, lng: 26.4142, diff: 2 },
  { name: 'Çanakkale Gelibolu', lat: 40.41, lng: 26.67, diff: 3 },
  // İç Anadolu
  { name: 'Konya Selçuklu', lat: 37.8833, lng: 32.4667, diff: 2 },
  { name: 'Konya Meram', lat: 37.8556, lng: 32.4556, diff: 2 },
  { name: 'Kayseri Melikgazi', lat: 38.7205, lng: 35.4826, diff: 2 },
  { name: 'Kayseri Talas', lat: 38.69, lng: 35.553, diff: 3 },
  { name: 'Eskişehir Tepebaşı', lat: 39.7767, lng: 30.5206, diff: 2 },
  { name: 'Eskişehir Odunpazarı', lat: 39.7692, lng: 30.5372, diff: 2 },
  { name: 'Sivas Merkez', lat: 39.7477, lng: 37.0179, diff: 3 },
  { name: 'Nevşehir Göreme', lat: 38.6436, lng: 34.8291, diff: 2 },
  { name: 'Nevşehir Merkez', lat: 38.6247, lng: 34.7144, diff: 3 },
  { name: 'Aksaray Merkez', lat: 38.3687, lng: 34.037, diff: 3 },
  { name: 'Kırşehir Merkez', lat: 39.142, lng: 34.17, diff: 3 },
  // Karadeniz
  { name: 'Samsun Atakum', lat: 41.33, lng: 36.27, diff: 2 },
  { name: 'Samsun Bafra', lat: 41.568, lng: 35.906, diff: 3 },
  { name: 'Trabzon Ortahisar', lat: 41.0027, lng: 39.7168, diff: 2 },
  { name: 'Trabzon Akçaabat', lat: 41.0183, lng: 39.5633, diff: 3 },
  { name: 'Ordu Altınordu', lat: 40.9839, lng: 37.8764, diff: 3 },
  { name: 'Giresun Merkez', lat: 40.9128, lng: 38.3895, diff: 3 },
  { name: 'Rize Merkez', lat: 41.0201, lng: 40.5235, diff: 3 },
  { name: 'Zonguldak Merkez', lat: 41.45, lng: 31.79, diff: 3 },
  { name: 'Bartın Merkez', lat: 41.6358, lng: 32.3375, diff: 3 },
  // Güneydoğu / Doğu (merkezler)
  { name: 'Gaziantep Şahinbey', lat: 37.0662, lng: 37.3833, diff: 2 },
  { name: 'Adana Seyhan', lat: 37.0, lng: 35.3213, diff: 2 },
  { name: 'Adana Ceyhan', lat: 37.024, lng: 35.817, diff: 3 },
  { name: 'Mersin Yenişehir', lat: 36.8, lng: 34.5833, diff: 2 },
  { name: 'Mersin Tarsus', lat: 36.917, lng: 34.893, diff: 3 },
  { name: 'Hatay Antakya', lat: 36.2023, lng: 36.1613, diff: 2 },
  { name: 'Hatay İskenderun', lat: 36.58, lng: 36.17, diff: 2 },
  { name: 'Kahramanmaraş Merkez', lat: 37.5858, lng: 36.9371, diff: 3 },
  { name: 'Malatya Battalgazi', lat: 38.3552, lng: 38.3095, diff: 2 },
  { name: 'Elazığ Merkez', lat: 38.674, lng: 39.223, diff: 3 },
  { name: 'Diyarbakır Sur', lat: 37.9144, lng: 40.2306, diff: 3 },
  { name: 'Şanlıurfa Merkez', lat: 37.1591, lng: 38.7969, diff: 3 },
  { name: 'Mardin Artuklu', lat: 37.3129, lng: 40.7339, diff: 3 },
  { name: 'Van İpekyolu', lat: 38.5, lng: 43.38, diff: 3 },
  { name: 'Erzurum Palandöken', lat: 39.9, lng: 41.27, diff: 3 },
  // Marmara batı
  { name: 'Tekirdağ Merkez', lat: 40.9781, lng: 27.5117, diff: 2 },
  { name: 'Tekirdağ Çorlu', lat: 41.15, lng: 27.8, diff: 2 },
  { name: 'Edirne Merkez', lat: 41.6772, lng: 26.5557, diff: 2 },
  { name: 'Kırklareli Merkez', lat: 41.733, lng: 27.225, diff: 3 },
  { name: 'Yalova Merkez', lat: 40.6551, lng: 29.2769, diff: 2 },
  { name: 'Bolu Merkez', lat: 40.735, lng: 31.6078, diff: 3 },
  { name: 'Düzce Merkez', lat: 40.8438, lng: 31.1565, diff: 3 },
  { name: 'Isparta Merkez', lat: 37.7648, lng: 30.5566, diff: 3 },
  { name: 'Afyonkarahisar Merkez', lat: 38.7507, lng: 30.5334, diff: 3 },
  { name: 'Uşak Merkez', lat: 38.6742, lng: 29.4058, diff: 3 },
  { name: 'Kütahya Merkez', lat: 39.4167, lng: 29.9833, diff: 3 },
  { name: 'Bilecik Merkez', lat: 40.1419, lng: 29.9793, diff: 3 },
  { name: 'Tokat Merkez', lat: 40.3167, lng: 36.55, diff: 3 },
  { name: 'Çorum Merkez', lat: 40.54, lng: 34.95, diff: 3 },
  { name: 'Amasya Merkez', lat: 40.65, lng: 35.83, diff: 3 },
  { name: 'Kastamonu Merkez', lat: 41.3766, lng: 33.7765, diff: 3 },
  { name: 'Sinop Merkez', lat: 42.02, lng: 35.15, diff: 3 },
  { name: 'Karabük Merkez', lat: 41.2, lng: 32.6333, diff: 3 },
];

const TARGET = 1000;
const VARIANTS = ['Merkez', 'Kuzey', 'Güney', 'Doğu', 'Batı', 'Çevre', 'Sanayi', 'Sahil', 'Çıkış', 'Yolu'];

function randomOffsetKm(km) {
  const r = km * 0.009 * Math.sqrt(Math.random());
  const t = Math.random() * 2 * Math.PI;
  return { dLat: r * Math.cos(t), dLng: r * Math.sin(t) };
}

const perAnchor = Math.ceil(TARGET / anchors.length);
const locations = [];
let n = 0;

for (const anchor of anchors) {
  for (let i = 0; i < perAnchor && locations.length < TARGET; i++) {
    const km = i === 0 ? 0 : 0.3 + Math.random() * 4.5;
    const { dLat, dLng } = randomOffsetKm(km);
    let difficulty = anchor.diff;
    if (km > 2.5 && difficulty < 3) difficulty = 3;
    else if (km > 1.2 && difficulty < 2) difficulty = 2;

    const variant = VARIANTS[i % VARIANTS.length];
    const slug = anchor.name.replace(/\s+/g, '-').replace(/[^a-zA-Z0-9ğüşıöçĞÜŞİÖÇ-]/g, '');

    locations.push({
      id: `tr-${slug}-${i}`,
      name: `${anchor.name} — ${variant}`,
      lat: parseFloat((anchor.lat + dLat).toFixed(6)),
      lng: parseFloat((anchor.lng + dLng).toFixed(6)),
      difficulty,
    });
    n++;
  }
}

// Karıştır
for (let i = locations.length - 1; i > 0; i--) {
  const j = Math.floor(Math.random() * (i + 1));
  [locations[i], locations[j]] = [locations[j], locations[i]];
}

const out = path.join(__dirname, '../src/generatedLocations.ts');
fs.writeFileSync(
  out,
  `/** Otomatik üretildi — node scripts/generate-1000.cjs */\nexport const generatedLocations = ${JSON.stringify(locations, null, 2)};\n`
);
console.log(`Wrote ${locations.length} locations → ${out}`);
