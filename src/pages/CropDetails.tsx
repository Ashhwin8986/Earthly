
import { ArrowLeft, Thermometer, Calendar, Sun, Droplets } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useNavigate, useLocation } from "react-router-dom";

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
  tip?: string;
}

const CropDetails = () => {
  const navigate = useNavigate();
  const location = useLocation();

  // Get crop data from navigation state or use fallback
  const cropData = location.state?.crop || {
    crop_name: "Tomatoes",
    scientific_name: "Solanum lycopersicum",
    ideal_temperature: "18-25°C",
    sowing_months: "Mar-Apr",
    harvest_months: "Jun-Jul",
    sunlight_requirement: "Full Sun",
    watering_frequency: "Daily",
    description: "Tomatoes are warm-season crops that thrive in well-drained, fertile soil. They require consistent watering and plenty of sunlight to produce healthy, flavorful fruits. Start seeds indoors 6-8 weeks before the last frost date for best results.",
  };

  // Generate crop image based on crop name
  const getCropImage = (cropName: string) => {
    const name = cropName.toLowerCase();
    if (name.includes('tomato')) return "https://images.unsplash.com/photo-1518005020951-eccb494ad742";
    if (name.includes('carrot')) return "https://images.unsplash.com/photo-1445282768818-728615cc910a";
    if (name.includes('lettuce') || name.includes('spinach')) return "https://images.unsplash.com/photo-1622206151226-18ca2c9ab4a1";
    if (name.includes('corn') || name.includes('maize')) return "https://images.unsplash.com/photo-1551754655-cd27e38d2076";
    if (name.includes('pepper') || name.includes('chili')) return "https://images.unsplash.com/photo-1583201344223-1f12e84b8e0d";
    if (name.includes('cucumber')) return "https://images.unsplash.com/photo-1449300079323-02e209d9d3a6";
    if (name.includes('potato')) return "https://images.unsplash.com/photo-1552752977-73bb10ca5f94";
    if (name.includes('onion')) return "https://images.unsplash.com/photo-1518977676601-b53f82aba655";
    // Default fallback image for general crops
    return "https://images.unsplash.com/photo-1465146344425-f00d5f5c8f07";
  };

  // Generate companion plants based on crop type
  const getCompanionPlants = (cropName: string) => {
    const name = cropName.toLowerCase();
    if (name.includes('tomato')) return ["Basil", "Carrots", "Lettuce", "Parsley", "Peppers"];
    if (name.includes('carrot')) return ["Radishes", "Lettuce", "Chives", "Onions"];
    if (name.includes('lettuce')) return ["Spinach", "Radishes", "Carrots", "Tomatoes"];
    if (name.includes('corn')) return ["Beans", "Squash", "Pumpkin"];
    if (name.includes('pepper')) return ["Tomatoes", "Basil", "Onions", "Carrots"];
    if (name.includes('cucumber')) return ["Radishes", "Beans", "Corn", "Lettuce"];
    if (name.includes('potato')) return ["Beans", "Corn", "Cabbage", "Peas"];
    if (name.includes('onion')) return ["Carrots", "Tomatoes", "Lettuce", "Cabbage"];
    // Default companions
    return ["Marigolds", "Nasturtiums", "Herbs", "Lettuce"];
  };

  const cropImage = getCropImage(cropData.crop_name);
  const companionPlants = getCompanionPlants(cropData.crop_name);

  return (
    <div className="min-h-screen bg-background">
      {/* Header Image */}
      <div
        className="h-64 md:h-80 bg-cover bg-center relative"
        style={{ backgroundImage: `url(${cropImage})` }}
      >
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
      </div>

      <div className="max-w-5xl mx-auto p-4 -mt-20 relative z-10">
        {/* Main Content Card */}
        <Card className="eco-card fade-in">
          <div className="space-y-6">
            {/* Crop Name */}
            <div className="text-center">
              <h1 className="text-4xl font-bold mb-2 manrope-heading">{cropData.crop_name}</h1>
              {cropData.scientific_name && (
                <p className="text-lg text-muted-foreground italic newsreader-subheading">
                  {cropData.scientific_name}
                </p>
              )}
            </div>

            {/* Quick Facts */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="flex items-center space-x-3 p-4 bg-secondary rounded-lg">
                <Thermometer className="h-6 w-6 text-accent" />
                <div>
                  <div className="text-sm text-muted-foreground">Ideal Temperature</div>
                  <div className="font-semibold">{cropData.ideal_temperature}</div>
                </div>
              </div>
              <div className="flex items-center space-x-3 p-4 bg-secondary rounded-lg">
                <Calendar className="h-6 w-6 text-primary" />
                <div>
                  <div className="text-sm text-muted-foreground">Sowing Months</div>
                  <div className="font-semibold">{cropData.sowing_months}</div>
                </div>
              </div>
              <div className="flex items-center space-x-3 p-4 bg-secondary rounded-lg">
                <Calendar className="h-6 w-6 text-accent" />
                <div>
                  <div className="text-sm text-muted-foreground">Harvest Months</div>
                  <div className="font-semibold">{cropData.harvest_months}</div>
                </div>
              </div>
            </div>

            {/* Additional Facts */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-center space-x-3 p-4 bg-secondary/50 rounded-lg">
                <Sun className="h-6 w-6 text-yellow-500" />
                <div>
                  <div className="text-sm text-muted-foreground">Sunlight Requirement</div>
                  <div className="font-semibold">{cropData.sunlight_requirement}</div>
                </div>
              </div>
              <div className="flex items-center space-x-3 p-4 bg-secondary/50 rounded-lg">
                <Droplets className="h-6 w-6 text-blue-500" />
                <div>
                  <div className="text-sm text-muted-foreground">Watering Frequency</div>
                  <div className="font-semibold">{cropData.watering_frequency}</div>
                </div>
              </div>
            </div>

            {/* Description */}
            <div>
              <h3 className="text-xl font-semibold mb-3">About This Crop</h3>
              <p className="text-muted-foreground leading-relaxed">{cropData.description}</p>
              {cropData.tip && (
                <div className="mt-4 p-4 bg-yellow-50 border-l-4 border-yellow-400 rounded">
                  <p className="text-sm font-medium text-yellow-800">
                    💡 <strong>Pro Tip:</strong> {cropData.tip}
                  </p>
                </div>
              )}
            </div>

            {/* Companion Plants */}
            <div>
              <h3 className="text-xl font-semibold mb-3">Companion Plants</h3>
              <div className="flex flex-wrap gap-2">
                {companionPlants.map((plant, index) => (
                  <Badge key={index} variant="outline" className="text-sm">
                    {plant}
                  </Badge>
                ))}
              </div>
            </div>

            {/* Back Button */}
            <div className="pt-6 border-t border-border">
              <Button
                onClick={() => navigate('/growguide')}
                variant="outline"
                className="hover-scale"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Grow Guide
              </Button>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default CropDetails;
