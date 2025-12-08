import { supabase } from './supabase';

export interface EstimateHeightRequest {
  id: string;
  photoPath: string;
  userInput: string;
}

export interface GeminiAnalysis {
  estimated_height_cm: number;
  explanation: string;
  method?: string;
  hint?: string;
}

export interface EstimateHeightResponse {
  success: boolean;
  id: string;
  signedUrl: string;
  userInput: string;
  analysis: GeminiAnalysis;
}

export interface EstimateHeightError {
  success: false;
  error: 'bad_request' | 'no_image' | 'ai_failed';
  details?: string;
}

export async function callHeightEstimation(
  id: string,
  photoPath: string,
  userInput: string = ''
): Promise<EstimateHeightResponse> {
  console.log('Calling height estimation API:', { id, photoPath, userInput });
  console.log('Environment variables:', {
    supabaseUrl: process.env.EXPO_PUBLIC_SUPABASE_URL ? 'Present' : 'Missing',
    supabaseKey: process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY ? 'Present' : 'Missing'
  });
  
  try {
    console.log('Invoking Edge Function: estimate-height');
    const { data, error } = await supabase.functions.invoke('estimate-height', {
      body: {
        id,
        photoPath,
        userInput
      } as EstimateHeightRequest
    });
    
    console.log('Edge Function response:', { data, error });

    if (error) {
      console.error('Supabase function error:', error);
      throw new Error(`API call failed: ${error.message}`);
    }

    if (!data) {
      throw new Error('No response data received');
    }

    console.log('Height estimation response:', data);

    // Check if the response indicates failure
    if (!data.success) {
      const errorResponse = data as EstimateHeightError;
      throw new Error(`Height estimation failed: ${errorResponse.error} - ${errorResponse.details || 'Unknown error'}`);
    }

    return data as EstimateHeightResponse;
  } catch (error) {
    console.error('Height estimation API error:', error);
    throw error;
  }
}