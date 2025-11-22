import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import multer from "multer";
import exifr from "exifr";
import path from "path";
import {
  tripSchema,
  attractionSchema,
  restaurantSchema,
  nearbyPlaceSchema,
  indoorPlaceSchema,
  loginSchema,
  signupSchema,
  updateProfileSchema,
  changePasswordSchema,
  placeSubmissionSchema,
} from "../shared/schema";
import aiRoutes from "./routes/aiRoutes";
import mapsRoutes from "./routes/mapsRoutes";

// Configure multer for file uploads
const upload = multer({
  storage: multer.diskStorage({
    destination: "uploads/",
    filename: (req, file, cb) => {
      const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
      cb(null, uniqueSuffix + path.extname(file.originalname));
    },
  }),
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);
    if (extname && mimetype) {
      cb(null, true);
    } else {
      cb(new Error("Only JPEG and PNG images are allowed"));
    }
  },
});

// Helper function to calculate distance between two GPS coordinates (Haversine formula)
function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371e3; // Earth's radius in meters
  const φ1 = (lat1 * Math.PI) / 180;
  const φ2 = (lat2 * Math.PI) / 180;
  const Δφ = ((lat2 - lat1) * Math.PI) / 180;
  const Δλ = ((lon2 - lon1) * Math.PI) / 180;

  const a =
    Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
    Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return R * c; // Distance in meters
}

// Verification functions (placeholder implementations)
async function checkReverseImageSearch(imagePath: string): Promise<boolean> {
  // Placeholder: In production, integrate with SerpApi or similar
  // For now, randomly return false (not found online) 90% of the time
  await new Promise((resolve) => setTimeout(resolve, 500)); // Simulate API call
  return Math.random() < 0.1; // 10% chance of being found online
}

async function checkAIFakeDetection(imagePath: string): Promise<number> {
  // Placeholder: In production, integrate with Reality Defender or similar
  // For now, return a random score between 0-40 (mostly real images)
  await new Promise((resolve) => setTimeout(resolve, 300)); // Simulate API call
  return Math.random() * 40; // 0-40% AI fake probability
}

