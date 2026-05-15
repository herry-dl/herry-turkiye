const fs = require('fs');

const cities = [
  { name: "İstanbul Beşiktaş", lat: 41.0422, lng: 29.0067 },
  { name: "İstanbul Kadıköy", lat: 40.9906, lng: 29.0267 },
  { name: "İstanbul Fatih", lat: 41.0186, lng: 28.9397 },
  { name: "İstanbul Üsküdar", lat: 41.0231, lng: 29.0151 },
  { name: "İstanbul Şişli", lat: 41.0602, lng: 28.9872 },
  { name: "İstanbul Bakırköy", lat: 40.9784, lng: 28.8697 },
  { name: "İstanbul Beyoğlu", lat: 41.0369, lng: 28.9770 },
  { name: "İstanbul Maltepe", lat: 40.9342, lng: 29.1303 },
  { name: "İstanbul Kartal", lat: 40.8891, lng: 29.1867 },
  { name: "İstanbul Pendik", lat: 40.8765, lng: 29.2344 },
  { name: "Ankara Çankaya", lat: 39.9179, lng: 32.8629 },
  { name: "Ankara Kızılay", lat: 39.9212, lng: 32.8540 },
  { name: "Ankara Ulus", lat: 39.9438, lng: 32.8562 },
  { name: "Ankara Keçiören", lat: 39.9739, lng: 32.8683 },
  { name: "Ankara Mamak", lat: 39.9169, lng: 32.9367 },
  { name: "İzmir Konak", lat: 38.4189, lng: 27.1287 },
  { name: "İzmir Bornova", lat: 38.4619, lng: 27.2147 },
  { name: "İzmir Buca", lat: 38.3833, lng: 27.1833 },
  { name: "İzmir Karşıyaka", lat: 38.4575, lng: 27.1086 },
  { name: "Bursa Osmangazi", lat: 40.1826, lng: 29.0501 },
  { name: "Bursa Nilüfer", lat: 40.2053, lng: 28.9647 },
  { name: "Bursa Yıldırım", lat: 40.1869, lng: 29.0969 },
  { name: "Antalya Muratpaşa", lat: 36.8841, lng: 30.7056 },
  { name: "Antalya Konyaaltı", lat: 36.8746, lng: 30.6374 },
  { name: "Antalya Kepez", lat: 36.9342, lng: 30.7314 },
  { name: "Konya Selçuklu", lat: 37.8833, lng: 32.4667 },
  { name: "Konya Meram", lat: 37.8556, lng: 32.4556 },
  { name: "Konya Karatay", lat: 37.8722, lng: 32.5038 },
  { name: "Adana Seyhan", lat: 37.0000, lng: 35.3213 },
  { name: "Adana Çukurova", lat: 37.0400, lng: 35.3000 },
  { name: "Gaziantep Şahinbey", lat: 37.0662, lng: 37.3833 },
  { name: "Gaziantep Şehitkamil", lat: 37.0500, lng: 37.3200 },
  { name: "Şanlıurfa Eyyübiye", lat: 37.1591, lng: 38.7969 },
  { name: "Mersin Yenişehir", lat: 36.8000, lng: 34.5833 },
  { name: "Mersin Mezitli", lat: 36.7833, lng: 34.5333 },
  { name: "Diyarbakır Sur", lat: 37.9144, lng: 40.2306 },
  { name: "Kayseri Melikgazi", lat: 38.7205, lng: 35.4826 },
  { name: "Kayseri Kocasinan", lat: 38.7333, lng: 35.5167 },
  { name: "Samsun Atakum", lat: 41.3300, lng: 36.2700 },
  { name: "Samsun İlkadım", lat: 41.2867, lng: 36.3300 },
  { name: "Denizli Pamukkale", lat: 37.7600, lng: 29.0900 },
  { name: "Eskişehir Tepebaşı", lat: 39.7767, lng: 30.5206 },
  { name: "Eskişehir Odunpazarı", lat: 39.7692, lng: 30.5372 },
  { name: "Trabzon Ortahisar", lat: 41.0027, lng: 39.7168 },
  { name: "Malatya Battalgazi", lat: 38.3552, lng: 38.3095 },
  { name: "Malatya Yeşilyurt", lat: 38.3333, lng: 38.2500 },
  { name: "Kahramanmaraş Dulkadiroğlu", lat: 37.5858, lng: 36.9371 },
  { name: "Ordu Altınordu", lat: 40.9839, lng: 37.8764 },
  { name: "Afyonkarahisar Merkez", lat: 38.7507, lng: 30.5334 },
  { name: "Sivas Merkez", lat: 39.7477, lng: 37.0179 },
  { name: "Tokat Merkez", lat: 40.3167, lng: 36.5500 },
  { name: "Zonguldak Merkez", lat: 41.4506, lng: 31.7908 },
  { name: "Kütahya Merkez", lat: 39.4167, lng: 29.9833 },
  { name: "Çanakkale Merkez", lat: 40.1553, lng: 26.4142 },
  { name: "Edirne Merkez", lat: 41.6772, lng: 26.5557 },
  { name: "Tekirdağ Süleymanpaşa", lat: 40.9781, lng: 27.5117 },
  { name: "Balıkesir Merkez", lat: 39.6484, lng: 27.8826 },
  { name: "Muğla Bodrum", lat: 37.0342, lng: 27.4300 },
  { name: "Muğla Fethiye", lat: 36.6547, lng: 29.1242 },
  { name: "Muğla Marmaris", lat: 36.8558, lng: 28.2722 },
  { name: "Aydın Kuşadası", lat: 37.8600, lng: 27.2599 },
  { name: "Aydın Merkez", lat: 37.8444, lng: 27.8458 },
  { name: "Manisa Merkez", lat: 38.6191, lng: 27.4289 },
  { name: "Uşak Merkez", lat: 38.6742, lng: 29.4058 },
  { name: "Isparta Merkez", lat: 37.7648, lng: 30.5566 },
  { name: "Burdur Merkez", lat: 37.7203, lng: 30.2908 },
  { name: "Karaman Merkez", lat: 37.1759, lng: 33.2214 },
  { name: "Niğde Merkez", lat: 37.9667, lng: 34.6833 },
  { name: "Nevşehir Merkez", lat: 38.6247, lng: 34.7144 },
  { name: "Nevşehir Ürgüp", lat: 38.6317, lng: 34.9147 },
  { name: "Aksaray Merkez", lat: 38.3687, lng: 34.0370 },
  { name: "Kırşehir Merkez", lat: 39.1425, lng: 34.1709 },
  { name: "Yozgat Merkez", lat: 39.8181, lng: 34.8147 },
  { name: "Kırıkkale Merkez", lat: 39.8453, lng: 33.5064 },
  { name: "Çorum Merkez", lat: 40.5506, lng: 34.9556 },
  { name: "Amasya Merkez", lat: 40.6500, lng: 35.8333 },
  { name: "Kastamonu Merkez", lat: 41.3766, lng: 33.7765 },
  { name: "Sinop Merkez", lat: 42.0231, lng: 35.1531 },
  { name: "Bolu Merkez", lat: 40.7350, lng: 31.6078 },
  { name: "Düzce Merkez", lat: 40.8438, lng: 31.1565 },
  { name: "Yalova Merkez", lat: 40.6551, lng: 29.2769 },
  { name: "Sakarya Adapazarı", lat: 40.7731, lng: 30.3948 },
  { name: "Kocaeli İzmit", lat: 40.7654, lng: 29.9408 },
  { name: "Kocaeli Gebze", lat: 40.8017, lng: 29.4306 },
  { name: "Kırklareli Merkez", lat: 41.7333, lng: 27.2167 },
  { name: "Tekirdağ Çorlu", lat: 41.1500, lng: 27.8000 },
  { name: "Karabük Merkez", lat: 41.2000, lng: 32.6333 },
  { name: "Bartın Merkez", lat: 41.6358, lng: 32.3375 },
  { name: "Giresun Merkez", lat: 40.9128, lng: 38.3895 },
  { name: "Rize Merkez", lat: 41.0201, lng: 40.5235 },
  { name: "Artvin Merkez", lat: 41.1833, lng: 41.8167 },
  { name: "Erzincan Merkez", lat: 39.7500, lng: 39.5000 },
  { name: "Elazığ Merkez", lat: 38.6748, lng: 39.2225 },
  { name: "Bingöl Merkez", lat: 38.8847, lng: 40.4939 },
  { name: "Muş Merkez", lat: 38.7432, lng: 41.5064 },
  { name: "Van İpekyolu", lat: 38.4891, lng: 43.3833 },
  { name: "Batman Merkez", lat: 37.8812, lng: 41.1293 },
  { name: "Mardin Artuklu", lat: 37.3129, lng: 40.7339 },
  { name: "Mardin Kızıltepe", lat: 37.1939, lng: 40.5925 },
  { name: "Adıyaman Merkez", lat: 37.7644, lng: 38.2763 },
  { name: "Hatay Antakya", lat: 36.2023, lng: 36.1613 },
  { name: "Hatay İskenderun", lat: 36.5800, lng: 36.1700 },
  { name: "Osmaniye Merkez", lat: 37.0742, lng: 36.2472 },
  { name: "Kilis Merkez", lat: 36.7161, lng: 37.1150 },
  { name: "Bilecik Merkez", lat: 40.1419, lng: 29.9793 },
  { name: "Çankırı Merkez", lat: 40.6000, lng: 33.6167 },
  { name: "Balıkesir Ayvalık", lat: 39.3100, lng: 26.6900 },
  { name: "Antalya Alanya", lat: 36.5433, lng: 31.9997 },
  { name: "Antalya Side", lat: 36.7686, lng: 31.3886 },
  { name: "Antalya Manavgat", lat: 36.7836, lng: 31.4367 },
  { name: "İzmir Alsancak", lat: 38.4381, lng: 27.1461 },
  { name: "İstanbul Taksim", lat: 41.0369, lng: 28.9852 },
  { name: "İstanbul Bağcılar", lat: 41.0353, lng: 28.8550 },
  { name: "İstanbul Ümraniye", lat: 41.0161, lng: 29.1183 },
];

const locations = [];
const countPerCity = Math.ceil(5000 / cities.length);

cities.forEach(city => {
  for (let i = 0; i < countPerCity; i++) {
    // Small offsets: ±0.015 deg ≈ ±1.5km — stays in urban coverage
    const latOffset = (Math.random() - 0.5) * 0.03;
    const lngOffset = (Math.random() - 0.5) * 0.03;
    
    let difficulty;
    const r = Math.random();
    if (r < 0.33) difficulty = 1;
    else if (r < 0.66) difficulty = 2;
    else difficulty = 3;
    
    locations.push({
      id: `gen-v5-${city.name.replace(/\s+/g,'-')}-${i}`,
      name: `${city.name} Çevresi`,
      lat: parseFloat((city.lat + latOffset).toFixed(6)),
      lng: parseFloat((city.lng + lngOffset).toFixed(6)),
      difficulty
    });
  }
});

const finalLocations = locations.slice(0, 5000);
const content = `export const generatedLocations = ${JSON.stringify(finalLocations, null, 2)};`;
fs.writeFileSync('src/generatedLocations.ts', content);
console.log(`Generated ${finalLocations.length} locations.`);
