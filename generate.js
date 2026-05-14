import fs from 'fs';

// Türkiye geneli bounding box
const TURKEY_BOUNDS = { latMin: 36.0, latMax: 42.0, lngMin: 26.0, lngMax: 44.5 };

// Büyük şehirlerin ortalama merkezleri
const MAJOR_CITIES = [
  { name: 'İstanbul Merkezi', lat: 41.0082, lng: 28.9784, radius: 0.3 },
  { name: 'Ankara Merkezi', lat: 39.9208, lng: 32.8541, radius: 0.2 },
  { name: 'İzmir Merkezi', lat: 38.4237, lng: 27.1428, radius: 0.2 },
];

const MEDIUM_CITIES = [
  { name: 'Bursa Merkezi', lat: 40.1828, lng: 29.0667, radius: 0.15 },
  { name: 'Antalya Merkezi', lat: 36.8969, lng: 30.7133, radius: 0.15 },
  { name: 'Adana Merkezi', lat: 37.0000, lng: 35.3213, radius: 0.15 },
  { name: 'Konya Merkezi', lat: 37.8714, lng: 32.4846, radius: 0.15 },
  { name: 'Kayseri Merkezi', lat: 38.7312, lng: 35.4787, radius: 0.15 },
  { name: 'Eskişehir Merkezi', lat: 39.7767, lng: 30.5206, radius: 0.1 },
];

function getRandomOffset(radius) {
  const r = radius * Math.sqrt(Math.random());
  const theta = Math.random() * 2 * Math.PI;
  return {
    latOffset: r * Math.cos(theta),
    lngOffset: r * Math.sin(theta)
  };
}

const locations = [];
let idCounter = 1;

// Level 1: Major cities (200 locations)
for (let i = 0; i < 200; i++) {
  const city = MAJOR_CITIES[Math.floor(Math.random() * MAJOR_CITIES.length)];
  const offset = getRandomOffset(city.radius);
  locations.push({
    id: `gen-lvl1-${idCounter++}`,
    name: `Rastgele Sokak - ${city.name} Çevresi`,
    lat: city.lat + offset.latOffset,
    lng: city.lng + offset.lngOffset,
    difficulty: 1
  });
}

// Level 2: Medium cities (400 locations)
for (let i = 0; i < 400; i++) {
  const city = MEDIUM_CITIES[Math.floor(Math.random() * MEDIUM_CITIES.length)];
  const offset = getRandomOffset(city.radius);
  locations.push({
    id: `gen-lvl2-${idCounter++}`,
    name: `Rastgele Sokak - ${city.name} Çevresi`,
    lat: city.lat + offset.latOffset,
    lng: city.lng + offset.lngOffset,
    difficulty: 2
  });
}

// Level 3: Anywhere in Turkey (400 locations)
for (let i = 0; i < 400; i++) {
  const lat = TURKEY_BOUNDS.latMin + Math.random() * (TURKEY_BOUNDS.latMax - TURKEY_BOUNDS.latMin);
  const lng = TURKEY_BOUNDS.lngMin + Math.random() * (TURKEY_BOUNDS.lngMax - TURKEY_BOUNDS.lngMin);
  locations.push({
    id: `gen-lvl3-${idCounter++}`,
    name: `Kırsal / Şehir Dışı Yollar - Türkiye Geneli`,
    lat: lat,
    lng: lng,
    difficulty: 3
  });
}

// Fisher-Yates Shuffle
for (let i = locations.length - 1; i > 0; i--) {
  const j = Math.floor(Math.random() * (i + 1));
  [locations[i], locations[j]] = [locations[j], locations[i]];
}

const fileContent = `export const generatedLocations = ${JSON.stringify(locations, null, 2)};
`;

fs.writeFileSync('src/generatedLocations.ts', fileContent);
console.log('1000 generated locations saved to src/generatedLocations.ts');
