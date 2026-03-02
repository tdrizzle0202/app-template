import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  Platform,
  Pressable,
  StyleSheet,
  Text,
  View,
  useWindowDimensions,
} from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSpring,
  withSequence,
  Easing,
  FadeIn,
  runOnJS,
} from 'react-native-reanimated';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as Haptics from 'expo-haptics';
import { X } from 'lucide-react-native';
import { PressableScale } from '@/components/ui/PressableScale';
import { COLORS, TYPE, SPACING, RADIUS, SPRING_BUTTON } from '@/constants/theme';

const BUBBLE_SIZE = 60;
const GAME_DURATION = 30;

const CRAVING_EMOJIS = ['🚬', '💨', '😤', '🫠', '😩', '🤢'];
const POP_EMOJIS = ['💪', '✨', '🎉', '⭐'];

const randomFrom = <T,>(arr: T[]): T => arr[Math.floor(Math.random() * arr.length)];

// ── Types ───────────────────────────────────────────────
type GameState = 'ready' | 'playing' | 'done';

interface BubbleData {
  id: number;
  x: number;
  emoji: string;
  floatDuration: number; // 3000–5000ms
}

// ── Floating Bubble ─────────────────────────────────────
const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

function FloatingBubble({
  bubble,
  onPop,
  screenHeight,
}: {
  bubble: BubbleData;
  onPop: (id: number, scored?: boolean) => void;
  screenHeight: number;
}) {
  const translateY = useSharedValue(screenHeight);
  const scale = useSharedValue(1);
  const opacity = useSharedValue(1);
  const [popEmoji, setPopEmoji] = useState<string | null>(null);
  const removed = useRef(false);

  // Float upward on mount
  useEffect(() => {
    translateY.value = withTiming(-BUBBLE_SIZE - 20, {
      duration: bubble.floatDuration,
      easing: Easing.linear,
    });

    // Remove when offscreen
    const timeout = setTimeout(() => {
      if (!removed.current) {
        removed.current = true;
        onPop(bubble.id);
      }
    }, bubble.floatDuration);
    return () => clearTimeout(timeout);
  }, [bubble, translateY, onPop]);

  const animStyle = useAnimatedStyle(() => ({
    transform: [
      { translateY: translateY.value },
      { scale: scale.value },
    ],
    opacity: opacity.value,
  }));

  const handleTap = useCallback(() => {
    if (removed.current) return;
    removed.current = true;

    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Rigid);
    }

    setPopEmoji(randomFrom(POP_EMOJIS));

    // Pop animation: scale 1 → 1.3 → 0
    scale.value = withSequence(
      withSpring(1.3, { damping: 6, stiffness: 300 }),
      withTiming(0, { duration: 150 }),
    );
    opacity.value = withTiming(0, { duration: 250 });

    // Score + remove after animation
    setTimeout(() => onPop(bubble.id, true), 300);
  }, [bubble.id, onPop, scale, opacity]);

  return (
    <AnimatedPressable
      onPress={handleTap}
      style={[
        styles.bubble,
        { left: bubble.x },
        animStyle,
      ]}
    >
      <Text style={styles.bubbleEmoji}>{popEmoji ?? bubble.emoji}</Text>
    </AnimatedPressable>
  );
}

// ── Done bounce emoji ───────────────────────────────────
function BounceEmoji() {
  const scale = useSharedValue(0);

  useEffect(() => {
    scale.value = withSpring(1, { damping: 6, stiffness: 150 });
  }, [scale]);

  const animStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  return (
    <Animated.Text style={[styles.bigEmoji, animStyle]}>🎉</Animated.Text>
  );
}

