import { z } from "zod";

// Existing schemas...
export const tripSchema = z.object({
  id: z.number().optional(),
  destination: z.string(),
  days: z.number().min(1),
  budget: z.number().min(0),
  travelStyle: z.enum(["solo", "couple", "family", "friends"]),
  interests: z.array(z.string()),
  createdAt: z.date().optional(),
});

export type Trip = z.infer<typeof tripSchema>;
export type InsertTrip = Omit<Trip, "id" | "createdAt">;

// User schema
export const userSchema = z.object({
  id: z.number().optional(),
  name: z.string(),
  email: z.string().email(),
  password: z.string().min(6),
  createdAt: z.date().optional(),
});

export type User = z.infer<typeof userSchema>;
export type InsertUser = Omit<User, "id" | "createdAt">;
export type PublicUser = Omit<User, "password">;

// Auth schemas
export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string(),
});

export const signupSchema = z.object({
  name: z.string().min(1),
  email: z.string().email(),
  password: z.string().min(6),
});

export const updateProfileSchema = z.object({
  name: z.string().min(1),
  email: z.string().email(),
});

export const changePasswordSchema = z.object({
  currentPassword: z.string(),
  newPassword: z.string().min(6),
});

// Attraction schema
export const attractionSchema = z.object({
  id: z.number().optional(),
  tripId: z.number(),
  name: z.string(),
  description: z.string(),
  timing: z.enum(["Morning", "Afternoon", "Evening"]),
  rating: z.number().min(0).max(5),
  reviews: z.number().min(0),
  category: z.string(),
  upvotes: z.number().default(0),
});

export type Attraction = z.infer<typeof attractionSchema>;
export type InsertAttraction = Omit<Attraction, "id" | "upvotes">;

// Restaurant schema
export const restaurantSchema = z.object({
  id: z.number().optional(),
  tripId: z.number(),
  name: z.string(),
  rating: z.number().min(0).max(5),
  reviews: z.number().min(0),
  price: z.number().min(0),
  cuisine: z.string(),
  day: z.number(),
  mealType: z.enum(["Breakfast", "Lunch", "Dinner"]),
  upvotes: z.number().default(0),
});

export type Restaurant = z.infer<typeof restaurantSchema>;
export type InsertRestaurant = Omit<Restaurant, "id" | "upvotes">;

// Nearby place schema
export const nearbyPlaceSchema = z.object({
  id: z.number().optional(),
  tripId: z.number(),
  name: z.string(),
  category: z.enum(["attractions", "food", "cafes", "nightlife"]),
  rating: z.number().min(0).max(5),
  reviews: z.number().min(0),
  priceLevel: z.string(),
  distance: z.string(),
  upvotes: z.number().default(0),
});

export type NearbyPlace = z.infer<typeof nearbyPlaceSchema>;
export type InsertNearbyPlace = Omit<NearbyPlace, "id" | "upvotes">;

// Indoor alternative schema
export const indoorPlaceSchema = z.object({
  id: z.number().optional(),
  tripId: z.number(),
  name: z.string(),
  description: z.string(),
  rating: z.number().min(0).max(5),
});

export type IndoorPlace = z.infer<typeof indoorPlaceSchema>;
export type InsertIndoorPlace = Omit<IndoorPlace, "id">;

// Underrated Place submission schema
export const underratedPlaceSchema = z.object({
  id: z.number().optional(),
  title: z.string().min(1),
  description: z.string().min(10),
  latitude: z.number().min(-90).max(90),
  longitude: z.number().min(-180).max(180),
  imageUrl: z.string(),
  status: z.enum(["verified", "pending_review", "rejected"]),
  exifDistance: z.number().optional(),
  reverseImageFound: z.boolean().optional(),
  aiFakeScore: z.number().min(0).max(100).optional(),
  createdAt: z.date().optional(),
});

export type UnderratedPlace = z.infer<typeof underratedPlaceSchema>;
export type InsertUnderratedPlace = Omit<UnderratedPlace, "id" | "createdAt" | "status">;

export const placeSubmissionSchema = z.object({
  title: z.string().min(1),
  description: z.string().min(10),
  latitude: z.number().min(-90).max(90),
  longitude: z.number().min(-180).max(180),
});
