import express from "express";
import { mapsService } from "../services/mapsService";

const router = express.Router();

// Search places
router.get("/search", async (req, res) => {
  try {
    const { query, lat, lng } = req.query;
    
    if (!query || typeof query !== "string") {
      return res.status(400).json({ error: "Query parameter is required" });
    }

    const location = lat && lng 
      ? { lat: parseFloat(lat as string), lng: parseFloat(lng as string) }
      : undefined;

    const results = await mapsService.searchPlaces(query, location);
    res.json({ success: true, data: results });
  } catch (error: any) {
    console.error("Maps search error:", error);
    res.status(500).json({ error: error.message || "Failed to search places" });
  }
});

// Get place details
router.get("/place/:placeId", async (req, res) => {
  try {
    const { placeId } = req.params;
    const details = await mapsService.getPlaceDetails(placeId);
    
    if (!details) {
      return res.status(404).json({ error: "Place not found" });
    }
    
    res.json({ success: true, data: details });
  } catch (error: any) {
    console.error("Place details error:", error);
    res.status(500).json({ error: error.message || "Failed to get place details" });
  }
});

// Geocode address
router.get("/geocode", async (req, res) => {
  try {
    const { address } = req.query;
    
    if (!address || typeof address !== "string") {
      return res.status(400).json({ error: "Address parameter is required" });
    }

    const result = await mapsService.geocode(address);
    res.json({ success: true, data: result });
  } catch (error: any) {
    console.error("Geocode error:", error);
    res.status(500).json({ error: error.message || "Failed to geocode address" });
  }
});

// Reverse geocode
router.get("/reverse-geocode", async (req, res) => {
  try {
    const { lat, lng } = req.query;
    
    if (!lat || !lng) {
      return res.status(400).json({ error: "Lat and lng parameters are required" });
    }

    const result = await mapsService.reverseGeocode(
      parseFloat(lat as string),
      parseFloat(lng as string)
    );
    res.json({ success: true, data: result });
  } catch (error: any) {
    console.error("Reverse geocode error:", error);
    res.status(500).json({ error: error.message || "Failed to reverse geocode" });
  }
});

// Get directions
router.get("/directions", async (req, res) => {
  try {
    const { originLat, originLng, destLat, destLng, mode } = req.query;
    
    if (!originLat || !originLng || !destLat || !destLng) {
      return res.status(400).json({ error: "Origin and destination coordinates are required" });
    }

    const directions = await mapsService.getDirections(
      { lat: parseFloat(originLat as string), lng: parseFloat(originLng as string) },
      { lat: parseFloat(destLat as string), lng: parseFloat(destLng as string) },
      (mode as string) || "driving"
    );
    
    res.json({ success: true, data: directions });
  } catch (error: any) {
    console.error("Directions error:", error);
    res.status(500).json({ error: error.message || "Failed to get directions" });
  }
});

export default router;

