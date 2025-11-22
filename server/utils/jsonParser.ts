/**
 * Utility functions to extract and parse JSON from AI responses
 * Handles cases where AI returns text before/after JSON or markdown code blocks
 */

export function extractJSON(text: string): string | null {
  if (!text) return null;

  // Remove leading/trailing whitespace
  text = text.trim();

  // Try to find JSON in markdown code blocks (most common case)
  const codeBlockMatch = text.match(/```(?:json)?\s*([\s\S]*?)\s*```/);
  if (codeBlockMatch) {
    const extracted = codeBlockMatch[1].trim();
    // Check if it looks like JSON
    if (extracted.startsWith('{') || extracted.startsWith('[')) {
      return extracted;
    }
  }

  // Try to find JSON object - match from first { to last }
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
      const extracted = text.substring(firstBrace, lastBrace + 1);
      return extracted;
    }
  }

  // Try to find JSON array - match from first [ to last ]
  const firstBracket = text.indexOf('[');
  if (firstBracket !== -1) {
    let bracketCount = 0;
    let lastBracket = firstBracket;
    
    for (let i = firstBracket; i < text.length; i++) {
      if (text[i] === '[') bracketCount++;
      if (text[i] === ']') {
        bracketCount--;
        if (bracketCount === 0) {
          lastBracket = i;
          break;
        }
      }
    }
    
    if (bracketCount === 0) {
      const extracted = text.substring(firstBracket, lastBracket + 1);
      return extracted;
    }
  }

  return null;
}

export function cleanJSON(jsonString: string): string {
  // Remove common issues
  let cleaned = jsonString.trim();
  
  // Remove trailing commas before closing braces/brackets
  cleaned = cleaned.replace(/,(\s*[}\]])/g, '$1');
  
  // Fix unescaped newlines in strings (replace actual newlines with \n)
  // This is a simple approach - be careful not to break valid JSON
  cleaned = cleaned.replace(/([^\\])\n/g, '$1\\n');
  cleaned = cleaned.replace(/^\n/g, '\\n');
  
  // Remove any control characters except those that are part of escaped sequences
  cleaned = cleaned.replace(/[\x00-\x1F\x7F]/g, '');
  
  return cleaned;
}

export function parseAIResponse(text: string): any {
  if (!text) {
    throw new Error("Empty response from AI");
  }

  const originalText = text;
  let attempts: string[] = [];

  // Pre-process: Remove any BOM or invisible characters
  text = text.replace(/^\uFEFF/, '').trim();
  
  // Remove any markdown code blocks that might still be there
  text = text.replace(/```json\s*/g, '').replace(/```\s*/g, '').trim();
  
  // Remove any leading/trailing text that's not JSON
  const firstBrace = text.indexOf('{');
  const firstBracket = text.indexOf('[');
  const startIndex = firstBrace !== -1 ? (firstBracket !== -1 ? Math.min(firstBrace, firstBracket) : firstBrace) : (firstBracket !== -1 ? firstBracket : 0);
  
  if (startIndex > 0) {
    text = text.substring(startIndex);
    console.log(`📝 Removed ${startIndex} characters from start`);
  }
  
  const lastBrace = text.lastIndexOf('}');
  const lastBracket = text.lastIndexOf(']');
  const endIndex = lastBrace !== -1 ? (lastBracket !== -1 ? Math.max(lastBrace, lastBracket) : lastBrace) : (lastBracket !== -1 ? lastBracket : text.length - 1);
  
  if (endIndex < text.length - 1) {
    text = text.substring(0, endIndex + 1);
    console.log(`📝 Removed ${originalText.length - text.length} characters from end`);
  }

  // Attempt 1: Direct parsing
  try {
    const parsed = JSON.parse(text);
    console.log("✅ Direct JSON parse succeeded");
    return parsed;
  } catch (e) {
    attempts.push(`Direct parse failed: ${(e as Error).message}`);
    console.log(`❌ Direct parse error: ${(e as Error).message}`);
  }

  // Attempt 2: Extract JSON from text
  const extracted = extractJSON(text);
  if (extracted) {
    try {
      return JSON.parse(extracted);
    } catch (e) {
      attempts.push(`Extracted JSON parse failed: ${(e as Error).message}`);
      
      // Attempt 3: Clean the extracted JSON
      const cleaned = cleanJSON(extracted);
      try {
        return JSON.parse(cleaned);
      } catch (e2) {
        attempts.push(`Cleaned JSON parse failed: ${(e2 as Error).message}`);
      }
    }
  } else {
    attempts.push("No JSON structure found in response");
  }

  // Attempt 4: Try to fix common issues and retry
  let fixed = text.trim();
  
  // Remove any text before first {
  const firstBrace = fixed.indexOf('{');
  if (firstBrace > 0) {
    fixed = fixed.substring(firstBrace);
  }
  
  // Remove any text after last }
  const lastBrace = fixed.lastIndexOf('}');
  if (lastBrace !== -1 && lastBrace < fixed.length - 1) {
    fixed = fixed.substring(0, lastBrace + 1);
  }
  
  // Try parsing the fixed version
  try {
    return JSON.parse(fixed);
  } catch (e) {
    attempts.push(`Fixed version parse failed: ${(e as Error).message}`);
  }

  // Attempt 5: Try to fix common JSON issues more aggressively
  let aggressiveFix = originalText.trim();
  
  // Remove any leading/trailing non-JSON text more aggressively
  const jsonStart = aggressiveFix.search(/[{[]/);
  
  if (jsonStart !== -1) {
    aggressiveFix = aggressiveFix.substring(jsonStart);
    const lastBrace = aggressiveFix.lastIndexOf('}');
    const lastBracket = aggressiveFix.lastIndexOf(']');
    const endIndex = Math.max(lastBrace, lastBracket);
    if (endIndex !== -1) {
      aggressiveFix = aggressiveFix.substring(0, endIndex + 1);
    }
    
    // Fix common issues - remove trailing commas
    aggressiveFix = aggressiveFix.replace(/,(\s*[}\]])/g, '$1');
    
    try {
      return JSON.parse(aggressiveFix);
    } catch (e) {
      attempts.push(`Aggressive fix parse failed: ${(e as Error).message}`);
    }
  }

  // If all attempts failed, log everything for debugging
  console.error("❌ All JSON parsing attempts failed");
  console.error("📄 Original response length:", originalText.length);
  console.error("📄 Original response (first 1000 chars):", originalText.substring(0, 1000));
  console.error("📄 Last 500 chars:", originalText.substring(Math.max(0, originalText.length - 500)));
  console.error("📄 Attempts made:", attempts);
  
  throw new Error(
    `Failed to parse JSON after multiple attempts. ` +
    `Response preview: ${originalText.substring(0, 500)}... ` +
    `Attempts: ${attempts.join('; ')}`
  );
}

