import axios from "axios";

export const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number) => {
  const toRad = (v: number) => (v * Math.PI) / 180;
  const R = 6371; // km

  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);

  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
    Math.sin(dLon / 2) ** 2;

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
};

export const getNearbyLocations = async (lat: number, lon: number) => {
  const url =
    `https://geocoding-api.open-meteo.com/v1/reverse?latitude=${lat}` +
    `&longitude=${lon}&count=10`;

  const { data } = await axios.get(url);
  const locations = data.results.slice(1, 5); // pick 4 nearby cities

  return locations.map((loc: any) => {
    const dist = calculateDistance(lat, lon, loc.latitude, loc.longitude);

    // mock AQI for nearby cities
    const aqi = Math.floor(Math.random() * 200);

    let tag = "Low";
    if (aqi > 100) tag = "Moderate";
    if (aqi > 150) tag = "High";

    return {
      name: loc.name,
      admin: loc.admin1,
      distance_km: Math.round(dist),
      aqi,
      tag
    };
  });
};
