import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { MapPin, Calendar, DollarSign, Cloud, Route, AlertTriangle, Compass, Heart } from "lucide-react";
import { useTrip } from "@/context/TripContext";

const Dashboard = () => {
  const [, setLocation] = useLocation();
  const { currentTrip } = useTrip();

  if (!currentTrip) {
    return (
      <div className="min-h-[calc(100vh-8rem)] flex items-center justify-center">
        <div className="text-center">
          <p className="text-muted-foreground mb-4">No trip selected. Create one first!</p>
          <Button onClick={() => setLocation("/")}>Create Trip</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100vh-8rem)] px-4 py-8">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-2">
            Your Trip Dashboard
          </h1>
          <p className="text-muted-foreground">
            Everything you need for your perfect journey
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card className="p-6 hover:shadow-medium transition-shadow">
            <div className="flex items-start gap-4">
              <div className="bg-primary/10 rounded-lg p-3">
                <MapPin className="h-6 w-6 text-primary" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-foreground mb-1">Destination</h3>
                <p className="text-2xl font-bold text-primary">{currentTrip.destination}</p>
              </div>
            </div>
          </Card>

          <Card className="p-6 hover:shadow-medium transition-shadow">
            <div className="flex items-start gap-4">
              <div className="bg-info/10 rounded-lg p-3">
                <Calendar className="h-6 w-6 text-info" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-foreground mb-1">Duration</h3>
                <p className="text-2xl font-bold text-foreground">{currentTrip.days} Days</p>
                <p className="text-sm text-muted-foreground mt-1">{currentTrip.travelStyle}</p>
              </div>
            </div>
          </Card>

          <Card className="p-6 hover:shadow-medium transition-shadow">
            <div className="flex items-start gap-4">
              <div className="bg-success/10 rounded-lg p-3">
                <DollarSign className="h-6 w-6 text-success" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-foreground mb-1">Budget</h3>
                <p className="text-2xl font-bold text-foreground">₹{currentTrip.budget}</p>
              </div>
            </div>
          </Card>
        </div>

        <Card className="p-6 mb-8 bg-gradient-to-r from-primary/5 to-info/5 border-primary/20">
          <div className="flex items-start gap-4">
            <div className="bg-primary/10 rounded-lg p-3">
              <Cloud className="h-6 w-6 text-primary" />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-foreground mb-1">Weather Forecast</h3>
              <p className="text-lg text-foreground">Sunny, 22°C - Perfect for sightseeing</p>
              <p className="text-sm text-muted-foreground mt-1">Perfect conditions for your adventure!</p>
            </div>
          </div>
        </Card>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Button
            onClick={() => setLocation("/itinerary")}
            variant="default"
            size="lg"
            className="h-24 text-lg font-semibold flex flex-col gap-2 hover:scale-[1.02] transition-transform"
          >
            <Route className="h-8 w-8" />
            View Itinerary
          </Button>

          <Button
            onClick={() => setLocation("/plan-b")}
            variant="outline"
            size="lg"
            className="h-24 text-lg font-semibold flex flex-col gap-2 hover:scale-[1.02] transition-transform border-2"
          >
            <AlertTriangle className="h-8 w-8" />
            Plan B Mode
          </Button>

          <Button
            onClick={() => setLocation("/nearby")}
            variant="outline"
            size="lg"
            className="h-24 text-lg font-semibold flex flex-col gap-2 hover:scale-[1.02] transition-transform border-2"
          >
            <Compass className="h-8 w-8" />
            Nearby Explorer
          </Button>

          <Button
            variant="outline"
            size="lg"
            className="h-24 text-lg font-semibold flex flex-col gap-2 hover:scale-[1.02] transition-transform border-2"
          >
            <Heart className="h-8 w-8" />
            Favorites (Upvoted)
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
