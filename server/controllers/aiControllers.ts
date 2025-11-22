import { Request, Response } from "express";
import { tripGenieChat } from "../ai-service";
import { buildTripPlannerPrompt, buildShufflePrompt, buildChatPrompt } from "../ai/promptTemplates";
import { parseAIResponse } from "../utils/jsonParser";
import { mapsService } from "../services/mapsService";

export const generateTripPlan = async (req: Request, res: Response) => {
  try {
    console.log("\n=== TRIP PLAN REQUEST START ===");
    console.log("📥 Request body:", JSON.stringify(req.body, null, 2));
    
    // Geocode the destination
    const destination = req.body.location?.city;
    if (destination) {
      console.log("📍 Geocoding destination:", destination);
      try {
        const geocodeResult = await mapsService.geocode(destination);
        if (geocodeResult && geocodeResult.coordinates) {
          console.log("✅ Geocoding successful:", geocodeResult.coordinates);
          req.body.location = {
            ...req.body.location,
            geotag: {
              latitude: geocodeResult.coordinates.lat,
              longitude: geocodeResult.coordinates.lng
            },
            address: geocodeResult.address || destination
          };
        }
      } catch (geocodeError: any) {
        console.warn("⚠️ Geocoding failed:", geocodeError.message);
      }
    }
    
    // Build prompt
    const prompt = buildTripPlannerPrompt(req.body);
    console.log("📝 Prompt length:", prompt.length);
    
    // Call AI
    console.log("🤖 Calling AI service...");
    let response: string;
    
    try {
      response = await tripGenieChat(prompt);
      console.log("✅ AI service returned response");
      console.log("📄 Response length:", response.length);
    } catch (aiError: any) {
      console.error("❌ AI service error:", aiError.message);
      return res.status(500).json({
        success: false,
        error: `AI service failed: ${aiError.message}. Please try again in a moment.`
      });
    }
    
    // Parse response
    console.log("🔍 Parsing AI response...");
    let parsedData: any;
    
    try {
      parsedData = parseAIResponse(response);
      console.log("✅ Successfully parsed response");
      console.log("📊 Data structure:", {
        hasDays: !!parsedData.days,
        daysCount: parsedData.days?.length || 0,
        hasCafes: !!parsedData.cafes,
        cafesCount: parsedData.cafes?.length || 0,
        hasMedical: !!parsedData.medical,
        hasTips: !!parsedData.tips
      });
    } catch (parseError: any) {
      console.error("❌ Parse error:", parseError.message);
      return res.status(500).json({
        success: false,
        error: `Failed to parse AI response: ${parseError.message}. Please try again.`
      });
    }
    
    // Validate structure
    if (!parsedData.days || !Array.isArray(parsedData.days) || parsedData.days.length === 0) {
      console.error("❌ Invalid structure - missing or empty days array");
      return res.status(500).json({
        success: false,
        error: "AI response is missing trip days. Please try again."
      });
    }
    
    // Ensure all required fields exist
    if (!parsedData.cafes) parsedData.cafes = [];
    if (!parsedData.medical) parsedData.medical = [];
    if (!parsedData.tips) parsedData.tips = [];
    
    console.log("✅ Validation passed");
    console.log("=== TRIP PLAN REQUEST COMPLETE ===\n");
    
    res.json({
      success: true,
      data: parsedData
    });
    
  } catch (error: any) {
    console.error("\n❌ TRIP PLAN ERROR:", error.message);
    console.error("Stack:", error.stack);
    console.error("=== TRIP PLAN REQUEST FAILED ===\n");
    
    res.status(500).json({
      success: false,
      error: error.message || "Failed to generate trip plan. Please try again."
    });
  }
};

