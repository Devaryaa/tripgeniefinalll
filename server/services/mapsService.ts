import dotenv from "dotenv";

dotenv.config();

// Google Maps API service
// Add your Google Maps API key to .env as GOOGLE_MAPS_API_KEY

export interface PlaceDetails {
  name: string;
  address: string;
  coordinates: {
    lat: number;
    lng: number;
  };
  rating?: number;
  reviews?: number;
  placeId?: string;
}

export const mapsService = {
  /**
   * Search for places using Google Places API
   */
  searchPlaces: async (query: string, location?: { lat: number; lng: number }): Promise<PlaceDetails[]> => {
    const apiKey = process.env.GOOGLE_MAPS_API_KEY;
    
    if (!apiKey) {
      console.error("❌ GOOGLE_MAPS_API_KEY not set in environment variables!");
      console.warn("⚠️ Please set GOOGLE_MAPS_API_KEY in your .env file");
      return [];
    }

    try {
      const locationParam = location ? `&location=${location.lat},${location.lng}&radius=5000` : '';
      const url = `https://maps.googleapis.com/maps/api/place/textsearch/json?query=${encodeURIComponent(query)}${locationParam}&key=${apiKey}`;
      
      const response = await fetch(url);
      const data = await response.json();

      if (data.status === 'OK' && data.results) {
        return data.results.map((place: any) => ({
          name: place.name,
          address: place.formatted_address || place.vicinity,
          coordinates: {
            lat: place.geometry.location.lat,
            lng: place.geometry.location.lng,
          },
          rating: place.rating,
          reviews: place.user_ratings_total,
          placeId: place.place_id,
        }));
      }

      return [];
    } catch (error) {
      console.error("Google Maps API error:", error);
      return [];
    }
  },

  /**
   * Get place details by place ID
   */
  getPlaceDetails: async (placeId: string): Promise<PlaceDetails | null> => {
    const apiKey = process.env.GOOGLE_MAPS_API_KEY;
    
    if (!apiKey) {
      return null;
    }

    try {
      const url = `https://maps.googleapis.com/maps/api/place/details/json?place_id=${placeId}&key=${apiKey}`;
      const response = await fetch(url);
      const data = await response.json();

      if (data.status === 'OK' && data.result) {
        const place = data.result;
        return {
          name: place.name,
          address: place.formatted_address || place.vicinity,
          coordinates: {
            lat: place.geometry.location.lat,
            lng: place.geometry.location.lng,
          },
          rating: place.rating,
          reviews: place.user_ratings_total,
          placeId: place.place_id,
        };
      }

      return null;
    } catch (error) {
      console.error("Google Maps API error:", error);
      return null;
    }
  },

  /**
   * Get directions between two points using Directions API
   */
  getDirections: async (origin: { lat: number; lng: number }, destination: { lat: number; lng: number }, mode: string = 'driving') => {
    const apiKey = process.env.GOOGLE_MAPS_API_KEY;
    
    if (!apiKey) {
      return null;
    }

    try {
      const url = `https://maps.googleapis.com/maps/api/directions/json?origin=${origin.lat},${origin.lng}&destination=${destination.lat},${destination.lng}&mode=${mode}&key=${apiKey}`;
      const response = await fetch(url);
      const data = await response.json();

      if (data.status === 'OK' && data.routes && data.routes.length > 0) {
        const route = data.routes[0];
        const leg = route.legs[0];
        return {
          distance: leg.distance.text,
          distanceValue: leg.distance.value, // in meters
          duration: leg.duration.text,
          durationValue: leg.duration.value, // in seconds
          steps: leg.steps.map((step: any) => ({
            instruction: step.html_instructions,
            distance: step.distance.text,
            duration: step.duration.text,
          })),
          polyline: route.overview_polyline.points,
        };
      }

      return null;
    } catch (error) {
      console.error("Google Maps Directions API error:", error);
      return null;
    }
  },

  /**
   * Geocode an address to coordinates using Geocoding API
   */
  geocode: async (address: string): Promise<PlaceDetails | null> => {
    const apiKey = process.env.GOOGLE_MAPS_API_KEY;
    
    if (!apiKey) {
      return null;
    }

    try {
      const url = `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(address)}&key=${apiKey}`;
      const response = await fetch(url);
      const data = await response.json();

      if (data.status === 'OK' && data.results && data.results.length > 0) {
        const result = data.results[0];
        return {
          name: result.formatted_address,
          address: result.formatted_address,
          coordinates: {
            lat: result.geometry.location.lat,
            lng: result.geometry.location.lng,
          },
          placeId: result.place_id,
        };
      }

      return null;
    } catch (error) {
      console.error("Google Maps Geocoding API error:", error);
      return null;
    }
  },

  /**
   * Reverse geocode coordinates to address
   */
  reverseGeocode: async (lat: number, lng: number): Promise<PlaceDetails | null> => {
    const apiKey = process.env.GOOGLE_MAPS_API_KEY;
    
    if (!apiKey) {
      return null;
    }

    try {
      const url = `https://maps.googleapis.com/maps/api/geocode/json?latlng=${lat},${lng}&key=${apiKey}`;
      const response = await fetch(url);
      const data = await response.json();

      if (data.status === 'OK' && data.results && data.results.length > 0) {
        const result = data.results[0];
        return {
          name: result.formatted_address,
          address: result.formatted_address,
          coordinates: {
            lat,
            lng,
          },
          placeId: result.place_id,
        };
      }

      return null;
    } catch (error) {
      console.error("Google Maps Reverse Geocoding API error:", error);
      return null;
    }
  },

  /**
   * Get distance matrix between multiple origins and destinations using Distance Matrix API
   */
  getDistanceMatrix: async (
    origins: Array<{ lat: number; lng: number } | string>,
    destinations: Array<{ lat: number; lng: number } | string>,
    mode: string = 'driving'
  ) => {
    const apiKey = process.env.GOOGLE_MAPS_API_KEY;
    
    if (!apiKey) {
      return null;
    }

    try {
      const originsStr = origins.map(origin => 
        typeof origin === 'string' ? origin : `${origin.lat},${origin.lng}`
      ).join('|');
      
      const destinationsStr = destinations.map(dest => 
        typeof dest === 'string' ? dest : `${dest.lat},${dest.lng}`
      ).join('|');

      const url = `https://maps.googleapis.com/maps/api/distancematrix/json?origins=${encodeURIComponent(originsStr)}&destinations=${encodeURIComponent(destinationsStr)}&mode=${mode}&key=${apiKey}`;
      const response = await fetch(url);
      const data = await response.json();

      if (data.status === 'OK' && data.rows) {
        return data.rows.map((row: any, i: number) => 
          row.elements.map((element: any, j: number) => ({
            origin: origins[i],
            destination: destinations[j],
            distance: element.distance?.text || null,
            distanceValue: element.distance?.value || null, // in meters
            duration: element.duration?.text || null,
            durationValue: element.duration?.value || null, // in seconds
            status: element.status,
          }))
        ).flat();
      }

      return null;
    } catch (error) {
      console.error("Google Maps Distance Matrix API error:", error);
      return null;
    }
  },
};

