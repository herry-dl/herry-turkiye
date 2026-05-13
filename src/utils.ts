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
  const MAX_SCORE = 5000;
  const PERFECT_DISTANCE = 10; // km
  const MAX_DISTANCE = 1500; // km (approx length of Turkey)

  if (distanceKm <= PERFECT_DISTANCE) {
    return MAX_SCORE;
  }
  
  if (distanceKm >= MAX_DISTANCE) {
    return 0;
  }

  // Exponential decay for score
  const score = MAX_SCORE * Math.pow(Math.E, -5 * (distanceKm / MAX_DISTANCE));
  return Math.max(0, Math.round(score));
}
