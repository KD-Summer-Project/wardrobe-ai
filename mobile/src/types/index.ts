export type Slot = 'top' | 'bottom' | 'dress' | 'shoes' | 'outerwear';

export interface User {
  id: number;
  email: string;
}

export interface ClothingItem {
  id: number;
  category: string;
  color: string;
  warmth_level: number;
  season_tags: string[];
  image_url: string;
  created_at: string;
}

export interface WeatherData {
  temp_c: number;
  feels_like_c: number;
  condition: string;
  description: string;
  humidity: number;
  city_name: string | null;
}

export interface OutfitSuggestion {
  top: ClothingItem | null;
  bottom: ClothingItem | null;
  dress: ClothingItem | null;
  shoes: ClothingItem | null;
  outerwear: ClothingItem | null;
  missing_slots: string[];
  weather: WeatherData;
}

export interface AuthTokens {
  access_token: string;
  token_type: string;
}
