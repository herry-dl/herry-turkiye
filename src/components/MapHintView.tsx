import { useEffect } from 'react';
import { MapContainer, TileLayer } from 'react-leaflet';

interface MapHintViewProps {
  lat: number;
  lng: number;
  onReady: () => void;
}

/** Sokak fotoğrafı yoksa: ücretsiz OSM harita ipucu (siyah ekran yerine) */
export function MapHintView({ lat, lng, onReady }: MapHintViewProps) {
  useEffect(() => {
    const t = window.setTimeout(onReady, 400);
    return () => clearTimeout(t);
  }, [lat, lng, onReady]);

  return (
    <div className="map-hint-wrap" style={{ position: 'absolute', inset: 0, zIndex: 1 }}>
      <MapContainer
        center={[lat, lng]}
        zoom={16}
        zoomControl={false}
        dragging={false}
        scrollWheelZoom={false}
        doubleClickZoom={false}
        touchZoom={false}
        boxZoom={false}
        keyboard={false}
        attributionControl={false}
        style={{ height: '100%', width: '100%' }}
        whenReady={() => onReady()}
      >
        <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
      </MapContainer>
      <div className="map-hint-banner">Sokak görüntüsü yok — harita ipucu</div>
    </div>
  );
}