export const shufflePlace = async (req: Request, res: Response) => {
  try {
    console.log("\n=== SHUFFLE REQUEST START ===");
    console.log("📥 Request:", JSON.stringify(req.body, null, 2));
    
    const prompt = buildShufflePrompt(req.body);
    console.log("📝 Prompt length:", prompt.length);
    
    console.log("🤖 Calling AI...");
    const response = await tripGenieChat(prompt);
    console.log("✅ AI responded");
    
    console.log("🔍 Parsing...");
    const parsedData = parseAIResponse(response);
    console.log("✅ Parsed successfully");
    
    if (!parsedData.new_place) {
      throw new Error("AI response missing 'new_place' field");
    }
    
    console.log("=== SHUFFLE REQUEST COMPLETE ===\n");
    
    res.json({
      success: true,
      data: parsedData
    });
    
  } catch (error: any) {
    console.error("\n❌ SHUFFLE ERROR:", error.message);
    console.error("=== SHUFFLE REQUEST FAILED ===\n");
    
    res.status(500).json({
      success: false,
      error: error.message || "Failed to shuffle place"
    });
  }
};

export const chatWithAI = async (req: Request, res: Response) => {
  try {
    console.log("\n=== CHAT REQUEST START ===");
    const { message, context } = req.body;
    
    const prompt = buildChatPrompt(message, context);
    const response = await tripGenieChat(prompt);
    
    console.log("=== CHAT REQUEST COMPLETE ===\n");
    
    res.json({
      success: true,
      data: { message: response }
    });
    
  } catch (error: any) {
    console.error("\n❌ CHAT ERROR:", error.message);
    console.error("=== CHAT REQUEST FAILED ===\n");
    
    res.status(500).json({
      success: false,
      error: error.message || "Failed to process chat"
    });
  }
};

export const adjustItinerary = async (req: Request, res: Response) => {
  try {
    console.log("\n=== ITINERARY ADJUSTMENT REQUEST START ===");
    console.log("📥 Request:", JSON.stringify(req.body, null, 2));
    
    const { userMessage, currentItinerary, location, userPreferences } = req.body;
    
    if (!userMessage || !currentItinerary || !location) {
      return res.status(400).json({
        success: false,
        error: "Missing required fields: userMessage, currentItinerary, location"
      });
    }
    
    // Import here to avoid circular dependencies
    const { buildItineraryAdjustmentPrompt } = await import("../ai/promptTemplates");
    
    const prompt = buildItineraryAdjustmentPrompt(req.body);
    console.log("📝 Prompt length:", prompt.length);
    
    console.log("🤖 Calling AI service...");
    let response: string;
    
    try {
      response = await tripGenieChat(prompt);
      console.log("✅ AI service returned response");
      console.log("📄 Response length:", response.length);
    } catch (aiError: any) {
      console.error("❌ AI service error:", aiError.message);
      return res.status(500).json({
        success: false,
        error: `AI service failed: ${aiError.message}`
      });
    }
    
    console.log("🔍 Parsing AI response...");
    let parsedData: any;
    
    try {
      parsedData = parseAIResponse(response);
      console.log("✅ Successfully parsed response");
      console.log("📊 Data structure:", {
        hasAcknowledgment: !!parsedData.acknowledgment,
        hasRecommendation: !!parsedData.recommendation,
        hasDays: !!parsedData.days,
        daysCount: parsedData.days?.length || 0
      });
    } catch (parseError: any) {
      console.error("❌ Parse error:", parseError.message);
      return res.status(500).json({
        success: false,
        error: `Failed to parse AI response: ${parseError.message}`
      });
    }
    
    // Ensure all required fields exist
    if (!parsedData.days) parsedData.days = [];
    if (!parsedData.cafes) parsedData.cafes = [];
    if (!parsedData.medical) parsedData.medical = [];
    if (!parsedData.tips) parsedData.tips = [];
    
    console.log("✅ Validation passed");
    console.log("=== ITINERARY ADJUSTMENT REQUEST COMPLETE ===\n");
    
    res.json({
      success: true,
      data: parsedData
    });
    
  } catch (error: any) {
    console.error("\n❌ ADJUSTMENT ERROR:", error.message);
    console.error("Stack:", error.stack);
    console.error("=== ADJUSTMENT REQUEST FAILED ===\n");
    
    res.status(500).json({
      success: false,
      error: error.message || "Failed to adjust itinerary"
    });
  }
};
