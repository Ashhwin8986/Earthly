import { useEffect, useState } from "react";
import { MapPin, Wind, Thermometer, Droplets, Eye, X, Cloud } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useSearchParams } from "react-router-dom";
import { API_BASE } from "@/config/api";

type NearbyLocation = {
  name: string;
  distance: number;
  aqi: number;
  forecast: Array<{
    date: string;
    max: number;
    min: number;
  }>;
};

const AirMap = () => {
  const [params] = useSearchParams();

  const lat = params.get("lat");
  const lon = params.get("lon");
  const place = params.get("place") || "Unknown";

  const [airQualityData, setAirQualityData] = useState<any | null>(null);
  const [weatherData, setWeatherData] = useState<any | null>(null);
  const [nearbyStations, setNearbyStations] = useState<NearbyLocation[]>([]);
  const [error, setError] = useState("");
  const [showHeatMap, setShowHeatMap] = useState(false);
  const [showPollutionMap, setShowPollutionMap] = useState(false);
  const [heatMapData, setHeatMapData] = useState<any>(null);
  const [pollutionMapData, setPollutionMapData] = useState<any>(null);
  const [healthRecommendations, setHealthRecommendations] = useState<string[]>([]);

  const getAQIColor = (aqi: number) => {
    if (aqi <= 50) return "bg-green-500";
    if (aqi <= 100) return "bg-yellow-500";
    if (aqi <= 150) return "bg-orange-500";
    if (aqi <= 200) return "bg-red-500";
    if (aqi <= 300) return "bg-purple-500";
    return "bg-red-900";
  };

  const getAQILevel = (aqi: number) => {
    if (aqi <= 50) return "Good";
    if (aqi <= 100) return "Moderate";
    if (aqi <= 150) return "Unhealthy for Sensitive";
    if (aqi <= 200) return "Unhealthy";
    if (aqi <= 300) return "Very Unhealthy";
    return "Hazardous";
  };

  const getHealthRecommendations = (aqi: number): string[] => {
    if (aqi <= 50) {
      return [
        "Air quality is excellent. Enjoy your outdoor activities!",
        "Great day for exercise and outdoor sports",
        "Perfect conditions for children to play outside",
        "No health precautions necessary"
      ];
    }
    if (aqi <= 100) {
      return [
        "Air quality is acceptable for most people",
        "Unusually sensitive individuals should limit prolonged outdoor exertion",
        "Generally safe for outdoor activities",
        "Monitor air quality if you have respiratory conditions"
      ];
    }
    if (aqi <= 150) {
      return [
        "Sensitive groups should reduce prolonged outdoor exertion",
        "People with respiratory or heart conditions should limit outdoor activities",
        "Children and older adults should take it easy outdoors",
        "Close windows to keep indoor air clean"
      ];
    }
    if (aqi <= 200) {
      return [
        "Everyone should limit prolonged outdoor exertion",
        "Consider wearing a mask when going outdoors",
        "Keep windows closed and use air purifiers indoors",
        "Reschedule outdoor activities if possible"
      ];
    }
    if (aqi <= 300) {
      return [
        "Avoid all outdoor physical activities",
        "Stay indoors with windows and doors closed",
        "Use air purifiers and wear N95 masks if you must go outside",
        "People with heart or lung disease should remain indoors"
      ];
    }
    return [
      "Health emergency: Everyone should avoid outdoor activities",
      "Remain indoors and keep activity levels low",
      "Run air purifiers and seal windows/doors",
      "Seek medical attention if you experience symptoms"
    ];
  };

  const fetchHeatMap = async () => {
    try {
      const res = await fetch(`${API_BASE}/api/weather/heatmap?lat=${lat}&lon=${lon}`);
      const data = await res.json();
      if (data.success) {
        setHeatMapData(data.data);
        setShowHeatMap(true);
      }
    } catch (err) {
      console.error("Failed to fetch heat map", err);
    }
  };

  const fetchPollutionMap = async () => {
    try {
      const res = await fetch(`${API_BASE}/api/weather/pollution?lat=${lat}&lon=${lon}`);
      const data = await res.json();
      if (data.success) {
        setPollutionMapData(data.data);
        setShowPollutionMap(true);
      }
    } catch (err) {
      console.error("Failed to fetch pollution map", err);
    }
  };

  const fetchData = async () => {
    try {
      setError("");

      // 1) AIR QUALITY
      const aq = await fetch(`${API_BASE}/api/weather/air?lat=${lat}&lon=${lon}`);
      const aqJson = await aq.json();
      if (!aqJson.success) throw new Error("Air quality fetch failed");

      setAirQualityData({
        aqi: aqJson.data.aqi,
        level: getAQILevel(aqJson.data.aqi),
        color: getAQIColor(aqJson.data.aqi),
        recommendation: aqJson.data.recommendation
      });

      // Set health recommendations based on AQI
      setHealthRecommendations(getHealthRecommendations(aqJson.data.aqi));

      // 2) WEATHER CONDITIONS
      const wf = await fetch(`${API_BASE}/api/weather/forecast?lat=${lat}&lon=${lon}`);
      const wfJson = await wf.json();

      setWeatherData({
        temperature: wfJson.today.temp,
        humidity: wfJson.today.humidity,
        windSpeed: wfJson.today.wind,
        visibility: wfJson.today.visibility || 8
      });

      // 3) NEARBY LOCATIONS WITH WEATHER FORECAST
      const near = await fetch(`${API_BASE}/api/weather/nearby?lat=${lat}&lon=${lon}`);
      const nearJson = await near.json();

      if (nearJson.success && nearJson.data) {
        setNearbyStations(nearJson.data);
      }
    } catch (err: any) {
      setError(err.message || "Something went wrong");
    }
  };

  useEffect(() => {
    if (!lat || !lon) {
      setError("No location provided");
      return;
    }

    fetchData();
  }, [lat, lon]);

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
                  Temperature distribution and heat index overlay for {place}.
                </p>
                <Button className="bg-gradient-primary hover-scale" onClick={fetchHeatMap}>View Heat Map</Button>
              </div>
            </Card>

            <Card className="eco-card h-48 lg:h-[290px] flex items-center justify-center fade-in stagger-3 hover-lift">
              <div className="text-center space-y-4">
                <MapPin className="h-12 w-12 text-accent mx-auto animate-pulse" />
                <h3 className="text-xl font-semibold">Pollution Map</h3>
                <p className="text-muted-foreground max-w-md mx-auto text-sm">
                  Air pollution levels and contamination zones for {place}.
                </p>
                <Button className="bg-gradient-primary hover-scale" onClick={fetchPollutionMap}>View Pollution Map</Button>
              </div>
            </Card>

            <Card className="eco-card fade-in stagger-6 hover-lift">
              <h3 className="text-lg font-semibold mb-4">Health Recommendations</h3>
              <div className="space-y-4 text-sm">
                {healthRecommendations.length > 0 ? (
                  healthRecommendations.map((rec, i) => (
                    <p key={i}>{rec}</p>
                  ))
                ) : (
                  <>
                    <p>Loading recommendations...</p>
                  </>
                )}
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
                  <div key={i} className="p-3 rounded-lg bg-secondary">
                    <div className="flex items-center justify-between mb-2">
                      <div>
                        <div className="font-medium">{st.name}</div>
                        <div className="text-sm text-muted-foreground">{st.distance} km away</div>
                      </div>
                      <div className="text-right">
                        <div className="font-bold">{st.aqi}</div>
                        <div className={`text-xs px-2 py-1 rounded text-white ${getAQIColor(st.aqi)}`}>
                          {getAQILevel(st.aqi)}
                        </div>
                      </div>
                    </div>
                    {st.forecast && st.forecast.length > 0 && (
                      <div className="mt-2 pt-2 border-t border-border/50">
                        <div className="text-xs text-muted-foreground mb-1 flex items-center">
                          <Cloud className="h-3 w-3 mr-1" />
                          3-Day Forecast
                        </div>
                        <div className="grid grid-cols-3 gap-2">
                          {st.forecast.map((day, idx) => (
                            <div key={idx} className="text-xs">
                              <div className="text-muted-foreground">{new Date(day.date).toLocaleDateString('en-US', { weekday: 'short' })}</div>
                              <div className="font-medium">{day.max}°/{day.min}°</div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>

            </Card>

          </div>
        </div>

        {/* Heat Map Modal */}
        {showHeatMap && heatMapData && (
          <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={() => setShowHeatMap(false)}>
            <Card className="eco-card max-w-3xl w-full max-h-[80vh] overflow-auto" onClick={(e) => e.stopPropagation()}>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-semibold">Heat Map - {place}</h3>
                <Button variant="ghost" size="sm" onClick={() => setShowHeatMap(false)}>
                  <X className="h-4 w-4" />
                </Button>
              </div>
              
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 bg-secondary rounded-lg">
                    <div className="text-sm text-muted-foreground">Current Temperature</div>
                    <div className="text-3xl font-bold text-primary">{heatMapData.current_temp}°C</div>
                  </div>
                  <div className="p-4 bg-secondary rounded-lg">
                    <div className="text-sm text-muted-foreground">Feels Like</div>
                    <div className="text-3xl font-bold text-accent">{heatMapData.feels_like}°C</div>
                  </div>
                </div>

                <div>
                  <h4 className="font-semibold mb-2">24-Hour Temperature Trend</h4>
                  <div className="h-64 flex items-end justify-between gap-1">
                    {heatMapData.hourly_temps.map((temp: number, idx: number) => {
                      const maxTemp = Math.max(...heatMapData.hourly_temps);
                      const minTemp = Math.min(...heatMapData.hourly_temps);
                      const heightPercent = ((temp - minTemp) / (maxTemp - minTemp)) * 100;
                      
                      return (
                        <div key={idx} className="flex-1 flex flex-col items-center">
                          <div className="text-xs mb-1">{Math.round(temp)}°</div>
                          <div 
                            className="w-full bg-gradient-to-t from-orange-500 to-red-500 rounded-t"
                            style={{ height: `${heightPercent}%` }}
                          />
                          {idx % 3 === 0 && (
                            <div className="text-xs mt-1 text-muted-foreground">
                              {new Date(heatMapData.hourly_times[idx]).getHours()}h
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            </Card>
          </div>
        )}

        {/* Pollution Map Modal */}
        {showPollutionMap && pollutionMapData && (
          <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={() => setShowPollutionMap(false)}>
            <Card className="eco-card max-w-3xl w-full max-h-[80vh] overflow-auto" onClick={(e) => e.stopPropagation()}>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-semibold">Pollution Map - {place}</h3>
                <Button variant="ghost" size="sm" onClick={() => setShowPollutionMap(false)}>
                  <X className="h-4 w-4" />
                </Button>
              </div>
              
              <div className="space-y-4">
                <div className="grid grid-cols-3 gap-4">
                  <div className="p-4 bg-secondary rounded-lg">
                    <div className="text-sm text-muted-foreground">AQI</div>
                    <div className="text-2xl font-bold">{pollutionMapData.aqi}</div>
                    <div className={`text-xs px-2 py-1 rounded text-white mt-1 inline-block ${getAQIColor(pollutionMapData.aqi)}`}>
                      {getAQILevel(pollutionMapData.aqi)}
                    </div>
                  </div>
                  <div className="p-4 bg-secondary rounded-lg">
                    <div className="text-sm text-muted-foreground">PM2.5</div>
                    <div className="text-2xl font-bold">{pollutionMapData.pm25}</div>
                    <div className="text-xs text-muted-foreground">µg/m³</div>
                  </div>
                  <div className="p-4 bg-secondary rounded-lg">
                    <div className="text-sm text-muted-foreground">PM10</div>
                    <div className="text-2xl font-bold">{pollutionMapData.pm10}</div>
                    <div className="text-xs text-muted-foreground">µg/m³</div>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div className="p-3 bg-secondary rounded-lg">
                    <div className="text-sm text-muted-foreground">CO</div>
                    <div className="text-xl font-bold">{pollutionMapData.co}</div>
                  </div>
                  <div className="p-3 bg-secondary rounded-lg">
                    <div className="text-sm text-muted-foreground">NO₂</div>
                    <div className="text-xl font-bold">{pollutionMapData.no2}</div>
                  </div>
                  <div className="p-3 bg-secondary rounded-lg">
                    <div className="text-sm text-muted-foreground">SO₂</div>
                    <div className="text-xl font-bold">{pollutionMapData.so2}</div>
                  </div>
                </div>

                <div>
                  <h4 className="font-semibold mb-2">24-Hour AQI Trend</h4>
                  <div className="h-48 flex items-end justify-between gap-1">
                    {pollutionMapData.hourly_aqi.map((aqi: number, idx: number) => {
                      const maxAqi = Math.max(...pollutionMapData.hourly_aqi.filter((v: number) => v !== null));
                      const heightPercent = (aqi / maxAqi) * 100;
                      
                      return (
                        <div key={idx} className="flex-1 flex flex-col items-center">
                          <div className="text-xs mb-1">{Math.round(aqi)}</div>
                          <div 
                            className={`w-full rounded-t ${getAQIColor(aqi)}`}
                            style={{ height: `${heightPercent}%` }}
                          />
                          {idx % 3 === 0 && (
                            <div className="text-xs mt-1 text-muted-foreground">
                              {new Date(pollutionMapData.hourly_times[idx]).getHours()}h
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            </Card>
          </div>
        )}

      </div>
    </div>
  );
};

export default AirMap;
