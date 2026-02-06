
import { useState } from "react";
import { Calendar, ExternalLink, Filter } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

const EarthFeed = () => {
  const [selectedCategory, setSelectedCategory] = useState("All");

  const categories = ["All", "Climate News", "Sustainable Living", "Green Tech", "Plant & Wildlife"];

  const feedItems = [
    {
      id: 1,
      title: "Breakthrough in Solar Panel Efficiency Reaches 47%",
      summary: "Scientists have developed a new type of solar cell that achieves record-breaking efficiency, potentially revolutionizing renewable energy adoption worldwide.",
      category: "Green Tech",
      date: "2 hours ago",
      image: "https://images.unsplash.com/photo-1509316975850-ff9c5deb0cd9"
    },
    {
      id: 2,
      title: "Global Forest Restoration Initiative Plants 1 Billion Trees",
      summary: "International conservation effort reaches major milestone in combating deforestation and climate change through massive reforestation programs.",
      category: "Plant & Wildlife",
      date: "5 hours ago",
      image: "https://images.unsplash.com/photo-1500673922987-e212871fec22"
    },
    {
      id: 3,
      title: "Ocean Temperature Rises Threaten Marine Ecosystems",
      summary: "New research reveals alarming trends in ocean warming that could have devastating effects on coral reefs and marine biodiversity.",
      category: "Climate News",
      date: "8 hours ago",
      image: "https://images.unsplash.com/photo-1506744038136-46273834b3fb"
    },
    {
      id: 4,
      title: "Zero-Waste Living: Simple Steps for Sustainable Households",
      summary: "Expert tips and practical strategies for reducing household waste and adopting a more environmentally conscious lifestyle.",
      category: "Sustainable Living",
      date: "12 hours ago",
      image: "https://images.unsplash.com/photo-1518005020951-eccb494ad742"
    },
    {
      id: 5,
      title: "AI-Powered Farming Reduces Water Usage by 40%",
      summary: "Smart irrigation systems using artificial intelligence are helping farmers optimize water consumption while maintaining crop yields.",
      category: "Green Tech",
      date: "1 day ago",
      image: "https://images.unsplash.com/photo-1509316975850-ff9c5deb0cd9"
    }
  ];

  const filteredItems = selectedCategory === "All"
    ? feedItems
    : feedItems.filter(item => item.category === selectedCategory);

  const getCategoryColor = (category: string) => {
    switch (category) {
      case "Climate News": return "bg-red-100 text-red-800";
      case "Sustainable Living": return "bg-green-100 text-green-800";
      case "Green Tech": return "bg-blue-100 text-blue-800";
      case "Plant & Wildlife": return "bg-emerald-100 text-emerald-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <div className="min-h-screen bg-background p-4">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold mb-2 fade-in">Earth Feed</h1>
          <p className="text-xl text-muted-foreground fade-in stagger-1">
            Daily doses of environmental news and insights
          </p>
        </div>

        {/* Filter Section */}
        <Card className="eco-card mb-8 fade-in stagger-2">
          <div className="flex items-center space-x-4 mb-4">
            <Filter className="h-5 w-5 text-primary" />
            <h3 className="font-semibold">Filter by Category</h3>
          </div>
          <div className="flex flex-wrap gap-2">
            {categories.map((category) => (
              <Button
                key={category}
                variant={selectedCategory === category ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedCategory(category)}
                className={`hover-scale transition-all duration-200 ${selectedCategory === category ? "bg-gradient-primary" : ""
                  }`}
              >
                {category}
              </Button>
            ))}
          </div>
        </Card>

        {/* Feed Section */}
        <div className="space-y-6 mb-8">
          {filteredItems.map((item, index) => (
            <Card
              key={item.id}
              className="eco-card hover-lift fade-in"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <div className="flex flex-col md:flex-row gap-6">
                {/* Image */}
                <div className="md:w-48 h-48 md:h-32 flex-shrink-0">
                  <img
                    src={item.image}
                    alt={item.title}
                    className="w-full h-full object-cover rounded-lg"
                  />
                </div>

                {/* Content */}
                <div className="flex-1 space-y-3">
                  <div className="flex items-start justify-between gap-4">
                    <h3 className="text-lg font-semibold leading-tight hover:text-primary transition-colors">
                      {item.title}
                    </h3>
                    <Badge className={getCategoryColor(item.category)}>
                      {item.category}
                    </Badge>
                  </div>

                  <p className="text-muted-foreground text-sm leading-relaxed">
                    {item.summary}
                  </p>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                      <Calendar className="h-4 w-4" />
                      <span>{item.date}</span>
                    </div>
                    <Button variant="outline" size="sm" className="hover-scale">
                      <ExternalLink className="h-4 w-4 mr-2" />
                      Read More
                    </Button>
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>

        {/* Update Info */}
        <div className="text-center text-sm text-muted-foreground fade-in">
          <p>Updated daily from trusted sources</p>
        </div>
      </div>
    </div>
  );
};

export default EarthFeed;
