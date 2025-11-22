import dotenv from "dotenv";

dotenv.config();

// Text-to-Speech service using Web Speech API (browser-based)
// For server-side TTS, you can integrate with Google Cloud TTS, AWS Polly, etc.

export const ttsService = {
  /**
   * Generate speech from text (client-side implementation)
   * This returns instructions for the frontend to use Web Speech API
   */
  getSpeechInstructions: (text: string, options?: {
    lang?: string;
    voice?: string;
    rate?: number;
    pitch?: number;
  }) => {
    return {
      text,
      options: {
        lang: options?.lang || 'en-US',
        voice: options?.voice,
        rate: options?.rate || 1.0,
        pitch: options?.pitch || 1.0,
      },
      method: 'web-speech-api', // Frontend will use browser's Web Speech API
    };
  },

  /**
   * Server-side TTS using Google Cloud TTS (if API key is provided)
   */
  generateAudio: async (text: string, options?: {
    lang?: string;
    voice?: string;
  }): Promise<Buffer | null> => {
    const apiKey = process.env.GOOGLE_TTS_API_KEY;
    
    if (!apiKey) {
      console.warn("⚠️ GOOGLE_TTS_API_KEY not set. TTS will use browser Web Speech API.");
      return null;
    }

    // Implementation for Google Cloud TTS
    // This requires @google-cloud/text-to-speech package
    // For now, return null to use browser-based TTS
    return null;
  },
};

