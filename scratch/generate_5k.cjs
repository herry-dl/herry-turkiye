
const cities = [
  { name: "İstanbul", lat: 41.0082, lng: 28.9784 },
  { name: "Ankara", lat: 39.9334, lng: 32.8597 },
  { name: "İzmir", lat: 38.4237, lng: 27.1428 },
  { name: "Bursa", lat: 40.1885, lng: 29.0610 },
  { name: "Antalya", lat: 36.8841, lng: 30.7056 },
  { name: "Konya", lat: 37.8714, lng: 32.4932 },
  { name: "Adana", lat: 37.0000, lng: 35.3213 },
  { name: "Gaziantep", lat: 37.0662, lng: 37.3833 },
  { name: "Şanlıurfa", lat: 37.1591, lng: 38.7969 },
  { name: "Mersin", lat: 36.8121, lng: 34.6415 },
  { name: "Diyarbakır", lat: 37.9144, lng: 40.2306 },
  { name: "Kayseri", lat: 38.7205, lng: 35.4826 },
  { name: "Samsun", lat: 41.2867, lng: 36.33 },
  { name: "Denizli", lat: 37.7765, lng: 29.0864 },
  { name: "Eskişehir", lat: 39.7767, lng: 30.5206 },
  { name: "Erzurum", lat: 39.9043, lng: 41.2679 },
  { name: "Trabzon", lat: 41.0027, lng: 39.7168 },
  { name: "Malatya", lat: 38.3552, lng: 38.3095 },
  { name: "Kahramanmaraş", lat: 37.5858, lng: 36.9371 },
  { name: "Ordu", lat: 40.9839, lng: 37.8764 },
  { name: "Afyonkarahisar", lat: 38.7507, lng: 30.5334 },
  { name: "Sivas", lat: 39.7477, lng: 37.0179 },
  { name: "Tokat", lat: 40.3167, lng: 36.55 },
  { name: "Zonguldak", lat: 41.4506, lng: 31.7908 },
  { name: "Kütahya", lat: 39.4167, lng: 29.9833 },
  { name: "Çanakkale", lat: 40.1553, lng: 26.4142 },
  { name: "Edirne", lat: 41.6772, lng: 26.5557 },
  { name: "Tekirdağ", lat: 40.9781, lng: 27.5117 },
  { name: "Balıkesir", lat: 39.6484, lng: 27.8826 },
  { name: "Muğla", lat: 37.2153, lng: 28.3636 },
  { name: "Aydın", lat: 37.8444, lng: 27.8458 },
  { name: "Manisa", lat: 38.6191, lng: 27.4289 },
  { name: "Uşak", lat: 38.6742, lng: 29.4058 },
  { name: "Isparta", lat: 37.7648, lng: 30.5566 },
  { name: "Burdur", lat: 37.7203, lng: 30.2908 },
  { name: "Karaman", lat: 37.1759, lng: 33.2214 },
  { name: "Niğde", lat: 37.9667, lng: 34.6833 },
  { name: "Nevşehir", lat: 38.6247, lng: 34.7144 },
  { name: "Kırşehir", lat: 39.1425, lng: 34.1709 },
  { name: "Aksaray", lat: 38.3687, lng: 34.037 },
  { name: "Yozgat", lat: 39.8181, lng: 34.8147 },
  { name: "Kırıkkale", lat: 39.8453, lng: 33.5064 },
  { name: "Çorum", lat: 40.5506, lng: 34.9556 },
  { name: "Amasya", lat: 40.65, lng: 35.8333 },
  { name: "Kastamonu", lat: 41.3766, lng: 33.7765 },
  { name: "Sinop", lat: 42.0231, lng: 35.1531 },
  { name: "Bolu", lat: 40.735, lng: 31.6078 },
  { name: "Düzce", lat: 40.8438, lng: 31.1565 },
  { name: "Yalova", lat: 40.6551, lng: 29.2769 },
  { name: "Sakarya", lat: 40.7569, lng: 30.3783 },
  { name: "Bilecik", lat: 40.1419, lng: 29.9793 },
  { name: "Kocaeli", lat: 40.8533, lng: 29.8815 },
  { name: "Kırklareli", lat: 41.7333, lng: 27.2167 },
  { name: "Karabük", lat: 41.2, lng: 32.6333 },
  { name: "Bartın", lat: 41.6358, lng: 32.3375 },
  { name: "Çankırı", lat: 40.6, lng: 33.6167 },
  { name: "Giresun", lat: 40.9128, lng: 38.3895 },
  { name: "Rize", lat: 41.0201, lng: 40.5235 },
  { name: "Artvin", lat: 41.1833, lng: 41.8167 },
  { name: "Gümüşhane", lat: 40.4608, lng: 39.4814 },
  { name: "Bayburt", lat: 40.255, lng: 40.2247 },
  { name: "Erzincan", lat: 39.75, lng: 39.5 },
  { name: "Tunceli", lat: 39.1083, lng: 39.5472 },
  { name: "Elazığ", lat: 38.6748, lng: 39.2225 },
  { name: "Bingöl", lat: 38.8847, lng: 40.4939 },
  { name: "Muş", lat: 38.7432, lng: 41.5064 },
  { name: "Bitlis", lat: 38.4, lng: 42.1167 },
  { name: "Van", lat: 38.4891, lng: 43.3833 },
  { name: "Hakkari", lat: 37.5833, lng: 43.7333 },
  { name: "Şırnak", lat: 37.5164, lng: 42.4594 },
  { name: "Siirt", lat: 37.9333, lng: 41.9333 },
  { name: "Batman", lat: 37.8812, lng: 41.1293 },
  { name: "Mardin", lat: 37.3129, lng: 40.7339 },
  { name: "Adıyaman", lat: 37.7644, lng: 38.2763 },
  { name: "Kilis", lat: 36.7161, lng: 37.115 },
  { name: "Osmaniye", lat: 37.0742, lng: 36.2472 },
  { name: "Hatay", lat: 36.2023, lng: 36.1613 },
  { name: "Iğdır", lat: 39.9167, lng: 44.0333 },
  { name: "Ardahan", lat: 41.1105, lng: 42.7022 }
];

const locations = [];
const countPerCity = Math.ceil(5000 / cities.length);

cities.forEach(city => {
  for (let i = 0; i < countPerCity; i++) {
    // Generate variations with random offsets
    // 0.01 degree is approx 1.1km
    const latOffset = (Math.random() - 0.5) * 0.08; // approx 8km range
    const lngOffset = (Math.random() - 0.5) * 0.08;
    
    // Random difficulty
    const difficulty = Math.floor(Math.random() * 3) + 1;
    
    locations.push({
      id: `gen-v5-${city.name}-${i}`,
      name: `${city.name} Çevresi`,
      lat: city.lat + latOffset,
      lng: city.lng + lngOffset,
      difficulty: difficulty
    });
  }
});

// Trim to exactly 5000 if over
const finalLocations = locations.slice(0, 5000);

const fs = require('fs');
const content = `export const generatedLocations = ${JSON.stringify(finalLocations, null, 2)};`;
fs.writeFileSync('src/generatedLocations.ts', content);
console.log('Generated 5000 locations in src/generatedLocations.ts');
