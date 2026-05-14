// Haversine formula to calculate distance between two coordinates in kilometers
export function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371; // Radius of the earth in km
  const dLat = deg2rad(lat2 - lat1);
  const dLon = deg2rad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = R * c; // Distance in km
  return distance;
}

function deg2rad(deg: number): number {
  return deg * (Math.PI / 180);
}

// Calculate score based on distance (max 5000)
// For a Turkey-only game, 10km is perfect, 1000km is 0 points.
export function calculateScore(distanceKm: number): number {
  if (distanceKm <= 1) return 100;
  if (distanceKm <= 10) return 80;
  if (distanceKm <= 20) return 60; 
  if (distanceKm <= 50) return 50;
  if (distanceKm <= 100) return 30;
  if (distanceKm <= 200) return 10;
  return 0;
}
