import { supabase } from './supabase';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Crypto from 'expo-crypto';
import * as ImageManipulator from 'expo-image-manipulator';

const CACHE_PREFIX = '@photo_cache:';

// Simple in-memory cache for photo URLs (never expires until app restart)
const photoUrlCache = new Map<string, { url: string; expiresAt: number }>();

// Load cache from AsyncStorage on startup (per-key storage)
(async () => {
  try {
    const allKeys = await AsyncStorage.getAllKeys();
    const cacheKeys = allKeys.filter(key => key.startsWith(CACHE_PREFIX));

    if (cacheKeys.length > 0) {
      const entries = await AsyncStorage.multiGet(cacheKeys);
      entries.forEach(([key, value]) => {
        if (value) {
          try {
            const path = key.replace(CACHE_PREFIX, '');
            photoUrlCache.set(path, JSON.parse(value));
          } catch (error) {
            console.warn('Skipping corrupted cache entry:', key);
          }
        }
      });
    }
  } catch (error) {
    console.error('Failed to load photo cache from storage:', error);
  }
})();

export async function uploadPhoto(localUri: string): Promise<string> {
  if (!localUri?.trim()) throw new Error('Local URI is required');

  // Get current user ID
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    throw new Error('User not authenticated');
  }

  const uuid = Crypto.randomUUID();
  const fileName = `${uuid}.jpg`;
  const filePath = `${user.id}/${fileName}`;

  // Resize and compress image for faster Gemini processing
  // Max dimension 1024px keeps quality while reducing file size significantly
  const compressed = await ImageManipulator.manipulateAsync(
    localUri,
    [{ resize: { width: 1024 } }], // Resize to max 1024px width, maintains aspect ratio
    { compress: 0.7, format: ImageManipulator.SaveFormat.JPEG }
  );

  const response = await fetch(compressed.uri);
  const buffer = await response.arrayBuffer();

  // Check file size limit (5MB)
  const MAX_FILE_SIZE = 5 * 1024 * 1024;
  if (buffer.byteLength > MAX_FILE_SIZE) {
    throw new Error('File size exceeds 5MB limit');
  }

  const { error } = await supabase.storage
    .from('photos')
    .upload(filePath, buffer, {
      contentType: 'image/jpeg',
      upsert: false,
    });

  if (error) throw new Error(`Failed to upload photo: ${error.message}`);

  // Pre-cache the signed URL
  const { data: urlData } = await supabase.storage.from('photos').createSignedUrl(filePath, 3600);
  if (urlData?.signedUrl) {
    const cacheEntry = { url: urlData.signedUrl, expiresAt: Date.now() + 3600000 };
    photoUrlCache.set(filePath, cacheEntry);
    try {
      await AsyncStorage.setItem(CACHE_PREFIX + filePath, JSON.stringify(cacheEntry));
    } catch (error) {
      console.error('Failed to cache photo URL in storage:', error);
    }
  }

  return filePath;
}

export async function getPhotoUrl(path: string, expiresIn: number = 3600): Promise<string> {
  if (!path?.trim()) throw new Error('Photo path is required');

  // Check cache first
  const cached = photoUrlCache.get(path);
  if (cached && Date.now() < cached.expiresAt) {
    return cached.url;
  }

  try {
    const { data, error } = await supabase.storage
      .from('photos')
      .createSignedUrl(path, expiresIn);

    if (error) {
      console.error('Supabase storage error:', error);
      throw new Error(`Failed to get photo URL: ${error.message}`);
    }

    // Cache matches the signed URL expiration
    const cacheExpiry = Date.now() + (expiresIn * 1000);
    const cacheEntry = { url: data.signedUrl, expiresAt: cacheExpiry };
    photoUrlCache.set(path, cacheEntry);

    try {
      await AsyncStorage.setItem(CACHE_PREFIX + path, JSON.stringify(cacheEntry));
    } catch (error) {
      console.error('Failed to cache photo URL in storage:', error);
    }

    return data.signedUrl;
  } catch (error) {
    console.error('Error getting photo URL:', error);
    throw error;
  }
}

export async function deletePhoto(path: string): Promise<void> {
  if (!path?.trim()) {
    console.warn('No photo path provided for deletion');
    return;
  }

  const { error } = await supabase.storage
    .from('photos')
    .remove([path]);

  if (error) {
    console.warn(`Failed to delete photo ${path}: ${error.message}`);
  }

  // Clear from cache when deleted
  photoUrlCache.delete(path);
  try {
    await AsyncStorage.removeItem(CACHE_PREFIX + path);
  } catch (error) {
    console.error('Failed to remove photo URL from cache storage:', error);
  }
}