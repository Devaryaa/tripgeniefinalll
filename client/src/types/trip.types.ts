export interface Place {
  name: string;
  type: string;
  description: string;
  timing: string;
  transport: string;
  distance: string;
}

export interface Day {
  day: number;
  places: Place[];
}

export interface Cafe {
  name: string;
  vibe: string;
  price: string;
  bestDish: string;
  distance: string;
}

export interface TripPlan {
  days: Day[];
  cafes: Cafe[];
  medical: string[];
  tips: string[];
}
