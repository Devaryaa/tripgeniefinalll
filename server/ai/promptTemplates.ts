export const buildTripPlannerPrompt = (request: any) => {
  const { userPreferences, location, duration, visited = [], previouslyShown = [] } = request;
  
  return `
Generate a ${duration}-day trip plan for ${location.city}.

USER PREFERENCES:
- Interests: ${userPreferences.interests.join(', ')}
- Budget: ${userPreferences.budget}
- Pace: ${userPreferences.pace}
- Food: ${userPreferences.foodPreference.join(', ')}
- Travel Style: ${userPreferences.travelStyle.join(', ')}

LOCATION DATA:
- City: ${location.city}
${location.geotag ? `- Coordinates: ${location.geotag.latitude}, ${location.geotag.longitude}` : ''}
${location.weather ? `- Weather: ${location.weather.temperature}°C, ${location.weather.condition}` : ''}

EXCLUSIONS:
- Already visited: ${visited.join(', ') || 'None'}
- Previously shown: ${previouslyShown.join(', ') || 'None'}

IMPORTANT: Provide REAL, SPECIFIC places that actually exist in ${location.city}. Do NOT use generic or fictional names.

Provide:
1. Day-wise itinerary with 3-5 REAL attractions per day (use actual place names that exist)
2. Timing recommendations based on weather
3. 4-7 REAL café/restaurant suggestions with actual names, vibes, price ranges, best dishes
4. 2-3 REAL nearby medical stores/pharmacies with actual names
5. Transport recommendations between places with realistic distances
6. Weather-appropriate tips and medicine kit suggestions

For each place, provide:
- Real, verifiable place names (not generic descriptions)
- Actual addresses or neighborhoods when possible
- Realistic ratings (4.0-5.0 range)
- Realistic review counts
- Actual distance estimates in km

CRITICAL JSON OUTPUT REQUIREMENTS - FOLLOW EXACTLY:
You MUST return ONLY valid JSON that can be directly parsed by JSON.parse().

ABSOLUTE RULES:
1. Start with { and end with } - NO other text before or after
2. Use double quotes for ALL strings and keys (not single quotes)
3. NO markdown code blocks (no backticks or code fences)
4. NO explanations, comments, or any text outside the JSON
5. NO trailing commas before } or ]
6. Escape special characters in strings (use \\n for newlines, \\" for quotes)
7. Your ENTIRE response must be ONLY the JSON object - nothing else

EXACT JSON STRUCTURE REQUIRED:
{
  "days": [
    {
      "day": 1,
      "places": [
        {
          "name": "Place Name (REAL place that exists)",
          "type": "attraction",
          "description": "Brief description of the place",
          "timing": "Morning 9 AM - 12 PM",
          "transport": "Auto rickshaw or Cab",
          "distance": "2.5 km"
        }
      ]
    },
    {
      "day": 2,
      "places": [
        {
          "name": "Another Real Place",
          "type": "attraction",
          "description": "Description here",
          "timing": "Afternoon 2 PM - 5 PM",
          "transport": "Walking",
          "distance": "0.8 km"
        }
      ]
    }
  ],
  "cafes": [
    {
      "name": "Real Cafe Name",
      "vibe": "Cozy, casual",
      "price": "₹500-800",
      "bestDish": "Signature dish name",
      "distance": "1.2 km"
    },
    {
      "name": "Another Real Restaurant",
      "vibe": "Fine dining, elegant",
      "price": "₹1500-2500",
      "bestDish": "Popular dish name",
      "distance": "2.3 km"
    }
  ],
  "medical": [
    "Apollo Pharmacy - Main Street",
    "Wellness Medical Store - Near City Center"
  ],
  "tips": [
    "Carry water bottles during hot weather",
    "Book tickets in advance for popular attractions"
  ]
}

FIELD REQUIREMENTS (ALL MANDATORY):
- "days": Array of objects, one per day. Each must have:
  * "day": number (1, 2, 3, etc.)
  * "places": Array of objects, each must have ALL these fields as strings:
    - "name": string (real place name)
    - "type": string (e.g., "attraction", "monument", "beach")
    - "description": string (brief description)
    - "timing": string (e.g., "Morning 9 AM - 12 PM")
    - "transport": string (e.g., "Auto rickshaw", "Cab", "Walking")
    - "distance": string (e.g., "2.5 km")

- "cafes": Array of objects, each must have ALL these fields as strings:
  * "name": string (real cafe/restaurant name)
  * "vibe": string (e.g., "Cozy, casual", "Fine dining")
  * "price": string (e.g., "₹500-800", "₹1500-2500")
  * "bestDish": string (signature or popular dish)
  * "distance": string (e.g., "1.2 km")

- "medical": Array of strings (medical store/pharmacy names with addresses)

- "tips": Array of strings (travel tips and recommendations)

CRITICAL: 
- Generate ${duration} days (one object per day in "days" array)
- Each day should have 3-5 places
- Include 4-7 cafes/restaurants
- Include 2-3 medical stores
- Include 3-5 tips
- ALL fields must be strings (except "day" which is a number)
- Use REAL place names that exist in ${location.city}
- NO missing fields - every place and cafe must have ALL required fields

OUTPUT FORMAT:
- Start response with { (opening brace)
- End response with } (closing brace)
- NO text before or after
- NO markdown formatting
- NO code blocks
- Return ONLY the JSON object

EXAMPLE OF CORRECT OUTPUT (compact format is fine):
{"days":[{"day":1,"places":[{"name":"Gateway of India","type":"monument","description":"Iconic arch monument","timing":"Morning 9 AM - 12 PM","transport":"Cab","distance":"5 km"}]}],"cafes":[{"name":"Leopold Cafe","vibe":"Historic, casual","price":"₹600-1000","bestDish":"Chicken Cafreal","distance":"2 km"}],"medical":["Apollo Pharmacy - Colaba"],"tips":["Carry water"]}
`;
};

export const buildShufflePrompt = (request: any) => {
  const { placeName, placeType, location, userPreferences, visited = [], previouslyShown = [] } = request;
  
  return `
SHUFFLE RECOMMENDATION - Find Alternative

ORIGINAL PLACE:
- Name: "${placeName}"
- Type: ${placeType}

REPLACEMENT MUST BE:
- Same type/category as original (${placeType})
- Located IN ${location.city} ONLY (REAL place that actually exists)
- Match user interests: ${userPreferences.interests.join(', ')}
- NOT already visited: ${visited.join(', ') || 'None yet'}
- NOT previously shown: ${previouslyShown.join(', ') || 'None yet'}

CRITICAL REQUIREMENTS:
1. The new place MUST BE A REAL, EXISTING location in ${location.city}
2. Do NOT suggest generic names - use actual place names that people can visit
3. Match the original place's category and purpose
4. Provide a 1-2 sentence reason why this is a good alternative

${location.weather ? `\nCURRENT CONDITIONS: ${location.weather.temperature}°C, ${location.weather.condition}` : ''}

CRITICAL JSON OUTPUT REQUIREMENTS:
1. Return ONLY valid JSON - no text before/after
2. Start with { and end with }
3. Use double quotes for all strings
4. NO markdown code blocks, NO explanations

REQUIRED JSON STRUCTURE:
{
  "new_place": "Exact Name of Real Place in ${location.city}",
  "description": "Why this is a good alternative"
}

Return ONLY the JSON object - nothing else.
`;
};

export const buildChatPrompt = (message: string, context?: any) => {
  return `
User message: ${message}

${context ? `Context: ${JSON.stringify(context)}` : ''}

Respond as TripGenie PRO MAX with helpful travel advice.
`;
};
