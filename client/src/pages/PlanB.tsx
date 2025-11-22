import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { AlertTriangle, Shuffle, Star, ArrowLeft } from "lucide-react";
import { useLocation } from "wouter";
import { Badge } from "@/components/ui/badge";
import { useTrip } from "@/context/TripContext";

const defaultIndoorPlaces = [
  {
    name: "Musée d'Orsay",
    description: "Impressionist art museum in a stunning Beaux-Arts railway station",
    rating: 4.8,
  },
  {
    name: "Galeries Lafayette",
    description: "Iconic department store with magnificent glass dome",
    rating: 4.6,
  },
  {
    name: "Sainte-Chapelle",
    description: "Royal chapel famous for stunning stained-glass windows",
    rating: 4.7,
  },
  {
    name: "Centre Pompidou",
    description: "Modern and contemporary art museum with unique architecture",
    rating: 4.5,
  },
  {
    name: "Catacombs of Paris",
    description: "Underground ossuary holding remains of over 6 million people",
    rating: 4.4,
  },
];

const PlanB = () => {
  const [, setLocation] = useLocation();
  const { currentTrip } = useTrip();
  const [indoorPlaces, setIndoorPlaces] = useState(defaultIndoorPlaces);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadAlternatives();
  }, [currentTrip]);

  const loadAlternatives = async () => {
    if (!currentTrip) {
      setIndoorPlaces(defaultIndoorPlaces);
      setLoading(false);
      return;
    }
    try {
      setLoading(true);
      const res = await fetch(`/api/trips/${currentTrip.id}/indoor-alternatives`);
      const data = await res.json();
      setIndoorPlaces(data.length > 0 ? data : defaultIndoorPlaces);
    } catch {
      setIndoorPlaces(defaultIndoorPlaces);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-8rem)] px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <Card className="p-6 mb-8 bg-gradient-to-r from-warning/10 to-destructive/10 border-warning">
          <div className="flex items-start gap-4">
            <div className="bg-warning/20 rounded-lg p-3">
              <AlertTriangle className="h-6 w-6 text-warning" />
            </div>
            <div className="flex-1">
              <h2 className="text-xl font-bold text-foreground mb-2">
                Weather Alert - Plan B Activated
              </h2>
              <p className="text-muted-foreground">
                Don't worry! We've prepared amazing indoor alternatives for you.
              </p>
            </div>
          </div>
        </Card>

        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-2">
            Indoor Plan B
          </h1>
          <p className="text-muted-foreground">
            Rain or shine, your adventure continues
          </p>
        </div>

        <div className="space-y-4 mb-8">
          {indoorPlaces.map((place, idx) => (
            <Card key={idx} className="p-6 hover:shadow-medium transition-shadow">
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="flex-1">
                  <div className="flex items-start justify-between mb-2">
                    <h3 className="font-semibold text-foreground text-xl">
                      {place.name}
                    </h3>
                    <Badge variant="secondary" className="ml-2">
                      <Star className="h-3 w-3 mr-1 fill-warning text-warning" />
                      {place.rating}
                    </Badge>
                  </div>
                  <p className="text-muted-foreground mb-4">
                    {place.description}
                  </p>
                  <Button variant="outline" size="sm" className="gap-1">
                    <Shuffle className="h-3 w-3" />
                    Find Alternative
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>

        <div className="flex flex-col sm:flex-row gap-4">
          <Button
            onClick={() => setLocation("/itinerary")}
            variant="outline"
            size="lg"
            className="flex-1 gap-2 border-2"
          >
            <ArrowLeft className="h-5 w-5" />
            Back to Itinerary
          </Button>
          <Button variant="outline" size="lg" className="flex-1 gap-2 border-2">
            <Shuffle className="h-5 w-5" />
            Shuffle All Options
          </Button>
        </div>
      </div>
    </div>
  );
};

export default PlanB;
