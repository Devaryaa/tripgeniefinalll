import dotenv from "dotenv";
import Groq from "groq-sdk";

dotenv.config();

// System prompt for TripGenie
const SYSTEM_PROMPT = `
You are **TripGenie PRO MAX**, an advanced AI travel engine and trip planner.

Your job is to create PERSONALIZED, UNIQUE itineraries based on:
- User interests selected before using the website
- Reddit-style popularity reasoning
- Intelligent shuffle behavior
- Weather-aware timing logic (NON-RESTRICTIVE)
- Varied Cafés & food recommendations (DIFFERENT for each day)
- Geotag & location-aware suggestions
- Medical store & emergency help
- Transport reasoning
- Memory of previously shown places

====================================================
### LOCATION & DESTINATION RULES - CRITICAL!
- User requests a SPECIFIC CITY/DESTINATION
- ALL recommendations must be FROM THAT CITY ONLY
- DO NOT mix places from different cities
- Every place must be a REAL, EXISTING location in the requested city
- If unsure about a city, use major landmarks and well-known places from that location

### TIMING FORMAT - EXACT REQUIREMENTS
- Use specific times like "10 AM to 2 PM" NOT "Morning 10 AM - 12 PM"
- Format: "HH AM/PM to HH AM/PM" with 24-hour day span
- Morning: 8 AM to 11 AM
- Late Morning: 11 AM to 1 PM  
- Lunch: 1 PM to 3 PM
- Afternoon: 3 PM to 6 PM
- Evening: 6 PM to 8 PM
- Night: 8 PM to 10 PM

### LUNCH RECOMMENDATIONS - MUST BE UNIQUE PER DAY
- Generate DIFFERENT lunch spots for each day
- NO repeating the same restaurant across multiple days
- Vary cuisine types: Day 1 North Indian, Day 2 Street Food, Day 3 Continental, etc.
- Include variety in price ranges and vibes
- Each lunch should match the day's activities

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
          "name": "Real Place Name in the DESTINATION CITY",
          "type": "attraction",
          "description": "Description here",
          "timing": "10 AM to 1 PM",
          "transport": "Cab",
          "distance": "2.5 km"
        }
      ]
    }
  ],
  "cafes": [
    {
      "name": "Real Cafe Name in the DESTINATION CITY",
      "vibe": "Cozy casual",
      "price": "₹500-800",
      "bestDish": "Signature dish",
      "distance": "1.2 km"
    }
  ],
  "medical": ["Medical Store Name - Address in DESTINATION CITY"],
  "tips": ["Travel tip here"]
}

ALL FIELDS ARE MANDATORY. 
USE ONLY REAL PLACES FROM THE DESTINATION CITY.
LUNCH RECOMMENDATIONS MUST VARY BY DAY.
TIMINGS MUST BE SPECIFIC (e.g., "2 PM to 5 PM").
====================================================
`;

// Initialize Groq client
let groq: Groq | null = null;
if (process.env.GROQ_API_KEY) {
  try {
    groq = new Groq({ apiKey: process.env.GROQ_API_KEY });
    console.log("✅ Groq client initialized (FREE AI - No paid API needed!)");
  } catch (error) {
    console.error("❌ Failed to initialize Groq client:", error);
  }
} else {
  console.error("❌ GROQ_API_KEY not found in environment variables");
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
  
  console.log("✅ Cleaning complete");
  return cleaned;
}

/**
 * Get response from Groq API
 */
async function getGroqResponse(userMessage: any): Promise<string> {
  if (!groq || !process.env.GROQ_API_KEY) {
    throw new Error("Groq API key not configured. Please set GROQ_API_KEY in environment variables.");
  }

  try {
    console.log("🤖 Calling Groq API (FREE!)");
    
    // Build prompt with VERY explicit JSON instructions
    const jsonInstruction = `\n\n**CRITICAL**: Return ONLY valid JSON. No text before or after. No markdown. Just the JSON object starting with { and ending with }.`;
    const fullPrompt = `${SYSTEM_PROMPT}\n\nUser Request:\n${typeof userMessage === 'string' ? userMessage : JSON.stringify(userMessage)}${jsonInstruction}`;
    
    console.log("✅ Using llama-3.3-70b-versatile model (Groq - FREE)");
    
    const message = await groq.chat.completions.create({
      messages: [
        {
          role: "user",
          content: fullPrompt,
        },
      ],
      model: "llama-3.3-70b-versatile",
      temperature: 0.2,
      max_tokens: 8192,
    });
    
    console.log("📤 Sent prompt to Groq");
    
    let content = message.choices[0]?.message?.content || "";
    
    console.log("📥 Received response from Groq");
    console.log("📄 Raw response length:", content.length);
    console.log("📄 First 500 chars:", content.substring(0, 500));
    console.log("📄 Last 200 chars:", content.substring(Math.max(0, content.length - 200)));
    
    if (!content || content.trim().length === 0) {
      throw new Error("Groq returned empty response");
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
    console.error("❌ Groq API Error:", error.message);
    throw new Error(`Groq API error: ${error.message}`);
  }
}

export async function tripGenieChat(userMessage: any): Promise<string> {
  // Check if Groq API key is configured
  if (!process.env.GROQ_API_KEY) {
    const errorMsg = "❌ GROQ_API_KEY not configured! Please set GROQ_API_KEY in environment variables.";
    console.error(errorMsg);
    throw new Error("GROQ_API_KEY not configured. Please set it in your .env file.");
  }

  console.log("🚀 Starting TripGenie chat with Groq (FREE)");
  const response = await getGroqResponse(userMessage);
  console.log("✅ TripGenie chat complete");
  return response;
}
