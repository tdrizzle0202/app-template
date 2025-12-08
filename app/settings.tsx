import { router } from "expo-router";
import React, { useState } from "react";
import { StyleSheet, Text, TouchableOpacity, View, Platform, ScrollView, Linking, Alert, ActivityIndicator } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import * as Haptics from "expo-haptics";
import { ChevronRight, ChevronLeft } from "lucide-react-native";
import { TEXT_STYLES } from "@/constants/typography";
import { COLORS, SPACING, BORDER_RADIUS, SHADOWS } from "@/constants/designSystem";
import { restorePurchases } from "@/lib/revenueCat";
import { useProStatusStore } from "@/lib/proStatusStore";

export default function SettingsScreen() {
  const insets = useSafeAreaInsets();
  const [isRestoring, setIsRestoring] = useState(false);
  const refreshProStatus = useProStatusStore((state) => state.refreshProStatus);

  const settingsItems = [
    { id: "terms", title: "Terms and Conditions", subtitle: "Terms of service", url: "https://heightai.netlify.app/terms.html" },
    { id: "privacy", title: "Privacy", subtitle: "Privacy settings", url: "https://heightai.netlify.app/privacy.html" },
    { id: "help", title: "Help & Support", subtitle: "Get help", url: "https://heightai.netlify.app" },
    { id: "restore", title: "Restore Purchases", subtitle: "Restore previous subscriptions", action: "restore" },
  ];

  const handleRestore = async () => {
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }

    try {
      setIsRestoring(true);
      const result = await restorePurchases();

      if (result.success) {
        await refreshProStatus();
        const hasPro = useProStatusStore.getState().hasPro;

        if (hasPro) {
          Alert.alert('Success', 'Your HeightAI Pro subscription has been restored!');
        } else {
          Alert.alert('No Active Subscription', 'Your purchases were restored, but no active subscription was found.');
        }
      } else {
        Alert.alert('No Purchases Found', 'You have no previous purchases to restore.');
      }
    } catch (error) {
      console.error('Restore error:', error);
      Alert.alert('Error', 'Failed to restore purchases. Please try again.');
    } finally {
      setIsRestoring(false);
    }
  };

  const handleSettingPress = async (item: typeof settingsItems[0]) => {
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }

    if (item.action === 'restore') {
      await handleRestore();
      return;
    }

    if (item.url) {
      try {
        await Linking.openURL(item.url);
      } catch (error) {
        console.error('Failed to open URL:', error);
      }
    } else {
      console.log('Settings item pressed:', item.id);
    }
  };

  return (
    <View style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={[styles.scrollContent, { paddingTop: insets.top + SPACING.md }]}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.headerContainer}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => {
              if (Platform.OS !== 'web') {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              }
              router.back();
            }}
          >
            <ChevronLeft color={COLORS.black} size={32} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Settings</Text>
        </View>

        <View style={styles.settingsContainer}>
          {settingsItems.map((item, index) => (
            <TouchableOpacity
              key={item.id}
              style={[
                styles.settingItem,
                index === settingsItems.length - 1 && styles.lastSettingItem
              ]}
              onPress={() => handleSettingPress(item)}
              disabled={isRestoring && item.action === 'restore'}
            >
              <View style={styles.settingContent}>
                <Text style={styles.settingTitle}>{item.title}</Text>
                <Text style={styles.settingSubtitle}>{item.subtitle}</Text>
              </View>
              {isRestoring && item.action === 'restore' ? (
                <ActivityIndicator size="small" color={COLORS.gray400} />
              ) : (
                <ChevronRight color={COLORS.gray400} size={20} />
              )}
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.gray50,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: SPACING.xl,
    paddingBottom: 100,
  },
  headerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.lg,
    gap: SPACING.sm,
  },
  backButton: {
    padding: SPACING.xs,
    marginLeft: -SPACING.xs,
  },
  headerTitle: {
    fontSize: 28,
    fontFamily: TEXT_STYLES.h0.fontFamily,
    color: COLORS.black,
  },
  settingsContainer: {
    backgroundColor: COLORS.white,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: COLORS.black,
  },
  settingItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: SPACING.xl,
    paddingVertical: SPACING.lg,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.gray100,
  },
  lastSettingItem: {
    borderBottomWidth: 0,
  },
  settingContent: {
    flex: 1,
  },
  settingTitle: {
    ...TEXT_STYLES.h1,
    fontSize: 18,
    color: COLORS.black,
    marginBottom: SPACING.xs,
  },
  settingSubtitle: {
    ...TEXT_STYLES.h3,
    fontSize: 14,
    color: COLORS.black,
  },
});
