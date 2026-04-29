
import { useState } from "react";
import { Upload, Camera, RotateCcw, Info } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

const TrashScan = () => {
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const [scanResults, setScanResults] = useState<any[]>([]);
  const [isScanning, setIsScanning] = useState(false);

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setUploadedImage(e.target?.result as string);
        simulateScan();
      };
      reader.readAsDataURL(file);
    }
  };

  const simulateScan = () => {
    setIsScanning(true);
    // Simulate ML processing time
    setTimeout(() => {
      setScanResults([
        {
          item: "Plastic Bottle",
          classification: "Non-Biodegradable",
          tip: "Rinse and recycle in plastic recycling bin. Remove cap and label if possible."
        },
        {
          item: "Food Waste",
          classification: "Biodegradable",
          tip: "Compost in organic waste bin or home compost system."
        },
        {
          item: "Battery",
          classification: "Chemical Waste",
          tip: "Take to designated e-waste collection center. Never dispose in regular trash."
        }
      ]);
      setIsScanning(false);
    }, 2000);
  };

  const getClassificationColor = (classification: string) => {
    switch (classification) {
      case "Biodegradable": return "bg-green-100 text-green-800";
      case "Non-Biodegradable": return "bg-blue-100 text-blue-800";
      case "Chemical Waste": return "bg-red-100 text-red-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  const resetScan = () => {
    setUploadedImage(null);
    setScanResults([]);
    setIsScanning(false);
  };

  return (
    <div className="min-h-screen bg-background p-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold mb-2 fade-in">Trash Scan</h1>
          <p className="text-xl text-muted-foreground fade-in stagger-1">
            Identify waste types and get disposal tips
          </p>
        </div>

        {/* Upload Section */}
        <Card className="eco-card mb-8 fade-in stagger-2">
          {!uploadedImage ? (
            <div className="text-center space-y-6">
              <div className="border-2 border-dashed border-border rounded-lg p-12 hover:border-primary transition-colors">
                <Camera className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">Upload Waste Image</h3>
                <p className="text-muted-foreground mb-4">
                  Drag and drop an image here, or click to select
                </p>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                  id="image-upload"
                />
                <label htmlFor="image-upload">
                  <Button className="bg-gradient-primary hover-scale cursor-pointer">
                    <Upload className="h-4 w-4 mr-2" />
                    Choose Image
                  </Button>
                </label>
              </div>
              
              {/* Info Box */}
              <div className="flex items-start space-x-3 p-4 bg-secondary rounded-lg text-left">
                <Info className="h-5 w-5 text-accent mt-0.5 flex-shrink-0" />
                <div className="text-sm">
                  <p className="font-medium mb-1">How it works:</p>
                  <p className="text-muted-foreground">
                    Our AI model analyzes your image to identify different types of waste and provides 
                    appropriate disposal recommendations based on environmental best practices.
                  </p>
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Image Preview */}
              <div className="text-center">
                <img 
                  src={uploadedImage} 
                  alt="Uploaded waste" 
                  className="max-w-full h-64 object-contain mx-auto rounded-lg"
                />
              </div>

              {/* Reset Button */}
              <div className="text-center">
                <Button onClick={resetScan} variant="outline" className="hover-scale">
                  <RotateCcw className="h-4 w-4 mr-2" />
                  Try Another Image
                </Button>
              </div>
            </div>
          )}
        </Card>

        {/* Scanning Loading */}
        {isScanning && (
          <Card className="eco-card mb-8 fade-in">
            <div className="text-center space-y-4">
              <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full mx-auto" />
              <p className="text-muted-foreground">Analyzing image...</p>
            </div>
          </Card>
        )}

        {/* ML Output Section */}
        {scanResults.length > 0 && !isScanning && (
          <Card className="eco-card fade-in stagger-3">
            <h3 className="text-xl font-semibold mb-6">Scan Results</h3>
            <div className="space-y-4">
              {scanResults.map((result, index) => (
                <div key={index} className="p-4 border border-border rounded-lg hover:shadow-md transition-shadow">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="space-y-2">
                      <div className="flex items-center gap-3">
                        <h4 className="font-semibold">{result.item}</h4>
                        <Badge className={getClassificationColor(result.classification)}>
                          {result.classification}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">{result.tip}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        )}
      </div>
    </div>
  );
};

export default TrashScan;
