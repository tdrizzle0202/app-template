import React, { useState } from 'react';
import { Alert, Share, StyleSheet, Text, View } from 'react-native';
import Animated, { FadeIn, FadeInUp } from 'react-native-reanimated';
import { useRouter } from 'expo-router';
import { ChevronLeft } from 'lucide-react-native';
import { ScreenWrapper } from '@/components/ui/ScreenWrapper';
import { PressableScale } from '@/components/ui/PressableScale';
import { COLORS, TYPE, FONTS, SPACING, RADIUS } from '@/constants/theme';
import { useUserStore, getDaysSinceQuit, getMoneySaved } from '@/store/useUserStore';

type ExportFormat = 'json' | 'text';

export default function ExportDataScreen() {
  const router = useRouter();
  const [format, setFormat] = useState<ExportFormat>('json');

  const name = useUserStore((s) => s.name);
  const quitDate = useUserStore((s) => s.quitDate);
  const monthlySpend = useUserStore((s) => s.monthlySpend);
  const nicotineTypes = useUserStore((s) => s.nicotineTypes);
  const triggers = useUserStore((s) => s.triggers);
  const relapses = useUserStore((s) => s.relapses);

  const daysFree = getDaysSinceQuit(quitDate);
  const moneySaved = getMoneySaved(quitDate, monthlySpend);

  const exportData = {
    profile: { name: name || 'User', quitDate: quitDate ?? 'N/A' },
    stats: { daysFree, moneySaved, relapses },
    details: { nicotineTypes, triggers, monthlySpend },
  };

  function formatAsText(): string {
    return [
      '── Fein Data Export ──',
      '',
      'Profile',
      `  Name: ${exportData.profile.name}`,
      `  Quit Date: ${exportData.profile.quitDate}`,
      '',
      'Stats',
      `  Days Free: ${daysFree}`,
      `  Money Saved: $${moneySaved}`,
      `  Relapses: ${relapses}`,
      '',
      'Details',
      `  Nicotine Types: ${nicotineTypes.join(', ') || 'None'}`,
      `  Triggers: ${triggers.join(', ') || 'None'}`,
      `  Monthly Spend: $${monthlySpend}`,
    ].join('\n');
  }

  function formatAsJSON(): string {
    return JSON.stringify(exportData, null, 2);
  }

  const handleExport = async () => {
    const content = format === 'json' ? formatAsJSON() : formatAsText();
    try {
      await Share.share({ message: content });
    } catch {
      // user cancelled or share failed — do nothing
    }
  };

  return (
    <ScreenWrapper scrollable>
      <View style={{ paddingBottom: 100 }}>
        {/* ── Header ── */}
        <Animated.View entering={FadeIn.duration(300)} style={s.header}>
          <PressableScale onPress={() => router.back()} style={s.backBtn}>
            <ChevronLeft color={COLORS.text} size={24} />
          </PressableScale>
          <Text style={[TYPE.heading, { color: COLORS.text }]}>Export Data</Text>
          <View style={{ width: 40 }} />
        </Animated.View>

        {/* ── Description ── */}
        <Animated.View entering={FadeInUp.delay(100).duration(400)}>
          <Text style={s.description}>Preview and export your Fein data.</Text>
        </Animated.View>

        <View style={{ height: SPACING.lg }} />

        {/* ── Preview Card ── */}
        <Animated.View entering={FadeInUp.delay(200).duration(400)} style={s.previewCard}>
          {/* Profile */}
          <Text style={s.sectionLabel}>PROFILE</Text>
          <View style={s.row}>
            <Text style={s.rowKey}>Name</Text>
            <Text style={s.rowValue}>{name || 'User'}</Text>
          </View>
          <View style={s.row}>
            <Text style={s.rowKey}>Quit Date</Text>
            <Text style={s.rowValue}>{quitDate ?? 'N/A'}</Text>
          </View>

          <View style={s.divider} />

          {/* Stats */}
          <Text style={s.sectionLabel}>STATS</Text>
          <View style={s.row}>
            <Text style={s.rowKey}>Days Free</Text>
            <Text style={s.rowValue}>{daysFree}</Text>
          </View>
          <View style={s.row}>
            <Text style={s.rowKey}>Money Saved</Text>
            <Text style={s.rowValue}>${moneySaved}</Text>
          </View>
          <View style={s.row}>
            <Text style={s.rowKey}>Relapses</Text>
            <Text style={s.rowValue}>{relapses}</Text>
          </View>

          <View style={s.divider} />

          {/* Details */}
          <Text style={s.sectionLabel}>DETAILS</Text>
          <View style={s.row}>
            <Text style={s.rowKey}>Nicotine Types</Text>
            <Text style={s.rowValue}>{nicotineTypes.join(', ') || 'None'}</Text>
          </View>
          <View style={s.row}>
            <Text style={s.rowKey}>Triggers</Text>
            <Text style={s.rowValue}>{triggers.join(', ') || 'None'}</Text>
          </View>
          <View style={s.row}>
            <Text style={s.rowKey}>Monthly Spend</Text>
            <Text style={s.rowValue}>${monthlySpend}</Text>
          </View>
        </Animated.View>

        <View style={{ height: SPACING.lg }} />

        {/* ── Format Toggle ── */}
        <Animated.View entering={FadeInUp.delay(400).duration(400)} style={s.formatRow}>
          <PressableScale
            onPress={() => setFormat('json')}
            style={[s.formatPill, format === 'json' && s.formatPillActive]}
          >
            <Text style={[s.formatPillText, format === 'json' && s.formatPillTextActive]}>
              JSON
            </Text>
          </PressableScale>
          <PressableScale
            onPress={() => setFormat('text')}
            style={[s.formatPill, format === 'text' && s.formatPillActive]}
          >
            <Text style={[s.formatPillText, format === 'text' && s.formatPillTextActive]}>
              Text
            </Text>
          </PressableScale>
        </Animated.View>

        <View style={{ height: SPACING.xl }} />

        {/* ── Export Button ── */}
        <Animated.View entering={FadeInUp.delay(600).duration(400)}>
          <PressableScale onPress={handleExport} haptic="Heavy" style={s.ctaBtn}>
            <Text style={s.ctaText}>Export & Share</Text>
          </PressableScale>
        </Animated.View>
      </View>
    </ScreenWrapper>
  );
}

