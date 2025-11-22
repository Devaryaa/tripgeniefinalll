// Google Maps API initialization and utilities

let mapsLoaded = false;
let mapsLoading = false;
const loadCallbacks: Array<() => void> = [];

/**
 * Initialize Google Maps JavaScript API
 */
export function initGoogleMaps(apiKey: string, callback?: () => void): void {
  if (mapsLoaded) {
    callback?.();
    return;
  }

  if (callback) {
    loadCallbacks.push(callback);
  }

  if (mapsLoading) {
    return;
  }

  mapsLoading = true;

  // Check if script is already loaded
  const existingScript = document.querySelector('script[src*="maps.googleapis.com"]');
  if (existingScript) {
    mapsLoaded = true;
    mapsLoading = false;
    loadCallbacks.forEach(cb => cb());
    loadCallbacks.length = 0;
    return;
  }

  // Load Google Maps JavaScript API
  const script = document.createElement('script');
  script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places,geocoding`;
  script.async = true;
  script.defer = true;
  
  script.onload = () => {
    mapsLoaded = true;
    mapsLoading = false;
    console.log('✅ Google Maps API script loaded');
    loadCallbacks.forEach(cb => cb());
    loadCallbacks.length = 0;
  };

  script.onerror = () => {
    mapsLoading = false;
    console.error('❌ Failed to load Google Maps API');
  };

  document.head.appendChild(script);
}

/**
 * Check if Google Maps is loaded
 */
export function isMapsLoaded(): boolean {
  return mapsLoaded && typeof window.google !== 'undefined' && typeof window.google.maps !== 'undefined';
}

/**
 * Wait for Google Maps to be loaded
 */
export function waitForMaps(): Promise<void> {
  return new Promise((resolve, reject) => {
    if (isMapsLoaded()) {
      resolve();
      return;
    }

    const checkInterval = setInterval(() => {
      if (isMapsLoaded()) {
        clearInterval(checkInterval);
        resolve();
      }
    }, 100);

    // Timeout after 10 seconds
    setTimeout(() => {
      clearInterval(checkInterval);
      reject(new Error('Google Maps API failed to load within 10 seconds'));
    }, 10000);
  });
}

