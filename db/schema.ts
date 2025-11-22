import { pgTable, serial, varchar, text, integer, boolean, timestamp, doublePrecision } from "drizzle-orm/pg-core";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  email: varchar("email", { length: 255 }).notNull().unique(),
  password: varchar("password", { length: 255 }).notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const trips = pgTable("trips", {
  id: serial("id").primaryKey(),
  destination: varchar("destination", { length: 255 }).notNull(),
  days: integer("days").notNull(),
  budget: integer("budget").notNull(),
  travelStyle: varchar("travel_style", { length: 50 }).notNull(),
  interests: text("interests").array().notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const attractions = pgTable("attractions", {
  id: serial("id").primaryKey(),
  tripId: integer("trip_id").notNull().references(() => trips.id, { onDelete: "cascade" }),
  name: varchar("name", { length: 255 }).notNull(),
  description: text("description").notNull(),
  timing: varchar("timing", { length: 50 }).notNull(),
  rating: doublePrecision("rating").notNull(),
  reviews: integer("reviews").notNull(),
  category: varchar("category", { length: 100 }).notNull(),
  day: integer("day").notNull(),
  upvotes: integer("upvotes").notNull().default(0),
});

export const restaurants = pgTable("restaurants", {
  id: serial("id").primaryKey(),
  tripId: integer("trip_id").notNull().references(() => trips.id, { onDelete: "cascade" }),
  name: varchar("name", { length: 255 }).notNull(),
  rating: doublePrecision("rating").notNull(),
  reviews: integer("reviews").notNull(),
  price: integer("price").notNull(),
  cuisine: varchar("cuisine", { length: 100 }).notNull(),
  day: integer("day").notNull(),
  mealType: varchar("meal_type", { length: 50 }).notNull(),
  upvotes: integer("upvotes").notNull().default(0),
});

export const nearbyPlaces = pgTable("nearby_places", {
  id: serial("id").primaryKey(),
  tripId: integer("trip_id").notNull().references(() => trips.id, { onDelete: "cascade" }),
  name: varchar("name", { length: 255 }).notNull(),
  category: varchar("category", { length: 50 }).notNull(),
  rating: doublePrecision("rating").notNull(),
  reviews: integer("reviews").notNull(),
  priceLevel: varchar("price_level", { length: 50 }).notNull(),
  distance: varchar("distance", { length: 50 }).notNull(),
  upvotes: integer("upvotes").notNull().default(0),
});

export const indoorPlaces = pgTable("indoor_places", {
  id: serial("id").primaryKey(),
  tripId: integer("trip_id").notNull().references(() => trips.id, { onDelete: "cascade" }),
  name: varchar("name", { length: 255 }).notNull(),
  description: text("description").notNull(),
  rating: doublePrecision("rating").notNull(),
});

export const underratedPlaces = pgTable("underrated_places", {
  id: serial("id").primaryKey(),
  title: varchar("title", { length: 255 }).notNull(),
  description: text("description").notNull(),
  latitude: doublePrecision("latitude").notNull(),
  longitude: doublePrecision("longitude").notNull(),
  imageUrl: varchar("image_url", { length: 500 }).notNull(),
  status: varchar("status", { length: 50 }).notNull(),
  exifDistance: doublePrecision("exif_distance"),
  reverseImageFound: boolean("reverse_image_found"),
  aiFakeScore: doublePrecision("ai_fake_score"),
  upvotes: integer("upvotes").notNull().default(0),
  createdAt: timestamp("created_at").defaultNow(),
});
