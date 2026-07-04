import { apiClient } from './client';
import { ClothingItem } from '../types';

export async function listItems(): Promise<ClothingItem[]> {
  const { data } = await apiClient.get<ClothingItem[]>('/items');
  return data;
}

export async function uploadItem(imageUri: string): Promise<ClothingItem> {
  const formData = new FormData();
  formData.append('file', {
    uri: imageUri,
    name: 'item.jpg',
    type: 'image/jpeg',
  } as unknown as Blob);

  const { data } = await apiClient.post<ClothingItem>('/items', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return data;
}

export async function deleteItem(itemId: number): Promise<void> {
  await apiClient.delete(`/items/${itemId}`);
}
