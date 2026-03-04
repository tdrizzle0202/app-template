import { Stack } from "expo-router";
import * as ExpoSplashScreen from "expo-splash-screen";
import React from "react";
import { StatusBar, StyleSheet } from "react-native";
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
    <Stack screenOptions={{ headerShown: false, gestureEnabled: true, contentStyle: { backgroundColor: '#0F1218' } }}>
      <Stack.Screen name="index" options={{ gestureEnabled: false }} />
      <Stack.Screen name="landing" options={{ gestureEnabled: false }} />
      <Stack.Screen name="paywall" options={{ gestureEnabled: false }} />
      <Stack.Screen name="(tabs)" options={{ gestureEnabled: false }} />
      <Stack.Screen name="onboarding-flow" options={{ gestureEnabled: false }} />
      <Stack.Screen name="onboarding" options={{ gestureEnabled: false }} />
      <Stack.Screen name="pre-paywall" options={{ gestureEnabled: false }} />
      <Stack.Screen name="breathing" />
      <Stack.Screen name="reality-check" />
      <Stack.Screen name="craving-game" />
      <Stack.Screen name="graphic-reality" />
      <Stack.Screen name="pledge" />
      <Stack.Screen name="more" />
      <Stack.Screen name="share-progress" />
      <Stack.Screen name="export-data" />
      <Stack.Screen
        name="sos-modal"
        options={{
          presentation: 'modal',
          animation: 'slide_from_bottom',
          contentStyle: { backgroundColor: 'transparent' },
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

  // Don't render anything until fonts and assets are loaded
  // Native splash stays visible until index.tsx navigates and hides it
  if ((!fontsLoaded && !fontError) || !assetsLoaded) {
    return null;
  }

  return (
    <ErrorBoundary>
      <SafeAreaProvider>
        <GestureHandlerRootView style={styles.container}>
          <StatusBar barStyle="light-content" />
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