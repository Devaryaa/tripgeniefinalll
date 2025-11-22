import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { AlertTriangle, Shuffle, Star, ArrowLeft, Send, MessageCircle, Clock } from "lucide-react";
import { useLocation } from "wouter";
import { Badge } from "@/components/ui/badge";
import { useTrip } from "@/context/TripContext";
import { Input } from "@/components/ui/input";

interface ChatMessage {
  id: string;
  sender: "user" | "assistant";
  text: string;
  timestamp: Date;
}

interface AdjustedItinerary {
  acknowledgment?: string;
  recommendation?: string;
  days?: any[];
  cafes?: any[];
  medical?: string[];
  tips?: string[];
}

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
  
  // Chat state
  const [showChat, setShowChat] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: "1",
      sender: "assistant",
      text: "Hi! I'm TripGenie Plan B Assistant. Tell me what happened - did you miss something, wake up late, or want to change your plans? I'll help you adjust your itinerary! 🎯",
      timestamp: new Date(),
    },
  ]);
  const [inputValue, setInputValue] = useState("");
  const [adjustingItinerary, setAdjustingItinerary] = useState(false);
  const [adjustedItinerary, setAdjustedItinerary] = useState<AdjustedItinerary | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    loadAlternatives();
  }, [currentTrip]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

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

  const handleSendMessage = async () => {
    if (!inputValue.trim()) return;

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      sender: "user",
      text: inputValue,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputValue("");
    setAdjustingItinerary(true);

    try {
      // Call the adjust-itinerary endpoint
      const response = await fetch("/api/ai/adjust-itinerary", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userMessage: inputValue,
          currentItinerary: {
            days: [],
            cafes: [],
            medical: [],
            tips: [],
          },
          location: {
            city: currentTrip?.destination || "Unknown City",
          },
          userPreferences: {
            interests: currentTrip?.interests || [],
            budget: currentTrip?.budget || 0,
            pace: currentTrip?.travelStyle || "moderate",
          },
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to adjust itinerary");
      }

      const data = await response.json();

      if (data.success && data.data) {
        const assistantResponse: ChatMessage = {
          id: (Date.now() + 1).toString(),
          sender: "assistant",
          text:
            data.data.acknowledgment ||
            "Great! I've adjusted your itinerary based on your situation.",
          timestamp: new Date(),
        };
        setMessages((prev) => [...prev, assistantResponse]);
        setAdjustedItinerary(data.data);
      } else {
        throw new Error(data.error || "Failed to process request");
      }
    } catch (error: any) {
      const errorMessage: ChatMessage = {
        id: (Date.now() + 2).toString(),
        sender: "assistant",
        text: `I encountered an issue: ${error.message}. Please try again with a different message.`,
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setAdjustingItinerary(false);
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

        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-2">
              Indoor Plan B
            </h1>
            <p className="text-muted-foreground">
              Rain or shine, your adventure continues
            </p>
          </div>
          <Button
            onClick={() => setShowChat(!showChat)}
            variant="outline"
            size="lg"
            className="gap-2"
            data-testid="button-chat-mode"
          >
            <MessageCircle className="h-5 w-5" />
            <span className="hidden sm:inline">
              {showChat ? "Hide Assistant" : "Chat Mode"}
            </span>
          </Button>
        </div>

        {showChat ? (
          // Chat Interface
          <div className="space-y-4">
            <Card className="p-4 min-h-96 max-h-96 overflow-y-auto bg-muted/30 border-primary/20">
              <div className="space-y-4">
                {messages.map((msg) => (
                  <div
                    key={msg.id}
                    className={`flex ${
                      msg.sender === "user" ? "justify-end" : "justify-start"
                    }`}
                  >
                    <div
                      className={`max-w-xs px-4 py-2 rounded-lg ${
                        msg.sender === "user"
                          ? "bg-primary text-primary-foreground rounded-br-none"
                          : "bg-background border border-border rounded-bl-none"
                      }`}
                      data-testid={`message-${msg.id}`}
                    >
                      <p className="text-sm">{msg.text}</p>
                      <p
                        className={`text-xs mt-1 ${
                          msg.sender === "user"
                            ? "text-primary-foreground/70"
                            : "text-muted-foreground"
                        }`}
                      >
                        {msg.timestamp.toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </p>
                    </div>
                  </div>
                ))}
                {adjustingItinerary && (
                  <div className="flex justify-start">
                    <div className="bg-background border border-border px-4 py-2 rounded-lg rounded-bl-none">
                      <div className="flex items-center gap-2">
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary"></div>
                        <p className="text-sm text-muted-foreground">
                          Adjusting your itinerary...
                        </p>
                      </div>
                    </div>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>
            </Card>

            <div className="flex gap-2">
              <Input
                placeholder="Tell me what happened... (woke up late, missed something, etc.)"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyPress={(e) => {
                  if (e.key === "Enter" && !adjustingItinerary) {
                    handleSendMessage();
                  }
                }}
                disabled={adjustingItinerary}
                data-testid="input-chat-message"
              />
              <Button
                onClick={handleSendMessage}
                disabled={adjustingItinerary || !inputValue.trim()}
                size="lg"
                className="gap-2"
                data-testid="button-send-message"
              >
                <Send className="h-4 w-4" />
              </Button>
            </div>

            {adjustedItinerary && adjustedItinerary.days && (
              <div className="mt-8">
                <h3 className="text-xl font-bold text-foreground mb-4">
                  Adjusted Itinerary
                </h3>
                {adjustedItinerary.recommendation && (
                  <Card className="p-4 mb-4 bg-primary/5 border-primary/20">
                    <p className="text-sm text-foreground">
                      <strong>Recommendation:</strong>{" "}
                      {adjustedItinerary.recommendation}
                    </p>
                  </Card>
                )}

                <div className="space-y-4">
                  {adjustedItinerary.days.map((day: any) => (
                    <Card key={day.day} className="p-4">
                      <div className="bg-primary text-primary-foreground p-3 rounded mb-3">
                        <h4 className="font-bold">Day {day.day}</h4>
                      </div>
                      <div className="space-y-3">
                        {day.places &&
                          day.places.map((place: any, idx: number) => (
                            <div
                              key={idx}
                              className="p-3 bg-muted/50 rounded border border-border"
                            >
                              <h5 className="font-semibold text-foreground">
                                {place.name}
                              </h5>
                              <p className="text-sm text-muted-foreground mt-1">
                                {place.description}
                              </p>
                              <div className="flex items-center gap-2 mt-2 text-xs text-muted-foreground">
                                <Clock className="h-3 w-3" />
                                <span>{place.timing}</span>
                              </div>
                            </div>
                          ))}
                      </div>
                    </Card>
                  ))}
                </div>
              </div>
            )}
          </div>
        ) : (
          // Original Plan B View
          <div className="space-y-4 mb-8">
            {indoorPlaces.map((place, idx) => (
              <Card
                key={idx}
                className="p-6 hover:shadow-medium transition-shadow"
                data-testid={`card-indoor-place-${idx}`}
              >
                <div className="flex flex-col sm:flex-row gap-4">
                  <div className="flex-1">
                    <div className="flex items-start justify-between mb-2">
                      <h3
                        className="font-semibold text-foreground text-xl"
                        data-testid={`text-place-name-${idx}`}
                      >
                        {place.name}
                      </h3>
                      <Badge variant="secondary" className="ml-2">
                        <Star className="h-3 w-3 mr-1 fill-warning text-warning" />
                        {place.rating}
                      </Badge>
                    </div>
                    <p
                      className="text-muted-foreground mb-4"
                      data-testid={`text-place-description-${idx}`}
                    >
                      {place.description}
                    </p>
                    <Button
                      variant="outline"
                      size="sm"
                      className="gap-1"
                      data-testid={`button-find-alternative-${idx}`}
                    >
                      <Shuffle className="h-3 w-3" />
                      Find Alternative
                    </Button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}

        <div className="flex flex-col sm:flex-row gap-4">
          <Button
            onClick={() => setLocation("/itinerary")}
            variant="outline"
            size="lg"
            className="flex-1 gap-2 border-2"
            data-testid="button-back-itinerary"
          >
            <ArrowLeft className="h-5 w-5" />
            Back to Itinerary
          </Button>
          <Button
            variant="outline"
            size="lg"
            className="flex-1 gap-2 border-2"
            data-testid="button-shuffle-all"
          >
            <Shuffle className="h-5 w-5" />
            Shuffle All Options
          </Button>
        </div>
      </div>
    </div>
  );
};

export default PlanB;
