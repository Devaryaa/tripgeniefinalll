import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Search, MapPin, Star, DollarSign, ArrowUp, Shuffle, ExternalLink } from "lucide-react";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { useTrip } from "@/context/TripContext";

const defaultMockPlaces = [
  {
    name: "Sacré-Cœur",
    category: "attractions",
    rating: 4.7,
    reviews: 8942,
    priceLevel: "Free",
    distance: "1.2 km",
  },
  {
    name: "Le Marais",
    category: "attractions",
    rating: 4.6,
    reviews: 5621,
    priceLevel: "Free",
    distance: "2.1 km",
  },
  {
    name: "L'Ami Jean",
    category: "food",
    rating: 4.8,
    reviews: 2847,
    priceLevel: "$$$",
    distance: "0.8 km",
  },
  {
    name: "Bistrot Paul Bert",
    category: "food",
    rating: 4.7,
    reviews: 3214,
    priceLevel: "$$",
    distance: "1.5 km",
  },
  {
    name: "Café de Flore",
    category: "cafes",
    rating: 4.5,
    reviews: 6789,
    priceLevel: "$$",
    distance: "0.6 km",
  },
  {
    name: "Les Deux Magots",
    category: "cafes",
    rating: 4.4,
    reviews: 5432,
    priceLevel: "$$",
    distance: "0.7 km",
  },
  {
    name: "Le Baron",
    category: "nightlife",
    rating: 4.3,
    reviews: 1847,
    priceLevel: "$$$",
    distance: "2.3 km",
  },
  {
    name: "Rex Club",
    category: "nightlife",
    rating: 4.6,
    reviews: 2156,
    priceLevel: "$$",
    distance: "1.9 km",
  },
];

const categories = [
  { value: "attractions", label: "Attractions" },
  { value: "food", label: "Food" },
  { value: "cafes", label: "Cafés" },
  { value: "nightlife", label: "Nightlife" },
];

const Nearby = () => {
  const { currentTrip } = useTrip();
  const [activeCategory, setActiveCategory] = useState("attractions");
  const [places, setPlaces] = useState(defaultMockPlaces);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadPlaces();
  }, [currentTrip]);

  const loadPlaces = async () => {
    if (!currentTrip) {
      setPlaces(defaultMockPlaces);
      setLoading(false);
      return;
    }
    try {
      setLoading(true);
      const res = await fetch(`/api/trips/${currentTrip.id}/nearby?category=${activeCategory}`);
      const data = await res.json();
      setPlaces(data.length > 0 ? data : defaultMockPlaces);
    } catch {
      setPlaces(defaultMockPlaces);
    } finally {
      setLoading(false);
    }
  };

  const filteredPlaces = places.filter(
    (place) => place.category === activeCategory
  );

  return (
    <div className="min-h-[calc(100vh-8rem)] px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-2">
            Nearby Explorer
          </h1>
          <p className="text-muted-foreground">
            Discover amazing places around you
          </p>
        </div>

        <div className="mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground" />
            <Input
              placeholder="Search places near destination"
              className="pl-10 h-12"
            />
          </div>
        </div>

        <Tabs
          value={activeCategory}
          onValueChange={setActiveCategory}
          className="mb-8"
        >
          <TabsList className="grid w-full grid-cols-4">
            {categories.map((category) => (
              <TabsTrigger key={category.value} value={category.value}>
                {category.label}
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {filteredPlaces.map((place, idx) => (
            <Card key={idx} className="overflow-hidden hover:shadow-medium transition-shadow">
              <div className="h-48 bg-gradient-to-br from-primary/20 to-primary/5" />
              <div className="p-4">
                <div className="flex items-start justify-between mb-2">
                  <h3 className="font-semibold text-foreground text-lg">
                    {place.name}
                  </h3>
                  <Badge variant="secondary">
                    <MapPin className="h-3 w-3 mr-1" />
                    {place.distance}
                  </Badge>
                </div>

                <div className="flex items-center gap-3 text-sm text-muted-foreground mb-4">
                  <div className="flex items-center gap-1">
                    <Star className="h-4 w-4 fill-warning text-warning" />
                    <span className="font-medium text-foreground">{place.rating}</span>
                  </div>
                  <span>({place.reviews} reviews)</span>
                  <div className="flex items-center gap-1">
                    <DollarSign className="h-4 w-4" />
                    <span>{place.priceLevel}</span>
                  </div>
                </div>

                <div className="flex gap-2">
                  <Button variant="outline" size="sm" className="flex-1 gap-1">
                    <ArrowUp className="h-3 w-3" />
                    Upvote
                  </Button>
                  <Button variant="outline" size="sm" className="flex-1 gap-1">
                    <Shuffle className="h-3 w-3" />
                    Shuffle
                  </Button>
                  <Button variant="outline" size="sm" className="gap-1">
                    <ExternalLink className="h-3 w-3" />
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>

        <div className="mt-8 text-center">
          <Button size="lg" className="gap-2">
            <ExternalLink className="h-5 w-5" />
            Open in Maps
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Nearby;
