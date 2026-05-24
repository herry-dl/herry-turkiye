import React, { useEffect, useRef } from 'react';
import { MapContainer, TileLayer, Marker, useMap, useMapEvents, Polyline } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { ensureLeafletIcons, OSM_ATTRIBUTION, OSM_TILE_URL } from '../leaflet-config';

ensureLeafletIcons();

const targetIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-green.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

const guessIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
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

function MapResizeFix() {
  const map = useMap();
  useEffect(() => {
    const el = map.getContainer();
    const ro = new ResizeObserver(() => map.invalidateSize());
    ro.observe(el);
    return () => ro.disconnect();
  }, [map]);
  return null;
}

interface GameMapProps {
  guess: { lat: number; lng: number } | null;
  setGuess: (guess: { lat: number; lng: number }) => void;
  targetLocation: { lat: number; lng: number } | null;
  roundOver: boolean;
}

export const GameMap: React.FC<GameMapProps> = ({ guess, setGuess, targetLocation, roundOver }) => {
  const mapRef = useRef<L.Map>(null);

  const europeBounds: L.LatLngBoundsExpression = [
    [34.0, -25.0], // Southwest: Atlantic, Portugal, southern Spain
    [71.5, 45.5],  // Northeast: Northern Norway, Finland, Eastern Turkey
  ];

  useEffect(() => {
    if (roundOver && guess && targetLocation && mapRef.current) {
      const bounds = L.latLngBounds([
        [guess.lat, guess.lng],
        [targetLocation.lat, targetLocation.lng],
      ]);
      mapRef.current.fitBounds(bounds, { padding: [100, 100] });
    }
  }, [roundOver, guess, targetLocation]);

  return (
    <MapContainer
      center={[48.0, 20.0]}
      zoom={3.8}
      scrollWheelZoom={true}
      ref={mapRef}
      style={{ height: '100%', width: '100%' }}
      maxBounds={europeBounds}
      maxBoundsViscosity={1.0}
      minZoom={3}
    >
      <TileLayer attribution={OSM_ATTRIBUTION} url={OSM_TILE_URL} />
      <MapResizeFix />

      <ClickHandler onMapClick={(lat, lng) => setGuess({ lat, lng })} disabled={roundOver} />

      {guess && <Marker position={[guess.lat, guess.lng]} icon={guessIcon} />}

      {roundOver && targetLocation && (
        <>
          <Marker position={[targetLocation.lat, targetLocation.lng]} icon={targetIcon} />
          {guess && (
            <Polyline
              positions={[
                [guess.lat, guess.lng],
                [targetLocation.lat, targetLocation.lng],
              ]}
              color="#e63946"
              dashArray="10, 10"
              weight={3}
            />
          )}
        </>
      )}
    </MapContainer>
  );
};
