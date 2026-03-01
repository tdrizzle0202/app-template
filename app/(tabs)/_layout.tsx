import React, { useCallback, useEffect } from 'react';
import { View, Pressable, StyleSheet, Platform } from 'react-native';
import { Tabs } from 'expo-router';
import { BlurView } from 'expo-blur';
import { Home, TrendingUp, Heart, User } from 'lucide-react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  Easing,
} from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { COLORS } from '@/constants/theme';

const TAB_BAR_HEIGHT = 85;
const ACTIVE_COLOR = COLORS.primary;
const INACTIVE_COLOR = 'rgba(255,255,255,0.35)';
const SOS_COLOR = COLORS.accent;
const SOS_INACTIVE_COLOR = 'rgba(246,173,85,0.45)';

// ── SOS Glow (constant pulsing background) ──────────────
function SOSGlow() {
  const opacity = useSharedValue(0.1);

  useEffect(() => {
    opacity.value = withRepeat(
      withTiming(0.25, { duration: 1800, easing: Easing.inOut(Easing.ease) }),
      -1,
      true,
    );
  }, [opacity]);

  const style = useAnimatedStyle(() => ({
    opacity: opacity.value,
  }));

  return <Animated.View style={[styles.sosGlow, style]} />;
}

// ── Single tab item ──────────────────────────────────────
interface TabItemProps {
  icon: 'home' | 'trending' | 'heart' | 'user';
  isFocused: boolean;
  onPress: () => void;
  onLongPress: () => void;
}

const ICONS = {
  home: Home,
  trending: TrendingUp,
  heart: Heart,
  user: User,
} as const;

function TabItem({ icon, isFocused, onPress, onLongPress }: TabItemProps) {
  const isSOS = icon === 'heart';
  const Icon = ICONS[icon];

  const iconColor = isSOS
    ? isFocused
      ? SOS_COLOR
      : SOS_INACTIVE_COLOR
    : isFocused
      ? ACTIVE_COLOR
      : INACTIVE_COLOR;

  const iconSize = isSOS ? 28 : 24;

  return (
    <Pressable
      onPress={onPress}
      onLongPress={onLongPress}
      style={styles.tabItem}
      accessibilityRole="tab"
      accessibilityState={{ selected: isFocused }}
    >
      <View style={styles.iconContainer}>
        {isSOS && <SOSGlow />}
        <Icon color={iconColor} size={iconSize} />
      </View>
      {isFocused && !isSOS && <View style={styles.dot} />}
      {isFocused && isSOS && <View style={styles.sosDot} />}
    </Pressable>
  );
}

// ── Custom tab bar ───────────────────────────────────────
const TAB_ICONS: Record<string, TabItemProps['icon']> = {
  index: 'home',
  progress: 'trending',
  sos: 'heart',
  profile: 'user',
};

function CustomTabBar({ state, navigation }: any) {
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.tabBarWrapper, { paddingBottom: insets.bottom }]}>
      <BlurView intensity={30} tint="dark" style={StyleSheet.absoluteFill} />
      <View style={styles.tabBarContent}>
        {state.routes.map((route: any, index: number) => {
          const isFocused = state.index === index;
          const icon = TAB_ICONS[route.name] ?? 'home';

          const handlePress = () => {
            if (Platform.OS !== 'web') {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            }
            const event = navigation.emit({
              type: 'tabPress',
              target: route.key,
              canPreventDefault: true,
            });
            if (!isFocused && !event.defaultPrevented) {
              navigation.navigate(route.name);
            }
          };

          const handleLongPress = () => {
            navigation.emit({ type: 'tabLongPress', target: route.key });
          };

          return (
            <TabItem
              key={route.key}
              icon={icon}
              isFocused={isFocused}
              onPress={handlePress}
              onLongPress={handleLongPress}
            />
          );
        })}
      </View>
    </View>
  );
}

// ── Layout ───────────────────────────────────────────────
export default function TabLayout() {
  const renderTabBar = useCallback(
    (props: any) => <CustomTabBar {...props} />,
    [],
  );

  return (
    <Tabs
      tabBar={renderTabBar}
      screenOptions={{
        headerShown: false,
        lazy: true,
      }}
    >
      <Tabs.Screen name="index" />
      <Tabs.Screen name="progress" />
      <Tabs.Screen name="sos" />
      <Tabs.Screen name="profile" />
    </Tabs>
  );
}

// ── Styles ───────────────────────────────────────────────
const styles = StyleSheet.create({
  tabBarWrapper: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: TAB_BAR_HEIGHT,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.06)',
    backgroundColor: 'rgba(15,18,24,0.95)',
    overflow: 'hidden',
  },
  tabBarContent: {
    flex: 1,
    flexDirection: 'row',
  },
  tabItem: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 12,
    gap: 6,
  },
  iconContainer: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: ACTIVE_COLOR,
  },
  sosDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: SOS_COLOR,
  },
  sosGlow: {
    position: 'absolute',
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: SOS_COLOR,
  },
});
