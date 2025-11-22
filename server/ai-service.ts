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
### 🔀 SHUFFLE BUTTON LOGIC (VERY IMPORTANT)

When the user clicks shuffle on a specific tourist destination card:

- ONLY replace that single destination.
- DO NOT regenerate or modify the entire list.
- The new recommended place must:
    • Match the same category/type (café → café, beach → beach, fort → fort)
    • Match the user's pre-selected preferences
    • Be located in the same city or nearby area
    • Have a different vibe but still be relevant
    • NOT be the original place
    • NOT be any place shown earlier in this session
    • NOT be in the visited list

- Always offer a fresh and unique suggestion (maximum discoverability).
- Maintain variety without breaking the user's chosen category.

OUTPUT RULE FOR SHUFFLE:
Return ONLY:
{
  "new_place": "<name>",
  "description": "<1–2 line short reason>"
}

Do NOT output any extra text or multiple places.

====================================================
### 🌦 WEATHER LOGIC (BALANCED & NON-RESTRICTIVE)

Golden Rule:
- Weather MUST guide timings & comfort.
- Weather MUST NOT restrict or remove iconic attractions.
- Outdoor attractions (forts, palaces, viewpoints) should ALWAYS remain.

Hot Weather (38–44°C):
- Suggest optimal timings:
   • Early morning (6–10 AM)
   • Late late afternoon (4:30–7 PM)
- Add gentle suggestions:
   • "Carry water"
   • "Prefer shade"
- Recommend AC cafés for breaks (optional).

Extreme Heat (> 44°C):
- Keep outdoor attractions.
- Add optional caution:
   • "Morning recommended to avoid discomfort"
   • "Evening is cooler"

Rainy Weather:
- DO NOT remove outdoor attractions unless unsafe.
- Add soft warnings:
   • "Stairs may be slippery"
   • "Use cab instead of long walks"
- Indoor alternatives ONLY if user prefers.

Cold Weather:
- All outdoor attractions allowed.
- Add soft suggestions:
   • "Carry a jacket"

Medicines & Care Kit:
- Hot → ORS, electrolytes  
- Rain → antiseptic wipes, waterproof pouch  
- Cold → lip balm, cough drops  

Weather-Based Café Suggestions:
- Hot → AC cafés  
- Rain → cozy indoor spots  
- Cold → warm ambiance cafés  

====================================================
### 🍽 CAFÉ & RESTAURANT LOGIC
- Suggest 4–7 options.
- Include vibe, price, best dish, distance.
- Use geotag if provided.

====================================================
### 🏥 MEDICAL & SAFETY LOGIC
Always provide:
- 2–3 nearby medical stores  
- Gentle safety tips  
- Indian emergency numbers (112/108/100)

====================================================
### 🚕 TRANSPORT LOGIC
Choose best mode:
- <1.5 km → walking  
- 1.5–4 km → auto  
- >4 km → cab/metro  
- Rain → avoid long walking  

====================================================
### 🧠 MEMORY & CONTEXT
Track:
- User preferences  
- Previously shown places  
- Visited list  
- Shuffle replacements  
- Food preference  
- Budget  
- Pace  

====================================================
### OUTPUT FORMAT
CRITICAL JSON OUTPUT RULES:
1. Return ONLY valid JSON - no markdown, no code blocks, no explanations
2. Do NOT wrap JSON in \`\`\`json\`\`\` code blocks
3. Do NOT add text before or after the JSON
4. Start with { and end with } - nothing else
5. Use double quotes for ALL strings and keys
6. Ensure all commas and brackets are correct
7. NO trailing commas before } or ]
8. Return the JSON object directly - parseable by JSON.parse()

REQUIRED JSON STRUCTURE:
{
  "days": [{"day": 1, "places": [{"name": "...", "type": "...", "description": "...", "timing": "...", "transport": "...", "distance": "..."}]}],
  "cafes": [{"name": "...", "vibe": "...", "price": "...", "bestDish": "...", "distance": "..."}],
  "medical": ["...", "..."],
  "tips": ["...", "..."]
}

When asked for JSON, return ONLY the JSON object, nothing else.
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
 * Get response from Gemini API
 */
async function getGeminiResponse(userMessage: any): Promise<string> {
  if (!gemini || !process.env.GEMINI_API_KEY) {
    throw new Error("Gemini API key not configured. Please set GEMINI_API_KEY in environment variables.");
  }

  try {
    console.log("🤖 Calling Gemini API with model: gemini-2.0-flash-exp");
    console.log("📝 User message length:", typeof userMessage === 'string' ? userMessage.length : JSON.stringify(userMessage).length);

    // Try gemini-1.5-flash first (most stable), then try 2.0 if available
    let model;
    try {
      model = gemini.getGenerativeModel({ 
        model: "gemini-1.5-flash",
        generationConfig: {
          temperature: 0.2,
          responseMimeType: "application/json",
        }
      });
      console.log("✅ Using gemini-1.5-flash with JSON mode");
    } catch (modelError: any) {
      // If 1.5-flash not available, try 2.0-flash-exp
      console.log("⚠️ gemini-1.5-flash not available, trying gemini-2.0-flash-exp");
      try {
        model = gemini.getGenerativeModel({ 
          model: "gemini-2.0-flash-exp",
          generationConfig: {
            temperature: 0.2,
            responseMimeType: "application/json",
          }
        });
        console.log("✅ Using gemini-2.0-flash-exp with JSON mode");
      } catch (fallbackError: any) {
        console.error("❌ Both Gemini models failed:", fallbackError.message);
        throw fallbackError;
      }
    }
    
    // Build a more explicit JSON-focused prompt
    const jsonInstruction = `\n\nCRITICAL JSON OUTPUT REQUIREMENTS:
