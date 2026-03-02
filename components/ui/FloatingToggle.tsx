import React, { useCallback } from 'react';
import { Pressable, StyleSheet, Text, View, Platform } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
} from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import { COLORS, RADIUS, SPRING_CONFIG, FONTS } from '@/constants/theme';

interface FloatingToggleProps {
  options: string[];
  activeIndex: number;
  onChange: (index: number) => void;
}

const PADDING = 3;
const INDICATOR_RADIUS = RADIUS.pill - PADDING;

export function FloatingToggle({ options, activeIndex, onChange }: FloatingToggleProps) {
  const translateX = useSharedValue(0);
  const tabWidth = useSharedValue(0);

  const indicatorStyle = useAnimatedStyle(() => ({
    width: tabWidth.value,
    transform: [{ translateX: translateX.value }],
  }));

  const handleLayout = useCallback(
    (width: number) => {
      const w = width / options.length;
      tabWidth.value = w;
      translateX.value = withSpring(activeIndex * w, SPRING_CONFIG);
    },
    [activeIndex, options.length, tabWidth, translateX],
  );

  const handlePress = useCallback(
    (index: number) => {
      if (index === activeIndex) return;
      triggerHaptic('Selection');
      translateX.value = withSpring(index * tabWidth.value, SPRING_CONFIG);
      onChange(index);
    },
    [activeIndex, onChange, tabWidth, translateX],
  );

  return (
    <View
      style={styles.container}
      onLayout={(e) => handleLayout(e.nativeEvent.layout.width)}
    >
      <Animated.View style={[styles.indicator, indicatorStyle]} />
      {options.map((option, index) => (
        <Pressable
          key={option}
          style={styles.tab}
          onPress={() => handlePress(index)}
        >
          <Text
            style={[
              styles.label,
              index === activeIndex ? styles.activeLabel : styles.inactiveLabel,
            ]}
          >
            {option}
          </Text>
        </Pressable>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    backgroundColor: COLORS.bgGlass,
    borderWidth: 1,
    borderColor: COLORS.glassBorder,
    borderRadius: RADIUS.pill,
    borderCurve: 'continuous',
    padding: PADDING,
  },
  indicator: {
    position: 'absolute',
    top: PADDING,
    left: PADDING,
    bottom: PADDING,
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: INDICATOR_RADIUS,
    borderCurve: 'continuous',
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
  },
  label: {
    fontSize: 14,
    fontFamily: FONTS.medium,
  },
  activeLabel: {
    color: COLORS.text,
    fontFamily: FONTS.semibold,
  },
  inactiveLabel: {
    color: COLORS.textSecondary,
    fontFamily: FONTS.medium,
  },
});
