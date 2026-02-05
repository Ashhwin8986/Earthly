import { useState, useEffect } from "react";
import { Calendar, Thermometer, Cloud, Sun, Sprout, Droplets, Lightbulb } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";
import SecureLink from "@/components/SecureLink";
import { sanitizeInput } from "@/utils/security";
import { useNavigate } from "react-router-dom";

interface Crop {
  id: number;
  crop_name: string;
  scientific_name: string;
  ideal_temperature: string;
  sowing_months: string;
  harvest_months: string;
  sunlight_requirement: string;
  watering_frequency: string;
  description: string;
  month: string;
  tip: string;
}

const GrowGuide = () => {
  const navigate = useNavigate();
  const [selectedMonth, setSelectedMonth] = useState(0); // January

  const months = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];

  const { data: crops = [], isLoading, error } = useQuery({
    queryKey: ['crops', months[selectedMonth]],
    queryFn: async () => {
      try {
        const { data, error } = await supabase
          .from('grow_guide_crops')
          .select('*')
          .eq('month', months[selectedMonth]);

        if (error) {
          console.error('Error fetching crops:', error);
          throw new Error('Failed to load crops data');
        }

        // Sanitize the data before returning
        return (data || []).map((crop: any) => ({
          ...crop,
          crop_name: sanitizeInput(crop.crop_name || ''),
          scientific_name: sanitizeInput(crop.scientific_name || ''),
          description: sanitizeInput(crop.description || ''),
          tip: sanitizeInput(crop.tip || '')
        }));
      } catch (err) {
        console.error('Database query error:', err);
        throw err;
      }
    },
    retry: 3,
    retryDelay: 1000,
  });

  const weatherInfo = {
    temperature: "18°C",
    conditions: "Partly Cloudy",
    humidity: "65%",
    rainfall: "12mm"
  };

  const handleViewDetails = (crop: Crop) => {
    // Navigate to crop details with crop data as state
    navigate('/cropdetails', { state: { crop } });
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case "Easy": return "bg-green-100 text-green-800";
      case "Medium": return "bg-yellow-100 text-yellow-800";
      case "Hard": return "bg-red-100 text-red-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  const getCropIcon = (cropName: string) => {
    const name = cropName.toLowerCase();
    if (name.includes('tomato')) return "🍅";
    if (name.includes('carrot')) return "🥕";
    if (name.includes('lettuce') || name.includes('spinach')) return "🥬";
    if (name.includes('onion')) return "🧅";
    if (name.includes('corn') || name.includes('maize')) return "🌽";
    if (name.includes('chili') || name.includes('pepper')) return "🌶️";
    if (name.includes('cucumber')) return "🥒";
    if (name.includes('potato')) return "🥔";
    if (name.includes('pea')) return "🫛";
    if (name.includes('bean')) return "🫘";
    if (name.includes('rice')) return "🌾";
    if (name.includes('garlic')) return "🧄";
    if (name.includes('cabbage')) return "🥬";
    if (name.includes('beetroot')) return "🟣";
    if (name.includes('mustard')) return "🥬";
    if (name.includes('brinjal') || name.includes('eggplant')) return "🍆";
    if (name.includes('pumpkin')) return "🎃";
    if (name.includes('gourd')) return "🥒";
    if (name.includes('okra') || name.includes('lady finger')) return "🌶️";
    if (name.includes('coriander')) return "🌿";
    if (name.includes('fenugreek')) return "🌿";
    if (name.includes('turnip')) return "🟡";
    if (name.includes('bitter')) return "🟢";
    if (name.includes('amaranth')) return "🌿";
    if (name.includes('turmeric')) return "🟡";
    if (name.includes('ginger')) return "🫚";
    if (name.includes('sesame')) return "⚪";
    if (name.includes('soybean')) return "🟤";
    if (name.includes('groundnut') || name.includes('peanut')) return "🥜";
    if (name.includes('millet')) return "🌾";
    if (name.includes('sorghum') || name.includes('jowar')) return "🌾";
    if (name.includes('cotton')) return "☁️";
    return "🌱";
  };

  // Handle loading and error states
  if (error) {
    return (
      <div className="min-h-screen bg-background p-4">
        <div className="max-w-5xl mx-auto">
          <Card className="eco-card p-8 text-center">
            <p className="text-red-600 mb-4">Unable to load crop data at this time.</p>
            <Button onClick={() => window.location.reload()} variant="outline">
              Try Again
            </Button>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-4">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2 fade-in">Grow Guide</h1>
          <p className="text-xl text-muted-foreground fade-in stagger-1">
            Your personalized crop calendar and planting guide
          </p>
        </div>

        {/* Current Weather - Top */}
        <Card className="eco-card mb-8 fade-in stagger-2 hover-lift">
          <h3 className="text-lg font-semibold mb-4 flex items-center">
            <Cloud className="h-5 w-5 mr-2 text-accent" />
            Current Weather
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <div className="flex items-center space-x-3">
              <Thermometer className="h-6 w-6 text-accent" />
              <div>
                <div className="text-sm text-muted-foreground">Temperature</div>
                <div className="font-semibold text-lg">{weatherInfo.temperature}</div>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <Sun className="h-6 w-6 text-accent" />
              <div>
                <div className="text-sm text-muted-foreground">Conditions</div>
                <div className="font-semibold text-lg">{weatherInfo.conditions}</div>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <Droplets className="h-6 w-6 text-accent" />
              <div>
                <div className="text-sm text-muted-foreground">Humidity</div>
                <div className="font-semibold text-lg">{weatherInfo.humidity}</div>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <Cloud className="h-6 w-6 text-accent" />
              <div>
                <div className="text-sm text-muted-foreground">Rainfall</div>
                <div className="font-semibold text-lg">{weatherInfo.rainfall}</div>
              </div>
            </div>
          </div>
        </Card>

        {/* Month Selector */}
        <Card className="eco-card mb-8 fade-in stagger-3 hover-lift">
          <div className="flex items-center space-x-4 mb-4">
            <Calendar className="h-6 w-6 text-primary" />
            <h2 className="text-xl font-semibold">Select Month</h2>
          </div>
          <div className="grid grid-cols-3 md:grid-cols-6 lg:grid-cols-12 gap-2">
            {months.map((month, index) => (
              <Button
                key={index}
                variant={selectedMonth === index ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedMonth(index)}
                className={`hover-scale transition-all duration-200 ${selectedMonth === index ? "bg-gradient-primary" : ""}`}
              >
                {month.slice(0, 3)}
              </Button>
            ))}
          </div>
        </Card>

        {/* Crops Section */}
        <div className="mb-8">
          <h2 className="text-2xl font-semibold mb-2">
            Crops for {months[selectedMonth]}
          </h2>
          <p className="text-muted-foreground mb-6">
            Recommended planting activities for this month
          </p>

          {isLoading ? (
            <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-6 mb-8">
              {[...Array(6)].map((_, index) => (
                <Card key={index} className="eco-card animate-pulse">
                  <div className="h-48 bg-muted rounded"></div>
                </Card>
              ))}
            </div>
          ) : crops.length > 0 ? (
            <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-6 mb-8">
              {crops.map((crop: Crop, index) => (
                <Card key={crop.id} className="eco-card fade-in hover-lift" style={{ animationDelay: `${index * 0.1}s` }}>
                  <div className="space-y-4">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center space-x-3">
                        <span className="text-3xl">{getCropIcon(crop.crop_name)}</span>
                        <div>
                          <h3 className="font-semibold text-lg">{crop.crop_name}</h3>
                          {crop.scientific_name && (
                            <p className="text-xs text-muted-foreground italic">{crop.scientific_name}</p>
                          )}
                          <Badge className="bg-green-100 text-green-800 mt-1">
                            Easy
                          </Badge>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <span className="text-sm text-muted-foreground">Sowing:</span>
                        <span className="text-sm font-medium">{crop.sowing_months}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-muted-foreground">Harvest:</span>
                        <span className="text-sm font-medium">{crop.harvest_months}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-muted-foreground">Temperature:</span>
                        <span className="text-sm font-medium">{crop.ideal_temperature}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-muted-foreground">Sunlight:</span>
                        <span className="text-sm font-medium">{crop.sunlight_requirement}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-muted-foreground">Watering:</span>
                        <span className="text-sm font-medium">{crop.watering_frequency}</span>
                      </div>
                    </div>

                    <div className="pt-3 border-t border-border">
                      <p className="text-sm text-muted-foreground">
                        💡 {crop.description}
                      </p>
                    </div>

                    {crop.tip && (
                      <div className="pt-2 border-t border-border">
                        <div className="flex items-start space-x-2">
                          <Lightbulb className="h-4 w-4 text-yellow-500 mt-0.5 flex-shrink-0" />
                          <p className="text-sm font-medium text-primary">
                            {crop.tip}
                          </p>
                        </div>
                      </div>
                    )}

                    <Button
                      className="w-full hover-scale"
                      variant="outline"
                      onClick={() => handleViewDetails(crop)}
                    >
                      View Details
                    </Button>
                  </div>
                </Card>
              ))}
            </div>
          ) : (
            <Card className="eco-card p-8 text-center">
              <p className="text-muted-foreground">No crops data available for {months[selectedMonth]}.</p>
            </Card>
          )}
        </div>

        {/* Companion Planting */}
        <Card className="eco-card mb-8 fade-in stagger-4 hover-lift">
          <h3 className="text-lg font-semibold mb-4">Companion Planting</h3>
          <div className="grid md:grid-cols-3 gap-6 text-sm">
            <div>
              <span className="font-medium">Tomatoes + Basil</span>
              <p className="text-muted-foreground">Improves flavor and repels pests</p>
            </div>
            <div>
              <span className="font-medium">Carrots + Radishes</span>
              <p className="text-muted-foreground">Radishes help break up soil</p>
            </div>
            <div>
              <span className="font-medium">Lettuce + Spinach</span>
              <p className="text-muted-foreground">Similar growing conditions</p>
            </div>
          </div>
        </Card>

        {/* Seasonal Tips - Bottom */}
        <Card className="eco-card fade-in stagger-5 hover-lift">
          <h3 className="text-lg font-semibold mb-4 flex items-center">
            <Sprout className="h-5 w-5 mr-2 text-primary" />
            Seasonal Tips
          </h3>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
            <div className="flex items-start space-x-2">
              <div className="w-2 h-2 bg-primary rounded-full mt-1.5 flex-shrink-0" />
              <p>Start preparing soil for spring planting</p>
            </div>
            <div className="flex items-start space-x-2">
              <div className="w-2 h-2 bg-primary rounded-full mt-1.5 flex-shrink-0" />
              <p>Begin hardening off seedlings started indoors</p>
            </div>
            <div className="flex items-start space-x-2">
              <div className="w-2 h-2 bg-primary rounded-full mt-1.5 flex-shrink-0" />
              <p>Plan your garden layout and crop rotation</p>
            </div>
            <div className="flex items-start space-x-2">
              <div className="w-2 h-2 bg-primary rounded-full mt-1.5 flex-shrink-0" />
              <p>Check and maintain gardening tools</p>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default GrowGuide;
