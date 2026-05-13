import React, { useState, useEffect, useRef } from 'react';
import { MapContainer, TileLayer, Marker, useMapEvents, Polyline, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix for default Leaflet icon path issues in React
import iconRetinaUrl from 'leaflet/dist/images/marker-icon-2x.png';
import iconUrl from 'leaflet/dist/images/marker-icon.png';
import shadowUrl from 'leaflet/dist/images/marker-shadow.png';

delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl,
  iconUrl,
  shadowUrl,
});

// Custom Icon for Target
const targetIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-green.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

// Custom Icon for Guess
const guessIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});


interface ClickHandlerProps {
  onMapClick: (lat: number, lng: number) => void;
  disabled: boolean;
}

const ClickHandler: React.FC<ClickHandlerProps> = ({ onMapClick, disabled }) => {
  useMapEvents({
    click(e) {
      if (!disabled) {
        onMapClick(e.latlng.lat, e.latlng.lng);
      }
    },
  });
  return null;
};

interface GameMapProps {
  guess: { lat: number; lng: number } | null;
  setGuess: (guess: { lat: number; lng: number }) => void;
  targetLocation: { lat: number; lng: number } | null;
  roundOver: boolean;
}

export const GameMap: React.FC<GameMapProps> = ({ guess, setGuess, targetLocation, roundOver }) => {
  const mapRef = useRef<L.Map>(null);

  // Auto-fit bounds when round is over
  useEffect(() => {
    if (roundOver && guess && targetLocation && mapRef.current) {
      const bounds = L.latLngBounds([
        [guess.lat, guess.lng],
        [targetLocation.lat, targetLocation.lng]
      ]);
      mapRef.current.fitBounds(bounds, { padding: [50, 50] });
    }
  }, [roundOver, guess, targetLocation]);

  return (
    <div className={`map-section ${guess ? 'expanded' : ''}`}>
      <MapContainer 
        center={[39.0, 35.0]} // Center of Turkey
        zoom={5} 
        scrollWheelZoom={true}
        ref={mapRef}
        style={{ height: '100%', width: '100%' }}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        
        <ClickHandler 
          onMapClick={(lat, lng) => setGuess({ lat, lng })} 
          disabled={roundOver} 
        />

        {guess && (
          <Marker position={[guess.lat, guess.lng]} icon={guessIcon} />
        )}

        {roundOver && targetLocation && (
          <>
            <Marker position={[targetLocation.lat, targetLocation.lng]} icon={targetIcon} />
            {guess && (
              <Polyline 
                positions={[
                  [guess.lat, guess.lng],
                  [targetLocation.lat, targetLocation.lng]
                ]} 
                color="#e63946" 
                dashArray="10, 10" 
                weight={3}
              />
            )}
          </>
        )}
      </MapContainer>
    </div>
  );
};
