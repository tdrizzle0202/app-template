import React from 'react';
import { StyleSheet, Text, ViewStyle } from 'react-native';
import { PressableScale } from '@/components/ui/PressableScale';
import { COLORS, RADIUS, FONTS } from '@/constants/theme';

interface ButtonProps {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'glass';
  disabled?: boolean;
  style?: ViewStyle;
}

export function Button({ title, onPress, variant = 'primary', disabled = false, style }: ButtonProps) {
  return (
    <PressableScale
      onPress={onPress}
      disabled={disabled}
      haptic="Medium"
      style={[
        styles.base,
        variant === 'primary' && styles.primary,
        variant === 'glass' && styles.glass,
        disabled && styles.disabled,
        style,
      ]}
    >
      <Text
        style={[
          styles.label,
          variant === 'primary' && styles.primaryLabel,
          variant === 'glass' && styles.glassLabel,
        ]}
      >
        {title}
      </Text>
    </PressableScale>
  );
}

const styles = StyleSheet.create({
  base: {
    width: '100%',
    height: 52,
    borderRadius: RADIUS.md,
    borderCurve: 'continuous',
    alignItems: 'center',
    justifyContent: 'center',
  },
  primary: {
    backgroundColor: COLORS.primary,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.25,
    shadowRadius: 12,
    elevation: 6,
  },
  glass: {
    backgroundColor: COLORS.bgGlass,
    borderWidth: 1,
    borderColor: COLORS.glassBorder,
  },
  disabled: {
    opacity: 0.5,
  },
  label: {
    fontSize: 16,
    fontFamily: FONTS.semibold,
  },
  primaryLabel: {
    color: COLORS.bg,
  },
  glassLabel: {
    color: COLORS.text,
  },
});
