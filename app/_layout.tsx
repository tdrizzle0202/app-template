import { Stack } from "expo-router";
import * as ExpoSplashScreen from "expo-splash-screen";
import React from "react";
import { StatusBar, StyleSheet } from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { SafeAreaProvider } from "react-native-safe-area-context";
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

  // One-time app init (RevenueCat, Pro status)
  const appInitRef = React.useRef(false);
  const [appReady, setAppReady] = React.useState(false);

  React.useEffect(() => {
    if (appInitRef.current) return;
    appInitRef.current = true;

    (async () => {
      try {
        await initializeRevenueCat();
        await refreshProStatus();
        setAppReady(true);
      } catch (error) {
        console.error("App initialization error:", error);
        setAppReady(true);
      }
    })();
  }, [refreshProStatus]);

  if ((!fontsLoaded && !fontError) || !appReady) {
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
