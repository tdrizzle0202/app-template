import React, { useCallback } from 'react';
import {
  StyleSheet,
  Text,
  View,
  useWindowDimensions,
} from 'react-native';
import Animated, { FadeIn } from 'react-native-reanimated';
import { PressableScale } from '@/components/ui/PressableScale';
import { ScreenWrapper } from '@/components/ui/ScreenWrapper';
import { COLORS, TYPE, SPACING, RADIUS } from '@/constants/theme';

// ── Replace with your app's tools ────────────────────────
const TOOLS = [
  {
    emoji: '1',
    title: 'Tool One',
    subtitle: 'Description here',
    accentColor: COLORS.primary,
  },
  {
    emoji: '2',
    title: 'Tool Two',
    subtitle: 'Description here',
    accentColor: COLORS.danger,
  },
  {
    emoji: '3',
    title: 'Tool Three',
    subtitle: 'Description here',
    accentColor: COLORS.accent,
  },
  {
    emoji: '4',
    title: 'Tool Four',
    subtitle: 'Description here',
    accentColor: COLORS.success,
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
    // Navigate to tool screen
  }, [tool]);

  return (
    <Animated.View entering={FadeIn.delay(index * 100).duration(400)}>
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
export default function ToolsScreen() {
  const { width } = useWindowDimensions();
  const cardSize = (width - 40 - 12) / 2;

  return (
    <ScreenWrapper scrollable>
      <View style={{ paddingBottom: 100 }}>
        <Text style={[TYPE.heading, { color: COLORS.text }]}>Tools</Text>
        <View style={{ height: SPACING.xs }} />
        <Text style={[TYPE.body, { color: COLORS.textSecondary }]}>
          Pick a tool to get started.
        </Text>

        <View style={{ height: SPACING.lg }} />

        <View style={styles.grid}>
          {TOOLS.map((tool, i) => (
            <ToolCard key={tool.title} tool={tool} index={i} cardSize={cardSize} />
          ))}
        </View>
      </View>
    </ScreenWrapper>
  );
}

// ── Styles ───────────────────────────────────────────────
const styles = StyleSheet.create({
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
