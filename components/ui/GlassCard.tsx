import React from 'react';
import { Platform, StyleSheet, View, ViewStyle } from 'react-native';
import { BlurView } from 'expo-blur';
import { PressableScale } from '@/components/ui/PressableScale';
import { COLORS, RADIUS } from '@/constants/theme';

interface GlassCardProps {
  children: React.ReactNode;
  onPress?: () => void;
  style?: ViewStyle;
}

export function GlassCard({ children, onPress, style }: GlassCardProps) {
  const cardContent = (
    <>
      {Platform.OS === 'ios' ? (
        <BlurView intensity={20} tint="dark" style={StyleSheet.absoluteFill} />
      ) : (
        <View style={[StyleSheet.absoluteFill, styles.androidFallback]} />
      )}
      <View style={styles.inner}>{children}</View>
    </>
  );

  if (onPress) {
    return (
      <PressableScale
        onPress={onPress}
        scaleDown={0.98}
        style={[styles.card, style]}
      >
        {cardContent}
      </PressableScale>
    );
  }

  return <View style={[styles.card, style]}>{cardContent}</View>;
}

const styles = StyleSheet.create({
  card: {
    borderRadius: RADIUS.lg,
    borderCurve: 'continuous',
    borderWidth: 1,
    borderColor: COLORS.glassBorder,
    borderTopColor: COLORS.glassTopEdge,
    overflow: 'hidden',
  },
  androidFallback: {
    backgroundColor: COLORS.bgGlass,
  },
  inner: {
    padding: 20,
  },
});
