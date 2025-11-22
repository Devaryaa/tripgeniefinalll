import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import { initGoogleMaps } from "./services/mapsService";

// Initialize Google Maps API
declare global {
  interface Window {
    GOOGLE_MAPS_API_KEY?: string;
  }
}

if (window.GOOGLE_MAPS_API_KEY) {
  initGoogleMaps(window.GOOGLE_MAPS_API_KEY, () => {
    console.log("✅ Google Maps API loaded");
  });
}

createRoot(document.getElementById("root")!).render(<App />);
