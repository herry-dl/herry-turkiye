import type { Location } from './locations';

/**
 * Türkiye sokak görüntüsü için tercih edilen konum havuzu.
 * Mapillary tüm bu noktalarda kapsamaya sahip (200m içinde).
 * Runtime validation yine de yapılır (cache'lenir).
 */
export const verifiedLocations: Location[] = [
  // ===== KOLAY (1): Büyük şehir merkezleri, simge yapılar =====
  { id: 'v-ist-sultanahmet', name: 'Sultanahmet Meydanı - İstanbul', lat: 41.0054, lng: 28.9768, difficulty: 1 },
  { id: 'v-ist-eminonu', name: 'Eminönü Meydanı - İstanbul', lat: 41.0167, lng: 28.9706, difficulty: 1 },
  { id: 'v-ist-galata', name: 'Galata Köprüsü - İstanbul', lat: 41.0210, lng: 28.9733, difficulty: 1 },
  { id: 'v-ist-taksim', name: 'Taksim Meydanı - İstanbul', lat: 41.0370, lng: 28.9850, difficulty: 1 },
  { id: 'v-ist-bogazici', name: '15 Temmuz Şehitler Köprüsü - İstanbul', lat: 41.0436, lng: 29.0350, difficulty: 1 },
  { id: 'v-ist-ortakoy', name: 'Ortaköy Sahili - İstanbul', lat: 41.0494, lng: 29.0270, difficulty: 1 },
  { id: 'v-ist-kadikoy', name: 'Kadıköy İskele - İstanbul', lat: 40.9908, lng: 29.0235, difficulty: 1 },
  { id: 'v-ank-tbmm', name: 'TBMM Önü - Ankara', lat: 39.9145, lng: 32.8510, difficulty: 1 },
  { id: 'v-ank-kizilay', name: 'Kızılay Meydanı - Ankara', lat: 39.9203, lng: 32.8541, difficulty: 1 },
  { id: 'v-ank-ulus', name: 'Ulus Meydanı - Ankara', lat: 39.9408, lng: 32.8541, difficulty: 1 },
  { id: 'v-izm-kordon', name: 'Kordon Boyu - İzmir', lat: 38.4326, lng: 27.1408, difficulty: 1 },
  { id: 'v-izm-konak', name: 'Konak Meydanı - İzmir', lat: 38.4192, lng: 27.1287, difficulty: 1 },
  { id: 'v-ant-merkez', name: 'Antalya Merkez', lat: 36.8969, lng: 30.7133, difficulty: 1 },
  { id: 'v-konya-mevlana', name: 'Mevlana Müzesi - Konya', lat: 37.8706, lng: 32.5046, difficulty: 1 },

  // ===== ORTA (2): İl içi ana caddeler, ikincil şehirler =====
  { id: 'v-ist-vatan', name: 'Vatan Caddesi - İstanbul', lat: 41.0163, lng: 28.9405, difficulty: 2 },
  { id: 'v-ist-besiktas', name: 'Beşiktaş Çarşı - İstanbul', lat: 41.0426, lng: 29.0046, difficulty: 2 },
  { id: 'v-ist-moda', name: 'Moda Sahili - İstanbul', lat: 40.9809, lng: 29.0354, difficulty: 2 },
  { id: 'v-ank-sogutozu', name: 'Söğütözü - Ankara', lat: 39.9100, lng: 32.8125, difficulty: 2 },
  { id: 'v-ank-cankaya', name: 'Çankaya - Ankara', lat: 39.9251, lng: 32.8364, difficulty: 2 },
  { id: 'v-izm-alsancak', name: 'Alsancak - İzmir', lat: 38.4360, lng: 27.1430, difficulty: 2 },
  { id: 'v-izm-bornova', name: 'Bornova - İzmir', lat: 38.4690, lng: 27.2160, difficulty: 2 },
  { id: 'v-bursa-merkez', name: 'Bursa Merkez (Heykel)', lat: 40.1885, lng: 29.0610, difficulty: 2 },
  { id: 'v-eski-ataturk', name: 'Atatürk Bulvarı - Eskişehir', lat: 39.7715, lng: 30.5190, difficulty: 2 },
  { id: 'v-konya-alaaddin', name: 'Alaaddin Tepesi - Konya', lat: 37.8732, lng: 32.4937, difficulty: 2 },
  { id: 'v-adana-merkez', name: 'Adana Merkez', lat: 37.0017, lng: 35.3289, difficulty: 2 },
  { id: 'v-gaziantep-merkez', name: 'Gaziantep Merkez', lat: 37.0660, lng: 37.3825, difficulty: 2 },
  { id: 'v-trabzon-merkez', name: 'Trabzon Meydan', lat: 41.0050, lng: 39.7264, difficulty: 2 },
  { id: 'v-samsun-merkez', name: 'Samsun Merkez', lat: 41.2920, lng: 36.3300, difficulty: 2 },
  { id: 'v-kayseri-merkez', name: 'Kayseri Cumhuriyet Meydanı', lat: 38.7322, lng: 35.4853, difficulty: 2 },

  // ===== ZOR (3): Tarihi yerler, küçük şehirler, kırsal =====
  { id: 'v-ant-kaleici', name: 'Kaleiçi - Antalya', lat: 36.8847, lng: 30.7056, difficulty: 3 },
  { id: 'v-mardin', name: 'Mardin Eski Şehir', lat: 37.3131, lng: 40.7374, difficulty: 3 },
  { id: 'v-goreme', name: 'Göreme Kasaba - Nevşehir', lat: 38.6436, lng: 34.8291, difficulty: 3 },
  { id: 'v-canakkale-merkez', name: 'Çanakkale Merkez', lat: 40.1553, lng: 26.4142, difficulty: 3 },
  { id: 'v-kmaras-merkez', name: 'Kahramanmaraş Merkez', lat: 37.5858, lng: 36.9371, difficulty: 3 },
  { id: 'v-sivas-merkez', name: 'Sivas Meydan', lat: 39.7477, lng: 37.0179, difficulty: 3 },
  { id: 'v-erzurum-merkez', name: 'Erzurum Merkez', lat: 39.9043, lng: 41.2658, difficulty: 3 },
  { id: 'v-balikesir-merkez', name: 'Balıkesir Merkez', lat: 39.6500, lng: 27.8833, difficulty: 3 },
  { id: 'v-malatya-merkez', name: 'Malatya Merkez', lat: 38.3552, lng: 38.3095, difficulty: 3 },
  { id: 'v-bodrum-merkez', name: 'Bodrum Sahili - Muğla', lat: 37.0356, lng: 27.4305, difficulty: 3 },
  { id: 'v-marmaris-merkez', name: 'Marmaris Sahili - Muğla', lat: 36.8540, lng: 28.2729, difficulty: 3 },
  { id: 'v-diyarbakir-surlar', name: 'Diyarbakır Surları', lat: 37.9144, lng: 40.2306, difficulty: 3 },
];

export function verifiedByDifficulty(level: 1 | 2 | 3): Location[] {
  return verifiedLocations.filter((l) => {
    if (level === 1) return l.difficulty === 1;
    if (level === 2) return l.difficulty <= 2;
    return true;
  });
}
