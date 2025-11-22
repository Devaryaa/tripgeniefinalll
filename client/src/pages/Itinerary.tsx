import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { MapPin, Clock, Shuffle, ArrowUp, Volume2, Download, Utensils, Star, User } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useTrip } from "@/context/TripContext";
import { useTextToSpeech } from "@/hooks/useTextToSpeech";

const Itinerary = () => {
  const [, setLocation] = useLocation();
  const { currentTrip } = useTrip();
  const [attractions, setAttractions] = useState<any[]>([]);
  const [restaurants, setRestaurants] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const { speak, stop, isSpeaking, isSupported } = useTextToSpeech();

  useEffect(() => {
    if (currentTrip) {
      loadData();
    }
  }, [currentTrip]);

  const loadData = async () => {
    if (!currentTrip) return;
    try {
      setLoading(true);
      const [attRes, restRes] = await Promise.all([
        fetch(`/api/trips/${currentTrip.id}/attractions`).catch(() => ({ json: async () => [] })),
        fetch(`/api/trips/${currentTrip.id}/restaurants`).catch(() => ({ json: async () => [] })),
      ]);
      
      const attractions = await attRes.json();
      const restaurants = await restRes.json();
      
      // Only use mock data if we have no real data
      if (Array.isArray(attractions) && attractions.length > 0) {
        setAttractions(attractions);
      } else {
        setAttractions(mockAttractions);
      }
      
      if (Array.isArray(restaurants) && restaurants.length > 0) {
        setRestaurants(restaurants);
      } else {
        setRestaurants(mockLunchSpots);
      }
    } catch (error) {
      console.error("Failed to load data:", error);
      // Fallback to mock data on error
      setAttractions(mockAttractions);
      setRestaurants(mockLunchSpots);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-[calc(100vh-8rem)] flex items-center justify-center">
        <div className="text-center">
          <p className="text-muted-foreground mb-4">Loading your itinerary...</p>
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
        </div>
      </div>
    );
  }

  if (!currentTrip) {
    return (
      <div className="min-h-[calc(100vh-8rem)] flex items-center justify-center">
        <div className="text-center">
          <p className="text-muted-foreground mb-4">No trip selected</p>
          <Button onClick={() => setLocation("/home")}>Create a Trip</Button>
        </div>
      </div>
    );
  }

  const mockAttractions = [
    { name: "Eiffel Tower", description: "Iconic iron lattice tower with stunning city views", timing: "Morning" },
    { name: "Louvre Museum", description: "World's largest art museum and historic monument", timing: "Afternoon" },
    { name: "Notre-Dame", description: "Medieval Catholic cathedral with Gothic architecture", timing: "Afternoon" },
    { name: "Arc de Triomphe", description: "Monumental arch honoring French military victories", timing: "Evening" },
  ];

  const mockLunchSpots = [
    { name: "Café de Flore", rating: 4.5, reviews: 2847, price: 35 },
    { name: "Le Comptoir", rating: 4.7, reviews: 1923, price: 42 },
    { name: "Chez L'Ami Jean", rating: 4.6, reviews: 1654, price: 38 },
  ];

  return (
    <div className="min-h-[calc(100vh-8rem)] px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-2">
              Your Smart Itinerary
            </h1>
            <p className="text-muted-foreground">
              Personalized day-by-day plan for {currentTrip.destination}
            </p>
          </div>
          <Button
            onClick={() => setLocation("/account")}
            variant="outline"
            size="lg"
            className="gap-2 border-2"
          >
            <User className="h-5 w-5" />
            <span className="hidden sm:inline">Account</span>
          </Button>
        </div>

        <Card className="p-6 mb-8 bg-gradient-to-r from-primary/5 to-info/5 border-primary/20">
          <h2 className="text-xl font-semibold text-foreground mb-4">Trip Overview</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div>
              <p className="text-muted-foreground">Destination</p>
              <p className="font-semibold text-foreground">{currentTrip.destination}</p>
            </div>
            <div>
              <p className="text-muted-foreground">Duration</p>
              <p className="font-semibold text-foreground">{currentTrip.days} Days</p>
            </div>
            <div>
              <p className="text-muted-foreground">Style</p>
              <p className="font-semibold text-foreground">{currentTrip.travelStyle}</p>
            </div>
            <div>
              <p className="text-muted-foreground">Budget</p>
              <p className="font-semibold text-foreground">₹{currentTrip.budget}</p>
            </div>
          </div>
        </Card>

        <div className="space-y-8">
          {Array.from({ length: currentTrip.days }).map((_, dayIndex) => {
            // Get attractions for this specific day (if structured by day) or show all
            const dayAttractions = attractions.filter((attr: any) => 
              attr.day === dayIndex + 1 || !attr.day
            ).slice(0, 5); // Limit to 5 per day
            
            return (
            <Card key={dayIndex} className="overflow-hidden">
              <div className="bg-primary text-primary-foreground p-4">
                <h2 className="text-2xl font-bold">Day {dayIndex + 1}</h2>
              </div>

              <div className="p-6 space-y-6">
                <div className="space-y-4">
                  {(dayAttractions.length > 0 ? dayAttractions : attractions.slice(0, 4)).map((attraction, idx) => (
                    <Card key={idx} className="p-4 hover:shadow-medium transition-shadow">
                      <div className="flex flex-col sm:flex-row gap-4">
                        <div className="flex-1">
                          <div className="flex items-start justify-between mb-2">
                            <h3 className="font-semibold text-foreground text-lg">
                              {attraction.name}
                            </h3>
                            <Badge variant="secondary" className="ml-2">
                              <Clock className="h-3 w-3 mr-1" />
                              {attraction.timing}
                            </Badge>
                          </div>
                          <p className="text-sm text-muted-foreground mb-3">
                            {attraction.description}
                          </p>
                          <div className="flex gap-2">
                            <Button variant="outline" size="sm" className="gap-1">
                              <Shuffle className="h-3 w-3" />
                              Shuffle
                            </Button>
                            <Button variant="outline" size="sm" className="gap-1">
                              <ArrowUp className="h-3 w-3" />
                              Upvote
                            </Button>
                          </div>
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>

                <Card className="p-6 bg-gradient-to-r from-warning/5 to-warning/10 border-warning/20">
                  <div className="flex items-center gap-2 mb-4">
                    <Utensils className="h-5 w-5 text-warning" />
                    <h3 className="font-semibold text-foreground">Lunch Recommendations</h3>
                  </div>
                  <div className="space-y-3">
                    {restaurants.slice(0, 3).map((spot, idx) => (
                      <div
                        key={idx}
                        className="flex flex-col sm:flex-row sm:items-center justify-between p-3 bg-background rounded-lg"
                      >
                        <div className="flex-1">
                          <h4 className="font-medium text-foreground">{spot.name}</h4>
                          <div className="flex items-center gap-3 text-sm text-muted-foreground mt-1">
                            <div className="flex items-center gap-1">
                              <Star className="h-3 w-3 fill-warning text-warning" />
                              <span>{spot.rating}</span>
                            </div>
                            <span>({spot.reviews} reviews)</span>
                            <span>₹{spot.price}/person</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                  <Button variant="outline" size="sm" className="mt-4 gap-1">
                    <Shuffle className="h-3 w-3" />
                    Shuffle Lunch Options
                  </Button>
                </Card>
              </div>
            </Card>
            );
          })}
        </div>

        <div className="mt-8 flex flex-col sm:flex-row gap-4">
          <Button 
            size="lg" 
            className="flex-1 gap-2"
            onClick={() => {
              if (isSpeaking) {
                stop();
              } else {
                const itineraryText = attractions.map((attr, idx) => 
                  `Day ${idx + 1}: Visit ${attr.name} at ${attr.timing}. ${attr.description}`
                ).join(". ");
                speak(itineraryText);
              }
            }}
            disabled={!isSupported}
          >
            <Volume2 className="h-5 w-5" />
            {isSpeaking ? "Stop Speaking" : "Speak Itinerary Aloud"}
          </Button>
          <Button variant="outline" size="lg" className="flex-1 gap-2 border-2">
            <Download className="h-5 w-5" />
            Save Offline
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Itinerary;
