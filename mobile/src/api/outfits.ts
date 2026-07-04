import { apiClient } from './client';
import { OutfitSuggestion } from '../types';

export async function getOutfitSuggestion(lat: number, lon: number): Promise<OutfitSuggestion> {
  const { data } = await apiClient.get<OutfitSuggestion>('/outfits/suggestion', {
    params: { lat, lon },
  });
  return data;
}
