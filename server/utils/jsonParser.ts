/**
 * Improved JSON parser for AI responses
 * More lenient and better at handling malformed JSON
 */

export function parseAIResponse(text: string): any {
  if (!text || text.trim().length === 0) {
    throw new Error("Empty response from AI");
  }

  console.log("🔍 Parsing AI response");
  console.log("📄 Input length:", text.length);

  // Try direct parse first (best case)
  try {
    const parsed = JSON.parse(text);
    console.log("✅ Direct parse succeeded");
    return parsed;
  } catch (directError: any) {
    console.log("⚠️ Direct parse failed:", directError.message);
  }

  // Clean the text
  let cleaned = text.trim();
  
  // Remove BOM
  cleaned = cleaned.replace(/^\uFEFF/, '');
  
  // Remove markdown code blocks
  cleaned = cleaned.replace(/```json\s*/gi, '').replace(/```\s*/g, '');
  
  // Find JSON boundaries
  const firstBrace = cleaned.indexOf('{');
  const lastBrace = cleaned.lastIndexOf('}');
  
  if (firstBrace === -1 || lastBrace === -1) {
    console.error("❌ No JSON object found");
    throw new Error("No valid JSON object found in response");
  }
  
  // Extract JSON portion
  cleaned = cleaned.substring(firstBrace, lastBrace + 1);
  console.log("📄 Extracted JSON length:", cleaned.length);
  
  // Apply fixes
  cleaned = cleaned
    .replace(/,(\s*[}\]])/g, '$1')  // Remove trailing commas
    .replace(/[\x00-\x08\x0B-\x0C\x0E-\x1F\x7F]/g, '');  // Remove control chars
  
  // Try parsing cleaned version
  try {
    const parsed = JSON.parse(cleaned);
    console.log("✅ Cleaned parse succeeded");
    return parsed;
  } catch (cleanedError: any) {
    console.log("⚠️ Cleaned parse failed:", cleanedError.message);
    
    // More aggressive fixes
    let aggressive = cleaned
      .replace(/,(\s*[}\]])/g, '$1')
      .replace(/"\s*:\s*"/g, '":"')  // Fix spacing in key-value pairs
      .replace(/"\s*,\s*"/g, '","')  // Fix spacing in arrays
      .replace(/\n/g, ' ')  // Replace newlines with spaces
      .replace(/\r/g, '')  // Remove carriage returns
      .replace(/\t/g, ' ')  // Replace tabs with spaces
      .replace(/  +/g, ' ');  // Collapse multiple spaces
    
    try {
      const parsed = JSON.parse(aggressive);
      console.log("✅ Aggressive parse succeeded");
      return parsed;
    } catch (aggressiveError: any) {
      console.error("❌ All parsing attempts failed");
      console.error("📄 Original (first 500):", text.substring(0, 500));
      console.error("📄 Original (last 200):", text.substring(Math.max(0, text.length - 200)));
      console.error("📄 Cleaned (first 500):", cleaned.substring(0, 500));
      console.error("📄 Error:", aggressiveError.message);
      
      throw new Error(
        `Failed to parse AI response as JSON. ` +
        `Error: ${aggressiveError.message}. ` +
        `Preview: ${text.substring(0, 200)}...`
      );
    }
  }
}

export function extractJSON(text: string): string | null {
  if (!text) return null;
  text = text.trim();
  
  // Try code block extraction
  const codeBlockMatch = text.match(/```(?:json)?\s*([\s\S]*?)\s*```/);
  if (codeBlockMatch) {
    const extracted = codeBlockMatch[1].trim();
    if (extracted.startsWith('{') || extracted.startsWith('[')) {
      return extracted;
    }
  }
  
  // Try object extraction
  const firstBrace = text.indexOf('{');
  if (firstBrace !== -1) {
    let braceCount = 0;
    let lastBrace = firstBrace;
    
    for (let i = firstBrace; i < text.length; i++) {
      if (text[i] === '{') braceCount++;
      if (text[i] === '}') {
        braceCount--;
        if (braceCount === 0) {
          lastBrace = i;
          break;
        }
      }
    }
    
    if (braceCount === 0) {
      return text.substring(firstBrace, lastBrace + 1);
    }
  }
  
  return null;
}

export function cleanJSON(jsonString: string): string {
  let cleaned = jsonString.trim();
  cleaned = cleaned.replace(/,(\s*[}\]])/g, '$1');
  cleaned = cleaned.replace(/[\x00-\x08\x0B-\x0C\x0E-\x1F\x7F]/g, '');
  return cleaned;
}
