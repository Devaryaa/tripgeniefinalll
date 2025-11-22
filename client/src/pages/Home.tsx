import { useState } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Mic, Sparkles } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "sonner";
import { useTrip } from "@/context/TripContext";
import { useTripPlanner } from "@/hooks/useTripPlanner";

const interests = [
  "Adventure",
  "Culture",
  "Food",
  "Nature",
  "Shopping",
  "Nightlife",
  "History",
  "Beach",
];

const Home = () => {
  const [, setLocation] = useLocation();
  const { setCurrentTrip } = useTrip();
  const { generatePlan, loading: aiLoading } = useTripPlanner();
  const [destination, setDestination] = useState("");
  const [days, setDays] = useState("");
  const [budget, setBudget] = useState("");
  const [selectedInterests, setSelectedInterests] = useState<string[]>([]);
  const [travelStyle, setTravelStyle] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const toggleInterest = (interest: string) => {
    setSelectedInterests((prev) =>
      prev.includes(interest)
        ? prev.filter((i) => i !== interest)
        : [...prev, interest]
    );
  };

  const handleGenerateTrip = async () => {
    if (!destination.trim()) {
      toast.error("Please enter a destination");
      return;
    }
    if (!days || parseInt(days) < 1) {
      toast.error("Please enter valid number of days");
      return;
    }
    if (!budget || parseInt(budget) < 0) {
      toast.error("Please enter a valid budget");
      return;
    }
    if (selectedInterests.length === 0) {
      toast.error("Please select at least one interest");
      return;
    }
    if (!travelStyle) {
      toast.error("Please select a travel style");
      return;
    }

    setIsLoading(true);
    try {
      // First, create the trip record
      const tripResponse = await fetch("/api/trips", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          destination,
          days: parseInt(days),
          budget: parseInt(budget),
          interests: selectedInterests,
          travelStyle,
        }),
      });

      if (!tripResponse.ok) {
        throw new Error("Failed to create trip");
      }

      const trip = await tripResponse.json();
      
      // Now generate the AI trip plan
      toast.info("🤖 AI is generating your personalized itinerary...");
      
      const aiPlanData = {
        userPreferences: {
          interests: selectedInterests,
          budget: parseInt(budget),
          pace: travelStyle,
          foodPreference: selectedInterests.includes("Food") ? ["Local", "Fine Dining"] : ["Local"],
          travelStyle: [travelStyle],
        },
        location: {
          city: destination,
        },
        duration: parseInt(days),
        visited: [],
        previouslyShown: [],
      };

      const aiPlan = await generatePlan(aiPlanData);
      
      // Save the AI-generated plan to the trip
      if (aiPlan && aiPlan.days) {
        // Save attractions and restaurants from AI plan
        for (const day of aiPlan.days) {
          for (const place of day.places || []) {
            await fetch(`/api/trips/${trip.id}/attractions`, {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                name: place.name,
                description: place.description || "",
                timing: place.timing || "Morning",
                type: place.type || "attraction",
                distance: place.distance || "",
                transport: place.transport || "",
              }),
            });
          }
        }

        // Save restaurants/cafes
        for (const cafe of aiPlan.cafes || []) {
          await fetch(`/api/trips/${trip.id}/restaurants`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              name: cafe.name || cafe,
              rating: cafe.rating || 4.5,
              price: cafe.price || 500,
            }),
          });
        }
      }

      // Update trip context
      setCurrentTrip(trip);
      toast.success("✨ Your AI-powered trip plan is ready!");
      setLocation("/itinerary");
    } catch (error: any) {
      console.error("Trip generation error:", error);
      toast.error(error.message || "Failed to create trip. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-8rem)] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-2xl">
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-4 py-2 rounded-full mb-4">
            <Sparkles className="h-4 w-4" />
            <span className="text-sm font-medium">AI-Powered Travel Planning</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
            Plan Smarter with TripGenie
          </h1>
          <p className="text-lg text-muted-foreground">
            Your personalized AI travel companion for unforgettable journeys
          </p>
        </div>

        <div className="bg-card rounded-2xl shadow-large p-6 md:p-8 space-y-6">
          <div className="space-y-2">
            <Label htmlFor="destination">Destination</Label>
            <Input
              id="destination"
              placeholder="e.g., Paris, France"
              className="h-12"
              value={destination}
              onChange={(e) => setDestination(e.target.value)}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="days">Number of Days</Label>
              <Input
                id="days"
                type="number"
                placeholder="7"
                className="h-12"
                value={days}
                onChange={(e) => setDays(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="budget">Budget (INR)</Label>
              <Input
                id="budget"
                type="number"
                placeholder="150000"
                className="h-12"
                value={budget}
                onChange={(e) => setBudget(e.target.value)}
              />
            </div>
          </div>

          <div className="space-y-3">
            <Label>Interests (Select multiple)</Label>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {interests.map((interest) => (
                <div
                  key={interest}
                  className="flex items-center space-x-2 bg-secondary rounded-lg p-3 cursor-pointer hover:bg-secondary/80 transition-colors"
                  onClick={() => toggleInterest(interest)}
                >
                  <Checkbox
                    id={interest}
                    checked={selectedInterests.includes(interest)}
                    onCheckedChange={() => toggleInterest(interest)}
                  />
                  <label
                    htmlFor={interest}
                    className="text-sm font-medium cursor-pointer flex-1"
                  >
                    {interest}
                  </label>
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="travelStyle">Travel Style</Label>
            <Select value={travelStyle} onValueChange={setTravelStyle}>
              <SelectTrigger id="travelStyle" className="h-12">
                <SelectValue placeholder="Select your travel style" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="solo">Solo</SelectItem>
                <SelectItem value="couple">Couple</SelectItem>
                <SelectItem value="family">Family</SelectItem>
                <SelectItem value="friends">Friends</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 pt-4">
            <Button
              onClick={handleGenerateTrip}
              disabled={isLoading || aiLoading}
              className="flex-1 h-12 text-base font-semibold"
              size="lg"
            >
              {isLoading || aiLoading ? (
                <>
                  <Sparkles className="h-4 w-4 mr-2 animate-spin" />
                  {aiLoading ? "AI is planning..." : "Creating Trip..."}
                </>
              ) : (
                <>
                  <Sparkles className="h-4 w-4 mr-2" />
                  Generate Trip with AI
                </>
              )}
            </Button>
            <Button
              variant="outline"
              size="lg"
              className="h-12 w-full sm:w-12 border-2"
            >
              <Mic className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;
