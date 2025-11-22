import { useState } from "react";
import { aiService } from "../services/aiService";
import { TripPlan } from "../types/trip.types";

export const useTripPlanner = () => {
  const [tripPlan, setTripPlan] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const generatePlan = async (requestData: any) => {
    setLoading(true);
    setError(null);

    try {
      const response = await aiService.generateTripPlan(requestData);
      setTripPlan(response.data);
      return response.data;
    } catch (err: any) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const shufflePlace = async (shuffleData: any) => {
    setLoading(true);
    setError(null);

    try {
      const response = await aiService.shufflePlace(shuffleData);
      return response.data;
    } catch (err: any) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return {
    tripPlan,
    loading,
    error,
    generatePlan,
    shufflePlace
  };
};
