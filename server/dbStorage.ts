import { db } from '../db';
import { users, trips, attractions, restaurants, nearbyPlaces, indoorPlaces, underratedPlaces } from '../db/schema';
import { eq, sql, and } from 'drizzle-orm';
import type { IStorage } from './storage';
import type {
  User,
  InsertUser,
  PublicUser,
  Trip,
  InsertTrip,
  Attraction,
  InsertAttraction,
  Restaurant,
  InsertRestaurant,
  NearbyPlace,
  InsertNearbyPlace,
  IndoorPlace,
  InsertIndoorPlace,
  UnderratedPlace,
} from '../shared/schema';

export class DbStorage implements IStorage {
  // User operations
  async createUser(user: InsertUser): Promise<PublicUser> {
    const existingUsers = await db
      .select()
      .from(users)
      .where(eq(users.email, user.email));
    
    if (existingUsers.length > 0) {
      throw new Error("User already exists");
    }

    const [newUser] = await db.insert(users).values(user).returning();
    const { password, ...publicUser } = newUser;
    return publicUser as PublicUser;
  }

  async authenticateUser(email: string, password: string): Promise<PublicUser | null> {
    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.email, email));
    
    if (!user || user.password !== password) {
      return null;
    }
    
    const { password: _, ...publicUser } = user;
    return publicUser as PublicUser;
  }

  async updateUser(id: number, updates: Partial<Omit<User, "id" | "password" | "createdAt">>): Promise<PublicUser> {
    const [updatedUser] = await db
      .update(users)
      .set(updates)
      .where(eq(users.id, id))
      .returning();
    
    if (!updatedUser) {
      throw new Error("User not found");
    }
    
    const { password, ...publicUser } = updatedUser;
    return publicUser as PublicUser;
  }

  async changePassword(id: number, currentPassword: string, newPassword: string): Promise<void> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    
    if (!user) {
      throw new Error("User not found");
    }
    
    if (user.password !== currentPassword) {
      throw new Error("Current password is incorrect");
    }
    
    await db.update(users).set({ password: newPassword }).where(eq(users.id, id));
  }

  // Trip operations
  async getTrips(): Promise<Trip[]> {
    return await db.select().from(trips) as Trip[];
  }

  async getTrip(id: number): Promise<Trip | null> {
    const [trip] = await db.select().from(trips).where(eq(trips.id, id));
    return trip as Trip || null;
  }

  async createTrip(trip: InsertTrip): Promise<Trip> {
    const [newTrip] = await db.insert(trips).values(trip).returning();
    return newTrip as Trip;
  }

  async updateTrip(id: number, trip: Partial<Trip>): Promise<Trip> {
    const [updatedTrip] = await db
      .update(trips)
      .set(trip)
      .where(eq(trips.id, id))
      .returning();
    
    if (!updatedTrip) {
      throw new Error("Trip not found");
    }
    
    return updatedTrip as Trip;
  }

  async deleteTrip(id: number): Promise<void> {
    await db.delete(trips).where(eq(trips.id, id));
  }

  // Attraction operations
  async getAttractions(tripId: number): Promise<Attraction[]> {
    return await db
      .select()
      .from(attractions)
      .where(eq(attractions.tripId, tripId)) as Attraction[];
  }

  async createAttraction(attraction: InsertAttraction): Promise<Attraction> {
    const [newAttraction] = await db.insert(attractions).values(attraction).returning();
    return newAttraction as Attraction;
  }

  async upvoteAttraction(id: number): Promise<Attraction> {
    const [updatedAttraction] = await db
      .update(attractions)
      .set({ upvotes: sql`${attractions.upvotes} + 1` })
      .where(eq(attractions.id, id))
      .returning();
    
    if (!updatedAttraction) {
      throw new Error("Attraction not found");
    }
    
    return updatedAttraction as Attraction;
  }

  // Restaurant operations
  async getRestaurants(tripId: number): Promise<Restaurant[]> {
    return await db
      .select()
      .from(restaurants)
      .where(eq(restaurants.tripId, tripId)) as Restaurant[];
  }

  async createRestaurant(restaurant: InsertRestaurant): Promise<Restaurant> {
    const [newRestaurant] = await db.insert(restaurants).values(restaurant).returning();
    return newRestaurant as Restaurant;
  }

  // Nearby place operations
  async getNearbyPlaces(tripId: number, category?: string): Promise<NearbyPlace[]> {
    if (category) {
      return await db
        .select()
        .from(nearbyPlaces)
        .where(and(
          eq(nearbyPlaces.tripId, tripId),
          eq(nearbyPlaces.category, category as any)
        )) as NearbyPlace[];
    }
    
    return await db
      .select()
      .from(nearbyPlaces)
      .where(eq(nearbyPlaces.tripId, tripId)) as NearbyPlace[];
  }

  async upvoteNearbyPlace(id: number): Promise<NearbyPlace> {
    const [updatedPlace] = await db
      .update(nearbyPlaces)
      .set({ upvotes: sql`${nearbyPlaces.upvotes} + 1` })
      .where(eq(nearbyPlaces.id, id))
      .returning();
    
    if (!updatedPlace) {
      throw new Error("Nearby place not found");
    }
    
    return updatedPlace as NearbyPlace;
  }

  // Indoor alternative operations
  async getIndoorAlternatives(tripId: number): Promise<IndoorPlace[]> {
    return await db
      .select()
      .from(indoorPlaces)
      .where(eq(indoorPlaces.tripId, tripId)) as IndoorPlace[];
  }

  // Underrated place operations
  async createUnderratedPlace(place: Omit<UnderratedPlace, "id" | "createdAt" | "upvotes">): Promise<UnderratedPlace> {
    const [newPlace] = await db.insert(underratedPlaces).values(place).returning();
    return newPlace as UnderratedPlace;
  }

  async getUnderratedPlaces(): Promise<UnderratedPlace[]> {
    return await db.select().from(underratedPlaces) as UnderratedPlace[];
  }

  async getUnderratedPlace(id: number): Promise<UnderratedPlace | null> {
    const [place] = await db.select().from(underratedPlaces).where(eq(underratedPlaces.id, id));
    return place as UnderratedPlace || null;
  }

  async upvoteUnderratedPlace(id: number): Promise<UnderratedPlace> {
    const [updatedPlace] = await db
      .update(underratedPlaces)
      .set({ upvotes: sql`${underratedPlaces.upvotes} + 1` })
      .where(eq(underratedPlaces.id, id))
      .returning();
    
    if (!updatedPlace) {
      throw new Error("Underrated place not found");
    }
    
    return updatedPlace as UnderratedPlace;
  }
}

export const storage = new DbStorage();
