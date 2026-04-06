export interface User {
  id: string;
  email: string;
  full_name: string;
  avatar_url: string | null;
  created_at: string;
}

export interface Destination {
  id: string;
  name: string;
  country: string;
  region: "domestic" | "international";
  image_url: string;
  description: string;
  budget_min: number;
  budget_max: number;
  currency: string;
  best_months: number[];
  vibes: Vibe[];
  activities: string[];
  avg_daily_cost: number;
  latitude: number;
  longitude: number;
}

export type Vibe =
  | "adventure"
  | "relaxation"
  | "cultural"
  | "romantic"
  | "party"
  | "nature"
  | "spiritual"
  | "foodie"
  | "urban"
  | "offbeat";

export interface Trip {
  id: string;
  user_id: string;
  destination_id: string;
  title: string;
  budget: number;
  duration_days: number;
  start_date: string | null;
  vibe: Vibe;
  status: "planning" | "confirmed" | "completed";
  created_at: string;
  updated_at: string;
}

export interface ItineraryDay {
  id: string;
  trip_id: string;
  day_number: number;
  title: string;
  activities: ItineraryActivity[];
}

export interface ItineraryActivity {
  id: string;
  time: string;
  title: string;
  description: string;
  cost_estimate: number;
  location: string;
}

export type DietaryPref = "vegetarian" | "vegan" | "no-beef" | "no-pork" | "no-seafood" | "halal" | "none";

export interface OnboardingData {
  budget: number;
  duration: number;
  vibes: Vibe[];
  startDate: string | null;
  travelers: number;
  region: "domestic" | "international" | "both";
  diet: DietaryPref;
}
