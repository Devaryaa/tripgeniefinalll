// Quick test script to see what Gemini returns
import dotenv from "dotenv";
import { GoogleGenerativeAI } from "@google/generative-ai";

dotenv.config();

const gemini = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = gemini.getGenerativeModel({ 
  model: "gemini-2.0-flash-exp",
  generationConfig: {
    temperature: 0.2,
    responseMimeType: "application/json",
  }
});

const testPrompt = `Generate a simple JSON object with this structure:
{
  "days": [
    {
      "day": 1,
      "places": [
        {
          "name": "Test Place",
          "type": "attraction",
          "description": "A test place"
        }
      ]
    }
  ],
  "cafes": [],
  "medical": [],
  "tips": []
}

Return ONLY the JSON, nothing else.`;

console.log("Testing Gemini API...");
model.generateContent(testPrompt)
  .then(result => {
    const response = result.response;
    const text = response.text();
    console.log("\n=== RAW RESPONSE ===");
    console.log(text);
    console.log("\n=== RESPONSE LENGTH ===");
    console.log(text.length);
    console.log("\n=== FIRST 500 CHARS ===");
    console.log(text.substring(0, 500));
    console.log("\n=== LAST 500 CHARS ===");
    console.log(text.substring(Math.max(0, text.length - 500)));
    
    // Try to parse
    try {
      const parsed = JSON.parse(text);
      console.log("\n✅ SUCCESS: Valid JSON!");
      console.log(JSON.stringify(parsed, null, 2));
    } catch (e) {
      console.log("\n❌ FAILED: Not valid JSON");
      console.log("Error:", e.message);
    }
  })
  .catch(err => {
    console.error("Error:", err);
  });

