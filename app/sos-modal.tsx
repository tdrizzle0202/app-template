import React, { useCallback } from 'react';
import {
  Alert,
  StyleSheet,
  Text,
  View,
  useWindowDimensions,
} from 'react-native';
import Animated, { FadeInUp } from 'react-native-reanimated';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { PressableScale } from '@/components/ui/PressableScale';
import { COLORS, TYPE, SPACING, RADIUS } from '@/constants/theme';

// ── Tool definitions ─────────────────────────────────────
const TOOLS = [
  {
    emoji: '🫁',
    title: 'Breathe',
    subtitle: '4-7-8 technique',
    accentColor: COLORS.primary,
    route: '/breathing',
    alert: false,
  },
  {
    emoji: '🧠',
    title: 'Reality Check',
    subtitle: 'Why you quit',
    accentColor: COLORS.danger,
    route: '/reality-check',
    alert: false,
  },
  {
    emoji: '🎮',
    title: 'Pop Game',
    subtitle: '30 sec distraction',
    accentColor: COLORS.accent,
    route: '/craving-game',
    alert: false,
  },
  {
    emoji: '⚠️',
    title: 'Hard Truth',
    subtitle: 'See the damage',
    accentColor: 'rgba(252,129,129,0.7)',
    route: '/graphic-reality',
    alert: true,
  },
] as const;

// ── Tool Card ────────────────────────────────────────────
function ToolCard({
  tool,
  index,
  cardSize,
}: {
  tool: (typeof TOOLS)[number];
  index: number;
  cardSize: number;
}) {
  const handlePress = useCallback(() => {
    if (tool.alert) {
      Alert.alert(
        'Warning',
        'These images show real health damage from nicotine. Continue?',
        [
          { text: 'Cancel' },
          { text: 'Show me', onPress: () => router.push(tool.route as any) },
        ],
      );
    } else {
      router.push(tool.route as any);
    }
  }, [tool]);

  return (
    <Animated.View entering={FadeInUp.delay(index * 80 + 100).springify()}>
      <PressableScale onPress={handlePress} style={[styles.toolCard, { width: cardSize }]}>
        {/* Accent dot */}
        <View
          style={[styles.accentDot, { backgroundColor: tool.accentColor }]}
        />

        <Text style={styles.emoji}>{tool.emoji}</Text>
        <View style={{ height: SPACING.sm }} />
        <Text
          style={[TYPE.subheading, { color: COLORS.text, textAlign: 'center' }]}
        >
          {tool.title}
        </Text>
        <View style={{ height: SPACING.xs }} />
        <Text
          style={[
            TYPE.caption,
            { color: COLORS.textSecondary, textAlign: 'center' },
          ]}
        >
          {tool.subtitle}
        </Text>
      </PressableScale>
    </Animated.View>
  );
}

// ── Screen ───────────────────────────────────────────────
export default function SOSModal() {
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  const cardSize = (width - 40 - 12) / 2;

  return (
    <View style={styles.container}>
      {/* Drag handle */}
      <View style={styles.handleRow}>
        <View style={styles.handle} />
      </View>

      <View style={[styles.content, { paddingBottom: Math.max(insets.bottom, 24) }]}>
        <Text style={[TYPE.heading, { color: COLORS.text }]}>SOS Toolkit</Text>
        <View style={{ height: SPACING.xs }} />
        <Text style={[TYPE.body, { color: COLORS.textSecondary }]}>
          You've got this. Pick a tool.
        </Text>

        <View style={{ height: SPACING.lg }} />

        <View style={styles.grid}>
          {TOOLS.map((tool, i) => (
            <ToolCard key={tool.title} tool={tool} index={i} cardSize={cardSize} />
          ))}
        </View>
      </View>
    </View>
  );
}

// ── Styles ───────────────────────────────────────────────
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0F1218',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
  },
  handleRow: {
    alignItems: 'center',
    paddingTop: 10,
    paddingBottom: 4,
  },
  handle: {
    width: 36,
    height: 5,
    borderRadius: 3,
    backgroundColor: 'rgba(255,255,255,0.25)',
  },
  content: {
    paddingHorizontal: 20,
    paddingTop: SPACING.md,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  toolCard: {
    aspectRatio: 1,
    backgroundColor: COLORS.bgGlass,
    borderWidth: 1,
    borderColor: COLORS.glassBorder,
    borderRadius: RADIUS.lg,
    borderCurve: 'continuous',
    padding: 16,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  accentDot: {
    position: 'absolute',
    top: 12,
    left: 12,
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  emoji: {
    fontSize: 32,
  },
});
