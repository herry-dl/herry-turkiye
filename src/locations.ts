export interface Location {
  id: string;
  name: string;
  lat: number;
  lng: number;
  imageUrl: string;
}

export const locations: Location[] = [
  {
    id: 'ayasofya',
    name: 'Ayasofya (Hagia Sophia) - İstanbul',
    lat: 41.0082,
    lng: 28.9784,
    imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/c/c2/Hagia_Sophia_Mars_2013.jpg'
  },
  {
    id: 'kapadokya',
    name: 'Kapadokya (Göreme) - Nevşehir',
    lat: 38.6431,
    lng: 34.8289,
    imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/e/e0/Hot_Air_Balloons_in_Cappadocia.jpg'
  },
  {
    id: 'izmir-saat',
    name: 'Saat Kulesi - İzmir',
    lat: 38.4189,
    lng: 27.1287,
    imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/2/23/Izmir_Clock_Tower_2021.jpg'
  },
  {
    id: 'efes',
    name: 'Efes Antik Kenti (Celsus) - İzmir',
    lat: 37.9392,
    lng: 27.3409,
    imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/1/1d/Library_of_Celsus%2C_Ephesus%2C_Turkey.jpg'
  },
  {
    id: 'hadrian',
    name: 'Hadrian Kapısı - Antalya',
    lat: 36.8853,
    lng: 30.7083,
    imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/4/41/Hadrian%27s_Gate%2C_Antalya%2C_Turkey.jpg'
  }
];
