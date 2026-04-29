
import { useState } from "react";
import { Upload, Camera, AlertCircle, CheckCircle, Leaf, Droplets, Sun } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";

const PlantCare = () => {
  const [analysisResult, setAnalysisResult] = useState(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const sampleAnalysis = {
    plantType: "Tomato Plant",
    healthScore: 75,
    issues: [
      { name: "Leaf Yellowing", severity: "Medium", description: "Lower leaves showing yellowing, possibly nitrogen deficiency" },
      { name: "Mild Aphid Infestation", severity: "Low", description: "Small population of aphids detected on young shoots" }
    ],
    recommendations: [
      { icon: Droplets, title: "Nitrogen Fertilizer", description: "Apply balanced liquid fertilizer weekly for 3 weeks" },
      { icon: Leaf, title: "Natural Pest Control", description: "Use neem oil spray or introduce ladybugs" },
      { icon: Sun, title: "Light Adjustment", description: "Ensure 6-8 hours of direct sunlight daily" }
    ],
    careSchedule: [
      { task: "Water deeply", frequency: "Every 2-3 days" },
      { task: "Check for pests", frequency: "Weekly" },
      { task: "Prune suckers", frequency: "Bi-weekly" },
      { task: "Apply fertilizer", frequency: "Monthly" }
    ]
  };

<<<<<<< HEAD
  const handleImageUpload = async (file: File) => {
    setIsAnalyzing(true);

    const formData = new FormData();
    formData.append("image", file);

    try {
      const res = await fetch("http://localhost:5001/analyze-plant", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();

      setAnalysisResult({
        plantType: data.plantType,
        healthScore: data.healthScore,
        issues: data.status === "Healthy"
          ? []
          : [
            {
              name: data.status,
              severity: "Medium",
              description: "Detected via AI analysis"
            }
          ],
        recommendations: sampleAnalysis.recommendations,
        careSchedule: sampleAnalysis.careSchedule
      });

    } catch (err) {
      console.error("Prediction failed", err);
    } finally {
      setIsAnalyzing(false);
    }
=======
  const handleImageUpload = () => {
    setIsAnalyzing(true);
    // Simulate analysis
    setTimeout(() => {
      setAnalysisResult(sampleAnalysis);
      setIsAnalyzing(false);
    }, 3000);
>>>>>>> 296181e207082c4565e1c682ea8f4a44d77b208e
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case "High": return "bg-red-100 text-red-800";
      case "Medium": return "bg-yellow-100 text-yellow-800";
      case "Low": return "bg-green-100 text-green-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <div className="min-h-screen bg-background p-4">
<<<<<<< HEAD
      <div className="max-w-5xl mx-auto">
=======
      <div className="max-w-4xl mx-auto">
>>>>>>> 296181e207082c4565e1c682ea8f4a44d77b208e
        {/* Header */}
        <div className="mb-8 text-center">
          <h1 className="text-4xl font-bold mb-2 fade-in">Plant Care</h1>
          <p className="text-xl text-muted-foreground fade-in stagger-1">
            AI-powered plant health analysis and care recommendations
          </p>
        </div>

        {!analysisResult && !isAnalyzing && (
          <Card className="eco-card fade-in stagger-2">
            <div className="text-center space-y-6 py-12">
              <div className="w-24 h-24 mx-auto bg-primary/10 rounded-full flex items-center justify-center">
                <Camera className="h-12 w-12 text-primary" />
              </div>
              <div>
                <h2 className="text-2xl font-semibold mb-2">Upload Plant Photo</h2>
                <p className="text-muted-foreground mb-6">
                  Take a clear photo of your plant for instant health analysis
                </p>
              </div>
<<<<<<< HEAD

             <div className="max-w-md mx-auto">
  <label
    htmlFor="plant-upload"
    className="block border-2 border-dashed border-border rounded-lg p-8 hover:border-primary/50 transition-colors cursor-pointer group"
  >
    <Upload className="h-12 w-12 text-muted-foreground group-hover:text-primary mx-auto mb-4 transition-colors" />

    <p className="text-sm text-muted-foreground mb-4 text-center">
      Drag and drop an image here, or click to browse
    </p>

    <div className="flex justify-center">
      <Button
        type="button"
        className="bg-gradient-primary pointer-events-none"
      >
        Choose Image
      </Button>
    </div>

    <input
      id="plant-upload"
      type="file"
      accept="image/*"
      className="hidden"
      onChange={(e) => {
        if (e.target.files?.[0]) {
          handleImageUpload(e.target.files[0]);
        }
      }}
    />
  </label>
</div>
=======
              
              <div className="max-w-md mx-auto">
                <div className="border-2 border-dashed border-border rounded-lg p-8 hover:border-primary/50 transition-colors cursor-pointer group">
                  <Upload className="h-12 w-12 text-muted-foreground group-hover:text-primary mx-auto mb-4 transition-colors" />
                  <p className="text-sm text-muted-foreground mb-4">
                    Drag and drop an image here, or click to browse
                  </p>
                  <Button onClick={handleImageUpload} className="bg-gradient-primary">
                    Choose Image
                  </Button>
                </div>
              </div>
>>>>>>> 296181e207082c4565e1c682ea8f4a44d77b208e

              <div className="text-sm text-muted-foreground max-w-md mx-auto">
                <p className="mb-3">💡 Tips for best results:</p>
                <div className="space-y-2 text-center">
                  <p className="flex items-center justify-center">• Use natural lighting</p>
                  <p className="flex items-center justify-center">• Include the whole plant if possible</p>
                  <p className="flex items-center justify-center">• Focus on affected areas</p>
                </div>
              </div>
            </div>
          </Card>
        )}

        {isAnalyzing && (
          <Card className="eco-card fade-in">
            <div className="text-center space-y-6 py-12">
              <div className="w-16 h-16 mx-auto bg-primary/10 rounded-full flex items-center justify-center animate-pulse">
                <Leaf className="h-8 w-8 text-primary" />
              </div>
              <div>
                <h2 className="text-xl font-semibold mb-4">Analyzing Your Plant...</h2>
                <Progress value={65} className="max-w-xs mx-auto" />
                <p className="text-sm text-muted-foreground mt-2">
                  Detecting plant type and health issues
                </p>
              </div>
            </div>
          </Card>
        )}

        {analysisResult && (
          <div className="space-y-6 fade-in">
            {/* Plant Identity & Health Score */}
            <Card className="eco-card">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-2xl font-semibold">{analysisResult.plantType}</h2>
                  <p className="text-muted-foreground">Analysis complete</p>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-primary mb-1">
                    {analysisResult.healthScore}%
                  </div>
                  <p className="text-sm text-muted-foreground">Health Score</p>
                </div>
              </div>
<<<<<<< HEAD

              <Progress value={analysisResult.healthScore} className="mb-4" />

=======
              
              <Progress value={analysisResult.healthScore} className="mb-4" />
              
>>>>>>> 296181e207082c4565e1c682ea8f4a44d77b208e
              <div className="flex items-center space-x-2">
                {analysisResult.healthScore >= 80 ? (
                  <CheckCircle className="h-5 w-5 text-green-500" />
                ) : (
                  <AlertCircle className="h-5 w-5 text-yellow-500" />
                )}
                <span className="text-sm">
<<<<<<< HEAD
                  {analysisResult.healthScore >= 80
                    ? "Your plant is in good health!"
=======
                  {analysisResult.healthScore >= 80 
                    ? "Your plant is in good health!" 
>>>>>>> 296181e207082c4565e1c682ea8f4a44d77b208e
                    : "Some issues detected - see recommendations below"
                  }
                </span>
              </div>
            </Card>

            {/* Issues Detected */}
            {analysisResult.issues.length > 0 && (
              <Card className="eco-card">
                <h3 className="text-lg font-semibold mb-4 flex items-center">
                  <AlertCircle className="h-5 w-5 mr-2 text-yellow-500" />
                  Issues Detected
                </h3>
                <div className="space-y-3">
                  {analysisResult.issues.map((issue, index) => (
                    <div key={index} className="p-4 bg-secondary rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-medium">{issue.name}</h4>
                        <Badge className={getSeverityColor(issue.severity)}>
                          {issue.severity}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">{issue.description}</p>
                    </div>
                  ))}
                </div>
              </Card>
            )}

            {/* Recommendations */}
            <Card className="eco-card">
              <h3 className="text-lg font-semibold mb-4 flex items-center">
                <CheckCircle className="h-5 w-5 mr-2 text-green-500" />
                Recommended Actions
              </h3>
              <div className="grid md:grid-cols-3 gap-4">
                {analysisResult.recommendations.map((rec, index) => (
                  <div key={index} className="p-4 bg-secondary rounded-lg text-center space-y-3">
                    <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto">
                      <rec.icon className="h-6 w-6 text-primary" />
                    </div>
                    <h4 className="font-medium">{rec.title}</h4>
                    <p className="text-sm text-muted-foreground">{rec.description}</p>
                  </div>
                ))}
              </div>
            </Card>

            {/* Care Schedule */}
            <Card className="eco-card">
              <h3 className="text-lg font-semibold mb-4">Care Schedule</h3>
              <div className="space-y-3">
                {analysisResult.careSchedule.map((item, index) => (
                  <div key={index} className="flex justify-between items-center p-3 bg-secondary rounded-lg">
                    <span className="font-medium">{item.task}</span>
                    <span className="text-sm text-muted-foreground">{item.frequency}</span>
                  </div>
                ))}
              </div>
            </Card>

            <div className="text-center">
<<<<<<< HEAD
              <Button
                onClick={() => setAnalysisResult(null)}
=======
              <Button 
                onClick={() => setAnalysisResult(null)} 
>>>>>>> 296181e207082c4565e1c682ea8f4a44d77b208e
                variant="outline"
                className="mr-4"
              >
                Analyze Another Plant
              </Button>
              <Button className="bg-gradient-primary">
                Save to My Plants
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default PlantCare;
