import React, { useEffect, useState } from 'react';
import { StyleSheet, Text, View, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import Animated, {
  FadeIn,
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
  withDelay,
  withSequence,
  Easing,
  runOnJS,
} from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import { ScreenWrapper } from '@/components/ui/ScreenWrapper';
import { Button } from '@/components/ui/Button';
import { useTypewriter } from '@/hooks/useTypewriter';
import { COLORS, TYPE, FONTS, SPACING, RADIUS, SPRING_CONFIG } from '@/constants/theme';

// ── Blinking Cursor ───────────────────────────────────────
function Cursor({ visible }: { visible: boolean }) {
  const opacity = useSharedValue(1);

  useEffect(() => {
    if (!visible) {
      opacity.value = withTiming(0, { duration: 300 });
      return;
    }
    const blink = () => {
      opacity.value = withSequence(
        withTiming(1, { duration: 400 }),
        withTiming(0, { duration: 400 }),
      );
    };
    blink();
    const id = setInterval(blink, 800);
    return () => clearInterval(id);
  }, [visible]);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
  }));

  return (
    <Animated.View style={[styles.cursor, animatedStyle]} />
  );
}

// ── Main Screen ───────────────────────────────────────────
export default function Welcome() {
  const router = useRouter();
  const [phase, setPhase] = useState(0);

  useEffect(() => {
    const t1 = setTimeout(() => setPhase(1), 400);
    const t2 = setTimeout(() => setPhase(2), 900);
    return () => { clearTimeout(t1); clearTimeout(t2); };
  }, []);

  const title = useTypewriter('Welcome!', 35, phase >= 1 ? 0 : 99999);
  const subtitle = useTypewriter(
    "Let's get you set up\nin just a few steps.",
    20,
    phase >= 2 ? 0 : 99999,
  );

  useEffect(() => {
    if (subtitle.done && phase < 3) {
      setPhase(3);
      if (Platform.OS !== 'web') {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      }
    }
  }, [subtitle.done]);

  const buttonOpacity = useSharedValue(0);
  const buttonTranslateY = useSharedValue(30);

  useEffect(() => {
    if (phase >= 3) {
      buttonOpacity.value = withDelay(200, withTiming(1, { duration: 500, easing: Easing.out(Easing.ease) }));
      buttonTranslateY.value = withDelay(200, withSpring(0, SPRING_CONFIG));
    }
  }, [phase]);

  const buttonAnimStyle = useAnimatedStyle(() => ({
    opacity: buttonOpacity.value,
    transform: [{ translateY: buttonTranslateY.value }],
  }));

  return (
    <ScreenWrapper scrollable={false}>
      <View style={styles.container}>
        {/* Logo */}
        <Animated.View
          entering={FadeIn.duration(600)}
          style={styles.logoContainer}
        >
          <Text style={styles.logo}>APP</Text>
          <View style={styles.logoDot} />
        </Animated.View>

        {/* Content */}
        <View style={styles.content}>
          <View style={styles.titleRow}>
            <Text style={styles.title}>{title.displayed}</Text>
            {phase >= 1 && !title.done && <Cursor visible />}
          </View>

          <View style={styles.subtitleContainer}>
            <Text style={[styles.subtitle, { opacity: 0 }]}>
              {"Let's get you set up\nin just a few steps."}
            </Text>
            {phase >= 2 && (
              <View style={StyleSheet.absoluteFill}>
                <View style={styles.subtitleRow}>
                  <Text style={styles.subtitle}>{subtitle.displayed}</Text>
                  {!subtitle.done && <Cursor visible />}
                </View>
              </View>
            )}
          </View>
        </View>

        {/* Bottom section */}
        <Animated.View style={[styles.bottom, buttonAnimStyle]}>
          <Button
            title="Get Started"
            onPress={() => router.push('/onboarding/name')}
            style={styles.button}
          />
        </Animated.View>
      </View>
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  logoContainer: {
    alignItems: 'center',
    paddingTop: SPACING.xl,
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 4,
  },
  logo: {
    fontSize: 28,
    fontFamily: FONTS.extrabold,
    color: COLORS.text,
    letterSpacing: 6,
  },
  logoDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: COLORS.primary,
    marginTop: -12,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    paddingBottom: 40,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
  },
  title: {
    ...TYPE.display,
    fontSize: 40,
    color: COLORS.text,
    lineHeight: 48,
  },
  subtitleContainer: {
    marginTop: SPACING.md,
  },
  subtitleRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    flexWrap: 'wrap',
  },
  subtitle: {
    ...TYPE.body,
    fontSize: 20,
    color: COLORS.textSecondary,
    lineHeight: 30,
  },
  cursor: {
    width: 2,
    height: 28,
    backgroundColor: COLORS.primary,
    marginLeft: 2,
    borderRadius: 1,
  },
  bottom: {
    paddingBottom: SPACING.md,
  },
  button: {
    height: 56,
  },
});
