import axios from "axios";

export const getWeatherForecast = async (lat: number, lon: number) => {
  const url =
    `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}` +
    `&daily=temperature_2m_max,temperature_2m_min&current=temperature_2m,relative_humidity_2m,wind_speed_10m&timezone=auto`;

  const { data } = await axios.get(url);

  return {
    days: data.daily.time,
    max: data.daily.temperature_2m_max,
    min: data.daily.temperature_2m_min,
    today: {
      temp: Math.round(data.current.temperature_2m),
      humidity: Math.round(data.current.relative_humidity_2m),
      wind: Math.round(data.current.wind_speed_10m),
      visibility: Math.floor(Math.random() * 4) + 6 // Mock visibility 6-10 km
    }
  };
};

const getAQILevel = (aqi: number) => {
  if (aqi <= 50) return "Good";
  if (aqi <= 100) return "Moderate";
  if (aqi <= 150) return "Unhealthy for Sensitive Groups";
  if (aqi <= 200) return "Unhealthy";
  if (aqi <= 300) return "Very Unhealthy";
  return "Hazardous";
};

const getHealthRecommendation = (aqi: number) => {
  if (aqi <= 50) {
    return "Air quality is good. Perfect for outdoor activities!";
  }
  if (aqi <= 100) {
    return "Air quality is acceptable. Unusually sensitive people should consider limiting prolonged outdoor exertion.";
  }
  if (aqi <= 150) {
    return "Members of sensitive groups may experience health effects. The general public is less likely to be affected.";
  }
  if (aqi <= 200) {
    return "Everyone may begin to experience health effects. Limit prolonged outdoor exertion.";
  }
  if (aqi <= 300) {
    return "Health alert: everyone may experience more serious health effects. Avoid outdoor activities.";
  }
  return "Health warnings of emergency conditions. Everyone should avoid outdoor activities.";
};

export const getAirQualityData = async (lat: number, lon: number) => {
  try {
    // Use OpenWeather Air Pollution API for more accurate AQI
    const apiKey = process.env.OPENWEATHER_API_KEY;
    
    if (apiKey) {
      const owUrl = `http://api.openweathermap.org/data/2.5/air_pollution?lat=${lat}&lon=${lon}&appid=${apiKey}`;
      console.log('Fetching air quality from OpenWeather:', owUrl);
      const owResponse = await axios.get(owUrl);
      
      if (owResponse.data?.list?.[0]) {
        const pollution = owResponse.data.list[0];
        const components = pollution.components;
        
        console.log('OpenWeather pollution data:', {
          pm2_5: components.pm2_5,
          pm10: components.pm10,
          co: components.co,
          no2: components.no2
        });
        
        // Convert OpenWeather AQI (1-5) to US AQI scale (0-500)
        const owAqi = pollution.main.aqi; // 1-5 scale
        let usAqi;
        
        // Convert based on PM2.5 values (more accurate)
        if (components.pm2_5 <= 12) usAqi = Math.round((components.pm2_5 / 12) * 50);
        else if (components.pm2_5 <= 35.4) usAqi = Math.round(50 + ((components.pm2_5 - 12) / 23.4) * 50);
        else if (components.pm2_5 <= 55.4) usAqi = Math.round(100 + ((components.pm2_5 - 35.4) / 20) * 50);
        else if (components.pm2_5 <= 150.4) usAqi = Math.round(150 + ((components.pm2_5 - 55.4) / 95) * 50);
        else if (components.pm2_5 <= 250.4) usAqi = Math.round(200 + ((components.pm2_5 - 150.4) / 100) * 100);
        else usAqi = Math.round(300 + ((components.pm2_5 - 250.4) / 99.6) * 200);
        
        console.log(`Calculated US AQI from PM2.5 (${components.pm2_5}): ${usAqi}`);
        
        return {
          success: true,
          data: {
            aqi: Math.round(usAqi),
            pm25: Math.round(components.pm2_5 || 0),
            pm10: Math.round(components.pm10 || 0),
            level: getAQILevel(usAqi),
            recommendation: getHealthRecommendation(usAqi)
          }
        };
      }
    } else {
      console.log('OpenWeather API key not found in environment');
    }
  } catch (error) {
    console.error('OpenWeather API failed, falling back to Open-Meteo:', error);
  }
  
  // Fallback to Open-Meteo if OpenWeather fails
  console.log('Using Open-Meteo fallback');
  const url =
    `https://air-quality-api.open-meteo.com/v1/air-quality?latitude=${lat}` +
    `&longitude=${lon}&current=us_aqi,pm10,pm2_5`;

  const { data } = await axios.get(url);
  
  console.log('Open-Meteo AQI data:', data.current);
  
  // Use actual values if available, otherwise use conservative estimates
  const aqi = data.current?.us_aqi || 50;
  const pm25 = data.current?.pm2_5 || 12;
  const pm10 = data.current?.pm10 || 20;

  return {
    success: true,
    data: {
      aqi: Math.round(aqi),
      pm25: Math.round(pm25),
      pm10: Math.round(pm10),
      level: getAQILevel(aqi),
      recommendation: getHealthRecommendation(aqi)
    }
  };
};

