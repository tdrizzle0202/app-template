import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Animated, { FadeIn, FadeInDown, FadeInUp } from 'react-native-reanimated';
import { TypewriterText } from '@/components/ui/TypewriterText';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Check } from 'lucide-react-native';
import { PressableScale } from '@/components/ui/PressableScale';
import { Cloud, Sprout } from '@/components/icons/AllSetIllustrations';
import { useOnboardingStore } from '@/store/useOnboardingStore';
import { useUserStore } from '@/store/useUserStore';
import { FONTS, SPACING, RADIUS } from '@/constants/theme';

export default function AllSet() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const store = useOnboardingStore();
  const displayName = store.name || '';

  const handleStart = async () => {
    useUserStore.getState().completeOnboarding({
      name: store.name,
      gender: store.gender,
      referralSource: store.referralSource,
    });
    await AsyncStorage.setItem('hasSeenOnboarding', 'true');
    store.reset();
    router.replace('/paywall');
  };

  return (
    <View style={styles.root}>
      <LinearGradient
        colors={['#87CEEB', '#78B8D6', '#68D391', '#48BB78']}
        style={StyleSheet.absoluteFill}
      />

      <View style={[styles.container, { paddingTop: insets.top + 12, paddingBottom: Math.max(insets.bottom, 16) }]}>
        {/* Clouds */}
        <Animated.View entering={FadeIn.duration(800)} style={styles.cloudLayer} pointerEvents="none">
          <View style={styles.cloudLeft}>
            <Cloud width={110} opacity={0.7} />
          </View>
          <View style={styles.cloudRight}>
            <Cloud width={90} opacity={0.55} />
          </View>
          <View style={styles.cloudCenter}>
            <Cloud width={70} opacity={0.45} />
          </View>
        </Animated.View>

        {/* Main content */}
        <View style={styles.content}>
          {/* Mascot */}
          <Animated.View
            entering={FadeIn.delay(200).duration(600).withInitialValues({ transform: [{ scale: 0.5 }] })}
            style={styles.mascotContainer}
          >
            <View style={styles.mascotCircle}>
              <Text style={styles.mascotEmoji}>{'\u{1F389}'}</Text>
            </View>
          </Animated.View>

          {/* Sprout decorations */}
          <View style={styles.sproutRow} pointerEvents="none">
            <View style={styles.sproutLeft}>
              <Sprout size={24} />
            </View>
            <View style={styles.sproutRight}>
              <Sprout size={20} />
            </View>
          </View>

          {/* Title */}
          <Animated.View entering={FadeInDown.delay(400).duration(500)}>
            <TypewriterText
              text={displayName
                ? `You're all set, ${displayName}!`
                : "You're all set!"}
              style={styles.title}
              highlightWord="all"
              highlightStyle={styles.titleHighlight}
              speed={25}
              delay={600}
            />
          </Animated.View>

          {/* Divider */}
          <Animated.View entering={FadeIn.delay(800).duration(400)} style={styles.divider} />

          {/* Checkmark */}
          <Animated.View
            entering={FadeIn.delay(1000).duration(500).withInitialValues({ transform: [{ scale: 0.5 }] })}
            style={styles.checkContainer}
          >
            <View style={styles.checkCircle}>
              <Check size={22} color="#48BB78" strokeWidth={3} />
            </View>
          </Animated.View>
        </View>

        {/* CTA */}
        <Animated.View entering={FadeInUp.delay(1200).duration(500)} style={styles.bottom}>
          <PressableScale onPress={handleStart} style={styles.button} haptic="Light">
            <Text style={styles.buttonText}>Let's Go</Text>
          </PressableScale>
        </Animated.View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  container: {
    flex: 1,
    paddingHorizontal: SPACING.lg,
  },

  cloudLayer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 180,
  },
  cloudLeft: {
    position: 'absolute',
    top: 30,
    left: -20,
  },
  cloudRight: {
    position: 'absolute',
    top: 10,
    right: -10,
  },
  cloudCenter: {
    position: 'absolute',
    top: 70,
    left: '35%' as unknown as number,
  },

  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },

  mascotContainer: {
    marginBottom: SPACING.md,
  },
  mascotCircle: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: 'rgba(255,255,255,0.3)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  mascotEmoji: {
    fontSize: 48,
  },

  sproutRow: {
    flexDirection: 'row',
    width: '100%',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.xl,
    marginBottom: SPACING.sm,
  },
  sproutLeft: {
    transform: [{ rotate: '-15deg' }],
  },
  sproutRight: {
    transform: [{ rotate: '15deg' }],
  },

  title: {
    fontSize: 32,
    lineHeight: 40,
    fontFamily: FONTS.extrabold,
    fontWeight: '800',
    color: '#FFFFFF',
    textAlign: 'center',
    marginBottom: SPACING.lg,
    paddingHorizontal: SPACING.sm,
  },
  titleHighlight: {
    color: '#FF4444',
  },

  divider: {
    width: '60%',
    height: 1,
    backgroundColor: 'rgba(255,255,255,0.3)',
    marginBottom: SPACING.lg,
  },

  checkContainer: {
    marginBottom: SPACING.md,
  },
  checkCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 3,
  },

  bottom: {
    paddingBottom: SPACING.md,
  },
  button: {
    width: '100%',
    height: 56,
    borderRadius: RADIUS.pill,
    backgroundColor: 'rgba(255,255,255,0.25)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.4)',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 4,
  },
  buttonText: {
    fontSize: 18,
    fontFamily: FONTS.semibold,
    fontWeight: '600',
    color: '#FFFFFF',
  },
});
