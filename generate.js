import fs from 'fs';

// Türkiye'nin bilinen il ve ilçe merkezlerinden örnek bir liste (Street View garantisi yüksek yerler)
const KNOWN_POINTS = [
  { name: 'İstanbul Beşiktaş', lat: 41.0422, lng: 29.0075 },
  { name: 'İstanbul Kadıköy', lat: 40.9910, lng: 29.0270 },
  { name: 'Ankara Çankaya', lat: 39.9100, lng: 32.8600 },
  { name: 'İzmir Konak', lat: 38.4190, lng: 27.1280 },
  { name: 'Antalya Muratpaşa', lat: 36.8870, lng: 30.7070 },
  { name: 'Bursa Osmangazi', lat: 40.1900, lng: 29.0600 },
  { name: 'Konya Selçuklu', lat: 37.8900, lng: 32.4800 },
  { name: 'Adana Çukurova', lat: 37.0400, lng: 35.3000 },
  { name: 'Eskişehir Tepebaşı', lat: 39.7800, lng: 30.5100 },
  { name: 'Samsun Atakum', lat: 41.3300, lng: 36.2700 },
  { name: 'Trabzon Ortahisar', lat: 41.0000, lng: 39.7200 },
  { name: 'Gaziantep Şahinbey', lat: 37.0500, lng: 37.3700 },
  { name: 'Mersin Yenişehir', lat: 36.8000, lng: 34.5800 },
  { name: 'Kayseri Melikgazi', lat: 38.7200, lng: 35.4800 },
  { name: 'Denizli Pamukkale', lat: 37.7700, lng: 29.0800 },
  { name: 'Muğla Bodrum', lat: 37.0340, lng: 27.4300 },
  { name: 'Aydın Kuşadası', lat: 37.8600, lng: 27.2600 },
  { name: 'Balıkesir Ayvalık', lat: 39.3100, lng: 26.6900 },
  { name: 'Çanakkale Merkez', lat: 40.1500, lng: 26.4100 },
  { name: 'Edirne Merkez', lat: 41.6700, lng: 26.5500 },
  { name: 'Sakarya Adapazarı', lat: 40.7800, lng: 30.4000 },
  { name: 'Kocaeli İzmit', lat: 40.7600, lng: 29.9300 },
  { name: 'Yalova Merkez', lat: 40.6500, lng: 29.2700 },
  { name: 'Düzce Merkez', lat: 40.8400, lng: 31.1500 },
  { name: 'Bolu Merkez', lat: 40.7300, lng: 31.6000 },
  { name: 'Afyonkarahisar Merkez', lat: 38.7500, lng: 30.5300 },
  { name: 'Isparta Merkez', lat: 37.7600, lng: 30.5500 },
  { name: 'Uşak Merkez', lat: 38.6700, lng: 29.4000 },
  { name: 'Manisa Merkez', lat: 38.6100, lng: 27.4200 },
  { name: 'Tekirdağ Çorlu', lat: 41.1500, lng: 27.8000 },
  { name: 'Kırklareli Merkez', lat: 41.7300, lng: 27.2200 },
  { name: 'Hatay İskenderun', lat: 36.5800, lng: 36.1700 },
  { name: 'Kahramanmaraş Dulkadiroğlu', lat: 37.5800, lng: 36.9300 },
  { name: 'Malatya Battalgazi', lat: 38.3500, lng: 38.3100 },
  { name: 'Elazığ Merkez', lat: 38.6700, lng: 39.2200 },
  { name: 'Diyarbakır Sur', lat: 37.9100, lng: 40.2300 },
  { name: 'Şanlıurfa Eyyübiye', lat: 37.1500, lng: 38.7900 },
  { name: 'Mardin Artuklu', lat: 37.3100, lng: 40.7400 },
  { name: 'Batman Merkez', lat: 37.8800, lng: 41.1300 },
  { name: 'Van İpekyolu', lat: 38.5000, lng: 43.3800 },
  { name: 'Erzurum Palandöken', lat: 39.9000, lng: 41.2700 },
  { name: 'Sivas Merkez', lat: 39.7500, lng: 37.0100 },
  { name: 'Tokat Merkez', lat: 40.3100, lng: 36.5500 },
  { name: 'Amasya Merkez', lat: 40.6500, lng: 35.8300 },
  { name: 'Çorum Merkez', lat: 40.5400, lng: 34.9500 },
  { name: 'Kırıkkale Merkez', lat: 39.8400, lng: 33.5100 },
  { name: 'Kırşehir Merkez', lat: 39.1400, lng: 34.1600 },
  { name: 'Nevşehir Ürgüp', lat: 38.6300, lng: 34.9100 },
  { name: 'Niğde Merkez', lat: 37.9600, lng: 34.6700 },
  { name: 'Aksaray Merkez', lat: 38.3700, lng: 34.0200 },
  { name: 'Karaman Merkez', lat: 37.1800, lng: 33.2200 },
  { name: 'Rize Merkez', lat: 41.0200, lng: 40.5200 },
  { name: 'Giresun Merkez', lat: 40.9100, lng: 38.3800 },
  { name: 'Ordu Altınordu', lat: 40.9800, lng: 37.8800 },
  { name: 'Sinop Merkez', lat: 42.0200, lng: 35.1500 },
  { name: 'Kastamonu Merkez', lat: 41.3700, lng: 33.7700 },
  { name: 'Zonguldak Merkez', lat: 41.4500, lng: 31.7900 },
  { name: 'Bartın Merkez', lat: 41.6300, lng: 32.3300 },
  { name: 'Karabük Merkez', lat: 41.2000, lng: 32.6200 },
];

function getRandomOffset(radiusKm) {
  // 1 km yaklaşık 0.009 derecedir
  const radiusDeg = radiusKm * 0.009;
  const r = radiusDeg * Math.sqrt(Math.random());
  const theta = Math.random() * 2 * Math.PI;
  return {
    latOffset: r * Math.cos(theta),
    lngOffset: r * Math.sin(theta)
  };
}

const locations = [];
let idCounter = 1;

// Toplam ~1000 lokasyon üretmek için her bilinen noktadan ~17-18 adet türetelim
const POINTS_PER_CITY = 18;

KNOWN_POINTS.forEach(point => {
  for (let i = 0; i < POINTS_PER_CITY; i++) {
    // İlk nokta tam merkez olsun (Street View garantisi en yüksek)
    const radius = i === 0 ? 0 : 0.05; // 5km civarında dağıt
    const offset = getRandomOffset(radius);
    
    // Zorluk ataması: Merkeze yakınlar 1-2, uzaklar 3
    let difficulty = 2;
    if (i < 5) difficulty = 1;
    else if (i > 12) difficulty = 3;

    locations.push({
      id: `gen-v2-${idCounter++}`,
      name: `${point.name} Çevresi`,
      lat: point.lat + offset.latOffset,
      lng: point.lng + offset.lngOffset,
      difficulty: difficulty
    });
  }
});

// Fisher-Yates Shuffle
for (let i = locations.length - 1; i > 0; i--) {
  const j = Math.floor(Math.random() * (i + 1));
  [locations[i], locations[j]] = [locations[j], locations[i]];
}

const fileContent = `export const generatedLocations = ${JSON.stringify(locations, null, 2)};
`;

fs.writeFileSync('src/generatedLocations.ts', fileContent);
console.log(`${locations.length} stable locations generated in src/generatedLocations.ts`);
