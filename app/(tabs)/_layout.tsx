import { Tabs, router } from "expo-router";
import { Home } from "lucide-react-native";
import { Ionicons } from "@expo/vector-icons";
import React, { useState, useCallback, useMemo } from "react";
import { View, TouchableOpacity, Text, Modal, StyleSheet, Alert, Platform } from "react-native";
import * as ImageManipulator from 'expo-image-manipulator';
import * as Haptics from 'expo-haptics';
import { COLORS, SPACING, BORDER_RADIUS, SHADOWS } from "@/constants/designSystem";
import { TEXT_STYLES } from "@/constants/typography";
import { AddSheet } from "@/components/AddSheet";
import { getCachedProStatus, useProStatusStore } from "@/lib/proStatusStore";



export default function TabLayout() {
  const [showAddSheet, setShowAddSheet] = useState(false);
  const hasPro = useProStatusStore((state) => state.hasPro);

  const screenOptions = useMemo(() => ({
    tabBarActiveTintColor: COLORS.white,
    tabBarInactiveTintColor: COLORS.gray400,
    headerShown: false,
    lazy: true,
    unmountOnBlur: false,
    tabBarStyle: {
      display: 'none' as const,
      backgroundColor: '#181818',
      borderTopWidth: 0,
      paddingHorizontal: 10,
      paddingTop: 8,
    },
    tabBarItemStyle: {
      paddingHorizontal: 50,
    },
    tabBarLabelStyle: {
      fontSize: TEXT_STYLES.small.fontSize,
      fontFamily: TEXT_STYLES.small.fontFamily,
      fontWeight: "500" as const,
    },
  }), []);

  return (
    <View style={styles.container}>
      <Tabs screenOptions={screenOptions}>
        <Tabs.Screen
          name="home"
          options={{
            title: "Home",
            tabBarIcon: ({ color }) => (
              <Home color={color} size={30} />
            ),
            tabBarItemStyle: {
              marginLeft: 20,
              marginRight: 60,
            },
          }}
          listeners={{
            tabPress: () => {
              if (Platform.OS !== 'web') {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
              }
            },
          }}
        />

      </Tabs>

      {/* Floating Add Button - positioned to not interfere with tabs */}
      <View style={[styles.fabContainer, styles.fabPosition]} pointerEvents="box-none">
        <TouchableOpacity
          style={styles.fab}
          onPress={async () => {
            if (Platform.OS !== 'web') {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
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
          accessibilityRole="button"
          accessibilityLabel="Add photo"
          activeOpacity={0.8}
        >
          <View style={{ width: 32, height: 32, justifyContent: 'center', alignItems: 'center' }}>
            <Ionicons
              name="flash"
              size={32}
              color={COLORS.white}
            />
            <Ionicons
              name="flash-outline"
              size={32}
              color={COLORS.black}
              style={{ position: 'absolute' }}
            />
          </View>
        </TouchableOpacity>
      </View>

      <AddSheet visible={showAddSheet} onClose={() => setShowAddSheet(false)} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  fabContainer: {
    position: "absolute",
    left: 0,
    right: 0,
    alignItems: "center",
    zIndex: 999,
  },
  fabPosition: {
    bottom: 20,
  },
  fab: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#C5B5E8', // Pro Purple
    borderWidth: 2,
    borderColor: COLORS.black,
    justifyContent: "center",
    alignItems: "center",
    ...SHADOWS.lg,
  },
});