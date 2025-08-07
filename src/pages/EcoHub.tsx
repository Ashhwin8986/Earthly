import { useEffect } from "react";
import { ArrowRight, Leaf, Globe, BarChart3, Shield, MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Link } from "react-router-dom";
import { ParticleButton } from "@/components/ui/particle-button";
import heroImage from "@/assets/hero-earth.jpg";
import ChatBot from "@/components/ChatBot";

const EcoHub = () => {
  const isSignedIn = false;

  const handleTalkToSprout = () => {
    const chatIconButton = document.querySelector<HTMLButtonElement>(
      'button[class*="fixed"][class*="bottom-6"][class*="right-6"]'
    );
    chatIconButton?.click(); // Simulate click on the chatbot's floating button
  };

  const features = [
    {
      icon: Globe,
      title: "Air Quality Monitoring",
      description: "Real-time pollution tracking and health recommendations",
      color: "text-accent",
    },
    {
      icon: Leaf,
      title: "Nature Conservation",
      description: "Track forest cover, water bodies, and biodiversity",
      color: "text-primary",
    },
    {
      icon: BarChart3,
      title: "Agricultural Insights",
      description: "Crop calendars, plant health, and sustainable farming",
      color: "text-eco-highlight",
    },
    {
      icon: Shield,
      title: "Environmental Alerts",
      description: "Early warnings for pollution and climate risks",
      color: "text-earth-brown",
    },
  ];

  return (
    <div className="min-h-screen landing-page -mt-[4rem]">  {/*added negative margin*/}
      {/* Hero Section */}
      <section id="hero-section"  className="relative h-screen flex items-center justify-center overflow-hidden">
        <div 
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{ backgroundImage: `url(${heroImage})` }}
        />
        <div className="absolute inset-0 bg-gradient-to-br from-primary/40 via-transparent to-accent/20 " />
        
        <div className="relative z-10 text-center px-4 max-w-4xl mx-auto">
          <h1 className="text-5xl md:text-7xl font-bold text-white mb-6 fade-in">
            Tracking Nature's
            <span className="block text-eco-highlight">Pulse, Beautifully</span>
          </h1>
          <p className="text-xl md:text-2xl text-white/90 mb-8 fade-in stagger-1 font-lora">
            Monitor air quality, protect nature, and grow sustainably with 
            real-time environmental insights.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center fade-in stagger-2">
            <Link to={isSignedIn ? "/dashboard" : "/dashboard"}>
              <Button 
                size="lg" 
                className="bg-white text-primary hover:bg-white/90 hover-scale"
              >
                Start Monitoring
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>

            {/* Talk to Sprout opens ChatBot via icon click */}
            <Button 
              size="lg" 
              variant="outline"
              className="border-white/60 text-white bg-transparent hover:bg-transparent backdrop-blur-sm hover:shadow-lg hover:shadow-white/10 hover:border-white/80" 
              onClick={handleTalkToSprout}
            >
              Talk To Sprout
            </Button>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-background">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4 fade-in font-lora">
              Environmental Intelligence
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto fade-in stagger-1 font-lora">
              Comprehensive tools to understand, monitor, and protect our environment
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <Card key={index} className="eco-feature-card fade-in hover-glow" style={{ animationDelay: `${index * 0.1}s` }}>
                <div className="text-center space-y-4">
                  <div className={`w-16 h-16 ${feature.color} bg-current/10 rounded-full flex items-center justify-center mx-auto`}>
                    <feature.icon className={`h-8 w-8 ${feature.color}`} />
                  </div>
                  <h3 className="text-xl font-semibold manrope-heading">{feature.title}</h3>
                  <p className="text-muted-foreground font-lora">{feature.description}</p>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Mission Section */}
      <section className="py-20 bg-gradient-earth">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-6 fade-in font-lora">
            Our Mission
          </h2>
          <p className="text-xl text-muted-foreground leading-relaxed fade-in stagger-1 font-lora">
            To empower individuals, communities, and organizations with actionable 
            environmental data that drives positive change for our planet's future.
          </p>
          <div className="mt-12 fade-in stagger-2">
            <Link to="/signup">
              <ParticleButton size="lg" className="bg-gradient-primary hover:opacity-90">
                Join Our Mission
              </ParticleButton>
            </Link>
          </div>
        </div>
      </section>

      {/* Mount ChatBot (this keeps it on the screen) */}
      <ChatBot />
    </div>
  );
};

export default EcoHub;
