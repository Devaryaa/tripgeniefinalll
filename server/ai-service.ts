import dotenv from "dotenv";
import { GoogleGenerativeAI } from "@google/generative-ai";

dotenv.config();

// System prompt for TripGenie
const SYSTEM_PROMPT = `
You are **TripGenie PRO MAX**, an advanced AI travel engine and trip planner.

Your job is to combine:
- User interests selected before using the website
- Reddit-style popularity reasoning
- Intelligent shuffle behavior
- Weather-aware timing logic (NON-RESTRICTIVE)
- Cafés & food recommendations
- Geotag & location-aware suggestions
- Medical store & emergency help
- Transport reasoning
- Memory of previously shown places

====================================================
### CRITICAL JSON OUTPUT REQUIREMENTS

YOU MUST RETURN VALID JSON AND NOTHING ELSE.

RULES:
1. NO markdown code blocks (no \`\`\`json or \`\`\`)
2. NO explanations before or after the JSON
3. NO preambles or conclusions
4. Start with { and end with }
5. Use double quotes for all strings
6. NO trailing commas
7. Escape special characters properly

REQUIRED STRUCTURE:
{
  "days": [
    {
      "day": 1,
      "places": [
        {
          "name": "Real Place Name",
          "type": "attraction",
          "description": "Description here",
          "timing": "Morning 9 AM - 12 PM",
          "transport": "Cab",
          "distance": "2.5 km"
        }
      ]
    }
  ],
  "cafes": [
    {
      "name": "Real Cafe Name",
      "vibe": "Cozy casual",
      "price": "₹500-800",
      "bestDish": "Signature dish",
      "distance": "1.2 km"
    }
  ],
  "medical": ["Medical Store Name - Address"],
  "tips": ["Travel tip here"]
}

ALL FIELDS ARE MANDATORY. USE REAL PLACE NAMES.
====================================================
`;

// Initialize Gemini client
let gemini: GoogleGenerativeAI | null = null;
if (process.env.GEMINI_API_KEY) {
  try {
    gemini = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    console.log("✅ Gemini client initialized");
  } catch (error) {
    console.error("❌ Failed to initialize Gemini client:", error);
  }
} else {
  console.error("❌ GEMINI_API_KEY not found in environment variables");
}

/**
 * Clean and extract JSON from response
 */
function extractAndCleanJSON(text: string): string {
  console.log("🧹 Starting JSON extraction and cleaning");
  console.log("📄 Input length:", text.length);
  
  // Remove any BOM or invisible characters
  let cleaned = text.replace(/^\uFEFF/, '').trim();
  
  // Remove markdown code blocks
  cleaned = cleaned.replace(/```json\s*/gi, '').replace(/```\s*/g, '').trim();
  
  // Find JSON boundaries
  const firstBrace = cleaned.indexOf('{');
  const lastBrace = cleaned.lastIndexOf('}');
  
  if (firstBrace === -1 || lastBrace === -1) {
    throw new Error("No JSON object found in response");
  }
  
  // Extract JSON
  cleaned = cleaned.substring(firstBrace, lastBrace + 1);
  console.log("📄 After extraction length:", cleaned.length);
  
  // Remove trailing commas before } or ]
  cleaned = cleaned.replace(/,(\s*[}\]])/g, '$1');
  
  // Remove control characters but keep newlines in strings
  cleaned = cleaned.replace(/[\x00-\x09\x0B-\x0C\x0E-\x1F\x7F]/g, '');
  
  // Fix common issues with escaped characters
  cleaned = cleaned.replace(/\\/g, '\\\\').replace(/\\\\"/g, '\\"').replace(/\\\\n/g, '\\n');
  
  console.log("✅ Cleaning complete");
  return cleaned;
}

/**
 * Get response from Gemini API
 */
async function getGeminiResponse(userMessage: any): Promise<string> {
  if (!gemini || !process.env.GEMINI_API_KEY) {
    throw new Error("Gemini API key not configured. Please set GEMINI_API_KEY in environment variables.");
  }

  try {
    console.log("🤖 Calling Gemini API");
    
    // Use gemini-1.5-flash (more stable) without JSON mode
    const model = gemini.getGenerativeModel({ 
      model: "gemini-1.5-flash",
      generationConfig: {
        temperature: 0.2,
        // Remove responseMimeType to get more reliable responses
      }
    });
    
    console.log("✅ Using gemini-1.5-flash model");
    
    // Build prompt with VERY explicit JSON instructions
    const jsonInstruction = `\n\n**CRITICAL**: Return ONLY valid JSON. No text before or after. No markdown. Just the JSON object starting with { and ending with }.`;
    const fullPrompt = `${SYSTEM_PROMPT}\n\nUser Request:\n${typeof userMessage === 'string' ? userMessage : JSON.stringify(userMessage)}${jsonInstruction}`;
    
    console.log("📤 Sending prompt to Gemini");
    
    const result = await model.generateContent(fullPrompt);
    const response = await result.response;
    let content = response.text();
    
    console.log("📥 Received response from Gemini");
    console.log("📄 Raw response length:", content.length);
    console.log("📄 First 500 chars:", content.substring(0, 500));
    console.log("📄 Last 200 chars:", content.substring(Math.max(0, content.length - 200)));
    
    if (!content || content.trim().length === 0) {
      throw new Error("Gemini returned empty response");
    }
    
    // Clean and extract JSON
    try {
      content = extractAndCleanJSON(content);
      console.log("📄 Cleaned JSON (first 500 chars):", content.substring(0, 500));
      
      // Validate it's actually JSON
      const testParse = JSON.parse(content);
      console.log("✅ JSON validation successful");
      console.log("📊 Structure check:", {
        hasDays: !!testParse.days,
        daysCount: testParse.days?.length || 0,
        hasCafes: !!testParse.cafes,
        cafesCount: testParse.cafes?.length || 0
      });
      
      return content;
    } catch (cleanError: any) {
      console.error("❌ JSON cleaning/validation failed:", cleanError.message);
      console.error("📄 Problematic content:", content.substring(0, 1000));
      
      // Last resort: try to fix and return
      let lastResort = content
        .replace(/,(\s*[}\]])/g, '$1')
        .replace(/[\x00-\x08\x0B-\x0C\x0E-\x1F\x7F]/g, '')
        .trim();
      
      try {
        JSON.parse(lastResort);
        console.log("✅ Last resort fix worked");
        return lastResort;
      } catch (e) {
        console.error("❌ Last resort fix failed");
        throw cleanError;
      }
    }
  } catch (error: any) {
    console.error("❌ Gemini API Error:", error.message);
    throw new Error(`Gemini API error: ${error.message}`);
  }
}

export async function tripGenieChat(userMessage: any): Promise<string> {
  // Check if Gemini API key is configured
  if (!process.env.GEMINI_API_KEY) {
    const errorMsg = "❌ GEMINI_API_KEY not configured! Please set GEMINI_API_KEY in environment variables.";
    console.error(errorMsg);
    throw new Error("GEMINI_API_KEY not configured. Please set it in your .env file.");
  }

  console.log("🚀 Starting TripGenie chat");
  const response = await getGeminiResponse(userMessage);
  console.log("✅ TripGenie chat complete");
  return response;
}
