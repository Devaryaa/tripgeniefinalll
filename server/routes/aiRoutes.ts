import express from "express";
import { generateTripPlan, shufflePlace, chatWithAI } from "../controllers/aiControllers";
import { aiRateLimiter, chatRateLimiter } from "../middleware/rateLimiter";

const router = express.Router();

// Test endpoint to verify connection
router.get("/test", (req, res) => {
  res.json({ 
    success: true, 
    message: "AI routes are working!",
    timestamp: new Date().toISOString()
  });
});

router.post("/trip-plan", aiRateLimiter, generateTripPlan);
router.post("/shuffle", aiRateLimiter, shufflePlace);
router.post("/chat", chatRateLimiter, chatWithAI);

export default router;
