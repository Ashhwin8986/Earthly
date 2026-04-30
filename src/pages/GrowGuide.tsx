import { useState } from "react";
import { Calendar, Lightbulb } from "lucide-react";

import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";
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
  const [selectedMonth, setSelectedMonth] = useState(2);

  const months = [
    "January","February","March","April","May","June",
    "July","August","September","October","November","December"
  ];

  const { data: crops = [], isLoading } = useQuery({
    queryKey: ['crops', months[selectedMonth]],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('grow_guide_crops')
        .select('*')
        .eq('month', months[selectedMonth]);

      if (error) throw error;
      return data || [];
    }
  });

  const handleViewDetails = (crop: Crop) => {
    navigate('/cropdetails', { state: { crop } });
  };

  const getCropIcon = (name: string) => {
    const n = name.toLowerCase();

    const iconMap = [
      { pattern: /(amaranth|spinach|lettuce|cabbage|fenugreek|coriander|mustard)/, icon: "🥬" },
      { pattern: /(carrot)/, icon: "🥕" },
      { pattern: /(beetroot)/, icon: "🟣" },
      { pattern: /(turnip)/, icon: "⚪" },
      { pattern: /(radish)/, icon: "🌱" },
      { pattern: /(onion)/, icon: "🧅" },
      { pattern: /(garlic)/, icon: "🧄" },
      { pattern: /(tomato)/, icon: "🍅" },
      { pattern: /(brinjal|eggplant)/, icon: "🍆" },
      { pattern: /(chili|pepper)/, icon: "🌶️" },
      { pattern: /(lady finger|okra)/, icon: "🌿" },
      { pattern: /(bottle gourd|sponge gourd|ridge gourd|snake gourd|bitter gourd)/, icon: "🥒" },
      { pattern: /(watermelon|muskmelon)/, icon: "🍉" },
      { pattern: /(maize|corn)/, icon: "🌽" },
      { pattern: /(rice)/, icon: "🍚" },
      { pattern: /(sorghum|jowar)/, icon: "🌾" },
      { pattern: /(millet|bajra)/, icon: "🌾" },
      { pattern: /(chickpea|gram|moong|urad|pigeon pea|arhar|lentil)/, icon: "🫘" },
      { pattern: /(french beans|cluster beans|yardlong beans|cowpea)/, icon: "🫛" },
      { pattern: /(turmeric)/, icon: "🟠" },
      { pattern: /(sweet potato)/, icon: "🍠" },
    ];

    const match = iconMap.find(item => item.pattern.test(n));
    return match ? match.icon : "🌱";
  };

  return (
    <div className="min-h-screen bg-background p-4">
      <div className="max-w-5xl mx-auto">

        {/* HEADER */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">Grow Guide</h1>
          <p className="text-xl text-muted-foreground">
            Your personalized crop calendar and planting guide
          </p>
        </div>

        {/* ✅ FIXED: SINGLE CARD ONLY */}
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
                className={selectedMonth === index ? "bg-gradient-primary" : ""}
              >
                {month.slice(0, 3)}
              </Button>
            ))}
          </div>

        </Card>

        {/* CROPS */}
        <h2 className="text-2xl font-semibold mb-2">
          Crops for {months[selectedMonth]}
        </h2>

        <p className="text-muted-foreground mb-6">
          Recommended planting activities for this month
        </p>

        {isLoading ? (
          <div>Loading...</div>
        ) : (
          <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-6">
            {crops.map((crop: Crop) => (
              <Card key={crop.id} className="eco-card hover-lift flex flex-col h-full">
                <div className="flex flex-col h-full justify-between">

                  <div className="space-y-4">

                    <div className="flex items-start space-x-3">
                      <span className="text-3xl">
                        {getCropIcon(crop.crop_name)}
                      </span>

                      <div>
                        <h3 className="font-semibold text-lg">
                          {crop.crop_name}
                        </h3>

                        {crop.scientific_name && (
                          <p className="text-xs text-muted-foreground italic">
                            {crop.scientific_name}
                          </p>
                        )}

                        <Badge className="bg-green-100 text-green-800 mt-1">
                          Easy
                        </Badge>
                      </div>
                    </div>

                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Sowing:</span>
                        <span>{crop.sowing_months}</span>
                      </div>

                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Harvest:</span>
                        <span>{crop.harvest_months}</span>
                      </div>

                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Temperature:</span>
                        <span>{crop.ideal_temperature}</span>
                      </div>

                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Sunlight:</span>
                        <span>{crop.sunlight_requirement}</span>
                      </div>

                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Watering:</span>
                        <span>{crop.watering_frequency}</span>
                      </div>
                    </div>

                    <div className="pt-3 border-t border-border">
                      <p className="text-sm text-muted-foreground line-clamp-3">
                        💡 {crop.description}
                      </p>
                    </div>

                    {crop.tip && (
                      <div className="pt-2 border-t border-border flex items-start space-x-2">
                        <Lightbulb className="h-4 w-4 text-yellow-500 mt-0.5" />
                        <p className="text-sm font-medium text-primary">
                          {crop.tip}
                        </p>
                      </div>
                    )}

                  </div>

                  <Button
                    className="w-full mt-4"
                    variant="outline"
                    onClick={() => handleViewDetails(crop)}
                  >
                    View Details
                  </Button>

                </div>
              </Card>
            ))}
          </div>
        )}

      </div>
    </div>
  );
};

export default GrowGuide;