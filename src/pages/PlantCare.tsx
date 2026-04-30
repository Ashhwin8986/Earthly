import { useState } from "react";
import { Upload, Camera, AlertCircle, CheckCircle, Leaf, Droplets, Sun } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";

const PlantCare = () => {
  const [analysisResult, setAnalysisResult] = useState(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  // ✅ NEW: Hardcoded actions
  const getActions = (disease: string) => {
    const d = disease.toLowerCase();

    if (d.includes("blight")) {
      return [
        "Remove infected leaves immediately",
        "Apply fungicide weekly",
        "Avoid overhead watering"
      ];
    }

    if (d.includes("spot")) {
      return [
        "Use copper-based spray",
        "Ensure proper air circulation",
        "Avoid leaf wetness"
      ];
    }

    if (d.includes("healthy")) {
      return [
        "Maintain regular watering",
        "Provide 6-8 hours sunlight",
        "Monitor plant weekly"
      ];
    }

    return [
      "Inspect plant regularly",
      "Maintain proper watering",
      "Use organic fertilizer"
    ];
  };

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
        disease: data.disease,
        confidence: data.confidence,
        topPredictions: data.topPredictions,
        image: data.image   // ✅ ADD THIS
      });

    } catch (err) {
      console.error("Prediction failed", err);
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <div className="min-h-screen bg-background p-4">
      <div className="max-w-5xl mx-auto">

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

              <div className="max-w-md mx-auto">
                <div className="border-2 border-dashed border-border rounded-lg p-8 hover:border-primary/50 transition-colors cursor-pointer group">
                  <Upload className="h-12 w-12 text-muted-foreground group-hover:text-primary mx-auto mb-4 transition-colors" />
                  <p className="text-sm text-muted-foreground mb-4">
                    Drag and drop an image here, or click to browse
                  </p>
                  <input
                    type="file"
                    accept="image/*"
                    hidden
                    id="plant-upload"
                    onChange={(e) => {
                      if (e.target.files?.[0]) {
                        handleImageUpload(e.target.files[0]);
                      }
                    }}
                  />

                  <Button
                    onClick={() => document.getElementById("plant-upload")?.click()}
                    className="bg-gradient-primary"
                  >
                    Choose Image
                  </Button>
                </div>
              </div>

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

            {/* ✅ ADD IMAGE HERE */}
            {analysisResult.image && (
              <div className="mb-4 flex justify-center">
                <img
                  src={analysisResult.image}  
                  alt="Uploaded Plant"
                  className="rounded-lg max-h-80"
                />
              </div>
            )}

            {/* ✅ FIRST BOX (UPDATED) */}
            <Card className="eco-card">
              <div className="flex items-center justify-between">

                <div>
                  <h2 className="text-2xl font-semibold">
                    {analysisResult.disease}
                  </h2>
                  <p className="text-muted-foreground">
                    {analysisResult.plantType}
                  </p>
                  <p className="text-muted-foreground">
                    Analysis complete
                  </p>
                </div>

                <div className="text-center">
                  <div className="text-3xl font-bold text-primary mb-1">
                    {analysisResult.confidence}%
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Confidence
                  </p>
                </div>

              </div>
            </Card>

            {/* ✅ NEW: TOP PREDICTIONS BOX */}
            <Card className="eco-card">
              <h3 className="text-lg font-semibold mb-4">
                Other Possible Predictions
              </h3>

              <div className="space-y-3">
                {analysisResult.topPredictions.map((pred, index) => (
                  <div key={index} className="flex justify-between p-4 bg-secondary rounded-lg">
                    <div>
                      <h4 className="font-medium">{pred.disease}</h4>
                      <p className="text-sm text-muted-foreground">{pred.plant}</p>
                    </div>
                    <span className="font-medium">{pred.confidence}%</span>
                  </div>
                ))}
              </div>
            </Card>

            {/* ✅ REPLACED: ACTIONS BOX */}
            <Card className="eco-card">
              <h3 className="text-lg font-semibold mb-4 flex items-center">
                <CheckCircle className="h-5 w-5 mr-2 text-green-500" />
                Recommended Actions
              </h3>

              <div className="grid md:grid-cols-3 gap-4">
                {getActions(analysisResult.disease).map((action, index) => (
                  <div key={index} className="p-4 bg-secondary rounded-lg text-center">
                    <p className="text-sm">{action}</p>
                  </div>
                ))}
              </div>
            </Card>

            {/* BUTTONS (UNCHANGED) */}
            <div className="text-center">
              <Button
                onClick={() => setAnalysisResult(null)}
                variant="outline"
                className="mr-4"
              >
                Analyze Another Plant
              </Button>
            </div>

          </div>
        )}
      </div>
    </div>
  );
};

export default PlantCare;
