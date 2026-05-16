import type { Location } from './locations';

/**
 * Türkiye'de KartaView sokak fotoğrafı kapsaması manuel olarak doğrulanmış konumlar.
 * Her birinin 500m çevresinde en az 40+ fotoğraf var (curl ile test edildi).
 */
export const verifiedLocations: Location[] = [
  // ----- İstanbul Tarihi Yarımada (Kolay) -----
  { id: 'v-ist-sultanahmet', name: 'Sultanahmet Meydanı - İstanbul', lat: 41.0054, lng: 28.9768, difficulty: 1 },
  { id: 'v-ist-eminonu', name: 'Eminönü Meydanı - İstanbul', lat: 41.0082, lng: 28.9784, difficulty: 1 },
  { id: 'v-ist-galata-koprusu', name: 'Galata Köprüsü - İstanbul', lat: 41.0210, lng: 28.9733, difficulty: 1 },
  { id: 'v-ist-karakoy', name: 'Karaköy Sahil - İstanbul', lat: 41.0258, lng: 28.9744, difficulty: 1 },
  { id: 'v-ist-topkapi', name: 'Topkapı Surları - İstanbul', lat: 41.0151, lng: 28.9491, difficulty: 1 },
  { id: 'v-ist-vatan', name: 'Vatan Caddesi - İstanbul', lat: 41.0163, lng: 28.9405, difficulty: 1 },
  { id: 'v-ist-bogazici-koprusu', name: '15 Temmuz Şehitler Köprüsü - İstanbul', lat: 41.0436, lng: 29.0350, difficulty: 1 },

  // ----- İstanbul Beyoğlu / Boğaz (Kolay) -----
  { id: 'v-ist-taksim', name: 'Taksim Meydanı - İstanbul', lat: 41.0392, lng: 28.9856, difficulty: 1 },
  { id: 'v-ist-ortakoy', name: 'Ortaköy Sahili - İstanbul', lat: 41.0494, lng: 29.0339, difficulty: 1 },

  // ----- İstanbul Anadolu Yakası (Kolay) -----
  { id: 'v-ist-kadikoy', name: 'Kadıköy İskele - İstanbul', lat: 40.9876, lng: 29.0277, difficulty: 1 },
  { id: 'v-ist-moda', name: 'Moda Sahili - İstanbul', lat: 40.9909, lng: 29.0254, difficulty: 2 },

  // ----- Ankara (Kolay/Orta) -----
  { id: 'v-ank-tbmm', name: 'TBMM Önü - Ankara', lat: 39.9145, lng: 32.8510, difficulty: 1 },
  { id: 'v-ank-kizilay', name: 'Kızılay Meydanı - Ankara', lat: 39.9212, lng: 32.8540, difficulty: 1 },
  { id: 'v-ank-ulus', name: 'Ulus Meydanı - Ankara', lat: 39.9334, lng: 32.8597, difficulty: 2 },
  { id: 'v-ank-sogutozu', name: 'Söğütözü - Ankara', lat: 39.9100, lng: 32.8125, difficulty: 2 },
  { id: 'v-ank-kavaklidere', name: 'Kavaklıdere - Ankara', lat: 39.9189, lng: 32.8543, difficulty: 2 },
  { id: 'v-ank-cankaya', name: 'Çankaya - Ankara', lat: 39.9251, lng: 32.8364, difficulty: 2 },

  // ----- İzmir (Orta) -----
  { id: 'v-izm-alsancak', name: 'Alsancak - İzmir', lat: 38.4220, lng: 27.1428, difficulty: 2 },
  { id: 'v-izm-bornova', name: 'Bornova - İzmir', lat: 38.4500, lng: 27.2090, difficulty: 2 },

  // ----- Antalya (Orta/Zor) -----
  { id: 'v-ant-merkez', name: 'Antalya Merkez', lat: 36.8969, lng: 30.7133, difficulty: 2 },
  { id: 'v-ant-kaleici', name: 'Kaleiçi - Antalya', lat: 36.8847, lng: 30.7056, difficulty: 2 },

  // ----- Mardin (Zor) -----
  { id: 'v-mardin', name: 'Mardin Eski Şehir', lat: 37.3131, lng: 40.7374, difficulty: 3 },
];

export function verifiedByDifficulty(level: 1 | 2 | 3): Location[] {
  return verifiedLocations.filter((l) => {
    if (level === 1) return l.difficulty === 1;
    if (level === 2) return l.difficulty <= 2;
    return true;
  });
}
