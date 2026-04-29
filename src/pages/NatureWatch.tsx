import { useState } from "react";
import { Trees, Droplets, Building, AlertTriangle, TrendingUp, TrendingDown } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";

const NatureWatch = () => {
  const [selectedYear, setSelectedYear] = useState("2024");

  const forestData = {
    coverage: 68.2,
    change: -2.1,
    trend: "decreasing",
    areas: [
      { name: "Amazon Basin", coverage: 85.4, change: -3.2 },
      { name: "Boreal Forest", coverage: 92.1, change: -0.8 },
      { name: "Temperate Forest", coverage: 73.6, change: +1.2 },
      { name: "Tropical Forest", coverage: 45.3, change: -5.4 },
    ]
  };

  const waterData = {
    bodies: 156780,
    quality: 72,
    change: -1.8,
    sources: [
      { type: "Rivers", count: 45230, status: "Good" },
      { type: "Lakes", count: 89650, status: "Moderate" },
      { type: "Wetlands", count: 21900, status: "At Risk" },
    ]
  };

  const urbanData = {
    expansion: 12.3,
    change: +4.7,
    population: "8.2B",
    greenSpace: 15.8
  };

  const riskAreas = [
    { location: "Amazon Rainforest", risk: "High", threat: "Deforestation", trend: "increasing" },
    { location: "Great Barrier Reef", risk: "Critical", threat: "Coral Bleaching", trend: "stable" },
    { location: "Arctic Ice Caps", risk: "High", threat: "Melting", trend: "increasing" },
    { location: "Congo Basin", risk: "Medium", threat: "Logging", trend: "decreasing" },
  ];

  const getRiskColor = (risk: string) => {
    switch (risk) {
      case "Critical": return "bg-red-500";
      case "High": return "bg-orange-500";
      case "Medium": return "bg-yellow-500";
      default: return "bg-green-500";
    }
  };

  return (
    <div className="min-h-screen bg-background p-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2 fade-in">NatureWatch</h1>
          <p className="text-xl text-muted-foreground fade-in stagger-1">
            Monitor natural resources and environmental changes worldwide
          </p>
        </div>

        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="forests">Forests</TabsTrigger>
            <TabsTrigger value="water">Water Bodies</TabsTrigger>
            <TabsTrigger value="risks">Risk Areas</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            {/* Key Metrics */}
            <div className="grid md:grid-cols-4 gap-6">
              <Card className="eco-card fade-in">
                <div className="flex items-center space-x-3">
                  <div className="p-3 bg-primary/10 rounded-lg">
                    <Trees className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Forest Coverage</p>
                    <p className="text-2xl font-bold">{forestData.coverage}%</p>
                    <div className="flex items-center text-xs">
                      <TrendingDown className="h-3 w-3 text-red-500 mr-1" />
                      <span className="text-red-500">{forestData.change}%</span>
                    </div>
                  </div>
                </div>
              </Card>

              <Card className="eco-card fade-in stagger-1">
                <div className="flex items-center space-x-3">
                  <div className="p-3 bg-accent/10 rounded-lg">
                    <Droplets className="h-6 w-6 text-accent" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Water Quality</p>
                    <p className="text-2xl font-bold">{waterData.quality}%</p>
                    <div className="flex items-center text-xs">
                      <TrendingDown className="h-3 w-3 text-red-500 mr-1" />
                      <span className="text-red-500">{waterData.change}%</span>
                    </div>
                  </div>
                </div>
              </Card>

              <Card className="eco-card fade-in stagger-2">
                <div className="flex items-center space-x-3">
                  <div className="p-3 bg-earth-brown/10 rounded-lg">
                    <Building className="h-6 w-6 text-earth-brown" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Urban Expansion</p>
                    <p className="text-2xl font-bold">{urbanData.expansion}%</p>
                    <div className="flex items-center text-xs">
                      <TrendingUp className="h-3 w-3 text-orange-500 mr-1" />
                      <span className="text-orange-500">+{urbanData.change}%</span>
                    </div>
                  </div>
                </div>
              </Card>

              <Card className="eco-card fade-in stagger-3">
                <div className="flex items-center space-x-3">
                  <div className="p-3 bg-red-500/10 rounded-lg">
                    <AlertTriangle className="h-6 w-6 text-red-500" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Risk Areas</p>
                    <p className="text-2xl font-bold">{riskAreas.length}</p>
                    <p className="text-xs text-muted-foreground">Monitored</p>
                  </div>
                </div>
              </Card>
            </div>

            {/* Charts Placeholder */}
            <div className="grid lg:grid-cols-2 gap-6">
              <Card className="eco-card fade-in stagger-4">
                <h3 className="text-lg font-semibold mb-4">Global Forest Trends</h3>
                <div className="h-64 flex items-center justify-center bg-muted/30 rounded-lg">
                  <div className="text-center">
                    <Trees className="h-12 w-12 text-primary mx-auto mb-2" />
                    <p className="text-muted-foreground">Interactive forest coverage chart</p>
                  </div>
                </div>
              </Card>

              <Card className="eco-card fade-in stagger-5">
                <h3 className="text-lg font-semibold mb-4">Water Body Distribution</h3>
                <div className="h-64 flex items-center justify-center bg-muted/30 rounded-lg">
                  <div className="text-center">
                    <Droplets className="h-12 w-12 text-accent mx-auto mb-2" />
                    <p className="text-muted-foreground">Water quality and distribution map</p>
                  </div>
                </div>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="forests" className="space-y-6">
            <Card className="eco-card">
              <h3 className="text-xl font-semibold mb-6">Forest Coverage by Region</h3>
              <div className="space-y-6">
                {forestData.areas.map((area, index) => (
                  <div key={index} className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="font-medium">{area.name}</span>
                      <div className="flex items-center space-x-2">
                        <span className="text-sm">{area.coverage}%</span>
                        <span className={`text-sm ${area.change > 0 ? 'text-green-500' : 'text-red-500'}`}>
                          {area.change > 0 ? '+' : ''}{area.change}%
                        </span>
                      </div>
                    </div>
                    <Progress value={area.coverage} className="h-2" />
                  </div>
                ))}
              </div>
            </Card>
          </TabsContent>

          <TabsContent value="water" className="space-y-6">
            <div className="grid md:grid-cols-3 gap-6">
              {waterData.sources.map((source, index) => (
                <Card key={index} className="eco-card">
                  <div className="text-center space-y-3">
                    <Droplets className="h-8 w-8 text-accent mx-auto" />
                    <h3 className="font-semibold">{source.type}</h3>
                    <p className="text-2xl font-bold">{source.count.toLocaleString()}</p>
                    <span className={`inline-block px-2 py-1 rounded text-xs ${
                      source.status === 'Good' ? 'bg-green-100 text-green-800' :
                      source.status === 'Moderate' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-red-100 text-red-800'
                    }`}>
                      {source.status}
                    </span>
                  </div>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="risks" className="space-y-6">
            <div className="space-y-4">
              {riskAreas.map((area, index) => (
                <Card key={index} className="eco-card">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className={`w-3 h-3 rounded-full ${getRiskColor(area.risk)}`} />
                      <div>
                        <h3 className="font-semibold">{area.location}</h3>
                        <p className="text-sm text-muted-foreground">{area.threat}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className={`inline-block px-3 py-1 rounded-full text-xs text-white ${getRiskColor(area.risk)}`}>
                        {area.risk} Risk
                      </span>
                      <p className="text-xs text-muted-foreground mt-1">
                        Trend: {area.trend}
                      </p>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default NatureWatch;