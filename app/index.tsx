import { router } from "expo-router";
import React, { useEffect } from "react";
import { StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { TYPE, COLORS } from "@/constants/theme";

export default function SplashScreen() {
  const insets = useSafeAreaInsets();

  console.log('SplashScreen rendered');

  useEffect(() => {
    console.log('SplashScreen useEffect - setting timer to navigate');

    const checkProAndNavigate = async () => {
      // Wait for splash animation
      await new Promise(resolve => setTimeout(resolve, 2500));

      try {
        const { default: AsyncStorage } = require('@react-native-async-storage/async-storage');
        const { useProStatusStore } = require("@/lib/proStatusStore");

        // Check if user has seen onboarding
        const hasSeenOnboarding = await AsyncStorage.getItem('hasSeenOnboarding');
        const hasPro = useProStatusStore.getState().hasPro;

        console.log('Launch checks:', { hasSeenOnboarding, hasPro });

        if (!hasSeenOnboarding) {
          // New user -> Landing -> Onboarding
          router.replace("/landing");
        } else if (hasPro) {
          // Pro user -> Home
          router.replace("/(tabs)/home");
        } else {
          // Existing user, not Pro -> Pre-Paywall
          router.replace("/pre-paywall");
        }
      } catch (error) {
        console.error('Error during launch checks:', error);
        // Fallback to landing on error
        router.replace("/landing");
      }
    };

    checkProAndNavigate();
  }, []);

  return (
    <View style={[styles.container, { paddingTop: insets.top, paddingBottom: insets.bottom }]}>
      <View style={styles.logo}>
        <Text style={styles.logoText}>HeightSnap</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.white,
    justifyContent: "center",
    alignItems: "center",
  },
  logo: {
    alignItems: "center",
  },
  logoText: {
    ...TEXT_STYLES.h0,
    color: COLORS.black,
  },
});