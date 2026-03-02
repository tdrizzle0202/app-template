import React, { useState, useEffect, useRef } from 'react';
import { StyleSheet, Text, View, Platform } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  interpolateColor,
  Easing,
  FadeIn,
} from 'react-native-reanimated';
import { useRouter } from 'expo-router';
import { X } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import { ScreenWrapper } from '@/components/ui/ScreenWrapper';
import { PressableScale } from '@/components/ui/PressableScale';
import { COLORS, TYPE, FONTS, SPACING, RADIUS } from '@/constants/theme';

// ── Constants ──────────────────────────────────────────
const TOTAL_ROUNDS = 4;
const INHALE_S = 4;
const HOLD_S = 7;
const EXHALE_S = 8;
const CYCLE_S = INHALE_S + HOLD_S + EXHALE_S; // 19
const TOTAL_S = TOTAL_ROUNDS * CYCLE_S; // 76

type Phase = 'inhale' | 'hold' | 'exhale';

function getPhaseInfo(elapsed: number): { phase: Phase; countdown: number; round: number } {
  const round = Math.floor(elapsed / CYCLE_S) + 1;
  const t = elapsed % CYCLE_S;

  if (t < INHALE_S) {
    return { phase: 'inhale', countdown: INHALE_S - t, round };
  }
  if (t < INHALE_S + HOLD_S) {
    return { phase: 'hold', countdown: INHALE_S + HOLD_S - t, round };
  }
  return { phase: 'exhale', countdown: CYCLE_S - t, round };
}

