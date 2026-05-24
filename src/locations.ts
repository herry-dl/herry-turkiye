import { generatedLocations } from './generatedLocations';

export interface Location {
  id: string;
  name: string;
  lat: number;
  lng: number;
  difficulty: 1 | 2 | 3;
}

const manualLocations: Location[] = [
  // Seviye 1: Çok bilinen büyük şehir merkezleri, köprüler, simge yapılar (Kolay)
  { id: 'ist-bogazici', name: '15 Temmuz Şehitler Köprüsü Üzeri - İstanbul', lat: 41.0436, lng: 29.0350, difficulty: 1 },
  { id: 'ist-galata', name: 'Galata Köprüsü Üzeri - İstanbul', lat: 41.0210, lng: 28.9733, difficulty: 1 },
  { id: 'ist-sultanahmet', name: 'Sultanahmet Meydanı - İstanbul', lat: 41.0054, lng: 28.9768, difficulty: 1 },
  { id: 'ank-tbmm', name: 'İnönü Bulvarı (TBMM Önü) - Ankara', lat: 39.9145, lng: 32.8510, difficulty: 1 },
  { id: 'ank-kizilay', name: 'Kızılay Meydanı (Atatürk Blv) - Ankara', lat: 39.9212, lng: 32.8540, difficulty: 1 },
  { id: 'izmir-kordon', name: 'Kordon Boyu - İzmir', lat: 38.4326, lng: 27.1408, difficulty: 1 },
  { id: 'konya-mevlana-yol', name: 'Mevlana Müzesi Önü - Konya', lat: 37.8722, lng: 32.5038, difficulty: 1 },
  { id: 'paris-eiffel', name: 'Eyfel Kulesi - Paris', lat: 48.8584, lng: 2.2945, difficulty: 1 },
  { id: 'london-bigben', name: 'Big Ben & Westminster - Londra', lat: 51.5007, lng: -0.1246, difficulty: 1 },
  { id: 'roma-colosseum', name: 'Kolezyum - Roma', lat: 41.8902, lng: 12.4922, difficulty: 1 },
  { id: 'berlin-brandenburg', name: 'Brandenburg Kapısı - Berlin', lat: 52.5163, lng: 13.3777, difficulty: 1 },
  
  // Seviye 2: Diğer büyük/orta şehirlerin ana caddeleri (Orta)
  { id: 'ist-vatan', name: 'Vatan Caddesi - İstanbul', lat: 41.0163, lng: 28.9405, difficulty: 2 },
  { id: 'ank-eskisehir-yol', name: 'Eskişehir Yolu (Söğütözü) - Ankara', lat: 39.9100, lng: 32.8125, difficulty: 2 },
  { id: 'esk-ataturk', name: 'Atatürk Bulvarı - Eskişehir', lat: 39.7715, lng: 30.5190, difficulty: 2 },
  { id: 'esk-yunus', name: 'Yunus Emre Caddesi - Eskişehir', lat: 39.7680, lng: 30.5255, difficulty: 2 },
  { id: 'esk-universite', name: 'Üniversite Bulvarı - Eskişehir', lat: 39.7820, lng: 30.5080, difficulty: 2 },
  { id: 'konya-nalcaci', name: 'Nalçacı Caddesi - Konya', lat: 37.8780, lng: 32.4820, difficulty: 2 },
  { id: 'konya-alaaddin-yol', name: 'Alaaddin Bulvarı - Konya', lat: 37.8725, lng: 32.4950, difficulty: 2 },
  { id: 'kastamonu-meydan', name: 'Cumhuriyet Meydanı (Ana Yol) - Kastamonu', lat: 41.3769, lng: 33.7744, difficulty: 2 },
  { id: 'kastamonu-ataturk', name: 'Atatürk Caddesi - Kastamonu', lat: 41.3735, lng: 33.7770, difficulty: 2 },
  { id: 'aksaray-bulvar', name: 'Atatürk Bulvarı - Aksaray', lat: 38.3700, lng: 34.0280, difficulty: 2 },
  { id: 'prague-charles', name: 'Karl Köprüsü - Prag', lat: 50.0865, lng: 14.4114, difficulty: 2 },
  { id: 'milan-duomo', name: 'Duomo Meydanı - Milano', lat: 45.4641, lng: 9.1896, difficulty: 2 },
  { id: 'amsterdam-dam', name: 'Dam Meydanı - Amsterdam', lat: 52.3732, lng: 4.8926, difficulty: 2 },
  { id: 'athens-acropolis', name: 'Akropolis Girişi - Atina', lat: 37.9715, lng: 23.7257, difficulty: 2 },
 
  // Seviye 3: Daha zorlu yerler, şehir dışı yollar, daha az bilinen caddeler (Zor)
  { id: 'aksaray-e90', name: 'Ankara Yolu (E90) - Aksaray', lat: 38.3840, lng: 34.0150, difficulty: 3 },
  { id: 'kars-ani', name: 'Ani Harabeleri Yolu - Kars', lat: 40.5113, lng: 43.5683, difficulty: 3 },
  { id: 'mardin-dar', name: 'Mardin Eski Şehir Dar Sokakları', lat: 37.3131, lng: 40.7374, difficulty: 3 },
  { id: 'artvin-hopa-yol', name: 'Hopa Cankurtaran Geçidi Yolu - Artvin', lat: 41.3725, lng: 41.4880, difficulty: 3 },
  { id: 'sanliurfa-harran', name: 'Harran Ovası Köy Yolu - Şanlıurfa', lat: 36.8645, lng: 39.0267, difficulty: 3 },
  { id: 'canakkale-assos', name: 'Assos Sahil Yolu - Çanakkale', lat: 39.4893, lng: 26.3353, difficulty: 3 },
  { id: 'nevsehir-goreme', name: 'Göreme Kasaba İçi Yol - Nevşehir', lat: 38.6436, lng: 34.8291, difficulty: 3 },
  { id: 'antalya-kas-yol', name: 'Kaş - Kalkan Sahil Yolu (D400) - Antalya', lat: 36.2163, lng: 29.5670, difficulty: 3 },
  { id: 'norway-fjord', name: 'Geiranger Fiyordu - Norveç', lat: 62.1015, lng: 7.2065, difficulty: 3 },
  { id: 'germany-castle', name: 'Neuschwanstein Şatosu - Almanya', lat: 47.5576, lng: 10.7498, difficulty: 3 },
  { id: 'greece-santorini', name: 'Santorini Manzarası - Yunanistan', lat: 36.4166, lng: 25.4324, difficulty: 3 }
];

export const locations: Location[] = [...manualLocations, ...generatedLocations];
