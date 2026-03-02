import React from 'react';
import { StyleSheet, View, Text } from 'react-native';
import Animated, { useAnimatedProps, SharedValue } from 'react-native-reanimated';
import Svg, { Circle as SvgCircle } from 'react-native-svg';
import { COLORS, FONTS } from '@/constants/theme';

const AnimatedSvgCircle = Animated.createAnimatedComponent(SvgCircle);

const TRACK_COLOR = 'rgba(255,255,255,0.06)';

interface RingLoaderProps {
  /** Reanimated shared value from 0 → 1 */
  progress: SharedValue<number>;
  /** Ring diameter (default 260) */
  size?: number;
  /** Stroke width (default 14) */
  strokeWidth?: number;
  /** Progress stroke color (default COLORS.primary) */
  color?: string;
  /** Content rendered inside the ring */
  children?: React.ReactNode;
}

export function RingLoader({
  progress,
  size = 260,
  strokeWidth = 14,
  color = COLORS.primary,
  children,
}: RingLoaderProps) {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;

  const animatedProps = useAnimatedProps(() => ({
    strokeDashoffset: circumference * (1 - progress.value),
  }));

  return (
    <View style={{ width: size, height: size, alignItems: 'center', justifyContent: 'center' }}>
      <Svg
        width={size}
        height={size}
        style={{ position: 'absolute', transform: [{ rotate: '-90deg' }] }}
      >
        <SvgCircle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={TRACK_COLOR}
          strokeWidth={strokeWidth}
          fill="none"
        />
        <AnimatedSvgCircle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={color}
          strokeWidth={strokeWidth}
          fill="none"
          strokeDasharray={circumference}
          animatedProps={animatedProps}
          strokeLinecap="round"
        />
      </Svg>
      {children}
    </View>
  );
}
