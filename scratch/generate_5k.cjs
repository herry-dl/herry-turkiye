const fs = require('fs');

// ONLY cities/districts with known good Google Street View coverage in Turkey
// Removed: Bayburt, Ardahan, Igdir, Hakkari, Sirnak, Bitlis, Tunceli, Mus, Bingol, 
//          Van, Agri, Kars, most of eastern Anatolia rural areas
const cities = [
  // TÜRKİYE
  { name: "İstanbul Beşiktaş", lat: 41.0422, lng: 29.0067, diff: 1 },
  { name: "İstanbul Kadıköy", lat: 40.9906, lng: 29.0267, diff: 1 },
  { name: "İstanbul Fatih", lat: 41.0186, lng: 28.9397, diff: 1 },
  { name: "Ankara Çankaya", lat: 39.9179, lng: 32.8629, diff: 1 },
  { name: "İzmir Konak", lat: 38.4189, lng: 27.1287, diff: 1 },
  { name: "Antalya Muratpaşa", lat: 36.8841, lng: 30.7056, diff: 1 },
  { name: "Bursa Osmangazi", lat: 40.1826, lng: 29.0501, diff: 1 },
  { name: "Eskişehir Odunpazarı", lat: 39.7692, lng: 30.5372, diff: 2 },
  { name: "Muğla Bodrum", lat: 37.0342, lng: 27.4300, diff: 1 },
  { name: "Trabzon Ortahisar", lat: 41.0027, lng: 39.7168, diff: 2 },
  { name: "Nevşehir Göreme", lat: 38.6436, lng: 34.8291, diff: 2 },
  { name: "Adana Çukurova", lat: 37.0400, lng: 35.3000, diff: 2 },
  { name: "Gaziantep Şahinbey", lat: 37.0662, lng: 37.3833, diff: 2 },
  { name: "Çanakkale Merkez", lat: 40.1553, lng: 26.4142, diff: 2 },
  { name: "Edirne Merkez", lat: 41.6772, lng: 26.5557, diff: 2 },
  { name: "Kars Merkez", lat: 40.6013, lng: 43.0975, diff: 3 },
  { name: "Mardin Artuklu", lat: 37.3129, lng: 40.7339, diff: 3 },
  { name: "Artvin Hopa", lat: 41.3853, lng: 41.4361, diff: 3 },

  // ALMANYA (GERMANY)
  { name: "Berlin Mitte", lat: 52.5200, lng: 13.4050, diff: 1 },
  { name: "München Altstadt", lat: 48.1351, lng: 11.5820, diff: 1 },
  { name: "Hamburg Altona", lat: 53.5511, lng: 9.9937, diff: 1 },
  { name: "Köln Altstadt", lat: 50.9375, lng: 6.9603, diff: 2 },
  { name: "Frankfurt Innenstadt", lat: 50.1109, lng: 8.6821, diff: 2 },
  { name: "Stuttgart Mitte", lat: 48.7758, lng: 9.1829, diff: 3 },
  { name: "Dresden Altstadt", lat: 51.0504, lng: 13.7373, diff: 3 },

  // FRANSA (FRANCE)
  { name: "Paris Louvre", lat: 48.8566, lng: 2.3522, diff: 1 },
  { name: "Marseille Vieux-Port", lat: 43.2965, lng: 5.3698, diff: 1 },
  { name: "Lyon Bellecour", lat: 45.7640, lng: 4.8357, diff: 2 },
  { name: "Toulouse Capitole", lat: 43.6047, lng: 1.4442, diff: 2 },
  { name: "Nice Promenade", lat: 43.7102, lng: 7.2620, diff: 2 },
  { name: "Bordeaux Centre", lat: 44.8378, lng: -0.5792, diff: 3 },
  { name: "Strasbourg Petite-France", lat: 48.5734, lng: 7.7521, diff: 3 },

  // İNGİLTERE & BİRLEŞİK KRALLIK (UNITED KINGDOM)
  { name: "London Westminster", lat: 51.5074, lng: -0.1278, diff: 1 },
  { name: "Edinburgh Old Town", lat: 55.9533, lng: -3.1883, diff: 1 },
  { name: "Manchester Piccadilly", lat: 53.4808, lng: -2.2426, diff: 2 },
  { name: "Birmingham City Centre", lat: 52.4862, lng: -1.8904, diff: 2 },
  { name: "Cardiff Central", lat: 51.4816, lng: -3.1791, diff: 3 },
  { name: "Belfast City Centre", lat: 54.5973, lng: -5.9301, diff: 3 },
  { name: "Liverpool Waterfront", lat: 53.4084, lng: -2.9916, diff: 2 },

  // İTALYA (ITALY)
  { name: "Roma Colosseo", lat: 41.9028, lng: 12.4964, diff: 1 },
  { name: "Milano Duomo", lat: 45.4642, lng: 9.1900, diff: 1 },
  { name: "Napoli Centro", lat: 40.8518, lng: 14.2681, diff: 2 },
  { name: "Firenze Duomo", lat: 43.7696, lng: 11.2558, diff: 1 },
  { name: "Venezia Santa Lucia", lat: 45.4408, lng: 12.3155, diff: 2 },
  { name: "Torino Centro", lat: 45.0703, lng: 7.6869, diff: 3 },
  { name: "Palermo Centro", lat: 38.1157, lng: 13.3615, diff: 3 },

  // İSPANYA (SPAIN)
  { name: "Madrid Sol", lat: 40.4168, lng: -3.7038, diff: 1 },
  { name: "Barcelona Catalunya", lat: 41.3851, lng: 2.1734, diff: 1 },
  { name: "Valencia Central", lat: 39.4699, lng: -0.3763, diff: 2 },
  { name: "Sevilla Centro", lat: 37.3891, lng: -5.9845, diff: 2 },
  { name: "Zaragoza Centro", lat: 41.6488, lng: -0.8891, diff: 3 },
  { name: "Málaga Centro", lat: 36.7213, lng: -4.4214, diff: 2 },
  { name: "Bilbao Abando", lat: 43.2630, lng: -2.9350, diff: 3 },

  // PORTEKİZ (PORTUGAL)
  { name: "Lisboa Baixa", lat: 38.7223, lng: -9.1393, diff: 1 },
  { name: "Porto Ribeira", lat: 41.1579, lng: -8.6291, diff: 2 },
  { name: "Coimbra Centro", lat: 40.2033, lng: -8.4103, diff: 3 },

  // HOLLANDA (NETHERLANDS)
  { name: "Amsterdam Dam Square", lat: 52.3676, lng: 4.9041, diff: 1 },
  { name: "Rotterdam Centraal", lat: 51.9244, lng: 4.4777, diff: 2 },
  { name: "Utrecht Oudegracht", lat: 52.0907, lng: 5.1214, diff: 2 },

  // BELÇİKA (BELGIUM)
  { name: "Bruxelles Grand Place", lat: 50.8503, lng: 4.3517, diff: 1 },
  { name: "Antwerpen Centrum", lat: 51.2194, lng: 4.4025, diff: 2 },
  { name: "Gent Centrum", lat: 51.0543, lng: 3.7174, diff: 3 },

  // AVUSTURYA (AUSTRIA)
  { name: "Wien Stephansplatz", lat: 48.2082, lng: 16.3738, diff: 1 },
  { name: "Salzburg Altstadt", lat: 47.8095, lng: 13.0550, diff: 2 },
  { name: "Innsbruck Altstadt", lat: 47.2692, lng: 11.4041, diff: 3 },

  // İSVİÇRE (SWITZERLAND)
  { name: "Zürich Bahnhofstrasse", lat: 47.3769, lng: 8.5417, diff: 1 },
  { name: "Genève Lac", lat: 46.2044, lng: 6.1432, diff: 2 },
  { name: "Bern Altstadt", lat: 46.9480, lng: 7.4474, diff: 3 },

  // İSVEÇ (SWEDEN)
  { name: "Stockholm Gamla Stan", lat: 59.3293, lng: 18.0686, diff: 1 },
  { name: "Göteborg Avenyn", lat: 57.7089, lng: 11.9746, diff: 2 },
  { name: "Malmö Stortorget", lat: 55.6050, lng: 13.0038, diff: 3 },

  // NORVEÇ (NORWAY)
  { name: "Oslo Karl Johans gate", lat: 59.9139, lng: 10.7522, diff: 1 },
  { name: "Bergen Bryggen", lat: 60.3913, lng: 5.3221, diff: 2 },
  { name: "Trondheim Sentrum", lat: 63.4305, lng: 10.3951, diff: 3 },

  // FİNLANDİYA (FINLAND)
  { name: "Helsinki Senaatintori", lat: 60.1699, lng: 24.9384, diff: 1 },
  { name: "Tampere Keskustori", lat: 61.4978, lng: 23.7610, diff: 3 },

  // DANİMARKA (DENMARK)
  { name: "København Nyhavn", lat: 55.6761, lng: 12.5683, diff: 1 },
  { name: "Aarhus Latin Quarter", lat: 56.1567, lng: 10.2108, diff: 3 },

  // YUNANİSTAN (GREECE)
  { name: "Atina Akropolis Çevresi", lat: 37.9838, lng: 23.7275, diff: 1 },
  { name: "Selanik Kordon", lat: 40.6401, lng: 22.9444, diff: 2 },
  { name: "Patras Liman", lat: 38.2466, lng: 21.7346, diff: 3 },

  // POLONYA (POLAND)
  { name: "Warszawa Stare Miasto", lat: 52.2297, lng: 21.0122, diff: 1 },
  { name: "Kraków Rynek Główny", lat: 50.0647, lng: 19.9450, diff: 2 },
  { name: "Gdańsk Długi Targ", lat: 54.3520, lng: 18.6466, diff: 3 },

  // ÇEK CUMHURİYETİ (CZECH REPUBLIC)
  { name: "Praha Staroměstské", lat: 50.0755, lng: 14.4378, diff: 1 },
  { name: "Brno Střed", lat: 49.1951, lng: 16.6068, diff: 3 },

  // MACARİSTAN (HUNGARY)
  { name: "Budapest Parlament", lat: 47.4979, lng: 19.0402, diff: 1 },

  // İRLANDA (IRELAND)
  { name: "Dublin Temple Bar", lat: 53.3498, lng: -6.2603, diff: 1 },

  // HIRVATİSTAN (CROATIA)
  { name: "Zagreb Trg Bana", lat: 45.8150, lng: 15.9819, diff: 2 },
  { name: "Split Riva", lat: 43.5081, lng: 16.4402, diff: 2 },
  { name: "Dubrovnik Old Town", lat: 42.6507, lng: 18.0944, diff: 3 },

  // ROMANYA (ROMANIA)
  { name: "București Lipscani", lat: 44.4268, lng: 26.1025, diff: 2 },
  { name: "Cluj-Napoca Unirii", lat: 46.7712, lng: 23.6236, diff: 3 },

  // BULGARİSTAN (BULGARIA)
  { name: "Sofia Vitosha", lat: 42.6977, lng: 23.3219, diff: 2 },
  { name: "Plovdiv Old Town", lat: 42.1354, lng: 24.7453, diff: 3 },
];

const locations = [];
const countPerCity = Math.ceil(5000 / cities.length);

cities.forEach(city => {
  for (let i = 0; i < countPerCity; i++) {
    // Reverted to 1km range for maximum coverage stability
    const latOffset = (Math.random() - 0.5) * 0.01;
    const lngOffset = (Math.random() - 0.5) * 0.01;
    
    const finalLat = city.lat + latOffset;
    const finalLng = city.lng + lngOffset;

    locations.push({
      id: `gen-v10-${city.name.replace(/\s+/g,'-')}-${i}`,
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
