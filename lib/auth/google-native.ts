import {
  GoogleSignin,
  isErrorWithCode,
  isNoSavedCredentialFoundResponse,
  statusCodes,
} from '@react-native-google-signin/google-signin';

// ── Configure ────────────────────────────────────────────
// Call once at app startup (e.g. in _layout.tsx or index.tsx).
// webClientId comes from Google Cloud Console → OAuth 2.0 Client IDs → "Web client".
// It is the SAME value on both iOS and Android.
export function configureGoogleSignIn() {
  GoogleSignin.configure({
    webClientId: process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID,
    iosClientId: process.env.EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID,
  });
}

// ── Sign In ──────────────────────────────────────────────
// Returns the Google idToken on success, or null if the user cancelled.
// Throws on unexpected errors.
export async function signInWithGoogle(): Promise<{
  idToken: string;
  email: string | null;
  name: string | null;
} | null> {
  await GoogleSignin.hasPlayServices({ showPlayServicesUpdateDialog: true });

  const response = await GoogleSignin.signIn();

  if (isNoSavedCredentialFoundResponse(response)) {
    return null;
  }

  const idToken = response.data?.idToken;
  if (!idToken) {
    throw new Error('Google Sign-In succeeded but no idToken was returned');
  }

  return {
    idToken,
    email: response.data?.user.email ?? null,
    name: response.data?.user.name ?? null,
  };
}

// ── Sign Out ─────────────────────────────────────────────
export async function signOutGoogle() {
  try {
    await GoogleSignin.signOut();
  } catch {
    // silent – user may not have been signed in
  }
}

// ── Error helpers ────────────────────────────────────────
export function isGoogleCancelledError(error: unknown): boolean {
  return isErrorWithCode(error) && error.code === statusCodes.SIGN_IN_CANCELLED;
}

export function isGoogleInProgressError(error: unknown): boolean {
  return isErrorWithCode(error) && error.code === statusCodes.IN_PROGRESS;
}