1. Your response MUST be ONLY valid JSON - no markdown, no code blocks, no explanations
2. Start with { and end with }
3. Use double quotes for all strings
4. No trailing commas
5. The response must be parseable by JSON.parse() directly

Return ONLY the JSON object, nothing else.`;

    const fullPrompt = `${SYSTEM_PROMPT}\n\nUser Request:\n${typeof userMessage === 'string' ? userMessage : JSON.stringify(userMessage)}${jsonInstruction}`;
    
    console.log("📤 Sending prompt to Gemini (length:", fullPrompt.length, ")");
    
    try {
      const result = await model.generateContent(fullPrompt);
      const response = await result.response;
      let content = response.text();
      
      console.log("📥 Received raw response from Gemini");
      
      if (!content || content.trim().length === 0) {
        throw new Error("Gemini returned empty response");
      }
      
      console.log("✅ Gemini API response received");
      console.log("📄 Raw response length:", content.length);
      console.log("📄 Raw response (first 1500 chars):", content.substring(0, 1500));
      console.log("📄 Raw response (last 1500 chars):", content.substring(Math.max(0, content.length - 1500)));
      
      // Since we're using responseMimeType: "application/json", the response should already be valid JSON
      // But let's clean it just in case
      content = content.trim();
      
      // Remove any markdown code blocks (shouldn't happen with JSON mode, but just in case)
      content = content.replace(/^```json\s*/i, '').replace(/^```\s*/i, '').replace(/\s*```$/i, '').trim();
      
      // Find the actual JSON object boundaries
      const jsonStart = content.indexOf('{');
      const jsonEnd = content.lastIndexOf('}');
      
      if (jsonStart === -1 || jsonEnd === -1 || jsonEnd <= jsonStart) {
        console.error("❌ No valid JSON boundaries found!");
        console.error("📄 Content:", content);
        throw new Error("Response does not contain valid JSON structure");
      }
      
      content = content.substring(jsonStart, jsonEnd + 1);
      console.log("📄 Extracted JSON (length:", content.length, ")");
      console.log("📄 Extracted JSON (first 800 chars):", content.substring(0, 800));
      
      // Validate JSON before returning
      try {
        const testParse = JSON.parse(content);
        console.log("✅ Content is valid JSON!");
        console.log("📊 JSON structure check:", {
          hasDays: !!testParse.days,
          daysCount: testParse.days?.length || 0,
          hasCafes: !!testParse.cafes,
          cafesCount: testParse.cafes?.length || 0
        });
        return content;
      } catch (e) {
        console.error("❌ Content is NOT valid JSON!");
        console.error("Error:", (e as Error).message);
        console.error("Error at position:", (e as any).message?.match(/position (\d+)/)?.[1] || "unknown");
        console.error("Problematic JSON (first 3000 chars):", content.substring(0, 3000));
        console.error("Problematic JSON (last 1000 chars):", content.substring(Math.max(0, content.length - 1000)));
        
        // Try to find the error position and show context
        const errorMatch = (e as Error).message.match(/position (\d+)/);
        if (errorMatch) {
          const errorPos = parseInt(errorMatch[1]);
          const start = Math.max(0, errorPos - 100);
          const end = Math.min(content.length, errorPos + 100);
          console.error("Error context (around position", errorPos, "):", content.substring(start, end));
        }
        
        // Try one more aggressive fix - just remove trailing commas and control chars
        let fixed = content
          .replace(/,(\s*[}\]])/g, '$1') // Remove trailing commas
          .replace(/[\x00-\x08\x0B-\x0C\x0E-\x1F\x7F]/g, ''); // Remove control characters but keep \n, \r, \t
        
        try {
          const testParse2 = JSON.parse(fixed);
          console.log("✅ Fixed version is valid JSON!");
          return fixed;
        } catch (e2) {
          console.error("❌ Fixed version also failed:", (e2 as Error).message);
          // Return the content anyway - let parseAIResponse handle it
          console.log("⚠️ Returning content for parseAIResponse to handle");
          return content;
        }
      }
    } catch (apiError: any) {
      console.error("❌ Error getting response from Gemini:", apiError.message);
      throw apiError;
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

  // Use Gemini API
  return await getGeminiResponse(userMessage);
}
