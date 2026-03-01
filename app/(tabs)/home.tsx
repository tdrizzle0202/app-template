import { router, useFocusEffect, useLocalSearchParams } from "expo-router";
import React, { useState, useCallback, useEffect, useRef, memo, useMemo } from "react";
import { ScrollView, StyleSheet, Text, TouchableOpacity, View, Platform, ActivityIndicator, RefreshControl, Alert, Dimensions } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Image } from "expo-image";
import * as Haptics from "expo-haptics";

import { listResults, deleteResult } from "@/lib/heightStore";
import { getPhotoUrl } from "@/lib/photoStorage";
import { getUnitPreference, setUnitPreference, formatHeight as formatHeightUtil, UnitType } from "@/lib/unitPreference";
import { TYPE, COLORS, SPACING, RADIUS, SHADOWS } from "@/constants/theme";
import { Trash2, Gift, Settings, Plus } from "lucide-react-native";
import { getCachedProStatus, useProStatusStore } from "@/lib/proStatusStore";
import { incrementEstimateAndPromptRating } from "@/lib/ratingPrompt";
import { HEIGHT_GROUPS, groupByHeight, HeightGroup, HeightDataItem } from "@/lib/heightGroups";
import { CategoryInfoModal } from "@/components/CategoryInfoModal";
import { AddSheet } from "@/components/AddSheet";
import { DEMO_IMAGES, isDemoItem, getDemoItemsForGroup } from "@/lib/demoData";

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const CARD_WIDTH = (SCREEN_WIDTH - SPACING.lg * 2 - SPACING.sm) / 2.3; // Show ~2.3 cards
const CARD_HEIGHT = CARD_WIDTH * 1.4;

