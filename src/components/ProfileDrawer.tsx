import { useState, useEffect } from "react";
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerClose
} from "@/components/ui/drawer";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Settings,
  Heart,
  LogOut,
  X,
  Camera,
  Lock,
  User,
  Shield,
  Info
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { cn } from "@/lib/utils";

interface ProfileDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

const ProfileDrawer = ({ isOpen, onClose }: ProfileDrawerProps) => {
  const { user, signOut } = useAuth();
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  // Initialize dark mode from system preference or local storage if needed, 
  // but for now keeping it simple as requested, triggering side effect.
  const [darkMode, setDarkMode] = useState(false);

  const [analyticsConsent, setAnalyticsConsent] = useState(true);

  // Toggle dark class on html element
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, [darkMode]);

  const getInitials = (email: string) => {
    return email.substring(0, 2).toUpperCase();
  };

  const getMemberSince = () => {
    if (user?.created_at) {
      const date = new Date(user.created_at);
      return date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
    }
    return "January 2024";
  };

  const handleLogout = async () => {
    await signOut();
    onClose();
  };

  if (!user) return null;

  return (
    <>
      {/* Profile Drawer */}
      <Drawer open={isOpen && !isSettingsOpen} onOpenChange={(open) => !open && onClose()}>
        <DrawerContent className="h-[90vh] max-w-md ml-auto mr-0 rounded-l-2xl">
          <DrawerHeader className="text-center pb-6">
            <DrawerClose asChild>
              <Button variant="ghost" size="sm" className="absolute right-4 top-4">
                <X className="h-4 w-4" />
              </Button>
            </DrawerClose>
            <DrawerTitle className="sr-only">Profile</DrawerTitle>

            {/* Profile Picture */}
            <div className="flex justify-center mb-4">
              <div className="h-20 w-20 rounded-full bg-primary flex items-center justify-center text-primary-foreground text-2xl font-bold shadow-lg">
                {getInitials(user.email || "")}
              </div>
            </div>

            {/* Username */}
            <h2 className="text-xl font-bold text-foreground mb-1">
              {user.email?.split('@')[0] || "User"}
            </h2>

            {/* Member Since */}
            <p className="text-sm text-muted-foreground mb-3">
              Member since {getMemberSince()}
            </p>

            {/* Bio */}
            <p className="text-sm text-foreground/80 max-w-xs mx-auto leading-relaxed">
              Passionate about environmental conservation and sustainable living.
            </p>
          </DrawerHeader>

          <div className="flex-1 px-6 space-y-4">
            {/* Settings Button */}
            <Button
              variant="outline"
              className="w-full justify-start"
              onClick={() => setIsSettingsOpen(true)}
            >
              <Settings className="h-4 w-4 mr-2" />
              Manage Settings
            </Button>

            <Separator />

            {/* Donate Button */}
            <Button className="w-full bg-green-600 hover:bg-green-700 text-white">
              <Heart className="h-4 w-4 mr-2" />
              Donate Now
            </Button>

            <div className="flex-1" />

            {/* Privacy Policy */}
            <Button variant="link" className="text-muted-foreground p-0 h-auto">
              Privacy Policy
            </Button>

            {/* Logout Button */}
            <Button
              variant="outline"
              className="w-full text-red-600 border-red-200 hover:bg-red-50"
              onClick={handleLogout}
            >
              <LogOut className="h-4 w-4 mr-2" />
              Log Out
            </Button>
          </div>
        </DrawerContent>
      </Drawer>

      {/* Settings Drawer */}
      <Drawer open={isSettingsOpen} onOpenChange={setIsSettingsOpen}>
        <DrawerContent className="h-[95vh] max-w-md ml-auto mr-0 rounded-l-2xl">
          <DrawerHeader className="border-b">
            <div className="flex items-center justify-between">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsSettingsOpen(false)}
              >
                <X className="h-4 w-4" />
              </Button>
              <DrawerTitle className="text-lg font-semibold">Settings</DrawerTitle>
              <div className="w-8" />
            </div>
          </DrawerHeader>

          <div className="flex-1 overflow-y-auto px-6 py-4 space-y-6">
            {/* Account Settings */}
            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                <User className="h-4 w-4 text-primary" />
                <h3 className="font-semibold">Account Settings</h3>
              </div>

              <div className="space-y-3 pl-6">
                <div>
                  <Label htmlFor="username">Username</Label>
                  <Input id="username" defaultValue={user.email?.split('@')[0]} className="mt-1" />
                </div>

                <div>
                  <Label htmlFor="bio">Bio</Label>
                  <Textarea
                    id="bio"
                    placeholder="Tell us about yourself..."
                    className="mt-1 resize-none"
                    rows={2}
                  />
                </div>

                <Button variant="outline" size="sm" className="w-full">
                  <Camera className="h-4 w-4 mr-2" />
                  Change Profile Picture
                </Button>

                <Button variant="outline" size="sm" className="w-full">
                  <Lock className="h-4 w-4 mr-2" />
                  Change Password
                </Button>
              </div>
            </div>

            <Separator />

            {/* App Preferences */}
            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                <Settings className="h-4 w-4 text-primary" />
                <h3 className="font-semibold">App Preferences</h3>
              </div>

              <div className="space-y-3 pl-6">
                <div className="flex items-center justify-between">
                  <Label htmlFor="dark-mode">Dark Mode</Label>
                  <Switch
                    id="dark-mode"
                    checked={darkMode}
                    onCheckedChange={setDarkMode}
                  />
                </div>
              </div>
            </div>

            <Separator />

            {/* Privacy Controls */}
            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                <Shield className="h-4 w-4 text-primary" />
                <h3 className="font-semibold">Privacy Controls</h3>
              </div>

              <div className="space-y-3 pl-6">
                <div className="flex items-center justify-between">
                  <Label htmlFor="analytics-consent">Analytics Consent</Label>
                  <Switch
                    id="analytics-consent"
                    checked={analyticsConsent}
                    onCheckedChange={setAnalyticsConsent}
                  />
                </div>

                <Button variant="outline" size="sm" className="w-full">
                  Manage Data Sharing
                </Button>

                <Button variant="outline" size="sm" className="w-full text-red-600 border-red-200 hover:bg-red-50">
                  Request Data Deletion
                </Button>
              </div>
            </div>

            <Separator />

            {/* About App */}
            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                <Info className="h-4 w-4 text-primary" />
                <h3 className="font-semibold">About App</h3>
              </div>

              <div className="pl-6 space-y-2">
                <Button variant="outline" size="sm" className="w-full">
                  Developer Info & Credits
                </Button>

                <p className="text-xs text-muted-foreground text-center pt-4">
                  Version 1.3.2
                </p>
              </div>
            </div>
          </div>
        </DrawerContent>
      </Drawer>
    </>
  );
};

export default ProfileDrawer;
