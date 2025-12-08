import { router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import React, { useEffect, useState } from "react";
import { StyleSheet, Text, TouchableOpacity, View, Platform, ActivityIndicator, Alert } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import * as Haptics from "expo-haptics";
import { TEXT_STYLES } from "@/constants/typography";
import { getSubscriptionPackages, purchasePackage } from "@/lib/revenueCat";
import type { PurchasesPackage } from "react-native-purchases";
import { useProStatusStore } from "@/lib/proStatusStore";

export default function PaywallScreen() {
  const [packages, setPackages] = useState<PurchasesPackage[]>([]);
  const [loading, setLoading] = useState(true);
  const [purchasing, setPurchasing] = useState(false);

  const refreshProStatus = useProStatusStore((state) => state.refreshProStatus);
  const setProStatus = useProStatusStore((state) => state.setProStatus);
  const hasPro = useProStatusStore((state) => state.hasPro);

  useEffect(() => {
    loadPackages();
  }, []);

  useEffect(() => {
    if (hasPro) {
      router.replace('/(tabs)/home');
    }
  }, [hasPro]);

  const loadPackages = async () => {
    try {
      const availablePackages = await getSubscriptionPackages();
      setPackages(availablePackages);
    } catch (error) {
      console.error('Failed to load packages:', error);
    } finally {
      setLoading(false);
    }
  };

  const handlePurchase = async () => {
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }

    if (packages.length === 0) {
      Alert.alert('Error', 'No subscription packages available');
      return;
    }

    try {
      setPurchasing(true);

      // Get the weekly package (or first available)
      const weeklyPackage = packages.find(p => p.identifier === '$rc_weekly') || packages[0];

      const result = await purchasePackage(weeklyPackage);

      if (result.success) {
        setProStatus(true);
        refreshProStatus().catch((error) => {
          console.error('Failed to refresh Pro status after purchase:', error);
        });

        // Purchase successful - navigate to home
        router.replace('/(tabs)/home');
      }
    } catch (error) {
      console.error('Purchase error:', error);
    } finally {
      setPurchasing(false);
    }
  };

  const handleClose = () => {
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }
    router.replace('/(tabs)/home');
  };

  const handleBack = () => {
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    if (router.canGoBack()) {
      router.back();
    } else {
      // Fallback if no history (e.g. deep link or dev reload)
      router.replace('/pre-paywall');
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.content}>
          <ActivityIndicator size="large" color="#000000" />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header - Fixed at top */}
      <View style={styles.headerContainer}>
        <View style={styles.navRow}>
          <TouchableOpacity
            onPress={handleBack}
            style={styles.navButton}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <Ionicons name="chevron-back" size={28} color="rgba(0,0,0,0.3)" />
          </TouchableOpacity>

          <TouchableOpacity
            onPress={handleClose}
            style={styles.navButton}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <Ionicons name="close" size={28} color="rgba(0,0,0,0.3)" />
          </TouchableOpacity>
        </View>
      </View>

      {/* Main content - Pushed down */}
      <View style={styles.content}>
        {/* 50% OFF Badge */}
        <View style={styles.offerContainer}>
          <Text style={styles.oneTimeOfferText}>Your Onetime Offer</Text>
          <Text style={styles.offerText}>50% OFF</Text>
        </View>

        <View style={styles.spacer} />

        {/* Pricing Box */}
        <View style={styles.pricingBox}>
          <Text style={styles.autoRenewText}>Cancel Anytime</Text>
          <Text style={styles.trialText}>3 Day Trial</Text>
          <View style={styles.priceRow}>
            <Text style={styles.originalPriceText}>$9.99</Text>
            <Text style={styles.priceText}>$7.99/week</Text>
          </View>
        </View>

        {/* Buttons */}
        <TouchableOpacity
          style={[styles.goProButton, purchasing && styles.buttonDisabled]}
          onPress={handlePurchase}
          disabled={purchasing}
        >
          {purchasing ? (
            <ActivityIndicator color="#ffffff" size="small" />
          ) : (
            <Text style={styles.goProText}>Start Free Trial</Text>
          )}
        </TouchableOpacity>

        {/* Legal Note */}
        <Text style={styles.legalNote}>
          By subscribing, you agree to our Terms of Service and Privacy Policy.
          Subscription automatically renews unless cancelled.
        </Text>

        <View style={styles.spacer} />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#C5B5E8",
  },
  headerContainer: {
    paddingHorizontal: 32,
    paddingTop: 20,
    paddingBottom: 20,
  },
  navRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
    marginHorizontal: -8, // Align icons visually with edge
  },
  navButton: {
    padding: 8,
  },
  content: {
    flex: 1,
    paddingHorizontal: 32,
    paddingBottom: 20,
  },
  unlockText: {
    ...TEXT_STYLES.h2,
    color: "#000000",
    marginBottom: 4,
  },
  brandText: {
    ...TEXT_STYLES.h0,
    fontSize: 32,
    color: "#000000",
    marginBottom: 4,
  },
  nowText: {
    ...TEXT_STYLES.h2,
    color: "#000000",
  },
  featuresContainer: {
    marginBottom: 0,
  },
  featureItem: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
  },
  checkmark: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: "#000000",
    marginRight: 12,
    justifyContent: "center",
    alignItems: "center",
  },
  checkmarkText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "bold",
  },
  featureText: {
    ...TEXT_STYLES.body,
    fontSize: 16,
    color: "#000000",
  },
  pricingBox: {
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    padding: 24,
    marginBottom: 16,
    borderWidth: 2,
    borderColor: "#000000",
  },
  divider: {
    height: 1,
    backgroundColor: "#E0E0E0",
    marginVertical: 20,
  },
  autoRenewText: {
    ...TEXT_STYLES.h2,
    fontSize: 24,
    color: "#000000",
    textAlign: "center",
    marginBottom: 4,
  },
  trialText: {
    ...TEXT_STYLES.h2,
    fontSize: 24,
    color: "#000000",
    textAlign: "center",
    marginBottom: 8,
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
  },
  originalPriceText: {
    ...TEXT_STYLES.body,
    fontSize: 14,
    color: "#666666",
    textDecorationLine: 'line-through',
  },
  priceText: {
    ...TEXT_STYLES.h3,
    fontSize: 14,
    color: "#666666",
  },
  offerContainer: {
    alignSelf: 'center',
    alignItems: 'center',
    marginBottom: 0,
    marginTop: 20,
  },
  oneTimeOfferText: {
    ...TEXT_STYLES.h1, // Use h1 for boldness
    fontFamily: "Nunito_900Black", // Extra bold
    color: '#000000',
    fontSize: 24, // Larger
    marginBottom: 0,
    textTransform: 'uppercase',
    letterSpacing: 1,
    textAlign: 'center',
  },
  offerText: {
    ...TEXT_STYLES.h1,
    color: '#FFD700', // Gold
    fontSize: 64, // Even bigger
    lineHeight: 70,
  },
  goProButton: {
    backgroundColor: "#000000",
    paddingVertical: 18,
    borderRadius: 24,
    marginBottom: 12,
    alignItems: "center",
  },
  goProText: {
    ...TEXT_STYLES.h3,
    color: "#FFFFFF",
  },
  skipButton: {
    backgroundColor: "#FFFFFF",
    paddingVertical: 18,
    borderRadius: 24,
    marginBottom: 20,
    alignItems: "center",
    borderWidth: 2,
    borderColor: "#000000",
  },
  skipText: {
    ...TEXT_STYLES.h3,
    color: "#000000",
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  spacer: {
    flex: 1,
  },
  legalNote: {
    fontSize: 10,
    fontFamily: TEXT_STYLES.small.fontFamily,
    color: "#666666",
    textAlign: "center",
    lineHeight: 14,
  },
});
