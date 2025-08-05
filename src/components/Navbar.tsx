import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { Menu, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import ProfileDrawer from "@/components/ProfileDrawer";

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isProfileDrawerOpen, setIsProfileDrawerOpen] = useState(false);
  const [isPastHero, setIsPastHero] = useState(false);
  const location = useLocation();
  const { user, loading } = useAuth();

  // Transparent navbar for landing page and EcoHub page
  const isLandingPage = location.pathname === "/" || location.pathname === "/ecohub";

  useEffect(() => {
    if (!isLandingPage) {
      setIsPastHero(true);
      return;
    }

    const heroSection = document.getElementById('hero-section');
    if (!heroSection) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsPastHero(!entry.isIntersecting);
      },
      { threshold: 0.1 }
    );

    observer.observe(heroSection);
    return () => observer.disconnect();
  }, [isLandingPage]);

  const navItems = [
    { name: "My Dashboard", path: "/dashboard" },
    { name: "Air Map", path: "/airmap" },
    { name: "Nature Watch", path: "/naturewatch" },
    { name: "Grow Guide", path: "/growguide" },
    { name: "Plant Care", path: "/plantcare" },
    { name: "Trash Scan", path: "/trashscan" },
    { name: "Earth Feed", path: "/earthfeed" },
  ];

  const isActive = (path: string) => location.pathname === path;

  const getInitials = (email: string) => {
    return email.substring(0, 2).toUpperCase();
  };

  return (
    <>
      <nav
        className={cn(
          "fixed top-0 left-0 right-0 z-50 transition-all duration-300",
          isLandingPage
            ? isPastHero
              ? "bg-background border-b border-border/20"
              : "bg-transparent border-none"
            : "bg-background border-b border-border/20"
        )}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <Link to="/" className="flex items-center space-x-3 group">
              <div className="w-10 h-10 rounded-lg group-hover:scale-105 transition-transform duration-200 flex items-center justify-center border border-primary/30">
                <img
                  src="/media-uploads/621356d2-c943-46af-8afe-3417b7183c70.png"
                  alt="Earthly Logo"
                  className="w-10 h-10 rounded-lg object-cover border border-green-500"
                />
              </div>
              <div>
                <h1
                  className={cn(
                    "text-xl font-bold manrope-heading transition-colors duration-300",
                    isLandingPage
                      ? isPastHero
                        ? "text-green-600"
                        : "text-white"
                      : "text-foreground"
                  )}
                >
                  Earthly
                </h1>
                <p
                  className={cn(
                    "text-xs hidden sm:block newsreader-subheading transition-colors duration-300",
                    isLandingPage
                      ? isPastHero
                        ? "text-muted-foreground"
                        : "text-white/80"
                      : "text-muted-foreground"
                  )}
                >
                  Tracking Nature's Pulse
                </p>
              </div>
            </Link>

            {/* Desktop Navigation */}
            {!isLandingPage && (
              <div className="hidden md:flex items-center space-x-1">
                {navItems.slice(0, 6).map((item) => (
                  <Link
                    key={item.name}
                    to={item.path}
                    className={cn(
                      "px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 hover-scale",
                      isActive(item.path)
                        ? "bg-primary text-primary-foreground shadow-sm"
                        : "text-foreground hover:bg-secondary hover:text-secondary-foreground"
                    )}
                  >
                    {item.name}
                  </Link>
                ))}
              </div>
            )}

            {/* Auth Section */}
            <div className="hidden md:flex items-center space-x-4">
              {!loading &&
                (user ? (
                  <Button
                    variant="ghost"
                    size="sm"
                    className={cn(
                      "relative h-10 w-10 rounded-full p-0 hover:bg-secondary transition-colors duration-300",
                      isLandingPage && !isPastHero ? "text-white" : ""
                    )}
                    onClick={() => setIsProfileDrawerOpen(true)}
                  >
                    <div className="h-9 w-9 rounded-full bg-primary flex items-center justify-center text-primary-foreground font-medium">
                      {getInitials(user.email || "")}
                    </div>
                  </Button>
                ) : (
                  <>
                    <Link to="/signin">
                      <Button className="hover-scale bg-gradient-primary hover:opacity-90 text-white font-semibold px-6 py-2 h-10 rounded-md shadow-lg hover:shadow-xl transition-all duration-300">
                        Sign In
                      </Button>
                    </Link>
                    <Link to="/signup">
                      <Button className="hover-scale bg-gradient-primary hover:opacity-90 text-white font-semibold px-6 py-2 h-10 rounded-md shadow-lg hover:shadow-xl transition-all duration-300">
                        Get Started
                      </Button>
                    </Link>
                  </>
                ))}
            </div>

            {/* Mobile menu button */}
            <Button
              variant="ghost"
              size="sm"
              className={cn(
                "md:hidden hover-scale transition-colors duration-300",
                isLandingPage && !isPastHero ? "text-white hover:bg-white/10" : ""
              )}
              onClick={() => setIsOpen(!isOpen)}
            >
              {isOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </Button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isOpen && (
          <div
            className={cn(
              "md:hidden border-t slide-in-from-bottom",
              isLandingPage
                ? "border-transparent bg-transparent"
                : "bg-background border-border/30"
            )}
          >
            <div className="px-4 py-4 space-y-2">
              {!isLandingPage &&
                navItems.map((item, index) => (
                  <Link
                    key={item.name}
                    to={item.path}
                    onClick={() => setIsOpen(false)}
                    className={cn(
                      "block px-4 py-3 rounded-lg text-sm font-medium transition-all duration-200 hover-scale",
                      isActive(item.path)
                        ? "bg-primary text-primary-foreground"
                        : "text-foreground hover:bg-secondary"
                    )}
                    style={{ animationDelay: `${index * 0.05}s` }}
                  >
                    {item.name}
                  </Link>
                ))}

              <div
                className={cn(
                  "pt-4",
                  !isLandingPage ? "border-t border-border/30" : ""
                )}
              >
                {!loading &&
                  (user ? (
                    <Button
                      variant="ghost"
                      className={cn(
                        "w-full justify-start",
                        isLandingPage ? "text-white hover:bg-white/10" : ""
                      )}
                      onClick={() => {
                        setIsOpen(false);
                        setIsProfileDrawerOpen(true);
                      }}
                    >
                      <div className="h-8 w-8 rounded-full bg-primary flex items-center justify-center text-primary-foreground font-medium mr-3">
                        {getInitials(user.email || "")}
                      </div>
                      Profile
                    </Button>
                  ) : (
                    <div className="flex flex-col space-y-2">
                      <Link to="/signin">
                        <Button className="w-full hover-scale bg-gradient-primary hover:opacity-90 text-white font-semibold px-6 py-2 h-10 rounded-md shadow-lg hover:shadow-xl transition-all duration-300">
                          Sign In
                        </Button>
                      </Link>
                      <Link to="/signup">
                        <Button className="w-full hover-scale bg-gradient-primary hover:opacity-90 text-white font-semibold px-6 py-2 h-10 rounded-md shadow-lg hover:shadow-xl transition-all duration-300">
                          Get Started
                        </Button>
                      </Link>
                    </div>
                  ))}
              </div>
            </div>
          </div>
        )}
      </nav>

      <ProfileDrawer
        isOpen={isProfileDrawerOpen}
        onClose={() => setIsProfileDrawerOpen(false)}
      />
    </>
  );
};

export default Navbar;