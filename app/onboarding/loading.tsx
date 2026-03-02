import React, { useEffect, useRef, useState } from 'react';
import { StyleSheet, View, Text } from 'react-native';
import { useRouter } from 'expo-router';
import Animated, {
  FadeIn,
  FadeInUp,
  useSharedValue,
  useAnimatedReaction,
  withTiming,
  Easing,
  runOnJS,
} from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import { ScreenWrapper } from '@/components/ui/ScreenWrapper';
import { RingLoader } from '@/components/ui/RingLoader';
import { COLORS, TYPE, FONTS } from '@/constants/theme';

const RING_SIZE = 200;
const DURATION = 4500;

const STEPS = [
  'Analyzing your habits...',
  'Building your timeline...',
  'Personalizing strategies...',
];

export default function Loading() {
  const router = useRouter();
  const hapticInterval = useRef<ReturnType<typeof setInterval>>(undefined);

  // ── Ring progress 0 → 1 ──
  const ringProgress = useSharedValue(0);

  // ── Count-up percentage ──
  const [displayPercent, setDisplayPercent] = useState(0);

  useAnimatedReaction(
    () => Math.round(ringProgress.value * 100),
    (val, prev) => {
      if (val !== prev) runOnJS(setDisplayPercent)(val);
    },
  );

  // ── Rotating subtitle ──
  const [stepIndex, setStepIndex] = useState(0);

  useEffect(() => {
    // Start ring fill
    ringProgress.value = withTiming(1, {
      duration: DURATION,
      easing: Easing.out(Easing.cubic),
    });

    // Haptics
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    hapticInterval.current = setInterval(() => {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    }, 300);

    // Rotate subtitle text
    const stepTimer1 = setTimeout(() => setStepIndex(1), 1500);
    const stepTimer2 = setTimeout(() => setStepIndex(2), 3000);

    // Navigate after ring completes
    const navTimeout = setTimeout(() => {
      router.replace('/onboarding/all-set');
    }, DURATION);

    return () => {
      clearInterval(hapticInterval.current);
      clearTimeout(stepTimer1);
      clearTimeout(stepTimer2);
      clearTimeout(navTimeout);
    };
  }, []);

  return (
    <ScreenWrapper scrollable={false}>
      <View style={styles.center}>
        {/* Animated ring with percentage */}
        <Animated.View entering={FadeIn.duration(400)}>
          <RingLoader progress={ringProgress} size={RING_SIZE} strokeWidth={12}>
            <Text style={styles.percent}>{displayPercent}%</Text>
          </RingLoader>
        </Animated.View>

        <Animated.Text
          entering={FadeInUp.delay(200).duration(400)}
          style={styles.heading}
        >
          Formulating your{'\n'}personal plan
        </Animated.Text>

        <Animated.Text
          entering={FadeInUp.delay(400).duration(400)}
          style={styles.subtitle}
          key={stepIndex}
        >
          {STEPS[stepIndex]}
        </Animated.Text>
      </View>
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  percent: {
    fontSize: 48,
    fontFamily: FONTS.extrabold,
    fontWeight: '800',
    color: COLORS.text,
  },
  heading: {
    ...TYPE.heading,
    color: COLORS.text,
    textAlign: 'center',
    marginTop: 32,
  },
  subtitle: {
    ...TYPE.body,
    color: COLORS.textSecondary,
    textAlign: 'center',
    marginTop: 8,
  },
});
