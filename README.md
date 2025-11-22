# TripGenie - AI-Powered Travel Planning

A smart travel planning application with AI-powered itinerary generation and Google Maps integration.

## Setup Instructions

### 1. Install Dependencies

```bash
npm install
```

### 2. Configure API Keys

Create a `.env` file in the root directory with the following variables:

```env
# AI API Keys (at least one is required)
# Option 1: Llama API (via Groq)
LLAMA_API_KEY=your_groq_api_key_here

# Option 2: Gemini API (fallback if Llama fails)
GEMINI_API_KEY=your_gemini_api_key_here

# Google Maps API Key (required for maps functionality)
GOOGLE_MAPS_API_KEY=your_google_maps_api_key_here

# Server Configuration
PORT=5000
NODE_ENV=development
CLIENT_URL=http://localhost:3000
```

**Important Notes:**
- You need at least **one AI API key** (either `LLAMA_API_KEY` or `GEMINI_API_KEY`)
- The system will try Llama first, then fallback to Gemini if Llama fails
- The `GOOGLE_MAPS_API_KEY` is required for maps functionality
- The Maps API key is also hardcoded in `client/index.html` for client-side usage

### 3. Run the Application

**Development mode:**
```bash
npm run dev
```

**Production mode:**
```bash
npm run build
npm start
```

## API Configuration

### AI Service
- **Primary**: Llama 3.1 8B Instant (via Groq API)
- **Fallback**: Gemini 1.5 Flash (via Google Generative AI)

The AI service automatically falls back to Gemini if Llama fails.

### Maps Service
- Uses Google Maps JavaScript API for client-side maps
- Uses Google Maps Places API, Geocoding API, and Directions API for server-side operations

## Features

- AI-powered trip planning
- Weather-aware recommendations
- Interactive maps
- Place search and details
- Directions and routing
- Shuffle functionality for alternative suggestions
