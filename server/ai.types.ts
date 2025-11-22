export interface UserPreferences {
  interests: string[];
  budget: 'low' | 'medium' | 'high';
  pace: 'relaxed' | 'moderate' | 'packed';
  foodPreference: string[];
  travelStyle: string[];
}

export interface LocationData {
  city: string;
  geotag?: {
    latitude: number;
    longitude: number;
  };
  weather?: WeatherData;
}

export interface WeatherData {
  temperature: number;
  condition: string;
  humidity?: number;
  rainfall?: number;
}

export interface TripRequest {
  userPreferences: UserPreferences;
  location: LocationData;
  duration: number;
  visited?: string[];
  previouslyShown?: string[];
}

export interface ShuffleRequest {
  placeName: string;
  placeType: string;
  location: LocationData;
  userPreferences: UserPreferences;
  visited?: string[];
  previouslyShown?: string[];
}

export interface AIResponse {
  success: boolean;
  data?: any;
  error?: string;
}
