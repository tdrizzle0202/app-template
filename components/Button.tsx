import React, { useCallback } from 'react';
import { Pressable, StyleSheet, Text, ViewStyle, TextStyle, Platform } from 'react-native';
import Animated, { useSharedValue, useAnimatedStyle, withSpring } from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import { COLORS, SPACING, RADIUS, glassCard, SPRING_BUTTON, FONTS, TYPE } from '@/constants/theme';

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

type ButtonVariant = 'primary' | 'glass' | 'ghost';
type ButtonSize = 'sm' | 'md' | 'lg';

interface ButtonProps {
  label: string;
  onPress: () => void;
  variant?: ButtonVariant;
  size?: ButtonSize;
  disabled?: boolean;
  icon?: React.ReactNode;
  style?: ViewStyle;
  textStyle?: TextStyle;
}

const SIZE_STYLES: Record<ButtonSize, { height: number; paddingHorizontal: number; fontSize: number }> = {
  sm: { height: 40, paddingHorizontal: SPACING.sm, fontSize: FONT_SIZES.sm },
  md: { height: 48, paddingHorizontal: SPACING.md, fontSize: FONT_SIZES.base },
  lg: { height: 56, paddingHorizontal: SPACING.lg, fontSize: FONT_SIZES.lg },
};

export function Button({
  label,
  onPress,
  variant = 'primary',
  size = 'md',
  disabled = false,
  icon,
  style,
  textStyle,
}: ButtonProps) {
  const scale = useSharedValue(1);
  const sizeConfig = SIZE_STYLES[size];

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handlePressIn = useCallback(() => {
    scale.value = withSpring(0.95, SPRING_BUTTON);
  }, [scale]);

  const handlePressOut = useCallback(() => {
    scale.value = withSpring(1, SPRING_BUTTON);
  }, [scale]);

  const handlePress = useCallback(() => {
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }
    onPress();
  }, [onPress]);

  return (
    <AnimatedPressable
      onPress={handlePress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      disabled={disabled}
      style={[
        styles.base,
        {
          height: sizeConfig.height,
          paddingHorizontal: sizeConfig.paddingHorizontal,
        },
        variant === 'primary' && styles.primary,
        variant === 'glass' && styles.glass,
        variant === 'ghost' && styles.ghost,
        disabled && styles.disabled,
        animatedStyle,
        style,
      ]}
    >
      {icon}
      <Text
        style={[
          styles.label,
          { fontSize: sizeConfig.fontSize },
          variant === 'primary' && styles.primaryLabel,
          variant === 'glass' && styles.glassLabel,
          variant === 'ghost' && styles.ghostLabel,
          disabled && styles.disabledLabel,
          textStyle,
        ]}
      >
        {label}
      </Text>
    </AnimatedPressable>
  );
}

const styles = StyleSheet.create({
  base: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: BORDER_RADIUS.md,
    gap: SPACING.xs,
  },
  primary: {
    backgroundColor: COLORS.accent,
  },
  glass: {
    backgroundColor: GLASS.backgroundColor,
    borderWidth: GLASS.borderWidth,
    borderColor: GLASS.borderColor,
  },
  ghost: {
    backgroundColor: 'transparent',
  },
  disabled: {
    opacity: 0.4,
  },
  label: {
    fontFamily: FONTS.semibold,
  },
  primaryLabel: {
    color: COLORS.white,
  },
  glassLabel: {
    color: COLORS.textPrimary,
  },
  ghostLabel: {
    color: COLORS.textSecondary,
  },
  disabledLabel: {
    color: COLORS.textTertiary,
  },
});
