import React, { createContext, useContext, useState, ReactNode } from "react";

interface TripContextType {
  userPreferences: any;
  setUserPreferences: (prefs: any) => void;
  visited: string[];
  addVisited: (place: string) => void;
  previouslyShown: string[];
  addPreviouslyShown: (place: string) => void;
  clearHistory: () => void;
  currentTrip: any;
  setCurrentTrip: (trip: any) => void;
}

const TripContext = createContext<TripContextType | undefined>(undefined);

interface TripProviderProps {
  children: ReactNode;
}

export const TripProvider: React.FC<TripProviderProps> = ({ children }) => {
  const [userPreferences, setUserPreferences] = useState<any>(null);
  const [visited, setVisited] = useState<string[]>([]);
  const [previouslyShown, setPreviouslyShown] = useState<string[]>([]);
  const [currentTrip, setCurrentTrip] = useState<any>(null);

  const addVisited = (place: string) => {
    setVisited(prev => [...new Set([...prev, place])]);
  };

  const addPreviouslyShown = (place: string) => {
    setPreviouslyShown(prev => [...new Set([...prev, place])]);
  };

  const clearHistory = () => {
    setVisited([]);
    setPreviouslyShown([]);
  };

  const value: TripContextType = {
    userPreferences,
    setUserPreferences,
    visited,
    addVisited,
    previouslyShown,
    addPreviouslyShown,
    clearHistory,
    currentTrip,
    setCurrentTrip
  };

  return (
    <TripContext.Provider value={value}>
      {children}
    </TripContext.Provider>
  );
};

export const useTrip = () => {
  const context = useContext(TripContext);
  if (!context) {
    throw new Error("useTrip must be used within TripProvider");
  }
  return context;
};

export const useTripContext = () => {
  const context = useContext(TripContext);
  if (!context) {
    throw new Error("useTripContext must be used within TripProvider");
  }
  return context;
};
