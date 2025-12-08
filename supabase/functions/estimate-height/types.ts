// Types for the estimate-height Edge Function

export interface EstimateHeightRequest {
  /** The database row ID for the height estimation record */
  id: string;
  /** The storage file path within the 'photos' bucket (e.g., "device123/abcd-1234.jpg") */
  photoPath: string;
  /** Raw user input text to pass to Gemini */
  userInput: string;
}

export interface GeminiAnalysis {
  /** Estimated height in centimeters */
  estimated_height_cm: number;
  /** Short explanation of the estimation method */
  explanation: string;
  /** Method used for estimation (e.g., "known_object:credit_card") */
  method?: string;
  /** Hint for partial analysis (e.g., "need_object_or_known_person") */
  hint?: string;
}

export interface EstimateHeightResponse {
  /** Whether the operation was successful */
  success: boolean;
  /** The database row ID that was processed */
  id: string;
  /** The generated signed URL for debugging */
  signedUrl: string;
  /** The raw user input that was received */
  userInput: string;
  /** Analysis results from Gemini */
  analysis: GeminiAnalysis;
}

export interface EstimateHeightError {
  /** Whether the operation was successful */
  success: false;
  /** Error type: bad_request, no_image, ai_failed */
  error: 'bad_request' | 'no_image' | 'ai_failed';
  /** Additional error details if available */
  details?: string;
}