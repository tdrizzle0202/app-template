import { Stack } from "expo-router";
import * as ExpoSplashScreen from "expo-splash-screen";
import React from "react";
import { StyleSheet } from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { Asset } from "expo-asset";
import {
  useFonts,
  PlusJakartaSans_400Regular,
  PlusJakartaSans_500Medium,
  PlusJakartaSans_600SemiBold,
  PlusJakartaSans_700Bold,
  PlusJakartaSans_800ExtraBold,
} from "@expo-google-fonts/plus-jakarta-sans";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { supabase } from "@/lib/supabase";
import { initializeRevenueCat } from "@/lib/revenueCat";
import { useProStatusStore } from "@/lib/proStatusStore";

// Preload onboarding assets
const onboardingAssets = [
  require("../assets/onboarding/preview_image.png"),
  require("../assets/onboarding/preview_image2.png"),
  require("../assets/onboarding/paywall_preview.jpg"),
];

ExpoSplashScreen.preventAutoHideAsync();

function RootLayoutNav() {
  return (
    <Stack screenOptions={{ headerBackTitle: "Back", gestureEnabled: false }}>
      <Stack.Screen name="index" options={{ headerShown: false }} />
      <Stack.Screen name="landing" options={{ headerShown: false }} />
      <Stack.Screen name="paywall" options={{ headerShown: false }} />
      <Stack.Screen name="(tabs)" options={{ headerShown: false, gestureEnabled: false }} />
      <Stack.Screen name="preview" options={{ headerShown: false }} />
      <Stack.Screen name="info-chat" options={{ headerShown: false }} />
      <Stack.Screen name="result" options={{ headerShown: false }} />
      <Stack.Screen name="onboarding-flow" options={{ headerShown: false }} />
      <Stack.Screen name="pre-paywall" options={{ headerShown: false }} />
      <Stack.Screen
        name="settings"
        options={{
          headerShown: false,
        }}
      />
    </Stack>
  );
}

export default function RootLayout() {
  const [fontsLoaded, fontError] = useFonts({
    PlusJakartaSans_400Regular,
    PlusJakartaSans_500Medium,
    PlusJakartaSans_600SemiBold,
    PlusJakartaSans_700Bold,
    PlusJakartaSans_800ExtraBold,
  });

  const refreshProStatus = useProStatusStore((state) => state.refreshProStatus);

  // One-time app init (auth, RevenueCat, Pro) — not tied to fonts
  const appInitRef = React.useRef(false);
  const [assetsLoaded, setAssetsLoaded] = React.useState(false);

  React.useEffect(() => {
    if (appInitRef.current) return;
    appInitRef.current = true;

    (async () => {
      try {
        // Preload onboarding images in parallel with other init
        const assetPreloadPromise = Asset.loadAsync(onboardingAssets);

        // Anonymous auth if no session
        const {
          data: { session },
        } = await supabase.auth.getSession();
        if (!session) {
          await supabase.auth.signInAnonymously();
        }

        // RevenueCat init
        await initializeRevenueCat();

        // Check Pro status once at startup
        await refreshProStatus();

        // Wait for assets to finish loading
        await assetPreloadPromise;
        setAssetsLoaded(true);
      } catch (error) {
        console.error("App initialization error:", error);
        setAssetsLoaded(true); // Still allow app to proceed
      }
    })();
  }, [refreshProStatus]);

  // Hide splash as soon as fonts and assets are ready (or errored)
  React.useEffect(() => {
    if ((fontsLoaded || fontError) && assetsLoaded) {
      ExpoSplashScreen.hideAsync().catch(console.error);
    }
  }, [fontsLoaded, fontError, assetsLoaded]);

  // Don't render anything until fonts and assets are loaded
  if ((!fontsLoaded && !fontError) || !assetsLoaded) {
    return null;
  }

  return (
    <ErrorBoundary>
      <SafeAreaProvider>
        <GestureHandlerRootView style={styles.container}>
          <RootLayoutNav />
        </GestureHandlerRootView>
      </SafeAreaProvider>
    </ErrorBoundary>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});