import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSpring,
  withDelay,
  withSequence,
  Easing,
  FadeIn,
  FadeInUp,
} from 'react-native-reanimated';
import { useRouter } from 'expo-router';
import { ChevronLeft, HeartHandshake, Check } from 'lucide-react-native';
import { ScreenWrapper } from '@/components/ui/ScreenWrapper';
import { PressableScale } from '@/components/ui/PressableScale';
import { COLORS, TYPE, FONTS, SPACING, RADIUS } from '@/constants/theme';

// ── Mock Data ────────────────────────────────────────────
const PLEDGE_TEXT =
  'I pledge to stay nicotine-free today. I choose my health, my family, and my future over any craving. I am stronger than my addiction.';

// Celebration particle positions (angle in degrees, distance from center)
const PARTICLES = Array.from({ length: 12 }, (_, i) => ({
  angle: (i * 30) * (Math.PI / 180),
  distance: 80 + Math.random() * 40,
  color: [COLORS.primary, COLORS.accent, COLORS.success, COLORS.danger][i % 4],
  size: 6 + Math.random() * 6,
}));

function CelebrationParticle({ particle, triggered }: { particle: typeof PARTICLES[0]; triggered: boolean }) {
  const translateX = useSharedValue(0);
  const translateY = useSharedValue(0);
  const opacity = useSharedValue(0);
  const scale = useSharedValue(0);

  useEffect(() => {
    if (triggered) {
      const targetX = Math.cos(particle.angle) * particle.distance;
      const targetY = Math.sin(particle.angle) * particle.distance;
      opacity.value = withSequence(
        withTiming(1, { duration: 100 }),
        withDelay(400, withTiming(0, { duration: 300 })),
      );
      translateX.value = withSpring(targetX, { damping: 12, stiffness: 80 });
      translateY.value = withSpring(targetY, { damping: 12, stiffness: 80 });
      scale.value = withSequence(
        withSpring(1.2, { damping: 8 }),
        withDelay(200, withTiming(0, { duration: 300 })),
      );
    }
  }, [triggered, particle, translateX, translateY, opacity, scale]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: translateX.value },
      { translateY: translateY.value },
      { scale: scale.value },
    ],
    opacity: opacity.value,
  }));

  return (
    <Animated.View
      style={[
        {
          position: 'absolute',
          width: particle.size,
          height: particle.size,
          borderRadius: particle.size / 2,
          backgroundColor: particle.color,
        },
        animatedStyle,
      ]}
    />
  );
}

export default function PledgeScreen() {
  const router = useRouter();
  const [pledged, setPledged] = useState(false);
  const [celebration, setCelebration] = useState(false);

  const handlePledge = () => {
    setPledged(true);
    setCelebration(true);
  };

  return (
    <ScreenWrapper scrollable={false}>
      <View style={s.container}>
        {/* Header */}
        <Animated.View entering={FadeIn.duration(300)} style={s.header}>
          <PressableScale onPress={() => router.back()} style={s.backBtn}>
            <ChevronLeft color={COLORS.text} size={24} />
          </PressableScale>
          <Text style={[TYPE.heading, { color: COLORS.text }]}>Daily Pledge</Text>
          <View style={{ width: 40 }} />
        </Animated.View>

        <View style={s.center}>
          {/* Icon with celebration particles */}
          <Animated.View entering={FadeIn.delay(200).duration(400)} style={s.iconArea}>
            {celebration &&
              PARTICLES.map((p, i) => (
                <CelebrationParticle key={i} particle={p} triggered={celebration} />
              ))}
            <View style={[s.iconCircle, pledged && s.iconCirclePledged]}>
              {pledged ? (
                <Check color="#07090E" size={48} />
              ) : (
                <HeartHandshake color={COLORS.primary} size={48} />
              )}
            </View>
          </Animated.View>

          {/* Pledge text */}
          <Animated.View entering={FadeInUp.delay(400).duration(400)}>
            <Text style={s.pledgeText}>{PLEDGE_TEXT}</Text>
          </Animated.View>

        </View>

        {/* CTA */}
        <View style={s.btnArea}>
          <PressableScale
            onPress={handlePledge}
            haptic="Heavy"
            disabled={pledged}
            style={[s.ctaBtn, pledged && s.ctaBtnPledged]}
          >
            <Text style={[s.ctaText, pledged && s.ctaTextPledged]}>
              {pledged ? 'Pledged Today' : 'I Pledge'}
            </Text>
          </PressableScale>
        </View>
      </View>
    </ScreenWrapper>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, paddingBottom: 100 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: SPACING.md,
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.bgGlass,
    borderWidth: 1,
    borderColor: COLORS.glassBorder,
    alignItems: 'center',
    justifyContent: 'center',
  },
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconArea: {
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: SPACING.xl,
  },
  iconCircle: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: COLORS.bgGlass,
    borderWidth: 1,
    borderColor: COLORS.glassBorderBright,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconCirclePledged: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  pledgeText: {
    ...TYPE.body,
    color: COLORS.text,
    textAlign: 'center',
    lineHeight: 26,
    marginHorizontal: SPACING.md,
  },
  btnArea: {
    alignItems: 'center',
    marginTop: SPACING.lg,
  },
  ctaBtn: {
    height: 56,
    paddingHorizontal: 64,
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
  ctaBtnPledged: {
    backgroundColor: COLORS.bgGlass,
    borderWidth: 1,
    borderColor: COLORS.glassBorder,
    shadowOpacity: 0,
    elevation: 0,
  },
  ctaText: {
    ...TYPE.subheading,
    color: '#07090E',
  },
  ctaTextPledged: {
    color: COLORS.textSecondary,
  },
});
