export interface Location {
  id: string;
  name: string;
  lat: number;
  lng: number;
}

export const locations: Location[] = [
  // Kastamonu
  { id: 'kastamonu-saat', name: 'Saat Kulesi - Kastamonu', lat: 41.3745, lng: 33.7788 },
  { id: 'kastamonu-kale', name: 'Kastamonu Kalesi Önü - Kastamonu', lat: 41.3735, lng: 33.7725 },

  // Aksaray
  { id: 'ihlara', name: 'Ihlara Vadisi - Aksaray', lat: 38.2415, lng: 34.3005 },
  { id: 'egri-minare', name: 'Eğri Minare - Aksaray', lat: 38.3705, lng: 34.0322 },

  // Konya
  { id: 'mevlana', name: 'Mevlana Meydanı - Konya', lat: 37.8711, lng: 32.5052 },
  { id: 'alaaddin', name: 'Alaaddin Tepesi - Konya', lat: 37.8732, lng: 32.4930 },

  // İstanbul
  { id: 'sultanahmet', name: 'Sultanahmet Meydanı - İstanbul', lat: 41.0054, lng: 28.9768 },
  { id: 'taksim', name: 'Taksim Meydanı - İstanbul', lat: 41.0369, lng: 28.9850 },
  { id: 'ortakoy', name: 'Ortaköy Meydanı - İstanbul', lat: 41.0475, lng: 29.0270 },

  // Ankara
  { id: 'anitkabir', name: 'Anıtkabir Aslanlı Yol - Ankara', lat: 39.9255, lng: 32.8365 },
  { id: 'kizilay', name: 'Kızılay Meydanı - Ankara', lat: 39.9208, lng: 32.8541 },
  { id: 'ankara-kale', name: 'Ankara Kalesi Sokakları - Ankara', lat: 39.9392, lng: 32.8655 },

  // Eskişehir
  { id: 'odunpazari', name: 'Odunpazarı Evleri - Eskişehir', lat: 39.7615, lng: 30.5235 },
  { id: 'porsuk', name: 'Porsuk Çayı (Adalar) - Eskişehir', lat: 39.7711, lng: 30.5210 },
  { id: 'sazova', name: 'Sazova Parkı Şatosu - Eskişehir', lat: 39.7665, lng: 30.4815 }
];
