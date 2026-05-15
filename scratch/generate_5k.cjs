const fs = require('fs');

// ONLY cities/districts with known good Google Street View coverage in Turkey
// Removed: Bayburt, Ardahan, Igdir, Hakkari, Sirnak, Bitlis, Tunceli, Mus, Bingol, 
//          Van, Agri, Kars, most of eastern Anatolia rural areas
const cities = [
  // İstanbul - excellent coverage
  { name: "İstanbul Beşiktaş", lat: 41.0422, lng: 29.0067, diff: 1 },
  { name: "İstanbul Kadıköy", lat: 40.9906, lng: 29.0267, diff: 1 },
  { name: "İstanbul Fatih", lat: 41.0186, lng: 28.9397, diff: 1 },
  { name: "İstanbul Üsküdar", lat: 41.0231, lng: 29.0151, diff: 1 },
  { name: "İstanbul Şişli", lat: 41.0602, lng: 28.9872, diff: 1 },
  { name: "İstanbul Bakırköy", lat: 40.9784, lng: 28.8697, diff: 1 },
  { name: "İstanbul Beyoğlu", lat: 41.0369, lng: 28.9770, diff: 1 },
  { name: "İstanbul Maltepe", lat: 40.9342, lng: 29.1303, diff: 2 },
  { name: "İstanbul Ümraniye", lat: 41.0161, lng: 29.1183, diff: 2 },
  { name: "İstanbul Pendik", lat: 40.8765, lng: 29.2344, diff: 2 },
  { name: "İstanbul Bağcılar", lat: 41.0353, lng: 28.8550, diff: 2 },
  { name: "İstanbul Esenler", lat: 41.0444, lng: 28.8811, diff: 2 },
  { name: "İstanbul Avcılar", lat: 40.9797, lng: 28.7217, diff: 2 },
  { name: "İstanbul Sarıyer", lat: 41.1672, lng: 29.0561, diff: 3 },
  // Ankara - good coverage
  { name: "Ankara Çankaya", lat: 39.9179, lng: 32.8629, diff: 1 },
  { name: "Ankara Kızılay", lat: 39.9212, lng: 32.8540, diff: 1 },
  { name: "Ankara Ulus", lat: 39.9438, lng: 32.8562, diff: 2 },
  { name: "Ankara Keçiören", lat: 39.9739, lng: 32.8683, diff: 2 },
  { name: "Ankara Mamak", lat: 39.9169, lng: 32.9367, diff: 2 },
  { name: "Ankara Etimesgut", lat: 39.9519, lng: 32.6803, diff: 2 },
  // İzmir - good coverage
  { name: "İzmir Konak", lat: 38.4189, lng: 27.1287, diff: 1 },
  { name: "İzmir Bornova", lat: 38.4619, lng: 27.2147, diff: 1 },
  { name: "İzmir Karşıyaka", lat: 38.4575, lng: 27.1086, diff: 1 },
  { name: "İzmir Buca", lat: 38.3833, lng: 27.1833, diff: 2 },
  { name: "İzmir Bayraklı", lat: 38.4733, lng: 27.1658, diff: 2 },
  // Antalya - excellent coverage (tourism)
  { name: "Antalya Muratpaşa", lat: 36.8841, lng: 30.7056, diff: 1 },
  { name: "Antalya Konyaaltı", lat: 36.8746, lng: 30.6374, diff: 1 },
  { name: "Antalya Alanya", lat: 36.5433, lng: 31.9997, diff: 2 },
  { name: "Antalya Side", lat: 36.7686, lng: 31.3886, diff: 2 },
  { name: "Antalya Manavgat", lat: 36.7836, lng: 31.4367, diff: 2 },
  { name: "Antalya Kepez", lat: 36.9342, lng: 30.7314, diff: 2 },
  { name: "Antalya Kaş", lat: 36.2009, lng: 29.6377, diff: 3 },
  // Bursa - good coverage
  { name: "Bursa Osmangazi", lat: 40.1826, lng: 29.0501, diff: 1 },
  { name: "Bursa Nilüfer", lat: 40.2053, lng: 28.9647, diff: 1 },
  { name: "Bursa Yıldırım", lat: 40.1869, lng: 29.0969, diff: 2 },
  // Konya - good coverage
  { name: "Konya Selçuklu", lat: 37.8833, lng: 32.4667, diff: 2 },
  { name: "Konya Meram", lat: 37.8556, lng: 32.4556, diff: 2 },
  { name: "Konya Karatay", lat: 37.8722, lng: 32.5038, diff: 2 },
  // Adana - good coverage
  { name: "Adana Seyhan", lat: 37.0000, lng: 35.3213, diff: 2 },
  { name: "Adana Çukurova", lat: 37.0400, lng: 35.3000, diff: 2 },
  // Muğla - excellent (tourism)
  { name: "Muğla Bodrum", lat: 37.0342, lng: 27.4300, diff: 1 },
  { name: "Muğla Fethiye", lat: 36.6547, lng: 29.1242, diff: 2 },
  { name: "Muğla Marmaris", lat: 36.8558, lng: 28.2722, diff: 2 },
  { name: "Muğla Milas", lat: 37.3175, lng: 27.7842, diff: 3 },
  // Aydın - good coverage
  { name: "Aydın Kuşadası", lat: 37.8600, lng: 27.2599, diff: 2 },
  { name: "Aydın Merkez", lat: 37.8444, lng: 27.8458, diff: 2 },
  { name: "Aydın Didim", lat: 37.3819, lng: 27.2658, diff: 2 },
  // Manisa - good
  { name: "Manisa Merkez", lat: 38.6191, lng: 27.4289, diff: 2 },
  { name: "Manisa Akhisar", lat: 38.9203, lng: 27.8394, diff: 3 },
  // Gaziantep - good
  { name: "Gaziantep Şahinbey", lat: 37.0662, lng: 37.3833, diff: 2 },
  { name: "Gaziantep Şehitkamil", lat: 37.0500, lng: 37.3200, diff: 2 },
  // Denizli - good
  { name: "Denizli Pamukkale", lat: 37.7600, lng: 29.0900, diff: 2 },
  { name: "Denizli Merkez", lat: 37.7765, lng: 29.0864, diff: 2 },
  // Mersin - good
  { name: "Mersin Yenişehir", lat: 36.8000, lng: 34.5833, diff: 2 },
  { name: "Mersin Toroslar", lat: 36.7833, lng: 34.5333, diff: 3 },
  // Eskişehir - good
  { name: "Eskişehir Tepebaşı", lat: 39.7767, lng: 30.5206, diff: 2 },
  { name: "Eskişehir Odunpazarı", lat: 39.7692, lng: 30.5372, diff: 2 },
  // Kayseri - good
  { name: "Kayseri Melikgazi", lat: 38.7205, lng: 35.4826, diff: 2 },
  { name: "Kayseri Kocasinan", lat: 38.7333, lng: 35.5167, diff: 3 },
  // Samsun - good
  { name: "Samsun Atakum", lat: 41.3300, lng: 36.2700, diff: 2 },
  { name: "Samsun İlkadım", lat: 41.2867, lng: 36.3300, diff: 2 },
  // Trabzon - good
  { name: "Trabzon Ortahisar", lat: 41.0027, lng: 39.7168, diff: 2 },
  { name: "Trabzon Akçaabat", lat: 41.0183, lng: 39.5633, diff: 3 },
  // Edirne - good
  { name: "Edirne Merkez", lat: 41.6772, lng: 26.5557, diff: 2 },
  // Tekirdağ - good
  { name: "Tekirdağ Merkez", lat: 40.9781, lng: 27.5117, diff: 2 },
  { name: "Tekirdağ Çorlu", lat: 41.1500, lng: 27.8000, diff: 2 },
  // Kocaeli - good
  { name: "Kocaeli İzmit", lat: 40.7654, lng: 29.9408, diff: 2 },
  { name: "Kocaeli Gebze", lat: 40.8017, lng: 29.4306, diff: 2 },
  // Sakarya - good
  { name: "Sakarya Adapazarı", lat: 40.7731, lng: 30.3948, diff: 2 },
  // Balıkesir - good
  { name: "Balıkesir Merkez", lat: 39.6484, lng: 27.8826, diff: 3 },
  { name: "Balıkesir Ayvalık", lat: 39.3100, lng: 26.6900, diff: 2 },
  { name: "Balıkesir Bandırma", lat: 40.3508, lng: 27.9767, diff: 3 },
  // Çanakkale - good
  { name: "Çanakkale Merkez", lat: 40.1553, lng: 26.4142, diff: 2 },
  // Isparta - good
  { name: "Isparta Merkez", lat: 37.7648, lng: 30.5566, diff: 3 },
  // Nevşehir - good (tourism)
  { name: "Nevşehir Göreme", lat: 38.6436, lng: 34.8291, diff: 2 },
  { name: "Nevşehir Merkez", lat: 38.6247, lng: 34.7144, diff: 3 },
  // Kütahya - fair
  { name: "Kütahya Merkez", lat: 39.4167, lng: 29.9833, diff: 3 },
  // Bolu - good
  { name: "Bolu Merkez", lat: 40.7350, lng: 31.6078, diff: 3 },
  // Düzce - good
  { name: "Düzce Merkez", lat: 40.8438, lng: 31.1565, diff: 3 },
  // Yalova - good
  { name: "Yalova Merkez", lat: 40.6551, lng: 29.2769, diff: 2 },
  // Karabük - fair
  { name: "Karabük Merkez", lat: 41.2000, lng: 32.6333, diff: 3 },
  // Bartın - fair
  { name: "Bartın Merkez", lat: 41.6358, lng: 32.3375, diff: 3 },
  // Malatya - fair
  { name: "Malatya Battalgazi", lat: 38.3552, lng: 38.3095, diff: 2 },
  // Hatay - good
  { name: "Hatay Antakya", lat: 36.2023, lng: 36.1613, diff: 2 },
  { name: "Hatay İskenderun", lat: 36.5800, lng: 36.1700, diff: 2 },
  // Adıyaman - fair
  { name: "Adıyaman Merkez", lat: 37.7644, lng: 38.2763, diff: 3 },
  // Şanlıurfa - fair
  { name: "Şanlıurfa Merkez", lat: 37.1591, lng: 38.7969, diff: 3 },
  // Kahramanmaraş - fair
  { name: "Kahramanmaraş Merkez", lat: 37.5858, lng: 36.9371, diff: 3 },
  // Diyarbakır - fair
  { name: "Diyarbakır Merkez", lat: 37.9144, lng: 40.2306, diff: 3 },
  // Mardin - fair coverage in center
  { name: "Mardin Merkez", lat: 37.3129, lng: 40.7339, diff: 3 },
  // Sivas - fair
  { name: "Sivas Merkez", lat: 39.7477, lng: 37.0179, diff: 3 },
  // Tokat - fair
  { name: "Tokat Merkez", lat: 40.3167, lng: 36.5500, diff: 3 },
  // Giresun - fair
  { name: "Giresun Merkez", lat: 40.9128, lng: 38.3895, diff: 3 },
  // Rize - fair
  { name: "Rize Merkez", lat: 41.0201, lng: 40.5235, diff: 3 },
  // Ordu - fair
  { name: "Ordu Altınordu", lat: 40.9839, lng: 37.8764, diff: 3 },
  // Bilecik - fair
  { name: "Bilecik Merkez", lat: 40.1419, lng: 29.9793, diff: 3 },
  // Uşak - fair
  { name: "Uşak Merkez", lat: 38.6742, lng: 29.4058, diff: 3 },
  // Afyonkarahisar - fair
  { name: "Afyonkarahisar Merkez", lat: 38.7507, lng: 30.5334, diff: 3 },
  // Osmaniye
  { name: "Osmaniye Merkez", lat: 37.0742, lng: 36.2472, diff: 3 },
  // Kastamonu
  { name: "Kastamonu Merkez", lat: 41.3766, lng: 33.7765, diff: 3 },
  // Aksaray
  { name: "Aksaray Merkez", lat: 38.3687, lng: 34.0370, diff: 3 },
  // Niğde
  { name: "Niğde Merkez", lat: 37.9667, lng: 34.6833, diff: 3 },
];

const locations = [];
const countPerCity = Math.ceil(5000 / cities.length);

cities.forEach(city => {
  for (let i = 0; i < countPerCity; i++) {
    // Offset reduced to ±0.0015 deg ≈ ±165m (Total ~330m range)
    // This is a very tight radius around verified city center roads to avoid indoor panoramas
    const latOffset = (Math.random() - 0.5) * 0.003;
    const lngOffset = (Math.random() - 0.5) * 0.003;
    
    const finalLat = city.lat + latOffset;
    const finalLng = city.lng + lngOffset;

    locations.push({
      id: `gen-v9-${city.name.replace(/\s+/g,'-')}-${i}`,
      name: `${city.name} Merkezi`,
      lat: parseFloat(finalLat.toFixed(6)),
      lng: parseFloat(finalLng.toFixed(6)),
      difficulty: city.diff
    });
  }
});

const finalLocations = locations.slice(0, 5000);
const content = `export const generatedLocations = ${JSON.stringify(finalLocations, null, 2)};`;
fs.writeFileSync('src/generatedLocations.ts', content);
console.log(`Generated ${finalLocations.length} locations from ${cities.length} verified cities.`);
