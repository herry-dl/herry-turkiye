export interface Location {
  id: string;
  name: string;
  lat: number;
  lng: number;
}

export const locations: Location[] = [
  // Kastamonu (Ana Caddeler)
  { id: 'kastamonu-meydan', name: 'Cumhuriyet Meydanı (Ana Yol) - Kastamonu', lat: 41.3769, lng: 33.7744 },
  { id: 'kastamonu-ataturk', name: 'Atatürk Caddesi - Kastamonu', lat: 41.3735, lng: 33.7770 },

  // Aksaray (Ana Yollar)
  { id: 'aksaray-e90', name: 'Ankara Yolu (E90) - Aksaray', lat: 38.3840, lng: 34.0150 },
  { id: 'aksaray-bulvar', name: 'Atatürk Bulvarı - Aksaray', lat: 38.3700, lng: 34.0280 },

  // Konya (Ana Caddeler)
  { id: 'konya-mevlana-yol', name: 'Mevlana Caddesi (Müze Önü Ana Yol) - Konya', lat: 37.8722, lng: 32.5038 },
  { id: 'konya-nalcaci', name: 'Nalçacı Caddesi - Konya', lat: 37.8780, lng: 32.4820 },
  { id: 'konya-alaaddin-yol', name: 'Alaaddin Bulvarı (Tepe Etrafı Ana Yol) - Konya', lat: 37.8725, lng: 32.4950 },

  // İstanbul (Köprüler ve Ana Arterler)
  { id: 'ist-bogazici', name: '15 Temmuz Şehitler Köprüsü Üzeri - İstanbul', lat: 41.0436, lng: 29.0350 },
  { id: 'ist-galata', name: 'Galata Köprüsü Üzeri - İstanbul', lat: 41.0210, lng: 28.9733 },
  { id: 'ist-vatan', name: 'Vatan Caddesi - İstanbul', lat: 41.0163, lng: 28.9405 },

  // Ankara (Büyük Bulvarlar)
  { id: 'ank-tbmm', name: 'İnönü Bulvarı (TBMM Önü) - Ankara', lat: 39.9145, lng: 32.8510 },
  { id: 'ank-eskisehir-yol', name: 'Eskişehir Yolu (Söğütözü) - Ankara', lat: 39.9100, lng: 32.8125 },
  { id: 'ank-kizilay', name: 'Kızılay Meydanı (Atatürk Blv) - Ankara', lat: 39.9212, lng: 32.8540 },

  // Eskişehir (Ana Caddeler)
  { id: 'esk-ataturk', name: 'Atatürk Bulvarı - Eskişehir', lat: 39.7715, lng: 30.5190 },
  { id: 'esk-yunus', name: 'Yunus Emre Caddesi - Eskişehir', lat: 39.7680, lng: 30.5255 },
  { id: 'esk-universite', name: 'Üniversite Bulvarı - Eskişehir', lat: 39.7820, lng: 30.5080 }
];
