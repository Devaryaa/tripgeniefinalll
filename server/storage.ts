import type {
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
  User,
  InsertUser,
  PublicUser,
  UnderratedPlace,
} from "../shared/schema";

export interface IStorage {
  // User operations
  createUser(user: InsertUser): Promise<PublicUser>;
  authenticateUser(email: string, password: string): Promise<PublicUser | null>;
  updateUser(id: number, updates: Partial<Omit<User, "id" | "password" | "createdAt">>): Promise<PublicUser>;
  changePassword(id: number, currentPassword: string, newPassword: string): Promise<void>;

  // Trip operations
  getTrips(): Promise<Trip[]>;
  getTrip(id: number): Promise<Trip | null>;
  createTrip(trip: InsertTrip): Promise<Trip>;
  updateTrip(id: number, trip: Partial<Trip>): Promise<Trip>;
  deleteTrip(id: number): Promise<void>;

  // Attraction operations
  getAttractions(tripId: number): Promise<Attraction[]>;
  createAttraction(attraction: InsertAttraction): Promise<Attraction>;
  upvoteAttraction(id: number): Promise<Attraction>;

  // Restaurant operations
  getRestaurants(tripId: number): Promise<Restaurant[]>;
  createRestaurant(restaurant: InsertRestaurant): Promise<Restaurant>;

  // Nearby place operations
  getNearbyPlaces(tripId: number, category?: string): Promise<NearbyPlace[]>;
  upvoteNearbyPlace(id: number): Promise<NearbyPlace>;

  // Indoor alternative operations
  getIndoorAlternatives(tripId: number): Promise<IndoorPlace[]>;

  // Underrated place operations
  createUnderratedPlace(place: Omit<UnderratedPlace, "id" | "createdAt">): Promise<UnderratedPlace>;
  getUnderratedPlaces(): Promise<UnderratedPlace[]>;
  getUnderratedPlace(id: number): Promise<UnderratedPlace | null>;
}

// In-memory storage implementation
class MemStorage implements IStorage {
  private users: Map<number, User> = new Map();
  private trips: Map<number, Trip> = new Map();
  private attractions: Map<number, Attraction> = new Map();
  private restaurants: Map<number, Restaurant> = new Map();
  private nearbyPlaces: Map<number, NearbyPlace> = new Map();
  private indoorPlaces: Map<number, IndoorPlace> = new Map();
  private underratedPlaces: Map<number, UnderratedPlace> = new Map();
  
  private userIdCounter = 1;
  private tripIdCounter = 1;
  private attractionIdCounter = 1;
  private restaurantIdCounter = 1;
  private nearbyPlaceIdCounter = 1;
  private indoorPlaceIdCounter = 1;
  private underratedPlaceIdCounter = 1;

  // User operations
  async createUser(user: InsertUser): Promise<PublicUser> {
    // Check if user already exists
    const existingUser = Array.from(this.users.values()).find(
      (u) => u.email === user.email
    );
    if (existingUser) {
      throw new Error("User already exists");
    }

    const newUser: User = {
      ...user,
      id: this.userIdCounter++,
      createdAt: new Date(),
    };
    this.users.set(newUser.id, newUser);

    // Return user without password
    const { password, ...publicUser } = newUser;
    return publicUser;
  }

  async authenticateUser(email: string, password: string): Promise<PublicUser | null> {
    const user = Array.from(this.users.values()).find(
      (u) => u.email === email && u.password === password
    );
    
    if (!user) return null;
    
    const { password: _, ...publicUser } = user;
    return publicUser;
  }

  async updateUser(
    id: number,
    updates: Partial<Omit<User, "id" | "password" | "createdAt">>
  ): Promise<PublicUser> {
    const user = this.users.get(id);
    if (!user) throw new Error("User not found");

    const updatedUser = { ...user, ...updates };
    this.users.set(id, updatedUser);

    const { password, ...publicUser } = updatedUser;
    return publicUser;
  }

  async changePassword(
    id: number,
    currentPassword: string,
    newPassword: string
  ): Promise<void> {
    const user = this.users.get(id);
    if (!user) throw new Error("User not found");
    if (user.password !== currentPassword) {
      throw new Error("Current password is incorrect");
    }

    user.password = newPassword;
    this.users.set(id, user);
  }

  // Trip operations
  async getTrips(): Promise<Trip[]> {
    return Array.from(this.trips.values());
  }