// ── Styles ───────────────────────────────────────────────
const s = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: SPACING.lg,
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

  description: {
    ...TYPE.body,
    color: COLORS.textSecondary,
  },

  // Preview card
  previewCard: {
    backgroundColor: COLORS.bgGlass,
    borderWidth: 1,
    borderColor: COLORS.glassBorder,
    borderRadius: RADIUS.lg,
    borderCurve: 'continuous',
    padding: SPACING.lg,
  },
  sectionLabel: {
    ...TYPE.caption,
    color: COLORS.textSecondary,
    letterSpacing: 1,
    marginBottom: SPACING.sm,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 6,
  },
  rowKey: {
    ...TYPE.body,
    color: COLORS.textSecondary,
  },
  rowValue: {
    ...TYPE.body,
    color: COLORS.text,
  },
  divider: {
    height: 1,
    backgroundColor: COLORS.glassBorder,
    marginVertical: SPACING.md,
  },

  // Format toggle
  formatRow: {
    flexDirection: 'row',
    gap: SPACING.sm,
  },
  formatPill: {
    flex: 1,
    height: 44,
    borderRadius: RADIUS.pill,
    borderCurve: 'continuous',
    backgroundColor: COLORS.bgGlass,
    borderWidth: 1,
    borderColor: COLORS.glassBorder,
    alignItems: 'center',
    justifyContent: 'center',
  },
  formatPillActive: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  formatPillText: {
    ...TYPE.subheading,
    color: COLORS.textSecondary,
  },
  formatPillTextActive: {
    color: '#07090E',
  },

  // CTA button
  ctaBtn: {
    height: 56,
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
  ctaText: {
    ...TYPE.subheading,
    color: '#07090E',
  },
});
