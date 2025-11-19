import { useEffect, useState } from "react";
import { MapPin, Wind, Thermometer, Droplets, Eye } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useSearchParams } from "react-router-dom";
import { API_BASE } from "@/config/api";
const AirMap = () => {
  const [params] = useSearchParams();

  const lat = params.get("lat");
  const lon = params.get("lon");
  const place = params.get("place") || "Unknown";

  const [airQualityData, setAirQualityData] = useState<any | null>(null);
  const [weatherData, setWeatherData] = useState<any | null>(null);
  const [nearbyStations, setNearbyStations] = useState<any[]>([]);
  const [error, setError] = useState("");

  const getAQIColor = (aqi: number) => {
    if (aqi <= 50) return "bg-green-500";
    if (aqi <= 100) return "bg-yellow-500";
    if (aqi <= 150) return "bg-orange-500";
    return "bg-red-500";
  };

  const getAQILevel = (aqi: number) => {
    if (aqi <= 50) return "Good";
    if (aqi <= 100) return "Moderate";
    if (aqi <= 150) return "Unhealthy for Sensitive";
    return "Unhealthy";
  };

  useEffect(() => {
    if (!lat || !lon) {
      setError("No location provided");
      return;
    }

    
const fetchData = async () => {
  try {
    setError("");

    // 1) AIR QUALITY
    const aq = await fetch(`${API_BASE}/api/air?lat=${lat}&lon=${lon}`);
    const aqJson = await aq.json();
    if (!aqJson.success) throw new Error("Air quality fetch failed");

    setAirQualityData({
      aqi: aqJson.data.aqi,
      level: getAQILevel(aqJson.data.aqi),
      color: getAQIColor(aqJson.data.aqi),
      recommendation: aqJson.data.recommendation
    });

    // 2) WEATHER CONDITIONS
    const wf = await fetch(`${API_BASE}/api/weather/forecast?lat=${lat}&lon=${lon}`);
    const wfJson = await wf.json();

    setWeatherData({
      temperature: wfJson.today.temp,
      humidity: wfJson.today.humidity,
      windSpeed: wfJson.today.wind,
      visibility: wfJson.today.visibility || 8
    });

    // 3) NEARBY LOCATIONS
    const near = await fetch(`${API_BASE}/api/weather/nearby?lat=${lat}&lon=${lon}`);
    const nearJson = await near.json();

    setNearbyStations(
      (nearJson.data || []).map((st: any) => ({
        name: st.name,
        aqi: st.aqi,
        distance: `${st.distance} km`
      }))
    );
  } catch (err: any) {
    setError(err.message || "Something went wrong");
  }
};

    fetchData();
  }, [lat, lon]);

  // ---------------- UI: No changes below this line ----------------

  return (
    <div className="min-h-screen bg-background p-4">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2 fade-in">Air Map</h1>
          <p className="text-xl text-muted-foreground fade-in stagger-1">
            Realtime air quality monitoring and pollution tracking
          </p>
        </div>

        {error && <p className="text-red-600 mb-4">{error}</p>}

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Left Column */}
          <div className="lg:col-span-2 space-y-6">
            <Card className="eco-card h-48 lg:h-[290px] flex items-center justify-center fade-in stagger-2 hover-lift">
              <div className="text-center space-y-4">
                <MapPin className="h-12 w-12 text-primary mx-auto animate-pulse" />
                <h3 className="text-xl font-semibold">Heat Map</h3>
                <p className="text-muted-foreground max-w-md mx-auto text-sm">
                  Temperature distribution and heat index overlay will be displayed here.
                </p>
                <Button className="bg-gradient-primary hover-scale">View Heat Map</Button>
              </div>
            </Card>

            <Card className="eco-card h-48 lg:h-[290px] flex items-center justify-center fade-in stagger-3 hover-lift">
              <div className="text-center space-y-4">
                <MapPin className="h-12 w-12 text-accent mx-auto animate-pulse" />
                <h3 className="text-xl font-semibold">Pollution Map</h3>
                <p className="text-muted-foreground max-w-md mx-auto text-sm">
                  Air pollution levels and contamination zones will be displayed here.
                </p>
                <Button className="bg-gradient-primary hover-scale">View Pollution Map</Button>
              </div>
            </Card>

            <Card className="eco-card fade-in stagger-6 hover-lift">
              <h3 className="text-lg font-semibold mb-4">Health Recommendations</h3>
              <div className="space-y-4 text-sm">
                <p>Consider wearing a mask when going outdoors</p>
                <p>Keep windows closed and use air purifiers indoors</p>
                <p>Limit outdoor exercise and activities</p>
                <p>Stay hydrated and monitor air quality throughout the day</p>
              </div>
            </Card>
          </div>

          {/* Right Column */}
          <div className="space-y-6">

            {/* Weather Conditions */}
            {weatherData && (
              <Card className="eco-card fade-in stagger-4 hover-lift">
                <h3 className="text-lg font-semibold mb-4 flex items-center">
                  <Thermometer className="h-4 w-4 mr-2 text-accent" />
                  Weather Conditions
                </h3>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <div className="text-sm text-muted-foreground">Temperature</div>
                    <div className="font-semibold">{weatherData.temperature}°C</div>
                  </div>
                  <div>
                    <div className="text-sm text-muted-foreground">Humidity</div>
                    <div className="font-semibold">{weatherData.humidity}%</div>
                  </div>
                  <div>
                    <div className="text-sm text-muted-foreground">Wind Speed</div>
                    <div className="font-semibold">{weatherData.windSpeed} km/h</div>
                  </div>
                  <div>
                    <div className="text-sm text-muted-foreground">Visibility</div>
                    <div className="font-semibold">{weatherData.visibility} km</div>
                  </div>
                </div>
              </Card>
            )}

            {/* Current Location AQI */}
            {airQualityData && (
              <Card className="eco-card fade-in stagger-3 hover-lift">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold">Current Location</h3>
                    <Badge variant="outline">{place}</Badge>
                  </div>
                  <div className="text-center space-y-2">
                    <div className="text-4xl font-bold text-primary">
                      AQI = {airQualityData.aqi}
                    </div>
                    <div className={`inline-block px-3 py-1 rounded-full text-white text-sm ${airQualityData.color}`}>
                      {airQualityData.level}
                    </div>
                    <p className="text-sm text-muted-foreground mt-2">
                      {airQualityData.recommendation}
                    </p>
                  </div>
                </div>
              </Card>
            )}

            {/* Nearby Locations */}
            <Card className="eco-card fade-in stagger-5 hover-lift">
              <h3 className="text-lg font-semibold mb-4">Nearby Locations</h3>

              <div className="space-y-3">
                {nearbyStations.map((st, i) => (
                  <div key={i} className="flex items-center justify-between p-3 rounded-lg bg-secondary hover-scale">
                    <div>
                      <div className="font-medium">{st.name}</div>
                      <div className="text-sm text-muted-foreground">{st.distance}</div>
                    </div>
                    <div className="text-right">
                      <div className="font-bold">{st.aqi}</div>
                      <div className={`text-xs px-2 py-1 rounded text-white ${getAQIColor(st.aqi)}`}>
                        {getAQILevel(st.aqi)}
                      </div>
                    </div>
                  </div>
                ))}
              </div>

            </Card>

          </div>
        </div>
      </div>
    </div>
  );
};

export default AirMap;
