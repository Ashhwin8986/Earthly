import axios from "axios";

const GEOCODE_URL = "https://api.openweathermap.org/geo/1.0/direct";

interface GeocodeResponse {
  name: string;
  lat: number;
  lon: number;
  country: string;
  state?: string;
}

async function getCoordinates(location: string): Promise<GeocodeResponse[]> {
  try {
    const apiKey = process.env.OPENWEATHER_API_KEY;

    if (!apiKey) {
      throw new Error("Missing OPENWEATHER_API_KEY in environment variables");
    }

    const response = await axios.get(GEOCODE_URL, {
      params: {
        q: location,
        limit: 5,
        appid: apiKey,
      },
    });

    const data = response.data;

    if (!data || data.length === 0) {
      throw new Error("Location not found.");
    }

    return data as GeocodeResponse[];

  } catch (error: any) {
    console.error("GeocodeService Error:", error.message);
    throw new Error("Failed to fetch geocode data.");
  }
}

export default {
  getCoordinates,
};
