// Use relative URLs - Vite dev server and production both serve from same origin
const API_BASE_URL = import.meta.env.VITE_API_URL || "/api";

export const apiClient = {
  post: async (endpoint: string, data: any) => {
    console.log(`📤 API Request: POST ${API_BASE_URL}${endpoint}`, data);
    
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(data)
    });

    console.log(`📥 API Response Status: ${response.status} ${response.statusText}`);

    if (!response.ok) {
      let errorData;
      try {
        errorData = await response.json();
        console.error("❌ API Error Response:", errorData);
      } catch (e) {
        const text = await response.text();
        console.error("❌ API Error (non-JSON):", text);
        throw new Error(`Request failed: ${response.status} ${response.statusText} - ${text}`);
      }
      throw new Error(errorData.error || errorData.message || "Request failed");
    }

    const result = await response.json();
    console.log("✅ API Success Response:", result);
    return result;
  },

  get: async (endpoint: string) => {
    const response = await fetch(`${API_BASE_URL}${endpoint}`);

    if (!response.ok) {
      throw new Error("Request failed");
    }

    return response.json();
  }
};