// Get heat map data (temperature distribution)
export const getHeatMapData = async (lat: number, lon: number) => {
  const url =
    `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}` +
    `&current=temperature_2m,apparent_temperature&hourly=temperature_2m&timezone=auto`;

  const { data } = await axios.get(url);

  return {
    success: true,
    data: {
      current_temp: Math.round(data.current.temperature_2m),
      feels_like: Math.round(data.current.apparent_temperature),
      hourly_temps: data.hourly.temperature_2m.slice(0, 24),
      hourly_times: data.hourly.time.slice(0, 24)
    }
  };
};

// Get pollution map data
export const getPollutionMapData = async (lat: number, lon: number) => {
  try {
    // Use OpenWeather Air Pollution API for more accurate data
    const apiKey = process.env.OPENWEATHER_API_KEY;
    
    if (apiKey) {
      const owUrl = `http://api.openweathermap.org/data/2.5/air_pollution?lat=${lat}&lon=${lon}&appid=${apiKey}`;
      const owResponse = await axios.get(owUrl);
      
      if (owResponse.data?.list?.[0]) {
        const pollution = owResponse.data.list[0];
        const components = pollution.components;
        
        // Convert PM2.5 to US AQI
        let usAqi;
        if (components.pm2_5 <= 12) usAqi = Math.round((components.pm2_5 / 12) * 50);
        else if (components.pm2_5 <= 35.4) usAqi = Math.round(50 + ((components.pm2_5 - 12) / 23.4) * 50);
        else if (components.pm2_5 <= 55.4) usAqi = Math.round(100 + ((components.pm2_5 - 35.4) / 20) * 50);
        else if (components.pm2_5 <= 150.4) usAqi = Math.round(150 + ((components.pm2_5 - 55.4) / 95) * 50);
        else if (components.pm2_5 <= 250.4) usAqi = Math.round(200 + ((components.pm2_5 - 150.4) / 100) * 100);
        else usAqi = Math.round(300 + ((components.pm2_5 - 250.4) / 99.6) * 200);
        
        // Get hourly forecast
        const forecastUrl = `http://api.openweathermap.org/data/2.5/air_pollution/forecast?lat=${lat}&lon=${lon}&appid=${apiKey}`;
        const forecastResponse = await axios.get(forecastUrl);
        
        const hourlyAqi = forecastResponse.data?.list?.slice(0, 24).map((item: any) => {
          const pm25 = item.components.pm2_5;
          if (pm25 <= 12) return Math.round((pm25 / 12) * 50);
          else if (pm25 <= 35.4) return Math.round(50 + ((pm25 - 12) / 23.4) * 50);
          else if (pm25 <= 55.4) return Math.round(100 + ((pm25 - 35.4) / 20) * 50);
          else if (pm25 <= 150.4) return Math.round(150 + ((pm25 - 55.4) / 95) * 50);
          else if (pm25 <= 250.4) return Math.round(200 + ((pm25 - 150.4) / 100) * 100);
          else return Math.round(300 + ((pm25 - 250.4) / 99.6) * 200);
        }) || [];
        
        const hourlyTimes = forecastResponse.data?.list?.slice(0, 24).map((item: any) => 
          new Date(item.dt * 1000).toISOString()
        ) || [];
        
        return {
          success: true,
          data: {
            aqi: Math.round(usAqi),
            pm25: Math.round(components.pm2_5 || 0),
            pm10: Math.round(components.pm10 || 0),
            co: Math.round(components.co || 0),
            no2: Math.round(components.no2 || 0),
            so2: Math.round(components.so2 || 0),
            hourly_aqi: hourlyAqi,
            hourly_times: hourlyTimes
          }
        };
      }
    }
  } catch (error) {
    console.error('OpenWeather API failed for pollution map, using fallback:', error);
  }
  
  // Fallback to Open-Meteo
  const url =
    `https://air-quality-api.open-meteo.com/v1/air-quality?latitude=${lat}` +
    `&longitude=${lon}&hourly=pm10,pm2_5,carbon_monoxide,nitrogen_dioxide,sulphur_dioxide,us_aqi&current=us_aqi,pm10,pm2_5,carbon_monoxide,nitrogen_dioxide,sulphur_dioxide`;

  const { data } = await axios.get(url);

  return {
    success: true,
    data: {
      aqi: Math.round(data.current?.us_aqi || 50),
      pm25: Math.round(data.current?.pm2_5 || 12),
      pm10: Math.round(data.current?.pm10 || 20),
      co: Math.round(data.current?.carbon_monoxide || 200),
      no2: Math.round(data.current?.nitrogen_dioxide || 10),
      so2: Math.round(data.current?.sulphur_dioxide || 5),
      hourly_aqi: data.hourly?.us_aqi?.slice(0, 24) || [],
      hourly_times: data.hourly?.time?.slice(0, 24) || []
    }
  };
};
