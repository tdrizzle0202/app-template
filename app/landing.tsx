import { router } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  Alert,
  StyleSheet,
  Text,
  View,
  Linking,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { PressableScale } from "@/components/ui/PressableScale";
import { COLORS, SPACING, RADIUS } from "@/constants/theme";
import { getCachedProStatus, useProStatusStore } from "@/lib/proStatusStore";
import {
  signInWithGoogle,
  isGoogleCancelledError,
} from "@/lib/auth/google-native";

const TERMS_URL = "https://www.apple.com/legal/internet-services/itunes/dev/stdeula/";
const PRIVACY_URL = "https://example.com/privacy";

export default function LandingScreen() {
  const hasPro = useProStatusStore((state) => state.hasPro);
  const [isSigningIn, setIsSigningIn] = useState(false);

  useEffect(() => {
    let isMounted = true;

    const ensureProStatus = async () => {
      const isPro = await getCachedProStatus();
      if (isPro && isMounted) {
        router.replace("/(tabs)");
      }
    };

    ensureProStatus();

    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    if (hasPro) {
      router.replace("/(tabs)");
    }
  }, [hasPro]);

  const handleGetStarted = async () => {
    const isPro = await getCachedProStatus();
    if (isPro) {
      router.replace("/(tabs)");
      return;
    }

    router.push("/onboarding");
  };

  const handleGoogleSignIn = async () => {
    if (isSigningIn) return;
    setIsSigningIn(true);

    try {
      const result = await signInWithGoogle();
      if (!result) {
        // User cancelled or no saved credential
        setIsSigningIn(false);
        return;
      }

      // TODO: Send result.idToken to your backend (e.g. Supabase):
      // await supabase.auth.signInWithIdToken({
      //   provider: 'google',
      //   token: result.idToken,
      // });

      router.push("/onboarding");
    } catch (error) {
      if (!isGoogleCancelledError(error)) {
        Alert.alert("Sign-In Error", "Something went wrong. Please try again.");
      }
    } finally {
      setIsSigningIn(false);
    }
  };

  const handleOpenTerms = () => {
    Linking.openURL(TERMS_URL);
  };

  const handleOpenPrivacy = () => {
    Linking.openURL(PRIVACY_URL);
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        {/* Main Text */}
        <View style={styles.headerContainer}>
          <Text style={styles.mainText}>
            Your App{"\n"}Headline Here
          </Text>
        </View>

        {/* Image / Hero area — add your carousel or hero image */}
        <View style={styles.heroContainer}>
          <Text style={styles.placeholderText}>Hero Image / Carousel</Text>
        </View>

        {/* Bottom Section */}
        <View style={styles.bottomSection}>
          <PressableScale
            style={styles.getStartedButton}
            onPress={handleGetStarted}
            haptic="Medium"
          >
            <Text style={styles.getStartedText}>Get started</Text>
          </PressableScale>

          <PressableScale
            style={styles.googleButton}
            onPress={handleGoogleSignIn}
            haptic="Medium"
            disabled={isSigningIn}
          >
            <GoogleLogo />
            <Text style={styles.googleButtonText}>
              {isSigningIn ? "Signing in…" : "Continue with Google"}
            </Text>
          </PressableScale>

          <Text style={styles.termsText}>
            By continuing, you're{"\n"}accepting our{" "}
            <Text style={styles.termsLink} onPress={handleOpenTerms}>
              Terms of Service
            </Text>{" "}
            and{" "}
            <Text style={styles.termsLink} onPress={handleOpenPrivacy}>
              Privacy Policy
            </Text>
          </Text>
        </View>
      </View>
    </SafeAreaView>
  );
}

// ── Inline Google "G" logo (no extra dependency) ─────────
function GoogleLogo() {
  return (
    <View style={styles.googleLogoContainer}>
      <Text style={styles.googleLogoText}>G</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F5F5F7",
  },
  content: {
    flex: 1,
    justifyContent: "flex-start",
    alignItems: "center",
    paddingBottom: SPACING.md,
  },
  headerContainer: {
    paddingTop: 20,
    paddingHorizontal: SPACING.lg,
    marginBottom: SPACING.md,
  },
  heroContainer: {
    flex: 1,
    width: "100%",
    alignItems: "center",
    justifyContent: "center",
  },
  placeholderText: {
    fontSize: 16,
    color: COLORS.gray500,
  },
  mainText: {
    fontSize: 42,
    fontWeight: "600",
    color: COLORS.black,
    textAlign: "center",
    lineHeight: 48,
  },
  bottomSection: {
    width: "100%",
    alignItems: "center",
    paddingTop: 0,
  },
  getStartedButton: {
    backgroundColor: COLORS.black,
    paddingHorizontal: SPACING["3xl"],
    paddingVertical: 16,
    borderRadius: 30,
    width: "75%",
    marginBottom: SPACING.sm,
  },
  getStartedText: {
    fontSize: 18,
    fontWeight: "600",
    color: COLORS.white,
    textAlign: "center",
  },
  googleButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: COLORS.white,
    paddingHorizontal: SPACING["3xl"],
    paddingVertical: 14,
    borderRadius: 30,
    borderWidth: 1,
    borderColor: "#DADCE0",
    borderCurve: "continuous",
    width: "75%",
    marginBottom: SPACING.sm,
  },
  googleButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: COLORS.black,
    marginLeft: SPACING.sm,
  },
  googleLogoContainer: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: "#4285F4",
    alignItems: "center",
    justifyContent: "center",
  },
  googleLogoText: {
    fontSize: 13,
    fontWeight: "700",
    color: COLORS.white,
  },
  termsText: {
    fontSize: 11,
    color: COLORS.gray500,
    textAlign: "center",
    lineHeight: 14,
  },
  termsLink: {
    textDecorationLine: "underline",
    color: COLORS.gray600,
  },
});
