import React from 'react';
import { StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { COLORS, SPACING } from '@/constants/theme';

interface ScreenWrapperProps {
  children: React.ReactNode;
  padded?: boolean;
}

export function ScreenWrapper({ children, padded = true }: ScreenWrapperProps) {
  const insets = useSafeAreaInsets();

  return (
    <View style={styles.container}>
      {/* Ambient gradient blobs */}
      <LinearGradient
        colors={['transparent', COLORS.blob1, 'transparent']}
        style={styles.blob1}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      />
      <LinearGradient
        colors={['transparent', COLORS.blob2, 'transparent']}
        style={styles.blob2}
        start={{ x: 1, y: 0 }}
        end={{ x: 0, y: 1 }}
      />
      <LinearGradient
        colors={['transparent', COLORS.blob3, 'transparent']}
        style={styles.blob3}
        start={{ x: 0.5, y: 0 }}
        end={{ x: 0.5, y: 1 }}
      />

      <View
        style={[
          styles.content,
          {
            paddingTop: insets.top + SPACING.xs,
            paddingBottom: insets.bottom,
          },
          padded && { paddingHorizontal: SPACING.sm },
        ]}
      >
        {children}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  content: {
    flex: 1,
  },
  blob1: {
    position: 'absolute',
    top: -120,
    left: -80,
    width: 320,
    height: 320,
    borderRadius: 160,
    opacity: 1,
  },
  blob2: {
    position: 'absolute',
    top: 200,
    right: -100,
    width: 280,
    height: 280,
    borderRadius: 140,
    opacity: 1,
  },
  blob3: {
    position: 'absolute',
    bottom: 40,
    left: 20,
    width: 240,
    height: 240,
    borderRadius: 120,
    opacity: 1,
  },
});
