
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/hooks/useAuth";
import ProtectedRoute from "@/components/ProtectedRoute";
import Layout from "./components/Layout";
import EcoHub from "./pages/EcoHub";
import AirMap from "./pages/AirMap";
import GrowGuide from "./pages/GrowGuide";
import CropDetails from "./pages/CropDetails";
import PlantCare from "./pages/PlantCare";
import TrashScan from "./pages/TrashScan";
import EarthFeed from "./pages/EarthFeed";
import FarmGuide from "./pages/FarmGuide";
import Dashboard from "./pages/Dashboard";
import SignIn from "./pages/SignIn";
import SignUp from "./pages/SignUp";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Layout />}>
              <Route index element={<EcoHub />} />
              <Route path="airmap" element={<AirMap />} />
              <Route path="growguide" element={<GrowGuide />} />
              <Route path="cropdetails" element={<CropDetails />} />
              <Route path="plantcare" element={<PlantCare />} />
              <Route path="trashscan" element={<TrashScan />} />
              <Route path="earthfeed" element={<EarthFeed />} />
              <Route path="farmguide" element={<FarmGuide />} />
              <Route path="dashboard" element={
                <ProtectedRoute>
                  <Dashboard />
                </ProtectedRoute>
              } />
            </Route>
            <Route path="/signin" element={<SignIn />} />
            <Route path="/signup" element={<SignUp />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
