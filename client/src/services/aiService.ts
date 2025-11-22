import { apiClient } from "./api";

export const aiService = {
  generateTripPlan: async (requestData: any) => {
    return apiClient.post("/ai/trip-plan", requestData);
  },

  shufflePlace: async (shuffleData: any) => {
    return apiClient.post("/ai/shuffle", shuffleData);
  },

  chat: async (message: string, context?: any) => {
    return apiClient.post("/ai/chat", { message, context });
  }
};
