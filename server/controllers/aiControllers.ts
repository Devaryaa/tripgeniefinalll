import { Request, Response } from "express";
import { tripGenieChat } from "../ai-service";
import { buildTripPlannerPrompt, buildShufflePrompt, buildChatPrompt } from "../ai/promptTemplates";
import { parseAIResponse } from "../utils/jsonParser";
import { mapsService } from "../services/mapsService";

export const generateTripPlan = async (req: Request, res: Response) => {
  try {
    console.log("📥 Received trip plan request:", JSON.stringify(req.body, null, 2));
    
    // Geocode the destination to get coordinates
    const destination = req.body.location?.city;
    if (destination) {
      console.log("📍 Geocoding destination:", destination);
      try {
        const geocodeResult = await mapsService.geocode(destination);
        if (geocodeResult && geocodeResult.coordinates) {
          console.log("✅ Geocoding successful:", geocodeResult.coordinates);
          // Add geotag to location
          req.body.location = {
            ...req.body.location,
            geotag: {
              latitude: geocodeResult.coordinates.lat,
              longitude: geocodeResult.coordinates.lng
            },
            address: geocodeResult.address || destination
          };
        } else {
          console.warn("⚠️ Geocoding failed or returned no results");
        }
      } catch (geocodeError: any) {
        console.error("❌ Geocoding error:", geocodeError.message);
        // Continue without coordinates
      }
    }
    
    const prompt = buildTripPlannerPrompt(req.body);
    console.log("📝 Generated prompt length:", prompt.length);
    console.log("🤖 Calling AI service...");
    
    let response: string;
    try {
      response = await tripGenieChat(prompt);
      console.log("✅ AI service responded, length:", response.length);
      console.log("📄 Response preview (first 500 chars):", response.substring(0, 500));
    } catch (aiError: any) {
      console.error("❌ AI service error:", aiError.message);
      console.error("❌ AI service error stack:", aiError.stack);
      return res.status(500).json({
        success: false,
        error: `AI service error: ${aiError.message}. Please try again.`
      });
    }
    
    let parsedData;
    try {
      parsedData = parseAIResponse(response);
      console.log("✅ Successfully parsed AI response");
      console.log("📊 Parsed data structure:", {
        hasDays: !!parsedData.days,
        daysCount: parsedData.days?.length || 0,
        hasCafes: !!parsedData.cafes,
        cafesCount: parsedData.cafes?.length || 0,
        hasMedical: !!parsedData.medical,
        hasTips: !!parsedData.tips
      });
    } catch (parseError: any) {
      console.error("❌ JSON parse error:", parseError.message);
      console.error("📄 Full AI response:", response);
      console.error("📄 Response length:", response.length);
      console.error("📄 First 2000 chars:", response.substring(0, 2000));
      console.error("📄 Last 1000 chars:", response.substring(Math.max(0, response.length - 1000)));
      console.error("📄 Response starts with:", response.substring(0, 100));
      console.error("📄 Response ends with:", response.substring(Math.max(0, response.length - 100)));
      
      return res.status(500).json({
        success: false,
        error: `AI returned invalid JSON format: ${parseError.message}. Please try again.`,
        debug: process.env.NODE_ENV === "development" ? {
          responsePreview: response.substring(0, 2000),
          responseLength: response.length,
          startsWith: response.substring(0, 100),
          endsWith: response.substring(Math.max(0, response.length - 100)),
          parseError: parseError.message
        } : undefined
      });
    }
    
    // Validate the parsed data structure
    if (!parsedData.days || !Array.isArray(parsedData.days)) {
      console.error("❌ Invalid data structure - missing days array");
      return res.status(500).json({
        success: false,
        error: "AI response missing required 'days' array. Please try again."
      });
    }
    
    res.json({
      success: true,
      data: parsedData
    });
  } catch (error: any) {
    console.error("Trip plan generation error:", error);
    res.status(500).json({
      success: false,
      error: error.message || "Failed to generate trip plan"
    });
  }
};

export const shufflePlace = async (req: Request, res: Response) => {
  try {
    const prompt = buildShufflePrompt(req.body);
    const response = await tripGenieChat(prompt);
    
    let parsedData;
    try {
      parsedData = parseAIResponse(response);
      console.log("✅ Successfully parsed shuffle response");
    } catch (parseError: any) {
      console.error("❌ JSON parse error:", parseError.message);
      console.error("📄 Full AI response:", response);
      return res.status(500).json({
        success: false,
        error: `AI returned invalid JSON format: ${parseError.message}. Please try again.`
      });
    }
    
    // Validate the parsed data structure
    if (!parsedData.new_place) {
      console.error("❌ Invalid data structure - missing new_place");
      return res.status(500).json({
        success: false,
        error: "AI response missing required 'new_place' field. Please try again."
      });
    }
    
    res.json({
      success: true,
      data: parsedData
    });
  } catch (error: any) {
    console.error("Shuffle error:", error);
    res.status(500).json({
      success: false,
      error: error.message || "Failed to shuffle place"
    });
  }
};

export const chatWithAI = async (req: Request, res: Response) => {
  try {
    const { message, context } = req.body;
    const prompt = buildChatPrompt(message, context);
    const response = await tripGenieChat(prompt);
    
    res.json({
      success: true,
      data: { message: response }
    });
  } catch (error: any) {
    console.error("Chat error:", error);
    res.status(500).json({
      success: false,
      error: error.message || "Failed to process chat"
    });
  }
};
