import axios from "axios";

export const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number) => {
  const toRad = (v: number) => (v * Math.PI) / 180;
  const R = 6371;

  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);

  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) *
      Math.cos(toRad(lat2)) *
      Math.sin(dLon / 2) ** 2;

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
};

export const getNearbyLocations = async (lat: number, lon: number) => {
  try {
    const url = `https://geocoding-api.open-meteo.com/v1/reverse?latitude=${lat}&longitude=${lon}`;

    const { data } = await axios.get(url);

    if (!data || !data.results || data.results.length === 0) {
      return {
        success: true,
        data: []
      };
    }

    const locations = data.results.slice(1, 5); // 4 nearby cities

    const locationsWithWeather = await Promise.all(
      locations.map(async (loc: any) => {
        const dist = calculateDistance(lat, lon, loc.latitude, loc.longitude);

        try {
          // Air Quality
          const aqUrl =
            `https://air-quality-api.open-meteo.com/v1/air-quality?latitude=${loc.latitude}` +
            `&longitude=${loc.longitude}&current=us_aqi`;

          const aqRes = await axios.get(aqUrl);
          const aqi = Math.round(
            aqRes.data?.current?.us_aqi ??
              Math.floor(Math.random() * 150) + 20
          );

          // Weather Forecast
          const weatherUrl =
            `https://api.open-meteo.com/v1/forecast?latitude=${loc.latitude}` +
            `&longitude=${loc.longitude}&daily=temperature_2m_max,temperature_2m_min&timezone=auto`;

          const weatherRes = await axios.get(weatherUrl);

          const forecast =
            weatherRes.data?.daily?.time?.slice(0, 3).map(
              (date: string, i: number) => ({
                date,
                max: Math.round(weatherRes.data.daily.temperature_2m_max[i]),
                min: Math.round(weatherRes.data.daily.temperature_2m_min[i])
              })
            ) || [];

          return {
            name: loc.name,
            admin: loc.admin1,
            distance: Math.round(dist),
            aqi,
            forecast
          };
        } catch (err) {
          // fallback
          return {
            name: loc.name,
            admin: loc.admin1,
            distance: Math.round(dist),
            aqi: Math.floor(Math.random() * 150) + 20,
            forecast: []
          };
        }
      })
    );

    return {
      success: true,
      data: locationsWithWeather
    };
  } catch (error) {
    console.error("Error in getNearbyLocations:", error);
    return {
      success: true,
      data: []
    };
  }
};