// ── Screen ──────────────────────────────────────────────
export default function CravingGameScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { width: SCREEN_W, height: SCREEN_H } = useWindowDimensions();

  const [gameState, setGameState] = useState<GameState>('ready');
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(GAME_DURATION);
  const [bubbles, setBubbles] = useState<BubbleData[]>([]);

  const nextId = useRef(0);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const spawnRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const clearTimers = useCallback(() => {
    if (timerRef.current) { clearInterval(timerRef.current); timerRef.current = null; }
    if (spawnRef.current) { clearInterval(spawnRef.current); spawnRef.current = null; }
  }, []);

  useEffect(() => () => clearTimers(), [clearTimers]);

  // Format time as "0:27"
  const formatTime = (s: number) => `0:${s.toString().padStart(2, '0')}`;

  const spawnBubble = useCallback(() => {
    const id = nextId.current++;
    const b: BubbleData = {
      id,
      x: Math.random() * (SCREEN_W - 80) + 20,
      emoji: randomFrom(CRAVING_EMOJIS),
      floatDuration: 3000 + Math.random() * 2000,
    };
    setBubbles((prev) => [...prev, b]);
  }, [SCREEN_W]);

  const startGame = useCallback(() => {
    setScore(0);
    setTimeLeft(GAME_DURATION);
    setBubbles([]);
    nextId.current = 0;
    setGameState('playing');

    // Countdown
    let t = GAME_DURATION;
    timerRef.current = setInterval(() => {
      t -= 1;
      setTimeLeft(t);
      if (t <= 0) {
        clearTimers();
        setGameState('done');
      }
    }, 1000);

    // Spawn bubbles every 0.8s
    spawnRef.current = setInterval(() => {
      setBubbles((prev) => {
        if (prev.length >= 10) return prev; // cap active bubbles
        const id = nextId.current++;
        return [
          ...prev,
          {
            id,
            x: Math.random() * (SCREEN_W - 80) + 20,
            emoji: randomFrom(CRAVING_EMOJIS),
            floatDuration: 3000 + Math.random() * 2000,
          },
        ];
      });
    }, 800);

    // Initial burst of 3
    for (let i = 0; i < 3; i++) {
      const id = nextId.current++;
      setBubbles((prev) => [
        ...prev,
        {
          id,
          x: Math.random() * (SCREEN_W - 80) + 20,
          emoji: randomFrom(CRAVING_EMOJIS),
          floatDuration: 3000 + Math.random() * 2000,
        },
      ]);
    }
  }, [clearTimers, SCREEN_W]);

  // Handle bubble removal (popped or offscreen)
  const handleBubbleGone = useCallback((id: number, scored?: boolean) => {
    if (scored) setScore((s) => s + 1);
    setBubbles((prev) => prev.filter((b) => b.id !== id));
  }, []);

  const resetGame = useCallback(() => {
    clearTimers();
    setBubbles([]);
    setScore(0);
    setTimeLeft(GAME_DURATION);
    setGameState('ready');
  }, [clearTimers]);

  return (
    <View style={[styles.screen, { paddingTop: insets.top }]}>
      {/* ── Top Bar ── */}
      <Animated.View entering={FadeIn.duration(300)} style={styles.topBar}>
        <View style={{ width: 40 }} />
        <Text style={[TYPE.subheading, { color: COLORS.text }]}>Pop the Cravings</Text>
        <PressableScale onPress={() => router.back()} style={styles.closeBtn}>
          <X color={COLORS.text} size={20} />
        </PressableScale>
      </Animated.View>

      {/* ── STATE 1: Ready ── */}
      {gameState === 'ready' && (
        <Animated.View entering={FadeIn.duration(400)} style={styles.center}>
          <Text style={styles.bigEmoji}>🎮</Text>
          <Text style={[TYPE.heading, { color: COLORS.text, textAlign: 'center', marginTop: SPACING.md }]}>
            Tap the cravings to{'\n'}destroy them!
          </Text>
          <Text style={[TYPE.body, { color: COLORS.textSecondary, textAlign: 'center', marginTop: SPACING.sm }]}>
            30 seconds. As many as you can.
          </Text>
          <PressableScale onPress={startGame} haptic="Heavy" style={styles.primaryBtn}>
            <Text style={styles.primaryBtnText}>Start!</Text>
          </PressableScale>
        </Animated.View>
      )}

      {/* ── STATE 2: Playing ── */}
      {gameState === 'playing' && (
        <View style={styles.playArea}>
          {/* Timer + Score */}
          <View style={styles.timerArea}>
            <Text style={[TYPE.heading, { color: COLORS.primary, textAlign: 'center' }]}>
              {formatTime(timeLeft)}
            </Text>
            <Text style={[TYPE.subheading, { color: COLORS.text, textAlign: 'center' }]}>
              Score: {score}
            </Text>
          </View>

          {/* Game field */}
          <View style={styles.gameField}>
            {bubbles.map((b) => (
              <FloatingBubble key={b.id} bubble={b} onPop={handleBubbleGone} screenHeight={SCREEN_H} />
            ))}
          </View>
        </View>
      )}

      {/* ── STATE 3: Done ── */}
      {gameState === 'done' && (
        <Animated.View entering={FadeIn.duration(400)} style={styles.center}>
          <BounceEmoji />
          <Text style={[TYPE.heading, { color: COLORS.primary, textAlign: 'center', marginTop: SPACING.md }]}>
            Craving crushed!
          </Text>
          <Text style={[TYPE.body, { color: COLORS.textSecondary, textAlign: 'center', marginTop: SPACING.sm }]}>
            {score} bubbles popped
          </Text>
          <View style={{ height: SPACING.sm }} />
          <Text style={[TYPE.body, { color: COLORS.textMuted, textAlign: 'center' }]}>
            That craving is long gone by now 😎
          </Text>
          <View style={{ height: SPACING.xl }} />
          <PressableScale onPress={() => router.back()} haptic="Heavy" style={styles.primaryBtn}>
            <Text style={styles.primaryBtnText}>Done</Text>
          </PressableScale>
          <PressableScale onPress={resetGame} style={styles.glassBtn}>
            <Text style={styles.glassBtnText}>Play Again</Text>
          </PressableScale>
        </Animated.View>
      )}
    </View>
  );
}

// ── Styles ──────────────────────────────────────────────
const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: COLORS.bg,
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    height: 52,
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

  // Centered states
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 32,
  },
  bigEmoji: {
    fontSize: 48,
  },

  // Buttons
  primaryBtn: {
    marginTop: SPACING.lg,
    height: 56,
    paddingHorizontal: 56,
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
  primaryBtnText: {
    ...TYPE.subheading,
    color: '#07090E',
  },
  glassBtn: {
    marginTop: SPACING.sm,
    height: 48,
    paddingHorizontal: 56,
    borderRadius: RADIUS.md,
    borderCurve: 'continuous',
    backgroundColor: COLORS.bgGlass,
    borderWidth: 1,
    borderColor: COLORS.glassBorder,
    alignItems: 'center',
    justifyContent: 'center',
  },
  glassBtnText: {
    ...TYPE.subheading,
    color: COLORS.textSecondary,
  },

  // Playing state
  playArea: {
    flex: 1,
  },
  timerArea: {
    paddingVertical: SPACING.sm,
    gap: 2,
  },
  gameField: {
    flex: 1,
    overflow: 'hidden',
  },

  // Bubble
  bubble: {
    position: 'absolute',
    width: BUBBLE_SIZE,
    height: BUBBLE_SIZE,
    borderRadius: BUBBLE_SIZE / 2,
    backgroundColor: COLORS.bgGlass,
    borderWidth: 1,
    borderColor: COLORS.glassBorder,
    alignItems: 'center',
    justifyContent: 'center',
  },
  bubbleEmoji: {
    fontSize: 28,
  },
});
