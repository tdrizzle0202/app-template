import * as StoreReview from 'expo-store-review';
import AsyncStorage from '@react-native-async-storage/async-storage';

const STORAGE_KEYS = {
  ESTIMATE_COUNT: 'height_estimate_count',
  RATING_PROMPTED: 'rating_prompted',
  LAST_PROMPT_DATE: 'last_prompt_date',
};

const PROMPTS_CONFIG = {
  ESTIMATES_BEFORE_PROMPT: 3, // Show after 3 successful estimates
  DAYS_BETWEEN_PROMPTS: 7,    // Don't prompt again for 7 days
};

/**
 * Increment the estimate count and potentially show rating prompt
 * Call this after each successful height estimation
 */
export async function incrementEstimateAndPromptRating(): Promise<void> {
  try {
    // Check if device supports in-app review
    const isAvailable = await StoreReview.isAvailableAsync();
    if (!isAvailable) {
      return;
    }

    // Get current count
    const countStr = await AsyncStorage.getItem(STORAGE_KEYS.ESTIMATE_COUNT);
    const count = countStr ? parseInt(countStr, 10) : 0;
    const newCount = count + 1;

    // Save new count
    await AsyncStorage.setItem(STORAGE_KEYS.ESTIMATE_COUNT, newCount.toString());

    // Check if we should show the prompt
    if (newCount >= PROMPTS_CONFIG.ESTIMATES_BEFORE_PROMPT) {
      await showRatingPromptIfEligible();
    }
  } catch (error) {
    console.error('Error in rating prompt:', error);
  }
}

/**
 * Show rating prompt if user is eligible (hasn't been prompted recently)
 */
async function showRatingPromptIfEligible(): Promise<void> {
  try {
    // Check if already prompted
    const wasPrompted = await AsyncStorage.getItem(STORAGE_KEYS.RATING_PROMPTED);

    if (wasPrompted === 'true') {
      // Check if enough time has passed since last prompt
      const lastPromptDateStr = await AsyncStorage.getItem(STORAGE_KEYS.LAST_PROMPT_DATE);
      if (lastPromptDateStr) {
        const lastPromptDate = parseInt(lastPromptDateStr, 10);
        const daysSincePrompt = (Date.now() - lastPromptDate) / (1000 * 60 * 60 * 24);

        if (daysSincePrompt < PROMPTS_CONFIG.DAYS_BETWEEN_PROMPTS) {
          // Too soon to prompt again
          return;
        }
      }
    }

    // Show the native rating prompt
    await StoreReview.requestReview();

    // Mark as prompted
    await AsyncStorage.setItem(STORAGE_KEYS.RATING_PROMPTED, 'true');
    await AsyncStorage.setItem(STORAGE_KEYS.LAST_PROMPT_DATE, Date.now().toString());

    // Reset count for next cycle
    await AsyncStorage.setItem(STORAGE_KEYS.ESTIMATE_COUNT, '0');
  } catch (error) {
    console.error('Error showing rating prompt:', error);
  }
}

/**
 * Manually trigger rating prompt (for "Rate App" button in settings)
 */
export async function showRatingPrompt(): Promise<void> {
  try {
    const isAvailable = await StoreReview.isAvailableAsync();

    if (isAvailable) {
      await StoreReview.requestReview();
    } else {
      // Fallback: open store page if in-app review not available
      const url = await StoreReview.storeUrl();
      if (url) {
        // You can use Linking.openURL(url) here if needed
        console.log('Store URL:', url);
      }
    }
  } catch (error) {
    console.error('Error showing rating prompt:', error);
  }
}
