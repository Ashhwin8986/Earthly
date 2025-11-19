import axios from "axios";

export const getWeatherForecast = async (lat: number, lon: number) => {
  const url =
    `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}` +
    `&daily=temperature_2m_max,temperature_2m_min&timezone=auto`;

  const { data } = await axios.get(url);

  return {
    days: data.daily.time,
    max: data.daily.temperature_2m_max,
    min: data.daily.temperature_2m_min
  };
};

export const getAirQualityData = async (lat: number, lon: number) => {
  const url =
    `https://air-quality-api.open-meteo.com/v1/air-quality?latitude=${lat}` +
    `&longitude=${lon}&hourly=pm10,pm2_5,carbon_monoxide,us_aqi,uv_index`;

  const { data } = await axios.get(url);

  return {
    temperature: Math.floor(Math.random() * 10) + 20, // open-meteo no temp here → mock
    humidity: Math.floor(Math.random() * 30) + 50,
    windspeed: Math.floor(Math.random() * 10) + 5,
    visibility: Math.floor(Math.random() * 4) + 2,
    aqi: data.hourly.us_aqi[0]
  };
};
