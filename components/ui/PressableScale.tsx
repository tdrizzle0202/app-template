import React from 'react';
import { Platform, Pressable, type PressableProps } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
} from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import { SPRING_BUTTON } from '@/constants/theme';

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

const IS_NATIVE = Platform.OS !== 'web';

export type HapticType = 'Light' | 'Medium' | 'Heavy' | 'Rigid' | 'Soft' | 'Selection';

const IMPACT_MAP: Record<Exclude<HapticType, 'Selection'>, Haptics.ImpactFeedbackStyle> = {
  Light: Haptics.ImpactFeedbackStyle.Light,
  Medium: Haptics.ImpactFeedbackStyle.Medium,
  Heavy: Haptics.ImpactFeedbackStyle.Heavy,
  Rigid: Haptics.ImpactFeedbackStyle.Rigid,
  Soft: Haptics.ImpactFeedbackStyle.Soft,
};

export function triggerHaptic(type: HapticType = 'Light') {
  if (!IS_NATIVE) return;
  if (type === 'Selection') {
    Haptics.selectionAsync();
  } else {
    Haptics.impactAsync(IMPACT_MAP[type]);
  }
}

type PressableScaleProps = Omit<PressableProps, 'onPressIn' | 'onPressOut'> & {
  scaleDown?: number;
  haptic?: HapticType;
};

export function PressableScale({
  children,
  onPress,
  style,
  scaleDown = 0.96,
  haptic = 'Light',
  disabled = false,
  ...rest
}: PressableScaleProps) {
  const scale = useSharedValue(1);
  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  return (
    <AnimatedPressable
      {...rest}
      disabled={disabled}
      onPressIn={() => {
        scale.value = withSpring(scaleDown, SPRING_BUTTON);
        triggerHaptic(haptic);
      }}
      onPressOut={() => {
        scale.value = withSpring(1, SPRING_BUTTON);
      }}
      onPress={(e) => {
        onPress?.(e);
      }}
      style={[animatedStyle, style]}
    >
      {children}
    </AnimatedPressable>
  );
}
