
import { useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";

interface Plant {
  name: string;
  health: number;
  lastWatered: string;
  nextCare: string;
}

interface PlantCarouselProps {
  plants: Plant[];
}

const PlantCarousel = ({ plants }: PlantCarouselProps) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const plantsPerPage = 3;
  const totalPages = Math.ceil(plants.length / plantsPerPage);

  const nextPage = () => {
    setCurrentIndex((prev) => (prev + 1) % totalPages);
  };

  const prevPage = () => {
    setCurrentIndex((prev) => (prev - 1 + totalPages) % totalPages);
  };

  const currentPlants = plants.slice(
    currentIndex * plantsPerPage,
    (currentIndex + 1) * plantsPerPage
  );

  return (
    <div className="relative">
      <div className="grid md:grid-cols-3 gap-4">
        {currentPlants.map((plant, index) => (
          <div key={index} className="p-4 bg-secondary rounded-lg space-y-3 transition-all duration-300 hover:bg-secondary/80">
            <div className="flex items-center justify-between">
              <h4 className="font-medium manrope-heading">{plant.name}</h4>
              <span className="text-sm text-primary font-medium">{plant.health}%</span>
            </div>
            <Progress value={plant.health} className="h-2" />
            <div className="text-xs space-y-1">
              <div className="text-muted-foreground newsreader-subheading">Last watered: {plant.lastWatered}</div>
              <div className="text-primary font-medium">Next: {plant.nextCare}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Navigation Arrows */}
      {totalPages > 1 && (
        <div className="flex justify-center mt-4 space-x-2">
          <Button
            variant="outline"
            size="icon"
            onClick={prevPage}
            className="h-8 w-8 rounded-full transition-all duration-200 hover:bg-primary hover:text-primary-foreground"
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            onClick={nextPage}
            className="h-8 w-8 rounded-full transition-all duration-200 hover:bg-primary hover:text-primary-foreground"
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      )}

      {/* Page indicators */}
      {totalPages > 1 && (
        <div className="flex justify-center mt-2 space-x-1">
          {Array.from({ length: totalPages }).map((_, index) => (
            <div
              key={index}
              className={`w-2 h-2 rounded-full transition-all duration-200 ${
                index === currentIndex ? "bg-primary" : "bg-muted"
              }`}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default PlantCarousel;
