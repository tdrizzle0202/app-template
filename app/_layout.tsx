import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Stack } from "expo-router";
import * as ExpoSplashScreen from "expo-splash-screen";
import React from "react";
import { StyleSheet } from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { Asset } from "expo-asset";
import {
  useFonts,
  Nunito_400Regular,
  Nunito_500Medium,
  Nunito_600SemiBold,
  Nunito_700Bold,
  Nunito_800ExtraBold,
  Nunito_900Black,
} from "@expo-google-fonts/nunito";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { supabase } from "@/lib/supabase";
import { initializeAdMob } from "@/lib/admobAds";
import { initializeRevenueCat } from "@/lib/revenueCat";
import { useProStatusStore } from "@/lib/proStatusStore";

// Preload onboarding assets
const onboardingAssets = [
  require("../assets/onboarding/preview_image.png"),
  require("../assets/onboarding/preview_image2.png"),
  require("../assets/onboarding/paywall_preview.jpg"),
];

ExpoSplashScreen.preventAutoHideAsync();

const queryClient = new QueryClient();

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
    Nunito_400Regular,
    Nunito_500Medium,
    Nunito_600SemiBold,
    Nunito_700Bold,
    Nunito_800ExtraBold,
    Nunito_900Black,
  });

  const refreshProStatus = useProStatusStore((state) => state.refreshProStatus);

  // One-time app init (auth, RevenueCat, Pro, AdMob) — not tied to fonts
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

        // AdMob init (handles its own preload internally)
        await initializeAdMob();

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
        <QueryClientProvider client={queryClient}>
          <GestureHandlerRootView style={styles.container}>
            <RootLayoutNav />
          </GestureHandlerRootView>
        </QueryClientProvider>
      </SafeAreaProvider>
    </ErrorBoundary>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});