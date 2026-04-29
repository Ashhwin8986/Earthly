import { useState } from "react";
import { Upload, Camera, Leaf, Droplets, Sun, Sprout, TrendingUp, ArrowLeft, Calculator } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

// Add interfaces for type safety
interface SoilClassification {
  soilType: string;
  confidence: number;
}

interface CropRecommendation {
  recommended: string;
  alternatives: string[];
  season: string;
  rainfall: string;
  irrigation: string;
  temperature?: number;
  rainfallValue?: number;
}

interface YieldResult {
  areaHectares: number;
  areaAcres: number;
  yieldPerHectare: number;
  totalYield: number;
  totalYieldKg: number;
  estimatedIncome: number;
}

const FarmGuide = () => {
  const [currentScreen, setCurrentScreen] = useState('upload');
  const [soilClassification, setSoilClassification] = useState<SoilClassification | null>(null); // FIXED: Added type
  const [cropRecommendation, setCropRecommendation] = useState<CropRecommendation | null>(null); // FIXED: Added type
  const [uploadedImage, setUploadedImage] = useState<string | null>(null); // FIXED: Added type
  const [showYieldCalculator, setShowYieldCalculator] = useState(false);
  const [yieldResult, setYieldResult] = useState<YieldResult | null>(null); // FIXED: Added type
  const [unit, setUnit] = useState("meters"); // ✅ FIXED


  // Base yield derived from DES Normal Estimates (2016–17 to 2020–21)
  const baseYield: Record<string, number> = {
    'Rice': 26.07, 'Wheat': 33.84, 'Cotton': 4.45, 'Sugarcane': 776.09,
    'Maize': 29.55, 'Groundnut': 16.88, 'Soybean': 10.84, 'Bajra': 12.83,
    'Jowar': 9.0, 'Gram': 10.59, 'Jute': 25.40, 'Pulses': 6.16, 'Mustard': 13.87

  };

  // Adjustment factors
  const soilFactor: Record<string, number> = {
    'Black Soil': 1.1,
    'Alluvial Soil': 1.15,
    'Red Soil': 0.95,
    'Clay Soil': 1.0
  };

  const irrigationFactor: Record<string, number> = {
    'Available': 1.2,
    'Not Available': 0.8
  };

  const rainfallFactor: Record<string, number> = {
    'High': 1.1,
    'Medium': 1.0,
    'Low': 0.85
  };

  // MSP (Minimum Support Price) per quintal
  const msp: Record<string, number> = {
    'Rice': 2183, 'Wheat': 2275, 'Cotton': 6620,
    'Maize': 2090, 'Groundnut': 6377, 'Soybean': 4600,
    'Gram': 5440, 'Mustard': 5650, 'Bajra': 2500,
    'Jowar': 3180, 'Sugarcane': 340
  };

  // Get current season
  const getCurrentSeason = () => {
    const month = new Date().getMonth() + 1;
    if (month >= 6 && month <= 10) return 'Kharif';
    if (month >= 11 || month <= 3) return 'Rabi';
    return 'Kharif';
  };

  const classifySoil = async (imageFile: File): Promise<SoilClassification> => {
    const formData = new FormData();
    formData.append("image", imageFile);

    const response = await fetch("http://127.0.0.1:5001/predict-soil", {
      method: "POST",
      body: formData
    });

    if (!response.ok) {
      throw new Error("Soil classification failed");
    }

    const data = await response.json();
    return {
      soilType: data.soilType,
      confidence: data.confidence
    };
  };


  // 🔄 UPDATED HYBRID MODEL
  const calculateYield = (
    crop: string,
    soilType: string,
    length: number,
    width: number,
    unit: string,
    irrigation: string,
    rainfallCategory: string,   // still used for UI
    rainfallValue: number,      // actual mm
    temperature: number
  ): YieldResult => {

    // ✅ FIXED: Proper area conversion
    let areaHectares;

    if (unit === "meters") {
      areaHectares = (length * width) / 10000; // m² → hectares
    } else if (unit === "feet") {
      areaHectares = (length * width) / 107639; // ft² → hectares
    } else if (unit === "acres") {
      areaHectares = length * 0.4047; // ✅ acres → hectares
    } else {
      areaHectares = 0;
    }

    const base = baseYield[crop] ?? 20;
    const soilAdj = soilFactor[soilType] ?? 1.0;
    const irrAdj = irrigationFactor[irrigation] ?? 1.0;

    // ✅ Continuous rainfall factor
    const rainAdj = 1 + (rainfallValue / 300);

    // ✅ Temperature factor
    let tempAdj = 1.0;
    if (temperature < 15) tempAdj = 0.8;
    else if (temperature < 25) tempAdj = 1.0;
    else if (temperature < 35) tempAdj = 1.1;
    else tempAdj = 0.9;

    // ✅ Final yield formula
    const yieldPerHectare = Math.min(
      base * soilAdj * irrAdj * rainAdj * tempAdj,
      base * 1.8
    );

    const totalYield = yieldPerHectare * areaHectares;

    console.log("DEBUG INPUTS:", {
      crop,
      soilType,
      length,
      width,
      unit,
      irrigation,
      rainfallValue,
      temperature
    });

    return {
      areaHectares,
      areaAcres: areaHectares * 2.471,
      yieldPerHectare,
      totalYield,
      totalYieldKg: totalYield * 100,
      estimatedIncome: msp[crop] ? totalYield * msp[crop] : 0
    };
  };

  const getCropRecommendation = async (imageFile: File, location: string) => {
    const formData = new FormData();
    formData.append("image", imageFile);
    formData.append("location", location);

    const response = await fetch("http://127.0.0.1:5000/recommend", {
      method: "POST",
      body: formData,
    });

    if (!response.ok) {
      throw new Error("Crop recommendation failed");
    }

    const data = await response.json();
    return data;
  };

  // const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
  //   const file = event.target.files?.[0];
  //   if (!file) return;

  //   setCurrentScreen("analyzing");

  //   const reader = new FileReader();
  //   reader.onload = e => setUploadedImage(e.target?.result as string);
  //   reader.readAsDataURL(file);

  //   try {
  //     // You must have location stored somewhere
  //     const location = localStorage.getItem("userLocation") || "Delhi";

  //     const result = await getCropRecommendation(file, location);

  //     setSoilClassification({
  //       soilType: result.soil_type,
  //       confidence: 0 // backend already filtered, confidence optional
  //     });

  //     setCropRecommendation({
  //       recommended: result.recommended_crop,
  //       alternatives: result.top_5_crops.slice(1, 3),
  //       season: "",
  //       rainfall: "",
  //       irrigation: ""
  //     });

  //     setCurrentScreen("results");

  //   } catch (err) {
  //     alert("Recommendation failed. Check backend.");
  //     resetAll();
  //   }
  // };

  // 🔄 UPDATED
  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setCurrentScreen("analyzing");

    const reader = new FileReader();
    reader.onload = e => setUploadedImage(e.target?.result as string);
    reader.readAsDataURL(file);

    try {
      const location = localStorage.getItem("userLocation") || "Delhi";

      const result = await getCropRecommendation(file, location);

      setSoilClassification({
        soilType: result.soil_type,
        confidence: 0
      });

      setCropRecommendation({
        recommended: result.recommended_crop,
        alternatives: result.top_5_crops.slice(1, 3),
        season: "",
        rainfall: "",
        irrigation: "",

        temperature: result.temperature,     // ✅ NEW
        rainfallValue: result.rainfall       // ✅ NEW (numeric mm)
      });

      setCurrentScreen("results");

    } catch (err) {
      alert("Recommendation failed. Check backend.");
      resetAll();
    }
  };

  // Handle yield calculation
  // const handleYieldCalculation = ({
  //   length,
  //   width
  // }: {
  //   length: string;
  //   width: string;
  // }) => {
  //   if (!cropRecommendation || !soilClassification) return;

  //   setYieldResult(
  //     calculateYield(
  //       cropRecommendation.recommended,
  //       soilClassification.soilType,
  //       parseFloat(length),
  //       parseFloat(width),
  //       unit,
  //       cropRecommendation.irrigation,
  //       cropRecommendation.rainfall
  //     )
  //   );
  // };

  // 🔄 UPDATED
  const handleYieldCalculation = ({
    length,
    width
  }: {
    length: string;
    width: string;
  }) => {
    if (!cropRecommendation || !soilClassification) return;

    setYieldResult(
      calculateYield(
        cropRecommendation.recommended,
        soilClassification.soilType,
        parseFloat(length),
        parseFloat(width),
        unit,
        cropRecommendation.irrigation,
        cropRecommendation.rainfall,
        cropRecommendation.rainfallValue ?? 0,   // ✅ NEW
        cropRecommendation.temperature ?? 25     // ✅ NEW
      )
    );
  };


  const getSoilColor = (soilType: string) => {
    switch (soilType) {
      case "Black Soil": return "bg-gray-800 text-white";
      case "Red Soil": return "bg-red-800 text-white";
      case "Alluvial Soil": return "bg-amber-700 text-white";
      case "Clay Soil": return "bg-orange-900 text-white";
      default: return "bg-gray-700 text-white";
    }
  };

  const resetAll = () => {
    setCurrentScreen('upload');
    setSoilClassification(null);
    setCropRecommendation(null);
    setUploadedImage(null);
    setShowYieldCalculator(false);
    setYieldResult(null);
  };

  // SCREEN 1: Upload Image
  if (currentScreen === 'upload') {
    return (
      <div className="min-h-screen bg-background p-4">
        <div className="max-w-5xl mx-auto">
          <div className="mb-8 text-center">
            <h1 className="text-4xl font-bold mb-2 fade-in">Farm Guide</h1>
            <p className="text-xl text-muted-foreground fade-in stagger-1">
              AI-powered soil analysis, crop recommendation & yield prediction
            </p>
          </div>

          <Card className="eco-card fade-in stagger-2">
            <div className="text-center space-y-6 py-12">
              <div className="w-24 h-24 mx-auto bg-primary/10 rounded-full flex items-center justify-center">
                <Camera className="h-12 w-12 text-primary" />
              </div>
              <div>
                <h2 className="text-2xl font-semibold mb-2">Upload Soil Image</h2>
                <p className="text-muted-foreground mb-6">
                  Take a clear photo of your soil for instant analysis
                </p>
              </div>

              <div className="max-w-md mx-auto">
  <label
    htmlFor="image-upload"
    className="border-2 border-dashed border-border rounded-lg p-8 hover:border-primary/50 transition-colors cursor-pointer group block"
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
      id="image-upload"
      type="file"
      accept="image/*"
      onChange={handleImageUpload}
      className="hidden"
    />
  </label>
</div>

              <div className="text-sm text-muted-foreground max-w-md mx-auto">
                <p className="mb-3">💡 Tips for best results:</p>
                <div className="space-y-2 text-center">
                  <p>• Use natural lighting</p>
                  <p>• Capture soil texture clearly</p>
                  <p>• Avoid shadows</p>
                </div>
              </div>
            </div>
          </Card>
        </div>
      </div>
    );
  }

  // SCREEN 2: Analyzing
  if (currentScreen === 'analyzing') {
    return (
      <div className="min-h-screen bg-background p-4">
        <div className="max-w-5xl mx-auto">
          <div className="mb-8 text-center">
            <h1 className="text-4xl font-bold mb-2">Farm Guide</h1>
          </div>

          <Card className="eco-card fade-in">
            <div className="text-center space-y-6 py-12">
              <div className="w-16 h-16 mx-auto bg-primary/10 rounded-full flex items-center justify-center animate-pulse">
                <Leaf className="h-8 w-8 text-primary" />
              </div>
              <div>
                <h2 className="text-xl font-semibold mb-4">Analyzing Your Soil...</h2>
                <Progress value={65} className="max-w-xs mx-auto" />
                <p className="text-sm text-muted-foreground mt-2">
                  Detecting soil type and recommending crops
                </p>
              </div>
            </div>
          </Card>
        </div>
      </div>
    );
  }

  // SCREEN 3: Results - Add null check
  if (!soilClassification || !cropRecommendation) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background p-4">
      <div className="max-w-5xl mx-auto">
        <div className="mb-8">
          <Button
            variant="ghost"
            onClick={resetAll}
            className="mb-4"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Upload
          </Button>
          <div className="text-center">
            <h1 className="text-4xl font-bold mb-2">Farm Guide</h1>
            <p className="text-xl text-muted-foreground">
              Your personalized crop recommendation
            </p>
          </div>
        </div>

        <div className="space-y-6 fade-in">
          {/* Soil Classification Result */}
          <Card className="eco-card">
            <div className="flex flex-col md:flex-row items-center gap-6">
              {uploadedImage && (
                <img
                  src={uploadedImage}
                  alt="Uploaded soil"
                  className="w-32 h-32 object-cover rounded-lg"
                />
              )}
              <div className="flex-1">
                <h3 className="text-sm text-muted-foreground mb-2">Detected Soil Type</h3>
                <Badge className={`${getSoilColor(soilClassification.soilType)} text-lg px-4 py-2 mb-2`}>
                  {soilClassification.soilType}
                </Badge>
                <p className="text-sm text-muted-foreground">
                  Confidence: {soilClassification.confidence.toFixed(1)}%
                </p>
              </div>
              <div className="text-center">
                <h3 className="text-sm text-muted-foreground mb-2">Current Season</h3>
                <Badge className="bg-green-600 text-white text-lg px-4 py-2">
                  {cropRecommendation.season}
                </Badge>
              </div>
            </div>
          </Card>

          {/* Recommended Crop - Main Card */}
          <Card className="eco-card">
            <h3 className="text-lg font-semibold mb-4 flex items-center">
              <Sprout className="h-5 w-5 mr-2 text-green-500" />
              Recommended Crop for Your Field
            </h3>

            <div className="p-8 bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-lg text-center mb-6">
              <Leaf className="h-16 w-16 text-green-600 mx-auto mb-4" />
              <h2 className="text-4xl font-bold text-green-700 dark:text-green-400 mb-3">
                {cropRecommendation.recommended}
              </h2>
              <p className="text-muted-foreground">
                Best suited for {soilClassification.soilType} in {cropRecommendation.season} season
              </p>
            </div>

            {cropRecommendation.alternatives.length > 0 && (
              <div>
                <p className="text-sm font-medium mb-3">Alternative Crops:</p>
                <div className="flex flex-wrap gap-2">
                  {cropRecommendation.alternatives.map((crop, idx) => (
                    <Badge key={idx} variant="outline" className="text-base px-4 py-2">
                      {crop}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
          </Card>

          {/* Growing Conditions */}
          <Card className="eco-card">
            <h3 className="text-lg font-semibold mb-4">Growing Conditions</h3>
            <div className="grid md:grid-cols-3 gap-4">
              <div className="flex items-center space-x-3 p-4 bg-secondary rounded-lg">
                <Droplets className="h-8 w-8 text-blue-500" />
                <div>
                  <p className="text-sm text-muted-foreground">Rainfall</p>
                  <p className="font-semibold">{cropRecommendation.rainfall}</p>
                </div>
              </div>
              <div className="flex items-center space-x-3 p-4 bg-secondary rounded-lg">
                <Sun className="h-8 w-8 text-orange-500" />
                <div>
                  <p className="text-sm text-muted-foreground">Irrigation</p>
                  <p className="font-semibold">{cropRecommendation.irrigation}</p>
                </div>
              </div>
              <div className="flex items-center space-x-3 p-4 bg-secondary rounded-lg">
                <Leaf className="h-8 w-8 text-green-500" />
                <div>
                  <p className="text-sm text-muted-foreground">Season</p>
                  <p className="font-semibold">{cropRecommendation.season}</p>
                </div>
              </div>
            </div>
          </Card>

          {/* Yield Calculator Toggle */}
          {!showYieldCalculator && !yieldResult && (
            <Card className="eco-card">
              <div className="text-center py-6">
                <Calculator className="h-12 w-12 text-primary mx-auto mb-4" />
                <h3 className="text-xl font-semibold mb-2">Want to know expected yield?</h3>
                <p className="text-muted-foreground mb-6">
                  Calculate estimated crop yield and income for your land
                </p>
                <Button
                  onClick={() => setShowYieldCalculator(true)}
                  className="bg-gradient-primary"
                >
                  Calculate Yield
                </Button>
              </div>
            </Card>
          )}

          {/* Yield Calculator Form */}
          {showYieldCalculator && !yieldResult && (
            <Card className="eco-card">
              <h3 className="text-lg font-semibold mb-4 flex items-center">
                <TrendingUp className="h-5 w-5 mr-2 text-blue-500" />
                Yield Calculator
              </h3>

              <form onSubmit={(e: React.FormEvent<HTMLFormElement>) => { // FIXED: Added proper type
                e.preventDefault();
                const formData = new FormData(e.currentTarget); // FIXED: Changed to e.currentTarget
                handleYieldCalculation({
                  length: formData.get('length') as string,
                  width: formData.get('width') as string
                });
              }}>
                <div className="space-y-4">
                  <p className="text-sm text-muted-foreground">
                    Enter your land dimensions to calculate expected yield
                  </p>

                  <div className="grid md:grid-cols-3 gap-4">
                    <div>
                      <Label htmlFor="length">Length</Label>
                      <Input
                        id="length"
                        name="length"
                        type="number"
                        step="0.01"
                        placeholder="100"
                        required
                      />
                    </div>

                    <div>
                      <Label htmlFor="width">Width</Label>
                      <Input
                        id="width"
                        name="width"
                        type="number"
                        step="0.01"
                        placeholder="80"
                        required
                      />
                    </div>

                    <div>
                      <Label htmlFor="unit">Unit</Label>
                      <Select
                        value={unit}
                        onValueChange={(value) => setUnit(value)}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="meters">Meters</SelectItem>
                          <SelectItem value="feet">Feet</SelectItem>
                          <SelectItem value="acres">Acres</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="flex gap-4 pt-4">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setShowYieldCalculator(false)}
                      className="flex-1"
                    >
                      Cancel
                    </Button>
                    <Button type="submit" className="bg-gradient-primary flex-1">
                      Calculate
                    </Button>
                  </div>
                </div>
              </form>
            </Card>
          )}

          {/* Yield Results */}
          {yieldResult && (
            <Card className="eco-card">
              <h3 className="text-lg font-semibold mb-4 flex items-center">
                <TrendingUp className="h-5 w-5 mr-2 text-blue-500" />
                Yield Prediction for {cropRecommendation.recommended}
              </h3>

              <div className="grid md:grid-cols-3 gap-4 mb-6">
                <div className="p-4 bg-secondary rounded-lg text-center">
                  <p className="text-sm text-muted-foreground mb-1">Land Area</p>
                  <p className="text-2xl font-bold">
                    {yieldResult.areaHectares.toFixed(2)}
                  </p>
                  <p className="text-sm text-muted-foreground">hectares</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    ({yieldResult.areaAcres.toFixed(2)} acres)
                  </p>
                </div>

                <div className="p-4 bg-secondary rounded-lg text-center">
                  <p className="text-sm text-muted-foreground mb-1">Yield/Hectare</p>
                  <p className="text-2xl font-bold">
                    {yieldResult.yieldPerHectare.toFixed(1)}
                  </p>
                  <p className="text-sm text-muted-foreground">quintals</p>
                </div>

                <div className="p-4 bg-secondary rounded-lg text-center">
                  <p className="text-sm text-muted-foreground mb-1">Total Yield</p>
                  <p className="text-2xl font-bold">
                    {yieldResult.totalYield.toFixed(1)}
                  </p>
                  <p className="text-sm text-muted-foreground">quintals</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    ({yieldResult.totalYieldKg.toFixed(0)} kg)
                  </p>
                </div>
              </div>

              {yieldResult.estimatedIncome > 0 && (
                <div className="p-6 bg-gradient-to-r from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20 rounded-lg text-center">
                  <p className="text-sm text-muted-foreground mb-2">Estimated Income (at MSP)</p>
                  <p className="text-4xl font-bold text-blue-700 dark:text-blue-400">
                    ₹{yieldResult.estimatedIncome.toLocaleString('en-IN')}
                  </p>
                </div>
              )}

              <div className="mt-4 p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
                <p className="text-sm text-yellow-800 dark:text-yellow-200">
                  ⚠️ Note: These are estimated values based on standard agricultural data.
                  Actual yield may vary based on farming practices, weather conditions, and pest management.
                </p>
              </div>

              <div className="mt-4 text-center">
                <Button
                  variant="outline"
                  onClick={() => {
                    setYieldResult(null);
                    setShowYieldCalculator(true);
                  }}
                >
                  Recalculate
                </Button>
              </div>
            </Card>
          )}

          {/* Action Buttons */}
          <div className="text-center space-x-4 pb-8">
            <Button
              onClick={resetAll}
              variant="outline"
            >
              Analyze Another Field
            </Button>
            <Button className="bg-gradient-primary">
              Save Report
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FarmGuide;