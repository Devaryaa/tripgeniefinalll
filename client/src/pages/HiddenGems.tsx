import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowUp, MapPin, Verified, Clock } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Skeleton } from "@/components/ui/skeleton";

interface HiddenGem {
  id: number;
  title: string;
  description: string;
  latitude: number;
  longitude: number;
  imageUrl: string;
  status: "verified" | "pending_review" | "rejected";
  upvotes: number;
  createdAt: string;
}

const demoGems: HiddenGem[] = [
  {
    id: 1,
    title: "Secret Garden Café",
    description: "A hidden oasis in the heart of the city with beautiful flowers and amazing coffee. Perfect for a quiet afternoon.",
    latitude: 48.8566,
    longitude: 2.3522,
    imageUrl: "/uploads/demo-1.jpg",
    status: "verified",
    upvotes: 127,
    createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 2,
    title: "Underground Art Gallery",
    description: "Local artists showcase their work in this charming basement gallery. Free entry and always something new to discover.",
    latitude: 48.8606,
    longitude: 2.3376,
    imageUrl: "/uploads/demo-2.jpg",
    status: "verified",
    upvotes: 89,
    createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 3,
    title: "Rooftop Bookshop",
    description: "A tiny bookshop on a rooftop with stunning city views. They serve tea and have cozy reading nooks everywhere.",
    latitude: 48.8529,
    longitude: 2.3499,
    imageUrl: "/uploads/demo-3.jpg",
    status: "verified",
    upvotes: 156,
    createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 4,
    title: "Historic Bridge Walk",
    description: "A lesser-known bridge offering incredible sunset views and perfect photo opportunities without the crowds.",
    latitude: 48.8584,
    longitude: 2.2945,
    imageUrl: "/uploads/demo-4.jpg",
    status: "verified",
    upvotes: 203,
    createdAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 5,
    title: "Vintage Record Store",
    description: "Family-owned record store with rare vinyl collections and listening booths. The owner has amazing stories to share.",
    latitude: 48.8738,
    longitude: 2.2950,
    imageUrl: "/uploads/demo-5.jpg",
    status: "verified",
    upvotes: 78,
    createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 6,
    title: "Canal Side Picnic Spot",
    description: "A peaceful spot along the canal where locals gather for picnics. Bring your own food and enjoy the tranquil atmosphere.",
    latitude: 48.8719,
    longitude: 2.3672,
    imageUrl: "/uploads/demo-6.jpg",
    status: "verified",
    upvotes: 134,
    createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
  },
];

const HiddenGems = () => {
  const [places, setPlaces] = useState<HiddenGem[]>(demoGems);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: fetchedPlaces, isLoading } = useQuery<HiddenGem[]>({
    queryKey: ['/api/places'],
    retry: false,
  });

  useEffect(() => {
    if (fetchedPlaces && fetchedPlaces.length > 0) {
      setPlaces(fetchedPlaces);
    }
  }, [fetchedPlaces]);

  const upvoteMutation = useMutation({
    mutationFn: async (placeId: number) => {
      const res = await fetch(`/api/places/${placeId}/upvote`, {
        method: 'POST',
      });
      if (!res.ok) throw new Error('Failed to upvote');
      return res.json();
    },
    onSuccess: (updatedPlace) => {
      setPlaces(prev =>
        prev.map(place =>
          place.id === updatedPlace.id ? { ...place, upvotes: updatedPlace.upvotes } : place
        )
      );
      queryClient.invalidateQueries({ queryKey: ['/api/places'] });
      toast({
        title: "Upvoted!",
        description: "Thanks for supporting this hidden gem!",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to upvote. Please try again.",
        variant: "destructive",
      });
    },
  });

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) return "Today";
    if (diffDays === 1) return "Yesterday";
    if (diffDays < 7) return `${diffDays} days ago`;
    if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
    return `${Math.floor(diffDays / 30)} months ago`;
  };

  if (isLoading) {
    return (
      <div className="min-h-[calc(100vh-8rem)] px-4 py-8">
        <div className="max-w-6xl mx-auto">
          <Skeleton className="h-12 w-64 mb-2" />
          <Skeleton className="h-6 w-96 mb-8" />
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <Skeleton key={i} className="h-96" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100vh-8rem)] px-4 py-8">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-2" data-testid="heading-hidden-gems">
            Hidden Gems
          </h1>
          <p className="text-muted-foreground">
            Discover unique places shared by fellow travelers
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {places.map((gem) => (
            <Card 
              key={gem.id} 
              className="overflow-hidden hover-elevate transition-all"
              data-testid={`card-gem-${gem.id}`}
            >
              <div className="relative h-48 bg-gradient-to-br from-primary/20 to-primary/5">
                {gem.imageUrl.startsWith('/uploads/demo') && (
                  <div className="absolute inset-0 flex items-center justify-center text-muted-foreground">
                    <MapPin className="h-12 w-12" />
                  </div>
                )}
                {gem.status === "verified" && (
                  <Badge 
                    className="absolute top-2 right-2 gap-1"
                    variant="default"
                  >
                    <Verified className="h-3 w-3" />
                    Verified
                  </Badge>
                )}
              </div>
              <div className="p-4">
                <h3 className="font-semibold text-foreground text-lg mb-2" data-testid={`text-gem-title-${gem.id}`}>
                  {gem.title}
                </h3>
                <p className="text-sm text-muted-foreground mb-4 line-clamp-3">
                  {gem.description}
                </p>

                <div className="flex items-center gap-2 text-xs text-muted-foreground mb-4">
                  <Clock className="h-3 w-3" />
                  <span>{formatDate(gem.createdAt)}</span>
                </div>

                <div className="flex gap-2">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="flex-1 gap-1"
                    onClick={() => upvoteMutation.mutate(gem.id)}
                    disabled={upvoteMutation.isPending}
                    data-testid={`button-upvote-gem-${gem.id}`}
                  >
                    <ArrowUp className="h-3 w-3" />
                    <span data-testid={`text-upvotes-gem-${gem.id}`}>{gem.upvotes}</span>
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm"
                    className="gap-1"
                    data-testid={`button-location-${gem.id}`}
                  >
                    <MapPin className="h-3 w-3" />
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>

        {places.length === 0 && (
          <div className="text-center py-12">
            <MapPin className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-xl font-semibold text-foreground mb-2">
              No hidden gems yet
            </h3>
            <p className="text-muted-foreground">
              Be the first to share a special place!
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default HiddenGems;