  async getTrip(id: number): Promise<Trip | null> {
    return this.trips.get(id) || null;
  }

  async createTrip(trip: InsertTrip): Promise<Trip> {
    const newTrip: Trip = {
      ...trip,
      id: this.tripIdCounter++,
      createdAt: new Date(),
    };
    this.trips.set(newTrip.id, newTrip);
    return newTrip;
  }

  async updateTrip(id: number, updates: Partial<Trip>): Promise<Trip> {
    const trip = this.trips.get(id);
    if (!trip) throw new Error("Trip not found");
    const updated = { ...trip, ...updates };
    this.trips.set(id, updated);
    return updated;
  }

  async deleteTrip(id: number): Promise<void> {
    if (!this.trips.has(id)) throw new Error("Trip not found");
    
    // Delete associated data
    Array.from(this.attractions.values())
      .filter((a) => a.tripId === id)
      .forEach((a) => this.attractions.delete(a.id!));
    
    Array.from(this.restaurants.values())
      .filter((r) => r.tripId === id)
      .forEach((r) => this.restaurants.delete(r.id!));
    
    Array.from(this.nearbyPlaces.values())
      .filter((p) => p.tripId === id)
      .forEach((p) => this.nearbyPlaces.delete(p.id!));
    
    Array.from(this.indoorPlaces.values())
      .filter((p) => p.tripId === id)
      .forEach((p) => this.indoorPlaces.delete(p.id!));

    this.trips.delete(id);
  }

  // Attraction operations
  async getAttractions(tripId: number): Promise<Attraction[]> {
    return Array.from(this.attractions.values()).filter(
      (a) => a.tripId === tripId
    );
  }

  async createAttraction(attraction: InsertAttraction): Promise<Attraction> {
    const newAttraction: Attraction = {
      ...attraction,
      id: this.attractionIdCounter++,
      upvotes: 0,
    };
    this.attractions.set(newAttraction.id, newAttraction);
    return newAttraction;
  }

  async upvoteAttraction(id: number): Promise<Attraction> {
    const attraction = this.attractions.get(id);
    if (!attraction) throw new Error("Attraction not found");
    attraction.upvotes = (attraction.upvotes || 0) + 1;
    return attraction;
  }

  // Restaurant operations
  async getRestaurants(tripId: number): Promise<Restaurant[]> {
    return Array.from(this.restaurants.values()).filter(
      (r) => r.tripId === tripId
    );
  }

  async createRestaurant(restaurant: InsertRestaurant): Promise<Restaurant> {
    const newRestaurant: Restaurant = {
      ...restaurant,
      id: this.restaurantIdCounter++,
      upvotes: 0,
    };
    this.restaurants.set(newRestaurant.id, newRestaurant);
    return newRestaurant;
  }

  // Nearby place operations
  async getNearbyPlaces(tripId: number, category?: string): Promise<NearbyPlace[]> {
    return Array.from(this.nearbyPlaces.values()).filter((p) => {
      if (p.tripId !== tripId) return false;
      if (category && p.category !== category) return false;
      return true;
    });
  }

  async upvoteNearbyPlace(id: number): Promise<NearbyPlace> {
    const place = this.nearbyPlaces.get(id);
    if (!place) throw new Error("Nearby place not found");
    place.upvotes = (place.upvotes || 0) + 1;
    return place;
  }

  // Indoor alternative operations
  async getIndoorAlternatives(tripId: number): Promise<IndoorPlace[]> {
    return Array.from(this.indoorPlaces.values()).filter(
      (p) => p.tripId === tripId
    );
  }

  // Underrated place operations
  async createUnderratedPlace(place: Omit<UnderratedPlace, "id" | "createdAt">): Promise<UnderratedPlace> {
    const newPlace: UnderratedPlace = {
      ...place,
      id: this.underratedPlaceIdCounter++,
      createdAt: new Date(),
    };
    this.underratedPlaces.set(newPlace.id, newPlace);
    return newPlace;
  }

  async getUnderratedPlaces(): Promise<UnderratedPlace[]> {
    return Array.from(this.underratedPlaces.values());
  }

  async getUnderratedPlace(id: number): Promise<UnderratedPlace | null> {
    return this.underratedPlaces.get(id) || null;
  }
}

export const storage: IStorage = new MemStorage();
