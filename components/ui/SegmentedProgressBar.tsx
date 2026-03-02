import React, { useEffect } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, { useSharedValue, useAnimatedStyle, withTiming, Easing } from 'react-native-reanimated';
import { COLORS } from '@/constants/theme';

interface SegmentedProgressBarProps {
  totalSteps: number;
  currentStep: number;
}

function Segment({ filled, animating }: { filled: boolean; animating: boolean }) {
  const width = useSharedValue(animating ? 0 : filled ? 1 : 0);

  useEffect(() => {
    if (animating) {
      width.value = withTiming(1, { duration: 300, easing: Easing.out(Easing.ease) });
    }
  }, [animating]);

  const animatedStyle = useAnimatedStyle(() => ({
    backgroundColor: filled || animating
      ? COLORS.primary
      : 'rgba(255,255,255,0.08)',
    ...(animating && {
      width: `${width.value * 100}%`,
      position: 'absolute' as const,
      top: 0,
      left: 0,
      bottom: 0,
      borderRadius: 3,
    }),
  }));

  if (animating) {
    return (
      <View style={styles.segmentWrapper}>
        <View style={[styles.segment, styles.unfilled]} />
        <Animated.View style={[styles.segment, animatedStyle]} />
      </View>
    );
  }

  return <Animated.View style={[styles.segment, animatedStyle]} />;
}

export function SegmentedProgressBar({ totalSteps, currentStep }: SegmentedProgressBarProps) {
  return (
    <View style={styles.container}>
      {Array.from({ length: totalSteps }, (_, i) => (
        <Segment
          key={i}
          filled={i < currentStep}
          animating={i === currentStep}
        />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    gap: 4,
    flex: 1,
  },
  segmentWrapper: {
    flex: 1,
    height: 6,
    position: 'relative',
  },
  segment: {
    flex: 1,
    height: 6,
    borderRadius: 3,
  },
  unfilled: {
    backgroundColor: 'rgba(255,255,255,0.08)',
  },
});
