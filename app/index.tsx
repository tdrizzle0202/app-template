import { router } from "expo-router";
import React, { useEffect } from "react";
import { StyleSheet, View } from "react-native";
import * as ExpoSplashScreen from "expo-splash-screen";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useProStatusStore } from "@/lib/proStatusStore";

export default function Index() {
  useEffect(() => {
    (async () => {
      try {
        const hasSeenOnboarding = await AsyncStorage.getItem('hasSeenOnboarding');
        const hasPro = useProStatusStore.getState().hasPro;

        console.log('Launch checks:', { hasSeenOnboarding, hasPro });

        if (!hasSeenOnboarding) {
          router.replace("/onboarding/welcome");
        } else if (hasPro) {
          router.replace("/(tabs)");
        } else {
          router.replace("/paywall");
        }
      } catch (error) {
        console.error('Error during launch checks:', error);
        router.replace("/onboarding/welcome");
      }

      // Hide native splash after navigation commits
      requestAnimationFrame(() => {
        ExpoSplashScreen.hideAsync().catch(console.error);
      });
    })();
  }, []);

  // Blank view matching splash color — native splash covers this
  return <View style={styles.container} />;
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0F1218',
  },
});