// Memoized photo component to prevent re-renders
// Supports both remote photos (via photoUri) and bundled demo images (via demoId)
const PhotoComponent = memo(({ photoUri, demoId, style }: { photoUri: string | null; demoId?: string; style?: any }) => {
  const [photoUrl, setPhotoUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(!!photoUri);

  React.useEffect(() => {
    if (photoUri) {
      getPhotoUrl(photoUri)
        .then((url) => {
          setPhotoUrl(url);
        })
        .catch((error) => {
          console.error('Failed to get photo URL:', error);
          setPhotoUrl(null);
        })
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, [photoUri]);

  // Handle demo images (bundled assets)
  if (demoId && DEMO_IMAGES[demoId]) {
    return (
      <Image
        source={DEMO_IMAGES[demoId]}
        style={[styles.photo, style]}
        contentFit="cover"
      />
    );
  }

  if (loading) {
    return (
      <View style={[styles.photoPlaceholder, style]}>
        <ActivityIndicator size="small" color={COLORS.gray600} />
      </View>
    );
  }

  if (photoUrl) {
    return (
      <Image
        source={{ uri: photoUrl }}
        style={[styles.photo, style]}
        contentFit="cover"
      />
    );
  }

  return (
    <View style={[styles.photoPlaceholder, style]}>
      <Text style={styles.photoText}>Photo</Text>
    </View>
  );
});

export default function HomeScreen() {
  const insets = useSafeAreaInsets();
  const { refresh } = useLocalSearchParams<{ refresh?: string }>();
  const [unit, setUnit] = useState<UnitType>("ft");
  const [heightData, setHeightData] = useState<HeightDataItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const hasLoadedOnceRef = useRef(false);
  const hasPro = useProStatusStore((state) => state.hasPro);

  // Modal state
  const [infoModalVisible, setInfoModalVisible] = useState(false);
  const [showAddSheet, setShowAddSheet] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<HeightGroup | null>(null);

  // Load unit preference on mount
  useEffect(() => {
    const loadUnitPreference = async () => {
      const savedUnit = await getUnitPreference();
      setUnit(savedUnit);

      // Mark onboarding as seen since user reached home
      try {
        const { default: AsyncStorage } = require('@react-native-async-storage/async-storage');
        await AsyncStorage.setItem('hasSeenOnboarding', 'true');
      } catch (error) {
        console.error('Failed to save onboarding state:', error);
      }
    };
    loadUnitPreference();
  }, []);

  const loadResults = useCallback(async (silent = false) => {
    try {
      if (!silent) setLoading(true);
      console.log('Loading results...');
      const results = await listResults();
      console.log('Results loaded:', results.length);
      setHeightData(results);

      // Check if we have any completed results (not pending)
      const completedResults = results.filter(item => item.heightCm && item.heightCm > 0);
      if (completedResults.length > 0) {
        // Increment count and potentially show rating prompt
        await incrementEstimateAndPromptRating();
      }
    } catch (error) {
      console.error('Failed to load results:', error);
      setHeightData([]);
    } finally {
      if (!silent) setLoading(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      // Load on first time
      if (!hasLoadedOnceRef.current) {
        hasLoadedOnceRef.current = true;
        loadResults(); // Show loading on initial load
      }
    }, [loadResults])
  );

  // Watch for refresh parameter changes (e.g., after delete from result page)
  useEffect(() => {
    if (refresh === 'true') {
      loadResults(true); // Silent reload when returning from result page
      // Clear the refresh parameter
      router.setParams({ refresh: undefined });
    }
  }, [refresh, loadResults]);

  const onRefresh = useCallback(async () => {
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }
    setRefreshing(true);
    await loadResults(true); // Silent reload
    setRefreshing(false);
  }, [loadResults]);

  // Set up polling for pending results
  useEffect(() => {
    const hasPendingResults = heightData.some(item => !item.heightCm || item.heightCm === 0);

    if (hasPendingResults) {
      // Only check once after 10 seconds, then stop
      const timeout = setTimeout(() => {
        console.log('Checking for updated results after 10 seconds...');
        loadResults();
      }, 10000);

      return () => clearTimeout(timeout);
    }
  }, [heightData, loadResults]);

  const toggleUnit = async () => {
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }
    const newUnit: UnitType = unit === "ft" ? "cm" : "ft";
    setUnit(newUnit);
    await setUnitPreference(newUnit);
  };

  const handleCardPress = useCallback((itemId: string) => {
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    router.push(`/result?id=${itemId}`);
  }, []);

  const handleGiftPress = useCallback(async () => {
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }

    let isPro = hasPro;
    if (!isPro) {
      isPro = await getCachedProStatus();
    }

    if (isPro) {
      Alert.alert('HeightAI Pro', 'Thanks for supporting HeightAI Pro!');
      return;
    }

    router.push('/pre-paywall');
  }, [hasPro]);

  const handleDeleteAnalysis = useCallback(async (itemId: string) => {
    try {
      if (Platform.OS !== 'web') {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
      }
      console.log('Deleting analysis:', itemId);
      await deleteResult(itemId);
      await loadResults(); // Refresh the list
    } catch (error) {
      console.error('Failed to delete analysis:', error);
    }
  }, [loadResults]);

  const handleCategoryPress = useCallback((group: HeightGroup) => {
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    setSelectedCategory(group);
    setInfoModalVisible(true);
  }, []);

  // Group real height data by category
  const groupedRealData = useMemo(() => groupByHeight(heightData), [heightData]);

  // For each category, if empty show demo data, otherwise show real data
  const groupedData = useMemo(() => {
    const result = { ...groupedRealData };

    // Fill empty categories with demo data
    HEIGHT_GROUPS.forEach(group => {
      if (result[group.key].length === 0) {
        result[group.key] = getDemoItemsForGroup(group.key);
      }
    });

    return result;
  }, [groupedRealData]);

  // Get pending items (not yet analyzed) - only from real data
  const pendingItems = useMemo(() =>
    heightData.filter(item => !item.heightCm || item.heightCm === 0),
    [heightData]
  );

  // Render a horizontal card for the category rows (Share Card style)
  const renderHorizontalCard = useCallback((item: HeightDataItem) => {
    const isDemo = isDemoItem(item.id);

    return (
      <TouchableOpacity
        key={item.id}
        style={styles.horizontalCard}
        onPress={() => handleCardPress(item.id)}
        activeOpacity={0.9}
      >
        <PhotoComponent
          photoUri={isDemo ? null : item.photoUri}
          demoId={isDemo ? item.id : undefined}
          style={styles.horizontalPhoto}
        />

        {/* Floating Info Card (Share Card Style) */}
        <View style={styles.infoCard}>
          <View style={styles.infoRow}>
            <Text style={styles.horizontalCardName} numberOfLines={1}>
              {item.name}
            </Text>
            <Text style={styles.horizontalCardHeight}>
              {formatHeightUtil(item.heightCm || 0, unit)}
            </Text>
          </View>
        </View>
      </TouchableOpacity>
    );
  }, [handleCardPress, unit]);

  // Render a pending card (analyzing) - clean style
  const renderPendingCard = useCallback((item: HeightDataItem) => {
    return (
      <View key={item.id} style={styles.horizontalCard}>
        <PhotoComponent photoUri={item.photoUri} style={styles.horizontalPhoto} />

        {/* Floating Info Card (Share Card Style) */}
        <View style={styles.infoCard}>
          <View style={styles.infoRow}>
            <Text style={styles.horizontalCardName} numberOfLines={1}>
              {item.name}
            </Text>
            <Text style={styles.horizontalCardHeight}>
              ...
            </Text>
          </View>
        </View>

        {/* Loading indicator overlay */}
        <View style={styles.pendingOverlay}>
          <ActivityIndicator size="small" color={COLORS.white} />
        </View>
        <TouchableOpacity
          style={styles.horizontalDeleteButton}
          onPress={() => handleDeleteAnalysis(item.id)}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <Trash2 size={14} color="#FF3B30" />
        </TouchableOpacity>
      </View>
    );
  }, [handleDeleteAnalysis]);

  const renderCreateYourOwnCard = useCallback(() => {
    return (
      <TouchableOpacity
        key="create-your-own"
        style={[styles.horizontalCard, styles.createCard]}
        onPress={async () => {
          if (Platform.OS !== 'web') {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
          }

          let isPro = hasPro;
          if (!isPro) {
            isPro = await getCachedProStatus();
          }

          if (!isPro) {
            router.push('/pre-paywall');
            return;
          }

          setShowAddSheet(true);
        }}
        activeOpacity={0.8}
      >
        <Plus color={COLORS.black} size={32} />
        <Text style={styles.createCardText}>Create your own</Text>
      </TouchableOpacity>
    );
  }, []);

  // Render a category section with horizontal scroll - always show even if empty
  const renderCategorySection = useCallback((group: HeightGroup, items: HeightDataItem[]) => {
    const isDemoSection = items.length > 0 && isDemoItem(items[0].id);

    return (
      <View key={group.key} style={styles.categorySection}>
        <TouchableOpacity
          onPress={() => handleCategoryPress(group)}
          activeOpacity={0.7}
          style={styles.categoryHeader}
        >
          <Text style={styles.categoryTitle}>
            {group.label} {group.emoji}
          </Text>
        </TouchableOpacity>
        {items.length > 0 ? (
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.horizontalScrollContent}
          >
            {items.map(renderHorizontalCard)}
            {isDemoSection && renderCreateYourOwnCard()}
          </ScrollView>
        ) : (
          <View style={styles.emptyCategoryPlaceholder}>
            <Text style={styles.emptyCategoryText}>No one here yet</Text>
          </View>
        )}
      </View>
    );
  }, [renderHorizontalCard, handleCategoryPress, renderCreateYourOwnCard]);

  return (
    <View style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={[styles.scrollContent, { paddingTop: insets.top + SPACING.md }]}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={COLORS.gray600}
            colors={[COLORS.gray600]}
          />
        }
      >
        <View style={styles.headerContainer}>
          <Text style={styles.headerTitle}>HeightSnap</Text>
          <View style={styles.headerRight}>
            <TouchableOpacity
              style={styles.giftButtonHeader}
              onPress={handleGiftPress}
            >
              <Gift color={COLORS.black} size={20} strokeWidth={2} />
            </TouchableOpacity>
            <TouchableOpacity style={styles.unitToggle} onPress={toggleUnit}>
              <Text style={styles.unitText}>{unit === "ft" ? "ft/in" : "cm"}</Text>
            </TouchableOpacity>
          </View>
        </View>

        {loading ? (
          <Text style={styles.loadingText}>Loading...</Text>
        ) : (
          <>
            {/* Pending items section - only show if there are pending items */}
            {pendingItems.length > 0 && (
              <View style={styles.categorySection}>
                <Text style={styles.categoryTitle}>Analyzing... ⏳</Text>
                <ScrollView
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  contentContainerStyle={styles.horizontalScrollContent}
                >
                  {pendingItems.map(renderPendingCard)}
                </ScrollView>
              </View>
            )}

            {/* Always show all 4 height category sections in order */}
            {HEIGHT_GROUPS.map((group) =>
              renderCategorySection(group, groupedData[group.key])
            )}

            {/* Settings Button - Bottom of content */}
            <View style={styles.settingsContainer}>
              <TouchableOpacity
                style={styles.settingsButton}
                onPress={() => {
                  if (Platform.OS !== 'web') {
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
                  }
                  router.push('/settings');
                }}
              >
                <Settings color={COLORS.black} size={20} />
                <Text style={styles.settingsText}>Settings</Text>
              </TouchableOpacity>
            </View>
          </>
        )}
      </ScrollView>

      <CategoryInfoModal
        visible={infoModalVisible}
        onClose={() => setInfoModalVisible(false)}
        category={selectedCategory}
      />

      <AddSheet visible={showAddSheet} onClose={() => setShowAddSheet(false)} />
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
    paddingHorizontal: SPACING.lg,
    paddingBottom: SPACING['3xl'] + SPACING.xl + SPACING.lg + 80, // Extra padding for FAB
  },
  headerContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: SPACING.lg,
  },
  headerRight: {
    flexDirection: "row",
    alignItems: "center",
    gap: SPACING.sm,
  },
  headerTitle: {
    fontSize: 28,
    fontFamily: TEXT_STYLES.h0.fontFamily,
    color: COLORS.black,
  },
  giftButtonHeader: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.white,
    borderWidth: 2,
    borderColor: COLORS.black,
    justifyContent: "center",
    alignItems: "center",
  },
  unitToggle: {
    backgroundColor: COLORS.white,
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.sm,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: COLORS.black,
    width: 85,
    alignItems: "center",
  },
  unitText: {
    fontSize: 14,
    fontFamily: TEXT_STYLES.h3.fontFamily,
    color: COLORS.black,
  },
  card: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.white,
    borderRadius: 20,
    marginBottom: SPACING.md,
    padding: SPACING.md,
    borderWidth: 2,
    borderColor: COLORS.black,
  },
  photo: {
    width: "45%",
    aspectRatio: 0.75,
    borderRadius: BORDER_RADIUS.lg,
  },
  photoPlaceholder: {
    width: "45%",
    aspectRatio: 0.75,
    backgroundColor: COLORS.gray100,
    borderRadius: BORDER_RADIUS.lg,
    justifyContent: "center",
    alignItems: "center",
  },
  photoText: {
    ...TEXT_STYLES.small,
    color: COLORS.gray400,
  },
  cardContent: {
    flex: 1,
    justifyContent: "center",
    paddingLeft: SPACING.lg,
    gap: SPACING.xs,
  },
  nameText: {
    ...TEXT_STYLES.h1,
    fontSize: 26,
    color: COLORS.black,
    marginBottom: SPACING.xs,
  },
  heightText: {
    ...TEXT_STYLES.h3,
    fontSize: 22,
    color: COLORS.black,
    marginBottom: SPACING.sm,
  },
  loadingText: {
    ...TEXT_STYLES.body,
    color: COLORS.gray600,
    textAlign: "center",
    marginTop: SPACING['2xl'],
  },
  pendingCard: {
    // No opacity - keep card surface clean
  },
  analyzingContent: {
    flexDirection: "row",
    alignItems: "center",
  },
  deleteButton: {
    position: 'absolute',
    top: SPACING.md,
    right: SPACING.md,
    padding: SPACING.sm,
    borderRadius: BORDER_RADIUS.md,
    backgroundColor: COLORS.white,
    ...SHADOWS.sm,
  },
  shareButton: {
    position: 'absolute',
    bottom: SPACING.sm,
    right: SPACING.sm,
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: COLORS.black,
    justifyContent: 'center',
    alignItems: 'center',
    ...SHADOWS.md,
  },
  spinner: {
    marginRight: SPACING.sm,
  },
  analyzingText: {
    ...TEXT_STYLES.body,
    color: COLORS.gray600,
  },
  emptyContainer: {
    alignItems: "center",
    paddingVertical: 40,
    paddingHorizontal: SPACING.lg,
  },
  emptyTitle: {
    ...TEXT_STYLES.h3,
    color: COLORS.black,
    marginBottom: SPACING.sm,
    textAlign: "center",
  },
  emptyText: {
    ...TEXT_STYLES.body,
    color: COLORS.gray600,
    textAlign: "center",
    lineHeight: SPACING.lg,
  },
  // Category section styles
  categorySection: {
    marginBottom: SPACING.lg,
  },
  categoryHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  categoryTitle: {
    fontSize: 20,
    fontFamily: TEXT_STYLES.h1.fontFamily,
    color: COLORS.black,
  },
  horizontalScrollContent: {
    paddingRight: SPACING.lg,
    gap: SPACING.sm,
  },
  // Empty category placeholder
  emptyCategoryPlaceholder: {
    height: CARD_HEIGHT,
    backgroundColor: COLORS.gray200,
    borderRadius: BORDER_RADIUS.xl,
    justifyContent: "center",
    alignItems: "center",
    opacity: 0.5,
  },
  emptyCategoryText: {
    ...TEXT_STYLES.body,
    color: COLORS.gray500,
  },
  // Horizontal card styles (Share Card style)
  horizontalCard: {
    width: CARD_WIDTH,
    height: CARD_HEIGHT,
    borderRadius: BORDER_RADIUS.xl,
    overflow: "hidden",
    backgroundColor: COLORS.gray200,
  },
  horizontalPhoto: {
    width: "100%",
    height: "100%",
    borderRadius: BORDER_RADIUS.xl,
  },
  // Floating Info Card (Share Card Style)
  infoCard: {
    position: 'absolute',
    bottom: SPACING.sm,
    left: SPACING.sm,
    right: SPACING.sm,
    backgroundColor: COLORS.white,
    padding: SPACING.sm,
    borderRadius: BORDER_RADIUS.lg,
    borderWidth: 1.5,
    borderColor: COLORS.black,
    // Shadow for better visibility
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.15,
    shadowRadius: 3,
    elevation: 4,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 4,
  },
  horizontalCardName: {
    flex: 1,
    fontSize: 14,
    fontFamily: TEXT_STYLES.h1.fontFamily, // Bold
    color: COLORS.black,
  },
  horizontalCardHeight: {
    fontSize: 14,
    fontFamily: TEXT_STYLES.h1.fontFamily, // Bold
    color: COLORS.black,
  },
  // Pending overlay for analyzing cards
  pendingOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0,0,0,0.3)",
    borderRadius: BORDER_RADIUS.xl,
    justifyContent: "center",
    alignItems: "center",
  },
  horizontalDeleteButton: {
    position: "absolute",
    top: SPACING.xs,
    right: SPACING.xs,
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: COLORS.white,
    justifyContent: "center",
    alignItems: "center",
    ...SHADOWS.sm,
  },
  settingsContainer: {
    alignItems: 'center',
    marginTop: SPACING.md,
    marginBottom: SPACING.xl,
  },
  settingsButton: {
    backgroundColor: COLORS.white,
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
    borderRadius: 30,
    borderWidth: 2,
    borderColor: COLORS.black,
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
    ...SHADOWS.sm,
  },
  settingsText: {
    ...TEXT_STYLES.h3,
    fontSize: 16,
    color: COLORS.black,
  },
  createCard: {
    backgroundColor: 'rgba(229, 231, 235, 0.5)', // gray200 with 0.5 opacity
    justifyContent: "center",
    alignItems: "center",
    gap: SPACING.sm,
  },
  createCardText: {
    ...TEXT_STYLES.h3,
    fontSize: 16,
    color: COLORS.black,
    textAlign: "center",
  },
});