// ── Component ──────────────────────────────────────────
export default function BreathingScreen() {
  const router = useRouter();

  const [elapsed, setElapsed] = useState(0);
  const [completed, setCompleted] = useState(false);
  const prevPhaseRef = useRef<Phase | null>(null);

  const circleScale = useSharedValue(0.3);
  const glowOpacity = useSharedValue(0);
  const circleFill = useSharedValue(1);

  // Single interval drives the whole exercise
  useEffect(() => {
    if (completed) return;

    const interval = setInterval(() => {
      setElapsed((prev) => {
        const next = prev + 1;
        if (next >= TOTAL_S) {
          clearInterval(interval);
        }
        return next;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [completed]);

  // Derive current state from elapsed
  const isFinished = elapsed >= TOTAL_S;
  const { phase, countdown, round } = isFinished
    ? { phase: 'inhale' as Phase, countdown: 0, round: TOTAL_ROUNDS }
    : getPhaseInfo(elapsed);

  // React to phase changes — fire animations + haptics
  useEffect(() => {
    if (isFinished && !completed) {
      // Exercise complete
      circleScale.value = withTiming(1.0, { duration: 600, easing: Easing.out(Easing.ease) });
      glowOpacity.value = withTiming(0.3, { duration: 600 });
      setCompleted(true);
      if (Platform.OS !== 'web') {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      }
      prevPhaseRef.current = null;
      return;
    }

    if (isFinished) return;

    // Only fire on phase transitions
    if (phase === prevPhaseRef.current) return;
    prevPhaseRef.current = phase;

    // Haptic on every new phase
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }

    if (phase === 'inhale') {
      circleScale.value = withTiming(1.0, {
        duration: INHALE_S * 1000,
        easing: Easing.linear,
      });
      glowOpacity.value = withTiming(0.5, {
        duration: INHALE_S * 1000,
        easing: Easing.linear,
      });
      circleFill.value = withTiming(1, {
        duration: INHALE_S * 1000,
        easing: Easing.linear,
      });
    } else if (phase === 'hold') {
      // Circle stays exactly where it is — no animation
    } else if (phase === 'exhale') {
      circleScale.value = withTiming(0.3, {
        duration: EXHALE_S * 1000,
        easing: Easing.linear,
      });
      glowOpacity.value = withTiming(0, {
        duration: EXHALE_S * 1000,
        easing: Easing.linear,
      });
    }
  }, [phase, isFinished, completed, circleScale, glowOpacity, circleFill]);

  // ── Animated Styles ──────────────────────────────────
  const circleStyle = useAnimatedStyle(() => ({
    transform: [{ scale: circleScale.value }],
    backgroundColor: interpolateColor(
      circleFill.value,
      [0, 1],
      ['rgba(79,209,197,0.08)', '#4FD1C5'],
    ),
  }));

  const glowStyle = useAnimatedStyle(() => ({
    opacity: glowOpacity.value,
    transform: [{ scale: circleScale.value }],
  }));

  // ── Phase display ────────────────────────────────────
  const phaseLabel =
    phase === 'inhale' ? 'Breathe In' : phase === 'hold' ? 'Hold' : 'Breathe Out';
  const phaseColor =
    phase === 'inhale'
      ? COLORS.primary
      : phase === 'hold'
        ? COLORS.accent
        : COLORS.textSecondary;

  return (
    <ScreenWrapper scrollable={false}>
      <View style={s.container}>
        {/* ── Top Bar ── */}
        <Animated.View entering={FadeIn.duration(300)} style={s.header}>
          <View style={{ width: 40 }} />
          <Text style={[TYPE.subheading, { color: COLORS.text }]}>Breathing Exercise</Text>
          <PressableScale onPress={() => router.back()} style={s.closeBtn}>
            <X color={COLORS.textSecondary} size={24} />
          </PressableScale>
        </Animated.View>

        {/* ── Main Circle Area ── */}
        <View style={s.circleArea}>
          {/* Outer glow ring */}
          <Animated.View style={[s.glowRing, glowStyle]} />

          {/* Breathing circle */}
          <Animated.View style={[s.circle, circleStyle]} />
        </View>

        {/* ── Info Below Circle ── */}
        <View style={s.infoArea}>
          {!completed ? (
            <>
              <Text
                key={phase}
                style={[TYPE.heading, { color: phaseColor, textAlign: 'center' }]}
              >
                {phaseLabel}
              </Text>

              <Text style={s.countdown}>{countdown}</Text>

              <Text style={s.roundLabel}>
                Round {round} of {TOTAL_ROUNDS}
              </Text>
            </>
          ) : (
            <Animated.View entering={FadeIn.duration(500)} style={s.completionWrap}>
              <Text style={[TYPE.heading, { color: COLORS.primary, textAlign: 'center' }]}>
                Well done 🙌
              </Text>
              <Text
                style={[
                  TYPE.body,
                  { color: COLORS.textSecondary, textAlign: 'center', marginTop: SPACING.sm },
                ]}
              >
                You completed {TOTAL_ROUNDS} rounds
              </Text>
            </Animated.View>
          )}
        </View>

        {/* ── Bottom ── */}
        {completed && (
          <View style={s.bottomArea}>
            <PressableScale onPress={() => router.back()} style={s.doneBtn}>
              <Text style={s.doneBtnText}>Done</Text>
            </PressableScale>
          </View>
        )}
      </View>
    </ScreenWrapper>
  );
}

// ── Styles ──────────────────────────────────────────────
const s = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: SPACING.md,
  },
  closeBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.bgGlass,
    borderWidth: 1,
    borderColor: COLORS.glassBorder,
    alignItems: 'center',
    justifyContent: 'center',
  },
  circleArea: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  glowRing: {
    position: 'absolute',
    width: 220,
    height: 220,
    borderRadius: 110,
    backgroundColor: COLORS.primaryGlow,
  },
  circle: {
    width: 200,
    height: 200,
    borderRadius: 100,
    borderWidth: 1,
    borderColor: COLORS.primary,
  },
  infoArea: {
    alignItems: 'center',
    paddingBottom: SPACING.lg,
    minHeight: 140,
  },
  countdown: {
    fontSize: 48,
    fontWeight: '800',
    fontFamily: FONTS.extrabold,
    color: COLORS.text,
    marginTop: SPACING.sm,
  },
  roundLabel: {
    ...TYPE.caption,
    color: COLORS.textSecondary,
    marginTop: SPACING.sm,
  },
  completionWrap: {
    alignItems: 'center',
  },
  bottomArea: {
    alignItems: 'center',
    paddingBottom: SPACING.lg,
  },
  doneBtn: {
    height: 56,
    paddingHorizontal: 48,
    borderRadius: RADIUS.md,
    borderCurve: 'continuous',
    backgroundColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: COLORS.primary,
    shadowOpacity: 0.3,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 0 },
    elevation: 8,
  },
  doneBtnText: {
    ...TYPE.subheading,
    color: '#07090E',
  },
});
