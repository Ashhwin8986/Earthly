import { useEffect, useState, useRef } from "react";
import { MapPin, Wind, Thermometer, Droplets, Eye, X, Cloud } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useSearchParams } from "react-router-dom";
import { API_BASE } from "@/config/api";
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import 'leaflet.heat';

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
  const [error, setError] = useState("");
  const [showHeatMap, setShowHeatMap] = useState(false);
  const [showPollutionMap, setShowPollutionMap] = useState(false);
  const [heatMapData, setHeatMapData] = useState<any>(null);
  const [pollutionMapData, setPollutionMapData] = useState<any>(null);
  const [healthRecommendations, setHealthRecommendations] = useState<string[]>([]);
  const heatMapContainerRef = useRef<HTMLDivElement>(null);
  const pollutionMapContainerRef = useRef<HTMLDivElement>(null);
  const heatMapInstance = useRef<L.Map | null>(null);
  const pollutionMapInstance = useRef<L.Map | null>(null);

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

  // Initialize Heat Map with Leaflet
  useEffect(() => {
    if (!showHeatMap || !heatMapContainerRef.current || !lat || !lon) return;

    const centerLat = parseFloat(lat);
    const centerLon = parseFloat(lon);

    // Generate mock nearby points for heatmap density
    const generateHeatmapPoints = () => {
      const points = [];
      // Generate 50 points around the center with slight variations
      for (let i = 0; i < 50; i++) {
        const latOffset = (Math.random() - 0.5) * 0.05; // ~2.5km variation
        const lonOffset = (Math.random() - 0.5) * 0.05;
        const intensity = Math.random(); // 0-1 intensity
        
        points.push([
          centerLat + latOffset,
          centerLon + lonOffset,
          intensity
        ]);
      }
      return points;
    };

    if (heatMapInstance.current) {
      heatMapInstance.current.remove();
    }

    heatMapInstance.current = L.map(heatMapContainerRef.current).setView([centerLat, centerLon], 12);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap contributors'
    }).addTo(heatMapInstance.current);

    // Add heatmap layer
    const heatPoints = generateHeatmapPoints();
    const heat = (L as any).heatLayer(heatPoints, {
      radius: 25,
      blur: 15,
      maxZoom: 17,
      gradient: {
        0.0: 'blue',
        0.3: 'cyan',
        0.6: 'yellow',
        0.8: 'orange',
        1.0: 'red'
      }
    }).addTo(heatMapInstance.current);

    // Add marker for current location
    L.marker([centerLat, centerLon])
      .bindPopup('<h3>Current Location</h3>')
      .addTo(heatMapInstance.current);

    return () => {
      if (heatMapInstance.current) {
        heatMapInstance.current.remove();
        heatMapInstance.current = null;
      }
    };
  }, [showHeatMap, heatMapData, lat, lon]);

  // Initialize Pollution Map with Leaflet
  useEffect(() => {
    if (!showPollutionMap || !pollutionMapContainerRef.current || !lat || !lon) return;

    const centerLat = parseFloat(lat);
    const centerLon = parseFloat(lon);
    const currentAQI = airQualityData?.aqi || 50;

    // Generate mock nearby pollution monitoring stations
    const generatePollutionMarkers = () => {
      const stations = [];
      const stationCount = 15;
      
      for (let i = 0; i < stationCount; i++) {
        const latOffset = (Math.random() - 0.5) * 0.08; // ~4km variation
        const lonOffset = (Math.random() - 0.5) * 0.08;
        // Vary AQI around current location's AQI
        const stationAQI = Math.max(0, Math.min(300, currentAQI + (Math.random() - 0.5) * 40));
        
        let color = '#22c55e'; // Green 0-50
        if (stationAQI > 200) color = '#9333ea'; // Purple 201+
        else if (stationAQI > 150) color = '#ef4444'; // Red 151-200
        else if (stationAQI > 100) color = '#f97316'; // Orange 101-150
        else if (stationAQI > 50) color = '#eab308'; // Yellow 51-100
        
        stations.push({
          lat: centerLat + latOffset,
          lon: centerLon + lonOffset,
          aqi: Math.round(stationAQI),
          color
        });
      }
      return stations;
    };

    if (pollutionMapInstance.current) {
      pollutionMapInstance.current.remove();
    }

    pollutionMapInstance.current = L.map(pollutionMapContainerRef.current).setView([centerLat, centerLon], 11);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap contributors'
    }).addTo(pollutionMapInstance.current);

    // Add markers for each station
    const stations = generatePollutionMarkers();
    stations.forEach(station => {
      const marker = L.circleMarker([station.lat, station.lon], {
        radius: 12,
        fillColor: station.color,
        color: '#ffffff',
        weight: 2,
        opacity: 1,
        fillOpacity: 0.8
      }).addTo(pollutionMapInstance.current!);

      marker.bindPopup(`<h3>AQI: ${station.aqi}</h3><p>Location: ${station.lat.toFixed(4)}, ${station.lon.toFixed(4)}</p>`);
    });

    // Center marker
    L.marker([centerLat, centerLon], {
      icon: L.divIcon({
        className: 'custom-marker',
        html: '<div style="background-color: #3b82f6; width: 20px; height: 20px; border-radius: 50%; border: 3px solid white;"></div>',
        iconSize: [20, 20]
      })
    })
      .bindPopup('<h3>Your Location</h3>')
      .addTo(pollutionMapInstance.current);

    return () => {
      if (pollutionMapInstance.current) {
        pollutionMapInstance.current.remove();
        pollutionMapInstance.current = null;
      }
    };
  }, [showPollutionMap, pollutionMapData, lat, lon, airQualityData]);

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

          </div>
        </div>

        {/* Heat Map Modal */}
        {showHeatMap && (
          <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={() => setShowHeatMap(false)}>
            <Card className="eco-card max-w-4xl w-full max-h-[90vh] overflow-auto" onClick={(e) => e.stopPropagation()}>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-semibold">Heat Map - {place}</h3>
                <Button variant="ghost" size="sm" onClick={() => setShowHeatMap(false)}>
                  <X className="h-4 w-4" />
                </Button>
              </div>
              
              <div className="space-y-4">
                {/* Mapbox Heat Map */}
                <div 
                  ref={heatMapContainerRef} 
                  className="w-full h-96 rounded-lg overflow-hidden"
                />
                
                {/* Legend */}
                <div className="flex items-center justify-between text-sm">
                  <span>Low Pollution</span>
                  <div className="flex items-center space-x-1">
                    <div className="w-8 h-3 bg-blue-500 rounded"></div>
                    <div className="w-8 h-3 bg-cyan-400 rounded"></div>
                    <div className="w-8 h-3 bg-yellow-400 rounded"></div>
                    <div className="w-8 h-3 bg-orange-500 rounded"></div>
                    <div className="w-8 h-3 bg-red-500 rounded"></div>
                  </div>
                  <span>High Pollution</span>
                </div>

                {heatMapData && (
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
                )}
              </div>
            </Card>
          </div>
        )}

        {/* Pollution Map Modal */}
        {showPollutionMap && (
          <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={() => setShowPollutionMap(false)}>
            <Card className="eco-card max-w-4xl w-full max-h-[90vh] overflow-auto" onClick={(e) => e.stopPropagation()}>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-semibold">Pollution Map - {place}</h3>
                <Button variant="ghost" size="sm" onClick={() => setShowPollutionMap(false)}>
                  <X className="h-4 w-4" />
                </Button>
              </div>
              
              <div className="space-y-4">
                {/* Mapbox Pollution Map */}
                <div 
                  ref={pollutionMapContainerRef} 
                  className="w-full h-96 rounded-lg overflow-hidden"
                />
                
                {/* AQI Legend */}
                <div className="grid grid-cols-5 gap-2 text-center text-xs">
                  <div className="p-2 bg-green-500 text-white rounded">
                    <div className="font-bold">0-50</div>
                    <div>Good</div>
                  </div>
                  <div className="p-2 bg-yellow-500 text-white rounded">
                    <div className="font-bold">51-100</div>
                    <div>Moderate</div>
                  </div>
                  <div className="p-2 bg-orange-500 text-white rounded">
                    <div className="font-bold">101-150</div>
                    <div>Unhealthy (Sensitive)</div>
                  </div>
                  <div className="p-2 bg-red-500 text-white rounded">
                    <div className="font-bold">151-200</div>
                    <div>Unhealthy</div>
                  </div>
                  <div className="p-2 bg-purple-500 text-white rounded">
                    <div className="font-bold">201+</div>
                    <div>Very Unhealthy</div>
                  </div>
                </div>

                {pollutionMapData && (
                  <>
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
                  </>
                )}
              </div>
            </Card>
          </div>
        )}

      </div>
    </div>
  );
};

export default AirMap;
