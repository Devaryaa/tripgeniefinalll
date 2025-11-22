import { Link, useLocation } from "wouter";
import { Plane, Upload, Home, User, LogOut, Gem } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/context/AuthContext";

const Navbar = () => {
  const [location] = useLocation();
  const { logout } = useAuth();

  const handleLogout = () => {
    localStorage.removeItem("user");
    logout();
  };

  const isHomePage = location === "/home";

  return (
    <nav className="bg-background border-b border-border sticky top-0 z-50 shadow-soft">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <Link href="/home" className="flex items-center gap-2 group" data-testid="link-brand-home">
            <div className="bg-primary rounded-lg p-2 group-hover:bg-primary-dark transition-colors">
              <Plane className="h-6 w-6 text-primary-foreground" />
            </div>
            <span className="text-xl font-bold text-foreground">TripGenie</span>
          </Link>
          
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" asChild>
              <Link href="/home" data-testid="link-nav-home">
                <Home className="h-4 w-4 mr-2" />
                <span className="hidden sm:inline">Home</span>
              </Link>
            </Button>
            <Button variant="ghost" size="sm" asChild>
              <Link href="/hidden-gems" data-testid="link-nav-hidden-gems">
                <Gem className="h-4 w-4 mr-2" />
                <span className="hidden sm:inline">Hidden Gems</span>
              </Link>
            </Button>
            {isHomePage && (
              <Button variant="outline" size="sm" asChild>
                <Link href="/upload-place" data-testid="link-nav-upload">
                  <Upload className="h-4 w-4 mr-2" />
                  <span className="hidden sm:inline">Submit Place</span>
                </Link>
              </Button>
            )}
            <Button variant="ghost" size="sm" asChild>
              <Link href="/account" data-testid="link-nav-account">
                <User className="h-4 w-4 mr-2" />
                <span className="hidden sm:inline">Account</span>
              </Link>
            </Button>
            <Button variant="ghost" size="sm" onClick={handleLogout} data-testid="button-logout">
              <LogOut className="h-4 w-4 mr-2" />
              <span className="hidden sm:inline">Logout</span>
            </Button>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
