# TripGenie - AI Travel Planning Application

## Project Overview
TripGenie is an AI-powered travel planning application that helps users create personalized itineraries based on their preferences, budget, and travel style.

## Technology Stack
- **Frontend**: React 18 with TypeScript
- **Router**: Wouter (lightweight router)
- **Backend**: Express.js (Node.js)
- **Build Tool**: Vite
- **UI Components**: Shadcn UI with Radix UI primitives
- **Styling**: Tailwind CSS
- **State Management**: TanStack Query (React Query)
- **Forms**: React Hook Form with Zod validation

## Project Structure
```
├── client/                 # Frontend application
│   ├── public/            # Static assets
│   └── src/
│       ├── components/    # React components
│       │   ├── layout/    # Layout components (Navbar, Footer)
│       │   └── ui/        # Shadcn UI components
│       ├── hooks/         # Custom React hooks
│       ├── lib/           # Utility libraries
│       ├── pages/         # Page components
│       └── App.tsx        # Root component
├── server/                # Backend server
│   ├── index.ts          # Express server entry point
│   ├── routes.ts         # API routes
│   ├── storage.ts        # Data storage interface
│   └── vite.ts           # Vite dev server setup
├── shared/                # Shared types and schemas
│   └── schema.ts         # Data models
└── vite.config.ts        # Vite configuration

## Recent Migration (Lovable to Replit)
**Date**: November 21-22, 2025
**Status**: Completed

### Completed Steps
- ✅ Restructured project from single-directory Vite app to fullstack template
- ✅ Installed backend dependencies (Express, Drizzle ORM, etc.)
- ✅ Migrated from React Router DOM to Wouter
- ✅ Created Express server with Vite integration
- ✅ Updated all configuration files (package.json, tsconfig, vite.config.ts)
- ✅ Moved all frontend files to `client/` directory
- ✅ Created `server/` and `shared/` directories for backend structure
- ✅ Built "Underrated Places Submission" feature with automatic verification
- ✅ Implemented three-tier verification system (EXIF, reverse image search, AI detection)
- ✅ Updated Navbar with accessible navigation using asChild pattern
- ✅ Comprehensive data-testid coverage for all interactive elements

### Replit Environment Setup (November 22, 2025)
- ✅ Fixed syntax errors in AI prompt templates (removed backticks in template strings)
- ✅ Created missing AuthContext and useTextToSpeech hooks
- ✅ Added AuthProvider to App.tsx component hierarchy
- ✅ Fixed PORT type issue in server/index.ts (string to number conversion)
- ✅ Configured workflow for port 5000 with webview output
- ✅ Configured deployment for autoscale with build and run scripts
- ✅ Created .gitignore for Node.js project
- ✅ Configured API keys (GEMINI_API_KEY, GOOGLE_MAPS_API_KEY) as secrets
- ✅ Removed hardcoded API keys from client/index.html for security
- ✅ Application successfully running on port 5000 with all features operational

### AI Service Migration (November 22, 2025)
- ✅ Switched from Gemini API to Groq (FREE, no paid API needed)
- ✅ Updated AI service to use Groq SDK with llama-3.3-70b-versatile model
- ✅ Configured GROQ_API_KEY in Replit Secrets for automatic loading
- ✅ All trip planning now using Groq's fast, free inference
- ✅ Removed Google Generative AI dependency from code

### Enhanced AI System Prompt & Shuffle Functionality (November 22, 2025)
- ✅ **Improved AI System Prompt** with critical location constraints:
  - Enforces location accuracy (all recommendations from destination city only)
  - Fixed Patiala bug - now shows Patiala attractions, not Chandigarh
  - Added explicit timing format requirements (e.g., "10 AM to 2 PM")
  - Ensures unique lunch recommendations per day (no repeating restaurants)
- ✅ **Functional Shuffle Backend**:
  - `/api/ai/shuffle` endpoint fully working
  - Shuffle buttons in Itinerary have onClick handlers with loading states
  - Returns alternative places matching user interests and city constraints
  - Enhanced shuffle prompt to emphasize real places from destination city
- ✅ **Frontend Shuffle & Upvote Controls**:
  - Added onClick handlers with loading states on Shuffle buttons
  - Added onClick handlers on Upvote buttons
  - "Shuffle Lunch Options" button randomizes restaurant display
  - All buttons show pending state while processing

### Plan B Chatbot Mode (November 22, 2025)
- ✅ **Interactive Chatbot on Plan B Page**:
  - New "Chat Mode" button to toggle between indoor alternatives and chatbot
  - Real-time chat interface with message history
  - User can describe what happened (missed activities, woke up late, etc.)
  - Chatbot adjusts the entire itinerary based on user input
  - Shows updated day-by-day schedule with new recommendations
- ✅ **Backend Itinerary Adjustment Endpoint**:
  - `/api/ai/adjust-itinerary` endpoint processes user situations
  - Takes current itinerary, user preferences, and situation description
  - Returns AI-generated adjusted itinerary in same format
  - Includes acknowledgment and recommendation from the AI
  - All recommendations constrained to destination city
- ✅ **Chat Features**:
  - Message display with sender identification (user/assistant)
  - Timestamps on all messages
  - Auto-scroll to latest messages
  - Real-time loading state while AI processes
  - Displays adjusted itinerary with day-wise activities and timings
  - Clean UI with message bubbles and organized layout

### Pages
1. **Home** (`/`) - Trip planning input form with destination, budget, days, interests
2. **Dashboard** (`/dashboard`) - Trip overview with action buttons (View Itinerary, Plan B, Nearby Explorer)
3. **Itinerary** (`/itinerary`) - Detailed day-by-day itinerary with shuffle & upvote buttons
4. **Plan B** (`/plan-b`) - Indoor alternatives for bad weather + interactive chatbot mode
5. **Nearby** (`/nearby`) - Nearby attractions and restaurants
6. **Hidden Gems** (`/hidden-gems`) - Community-submitted travel gems with upvotes and verification status
7. **Upload Place** (`/upload-place`) - Submit hidden travel gems with automatic verification

## Features
- AI-powered trip suggestions
- Weather-based Plan B recommendations
- Budget tracking
- Interest-based activity filtering
- Responsive design with dark mode support
- **Underrated Places Submission** - Users can submit hidden travel gems with:
  - Photo upload with EXIF metadata extraction
  - Location verification (500m radius check)
  - Reverse image search to ensure originality
  - AI fake detection for submitted photos
  - Automatic status assignment (verified/under_review)

## Development Notes
- Server runs on port 5000
- Frontend uses Shadcn UI components with Tailwind CSS
- All routing done client-side with Wouter
- Backend API endpoints implemented in `server/routes.ts`
- Storage layer uses in-memory storage by default (can be switched to database)
- All interactive elements have data-testid attributes for comprehensive testing

## Complete Feature Implementation (November 22, 2025)
- ✅ **Upload Place Page** - Full photo upload form with:
  - Title and description fields
  - Latitude/longitude input
  - Photo upload with preview
  - Form validation
  - Real-time submission feedback
- ✅ **Photo Storage** - Photos stored in `/uploads` directory with path in database
- ✅ **Verification System**:
  - EXIF GPS metadata extraction from photos
  - Location accuracy check (500m radius)
  - Reverse image search for originality detection
  - AI fake detection to ensure authenticity
  - Automatic status assignment: verified or pending_review
- ✅ **Hidden Gems Display** - Community-submitted places shown with:
  - Verification status badges
  - Upvote functionality
  - Photo display
  - Location details
  - Submission timestamps

## API Endpoints
- `POST /api/places/submit` - Submit a new hidden place with automatic verification
  - Accepts: multipart/form-data with title, description, latitude, longitude, image
  - Returns: Place object with verification status and detailed verification results
  - Verification includes: EXIF location check (500m), reverse image search, AI fake detection
- `GET /api/places` - Retrieve all submitted places (verified and pending)
- `GET /api/places/:id` - Get a specific place by ID
- `POST /api/places/:id/upvote` - Upvote a hidden gem

## Technical Implementation Notes
- **Photo Uploads**: Use FormData with native fetch (not apiRequest) to preserve browser-managed Content-Type headers
- **Navigation**: Navbar uses Button with asChild pattern to avoid nested interactive elements
- **Verification System**: Currently uses placeholder logic for reverse image search and AI detection (to be replaced with real APIs in production)
- **EXIF Extraction**: Uses `exifr` library to extract GPS coordinates from uploaded photos
