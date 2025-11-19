import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  User,
  Calendar,
  CloudRain,
  Sun,
  MapPin,
  Leaf,
  Users,
  Lightbulb,
  Edit,
  Plus
} from "lucide-react";

import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

type ForecastDay = {
  date: string;
  max: number;
  min: number;
};

const Dashboard = () => {
  const navigate = useNavigate();

  // -----------------------------
  // STATE (persistent via localStorage)
  // -----------------------------
  const [showLocationInput, setShowLocationInput] = useState(false);

  const [userLocation, setUserLocation] = useState(
    localStorage.getItem("userLocation") || "Dehradun"
  );

  const [lastCoords, setLastCoords] = useState<{
    lat: number;
    lon: number;
  } | null>(() => {
    const saved = localStorage.getItem("lastCoords");
    return saved ? JSON.parse(saved) : null;
  });

  const [searchText, setSearchText] = useState("");
  const [forecast, setForecast] = useState<ForecastDay[] | null>(() => {
    const saved = localStorage.getItem("forecast");
    return saved ? JSON.parse(saved) : null;
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const API_BASE = "http://localhost:5000";

  // -----------------------------
  // SAVE state to localStorage
  // -----------------------------
  useEffect(() => {
    localStorage.setItem("userLocation", userLocation);
  }, [userLocation]);

  useEffect(() => {
    if (lastCoords)
      localStorage.setItem("lastCoords", JSON.stringify(lastCoords));
  }, [lastCoords]);

  useEffect(() => {
    if (forecast)
      localStorage.setItem("forecast", JSON.stringify(forecast));
  }, [forecast]);

  // -----------------------------
  // LOCATION SEARCH + FORECAST
  // -----------------------------
  const handleLocationEdit = () => setShowLocationInput((v) => !v);

  const searchLocation = async () => {
    setError(null);
    if (!searchText.trim()) return setError("Enter a location");

    try {
      setLoading(true);

      // 1) GEO API
      const geoRes = await fetch(
        `${API_BASE}/api/geocode?location=${encodeURIComponent(searchText)}`
      );
      const geoJson = await geoRes.json();
      if (!geoJson.success || geoJson.count === 0)
        throw new Error("Location not found");

      const best = geoJson.data[0];
      const lat = best.lat;
      const lon = best.lon;

      setLastCoords({ lat, lon });

      const formattedName = `${best.name}${best.state ? ", " + best.state : ""}${
        best.country ? ", " + best.country : ""
      }`;
      setUserLocation(formattedName);
      setShowLocationInput(false);

      // 2) WEATHER FORECAST
      const wfRes = await fetch(
        `${API_BASE}/api/weather/forecast?lat=${lat}&lon=${lon}`
      );
      const wfJson = await wfRes.json();

      const merged: ForecastDay[] = (wfJson.days || []).map(
        (d: string, i: number) => ({
          date: d,
          max: Math.round(wfJson.max[i]),
          min: Math.round(wfJson.min[i])
        })
      ).slice(0, 3);

      setForecast(merged);

    } catch (err: any) {
      setError(err.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  const gotoAirmap = () => {
    if (!lastCoords) {
      setError("Search a location first");
      return;
    }

    navigate(
      `/airmap?lat=${lastCoords.lat}&lon=${lastCoords.lon}&place=${encodeURIComponent(
        userLocation
      )}`
    );
  };

  // -----------------------------
  // Static dashboard dummy data (unchanged)
  // -----------------------------
  const userStats = {
    name: "Sara Chen",
    joinDate: "March 2024",
    plantsGrown: 23,
  };

  const ecoTips = [
    "Collect rainwater for your garden to save up to 40% on water usage",
    "Companion planting can reduce pest problems by 60%",
    "Composting kitchen scraps can reduce household waste by 30%"
  ];

  const handleQuickAction = (action: string) => {
    switch (action) {
      case "air-quality":
        gotoAirmap();
        break;
      case "planting-calendar":
        navigate("/growguide");
        break;
      case "plant-health":
        navigate("/plantcare");
        break;
      case "community":
        break;
    }
  };

  // ============================================================
  // UI (all your previous content kept exactly as it was)
  // ============================================================

  return (
    <div className="min-h-screen bg-background p-4 pb-20">
      <div className="max-w-7xl mx-auto">

        {/* HEADER */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2 fade-in">My Dashboard</h1>
          <p className="text-xl text-muted-foreground fade-in stagger-1">
            Track your environmental impact and garden progress
          </p>
        </div>

        {/* ROW 1: PROFILE + WEATHER */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">

          {/* PROFILE CARD */}
          <Card className="eco-card fade-in stagger-2 hover-lift">
            <div className="flex items-start space-x-4">
              <div className="w-16 h-16 bg-gradient-primary rounded-full flex items-center justify-center">
                <User className="h-8 w-8 text-white" />
              </div>
              <div className="flex-1">

                <h3 className="text-xl font-semibold mb-1">{userStats.name}</h3>
                <p className="text-sm text-muted-foreground mb-3">
                  Member since {userStats.joinDate}
                </p>

                {/* LOCATION */}
                <div className="space-y-2">

                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">
                      Your Location
                    </span>

                    {showLocationInput ? (
                      <div className="flex space-x-2">
                        <input
                          value={searchText}
                          onChange={(e) => setSearchText(e.target.value)}
                          placeholder="Search city..."
                          className="input input-sm border px-2 py-1 rounded"
                        />

                        <Button size="sm" onClick={searchLocation} disabled={loading}>
                          Search
                        </Button>

                        <Button size="sm" variant="ghost" onClick={handleLocationEdit}>
                          Cancel
                        </Button>
                      </div>
                    ) : (
                      <div className="flex items-center space-x-2">
                        <span className="text-sm font-medium">{userLocation}</span>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={handleLocationEdit}
                          className="p-1 h-6 w-6"
                        >
                          <Edit className="h-3 w-3" />
                        </Button>
                      </div>
                    )}
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Plants Grown</span>
                    <span className="text-sm font-medium">{userStats.plantsGrown}</span>
                  </div>
                </div>

                {error && (
                  <p className="text-red-600 text-sm mt-2">{error}</p>
                )}

              </div>
            </div>
          </Card>

          {/* WEATHER CARD (LIVE FORECAST) */}
          <Card className="eco-card fade-in stagger-3 hover-lift">
            <h3 className="text-lg font-semibold mb-4 flex items-center">
              <Sun className="h-5 w-5 mr-2 text-accent" />
              3-Day Weather Forecast
            </h3>

            {loading && <div>Loading...</div>}

            {!forecast && !loading && (
              <div className="text-sm text-muted-foreground">
                Search a location to load forecast.
              </div>
            )}

            {forecast && (
              <div className="space-y-3">
                {forecast.map((d) => (
                  <div key={d.date} className="flex items-center justify-between p-2 bg-secondary/50 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <Sun className="h-4 w-4 text-accent" />
                      <span className="text-sm font-medium">{d.date}</span>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-semibold">{d.max}°C</div>
                      <div className="text-xs text-muted-foreground">min {d.min}°C</div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            <div className="mt-4">
              <Button onClick={gotoAirmap} disabled={loading}>
                Check Air Quality
              </Button>
            </div>
          </Card>
        </div>

        {/* QUICK ACTIONS (unchanged) */}
        <Card className="eco-card fade-in stagger-4 hover-lift mb-6">
          <h3 className="text-lg font-semibold mb-4">Quick Actions</h3>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Button variant="outline" className="justify-start hover-scale" onClick={() => handleQuickAction("air-quality")}>
              <MapPin className="h-4 w-4 mr-2" />
              Check Air Quality
            </Button>
            <Button variant="outline" className="justify-start hover-scale" onClick={() => handleQuickAction("planting-calendar")}>
              <Calendar className="h-4 w-4 mr-2" />
              View Planting Calendar
            </Button>
            <Button variant="outline" className="justify-start hover-scale" onClick={() => handleQuickAction("plant-health")}>
              <Leaf className="h-4 w-4 mr-2" />
              Analyze Plant Health
            </Button>
            <Button variant="outline" className="justify-start hover-scale" onClick={() => handleQuickAction("community")}>
              <Users className="h-4 w-4 mr-2" />
              Join Community
            </Button>
          </div>
        </Card>

       {/* Swap It - Eco Products */}
        <Card className="eco-card fade-in stagger-5 hover-lift mb-6"> 
          <h3 className="text-lg font-semibold mb-4 flex items-center">
             <Leaf className="h-5 w-5 mr-2 text-primary" />
              Swap It </h3> 
              <div className="relative overflow-hidden">
                 <div className="flex animate-marquee hover:animation-pause space-x-4 py-2">
                   {[
                     {
                     name: "Bamboo Toothbrush", 
                     description: "Sustainably grown bamboo handle",
                     image: "https://images.unsplash.com/photo-1588776814546-1ffcf47267a5?w=300&h=200&fit=crop", 
                     url: "https://amazon.com/bamboo-toothbrush"
                     },
                     { 
                      name: "Reusable Silicone Food Bag", 
                      description: "Perfect for meal prep", 
                      image: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=300&h=200&fit=crop", 
                      url: "https://amazon.com/silicone-food-bag" 
                     }, 
                     { 
                      name: "Compostable Bamboo Dinnerware", 
                      description: "24 piece sustainable dining set", 
                      image: "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=300&h=200&fit=crop", 
                      url: "https://amazon.com/bamboo-dinnerware" 
                      }, 
                      { 
                       name: "Organic Vegetable Seed Kit", 
                       description: "Tomatoes, lettuce, and herbs starter kit", 
                       image: "https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=300&h=200&fit=crop", 
                       url: "https://amazon.com/vegetable-seed-kit" 
                       }, 
                       { 
                        name: "Reusable Jute Shopping Bag", 
                        description: "Biodegradable and durable", 
                        image: "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=300&h=200&fit=crop", 
                        url: "https://amazon.com/jute-shopping-bag" 
                        }, 
                        { 
                        name: "Air-Purifying Peace Lily", 
                        description: "Indoor plant in recycled pot", 
                        image: "https://images.unsplash.com/photo-1463320726281-696a485928c7?w=300&h=200&fit=crop", 
                        url: "https://amazon.com/peace-lily-plant" 
                        }, 
                        { 
                          name: "Biodegradable Dish Soap Bar", 
                          description: "Lavender scented natural cleaning", 
                          image: "https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=300&h=200&fit=crop", 
                          url: "https://amazon.com/dish-soap-bar" 
                        }, 
                        { 
                          name: "Coconut Fiber Scrub Pads", 
                          description: "Natural cleaning pads - pack of 6", 
                          image: "https://images.unsplash.com/photo-1563453392212-326f5e854473?w=300&h=200&fit=crop", 
                          url: "https://amazon.com/coconut-scrub-pads" 
                          } 
                        ].map((product, index) => ( 
                        <div key={index} className="flex-shrink-0 w-64 bg-secondary/30 rounded-lg p-4 hover:bg-secondary/50 hover:shadow-lg hover:scale-105 transition-all duration-300 group" style={{ animationPlayState: 'inherit' }} > 
                        <div className="relative overflow-hidden rounded-md mb-3"> 
                        <img src={product.image} alt={product.name} className="w-full h-32 object-cover group-hover:scale-110 transition-transform duration-300" /> 
                        </div> 
                        <h4 className="font-medium text-sm mb-2 text-foreground">{product.name}</h4> 
                        <p className="text-xs text-muted-foreground mb-3 line-clamp-2">{product.description}</p> 
                        <Button size="sm" className="w-full bg-primary hover:bg-primary/90 text-primary-foreground hover-scale focus:ring-2 focus:ring-primary focus:ring-offset-2" onClick={() => window.open(product.url, '_blank')} tabIndex={0} >
                         Buy on Amazon </Button> 
                         </div> 
                        ))} 
                        </div> 
                        </div> 
                        </Card>

                        
        {/* DAILY TIPS (unchanged) */}
        <Card className="eco-card fade-in stagger-6 hover-lift">
          <h3 className="text-lg font-semibold mb-4 flex items-center">
            <Lightbulb className="h-5 w-5 mr-2 text-accent" />
            Daily Eco Tips
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {ecoTips.map((tip, i) => (
              <div key={i} className="flex items-start space-x-3 p-3 bg-secondary rounded-lg">
                <div className="w-2 h-2 bg-primary rounded-full mt-2"></div>
                <p className="text-sm">{tip}</p>
              </div>
            ))}
          </div>

          <Button className="w-full mt-4" variant="outline">
            More Tips
          </Button>
        </Card>

      </div>
    </div>
  );
};

export default Dashboard;