export function registerRoutes(app: Express): Server {
  // Health check
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok" });
  });

  // ============= AI ENDPOINTS =============
  app.use("/api/ai", aiRoutes);

  // ============= MAPS ENDPOINTS =============
  app.use("/api/maps", mapsRoutes);

  // ============= AUTH ENDPOINTS =============
  
  // Login
  app.post("/api/auth/login", async (req, res) => {
    try {
      const data = loginSchema.parse(req.body);
      const user = await storage.authenticateUser(data.email, data.password);
      
      if (!user) {
        return res.status(401).json({ message: "Invalid credentials" });
      }

      res.json({ user });
    } catch (error: any) {
      res.status(400).json({ message: error.message || "Login failed" });
    }
  });

  // Signup
  app.post("/api/auth/signup", async (req, res) => {
    try {
      const data = signupSchema.parse(req.body);
      const user = await storage.createUser(data);
      res.status(201).json({ user });
    } catch (error: any) {
      res.status(400).json({ message: error.message || "Signup failed" });
    }
  });

  // Update profile
  app.put("/api/auth/update-profile", async (req, res) => {
    try {
      const data = updateProfileSchema.parse(req.body);
      // In a real app, you'd get userId from session/token
      const userId = 1; // Placeholder
      const user = await storage.updateUser(userId, data);
      res.json(user);
    } catch (error: any) {
      res.status(400).json({ message: error.message || "Update failed" });
    }
  });

  // Change password
  app.put("/api/auth/change-password", async (req, res) => {
    try {
      const data = changePasswordSchema.parse(req.body);
      // In a real app, you'd get userId from session/token
      const userId = 1; // Placeholder
      await storage.changePassword(userId, data.currentPassword, data.newPassword);
      res.json({ message: "Password changed successfully" });
    } catch (error: any) {
      res.status(400).json({ message: error.message || "Password change failed" });
    }
  });

  // ============= TRIP ENDPOINTS =============
  
  app.get("/api/trips", async (req, res) => {
    try {
      const trips = await storage.getTrips();
      res.json(trips);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch trips" });
    }
  });

  app.get("/api/trips/:id", async (req, res) => {
    try {
      const trip = await storage.getTrip(parseInt(req.params.id));
      if (!trip) return res.status(404).json({ message: "Trip not found" });
      res.json(trip);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch trip" });
    }
  });

  app.post("/api/trips", async (req, res) => {
    try {
      const data = tripSchema.omit({ id: true, createdAt: true }).parse(req.body);
      const trip = await storage.createTrip(data);
      res.status(201).json(trip);
    } catch (error: any) {
      res.status(400).json({ message: error.message || "Invalid trip data" });
    }
  });

  app.delete("/api/trips/:id", async (req, res) => {
    try {
      await storage.deleteTrip(parseInt(req.params.id));
      res.json({ message: "Trip deleted successfully" });
    } catch (error: any) {
      res.status(404).json({ message: error.message });
    }
  });

  // ============= ATTRACTION ENDPOINTS =============
  
  app.get("/api/trips/:tripId/attractions", async (req, res) => {
    try {
      const attractions = await storage.getAttractions(parseInt(req.params.tripId));
      res.json(attractions);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch attractions" });
    }
  });

  app.post("/api/trips/:tripId/attractions", async (req, res) => {
    try {
      const data = attractionSchema
        .omit({ id: true, upvotes: true })
        .parse({ ...req.body, tripId: parseInt(req.params.tripId) });
      const attraction = await storage.createAttraction(data);
      res.status(201).json(attraction);
    } catch (error: any) {
      res.status(400).json({ message: error.message || "Invalid attraction data" });
    }
  });

  app.post("/api/attractions/:id/upvote", async (req, res) => {
    try {
      const attraction = await storage.upvoteAttraction(parseInt(req.params.id));
      res.json(attraction);
    } catch (error: any) {
      res.status(404).json({ message: error.message });
    }
  });

  // ============= RESTAURANT ENDPOINTS =============
  
  app.get("/api/trips/:tripId/restaurants", async (req, res) => {
    try {
      const restaurants = await storage.getRestaurants(parseInt(req.params.tripId));
      res.json(restaurants);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch restaurants" });
    }
  });

  app.post("/api/trips/:tripId/restaurants", async (req, res) => {
    try {
      const data = restaurantSchema
        .omit({ id: true, upvotes: true })
        .parse({ ...req.body, tripId: parseInt(req.params.tripId) });
      const restaurant = await storage.createRestaurant(data);
      res.status(201).json(restaurant);
    } catch (error: any) {
      res.status(400).json({ message: error.message || "Invalid restaurant data" });
    }
  });

  // ============= NEARBY PLACE ENDPOINTS =============
  
  app.get("/api/trips/:tripId/nearby", async (req, res) => {
    try {
      const category = req.query.category as string | undefined;
      const places = await storage.getNearbyPlaces(parseInt(req.params.tripId), category);
      res.json(places);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch nearby places" });
    }
  });

  app.post("/api/nearby/:id/upvote", async (req, res) => {
    try {
      const place = await storage.upvoteNearbyPlace(parseInt(req.params.id));
      res.json(place);
    } catch (error: any) {
      res.status(404).json({ message: error.message });
    }
  });

  // ============= INDOOR ALTERNATIVES ENDPOINTS =============
  
  app.get("/api/trips/:tripId/indoor-alternatives", async (req, res) => {
    try {
      const alternatives = await storage.getIndoorAlternatives(parseInt(req.params.tripId));
      res.json(alternatives);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch indoor alternatives" });
    }
  });

  // ============= UNDERRATED PLACES SUBMISSION ENDPOINTS =============
  
  app.post("/api/places/submit", upload.single("image"), async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ message: "Image file is required" });
      }

      // Parse and validate the form data
      const data = placeSubmissionSchema.parse({
        title: req.body.title,
        description: req.body.description,
        latitude: parseFloat(req.body.latitude),
        longitude: parseFloat(req.body.longitude),
      });

      const imagePath = req.file.path;
      const imageUrl = `/${req.file.path}`;

      // ============= VERIFICATION CHECKS =============
      
      // 1. EXIF Location Check
      let exifDistance: number | undefined;
      let exifLat: number | undefined;
      let exifLon: number | undefined;
      
      try {
        const gpsData = await exifr.gps(imagePath);
        if (gpsData && gpsData.latitude && gpsData.longitude) {
          exifLat = gpsData.latitude;
          exifLon = gpsData.longitude;
          exifDistance = calculateDistance(
            data.latitude,
            data.longitude,
            exifLat,
            exifLon
          );
        }
      } catch (error) {
        console.log("No EXIF GPS data found in image");
      }

      // 2. Reverse Image Search Check
      const reverseImageFound = await checkReverseImageSearch(imagePath);

      // 3. AI Fake Detection Check
      const aiFakeScore = await checkAIFakeDetection(imagePath);

      // ============= DECISION LOGIC =============
      
      let status: "verified" | "pending_review" = "verified";
      
      // Check EXIF distance (if EXIF data exists)
      if (exifDistance !== undefined && exifDistance > 500) {
        status = "pending_review";
      }
      
      // Check reverse image search
      if (reverseImageFound) {
        status = "pending_review";
      }
      
      // Check AI fake score
      if (aiFakeScore > 70) {
        status = "pending_review";
      }

      // Save the place
      const place = await storage.createUnderratedPlace({
        title: data.title,
        description: data.description,
        latitude: data.latitude,
        longitude: data.longitude,
        imageUrl,
        status,
        exifDistance,
        reverseImageFound,
        aiFakeScore,
      });

      res.status(201).json({
        message: "Place submitted successfully",
        status: place.status,
        place: {
          id: place.id,
          title: place.title,
          status: place.status,
          verificationDetails: {
            exifDistance: exifDistance !== undefined ? `${Math.round(exifDistance)}m` : "No EXIF data",
            exifCoords: exifLat && exifLon ? `${exifLat.toFixed(6)}, ${exifLon.toFixed(6)}` : "N/A",
            reverseImageFound,
            aiFakeScore: `${aiFakeScore.toFixed(1)}%`,
          },
        },
      });
    } catch (error: any) {
      console.error("Place submission error:", error);
      res.status(400).json({ 
        message: error.message || "Failed to submit place" 
      });
    }
  });

  // Get all submitted places
  app.get("/api/places", async (req, res) => {
    try {
      const places = await storage.getUnderratedPlaces();
      res.json(places);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch places" });
    }
  });

  // Get a single place by ID
  app.get("/api/places/:id", async (req, res) => {
    try {
      const place = await storage.getUnderratedPlace(parseInt(req.params.id));
      if (!place) {
        return res.status(404).json({ message: "Place not found" });
      }
      res.json(place);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch place" });
    }
  });

  // Catch-all
  app.use((req, res, next) => {
    if (req.path.startsWith("/api")) {
      res.status(404).json({ message: "API endpoint not found" });
    } else {
      next();
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
