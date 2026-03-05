import React, { useState, useEffect, useMemo } from 'react';
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
  useAnimatedReaction,
  useAnimatedProps,
  withTiming,
  runOnJS,
  Easing,
  FadeIn,
} from 'react-native-reanimated';
import { Check, Lock } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import Svg, { Circle } from 'react-native-svg';
import { PressableScale } from '@/components/ui/PressableScale';
import { ScreenWrapper } from '@/components/ui/ScreenWrapper';
import { GlassCard } from '@/components/ui/GlassCard';
import { COLORS, TYPE, SPACING, RADIUS } from '@/constants/theme';

const AnimatedCircle = Animated.createAnimatedComponent(Circle);

const DAY_LABELS = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];

// ── Replace with your app's milestones ──────────────────
const MOCK_MILESTONES = [
  { id: '1', title: 'First milestone', time: '1 day', icon: '1', hoursRequired: 24, detail: 'You reached your first milestone.' },
  { id: '2', title: 'Second milestone', time: '3 days', icon: '2', hoursRequired: 72, detail: 'You reached your second milestone.' },
  { id: '3', title: 'Third milestone', time: '1 week', icon: '3', hoursRequired: 168, detail: 'You reached your third milestone.' },
  { id: '4', title: 'Fourth milestone', time: '2 weeks', icon: '4', hoursRequired: 336, detail: 'You reached your fourth milestone.' },
  { id: '5', title: 'Fifth milestone', time: '1 month', icon: '5', hoursRequired: 720, detail: 'You reached your fifth milestone.' },
];

// ── Animated Counter ─────────────────────────────────────
function AnimatedCounter({
  target,
  prefix = '',
  suffix = '',
  style,
}: {
  target: number;
  prefix?: string;
  suffix?: string;
  style?: any;
}) {
  const count = useSharedValue(0);
  const [display, setDisplay] = useState(0);

  useEffect(() => {
    const t = setTimeout(() => {
      count.value = withTiming(target, {
        duration: 1200,
        easing: Easing.out(Easing.cubic),
      });
    }, 300);
    return () => clearTimeout(t);
  }, [count, target]);

  useAnimatedReaction(
    () => Math.round(count.value),
    (val, prev) => {
      if (val !== prev) runOnJS(setDisplay)(val);
    },
  );

  return (
    <Text style={style}>
      {prefix}
      {display}
      {suffix}
    </Text>
  );
}

// ── Circular Progress Ring ───────────────────────────────
function CircularProgress({ percent, daysLeft }: { percent: number; daysLeft: number }) {
  const RING_SIZE = 140;
  const STROKE_W = 10;
  const R = (RING_SIZE - STROKE_W) / 2;
  const CIRC = 2 * Math.PI * R;

  const progress = useSharedValue(0);
  const [showDays, setShowDays] = useState(false);

  useEffect(() => {
    progress.value = withTiming(percent / 100, {
      duration: 1500,
      easing: Easing.out(Easing.cubic),
    });
  }, [percent, progress]);

  const animatedProps = useAnimatedProps(() => ({
    strokeDashoffset: CIRC * (1 - progress.value),
  }));

  const handleTap = () => {
    if (Platform.OS !== 'web') {
      Haptics.selectionAsync();
    }
    setShowDays((s) => !s);
  };

  return (
    <Pressable onPress={handleTap} style={{ alignItems: 'center' }}>
      <View style={{ width: RING_SIZE, height: RING_SIZE }}>
        <Svg width={RING_SIZE} height={RING_SIZE}>
          <Circle
            cx={RING_SIZE / 2}
            cy={RING_SIZE / 2}
            r={R}
            stroke="rgba(255,255,255,0.06)"
            strokeWidth={STROKE_W}
            fill="none"
          />
          <AnimatedCircle
            cx={RING_SIZE / 2}
            cy={RING_SIZE / 2}
            r={R}
            stroke={COLORS.primary}
            strokeWidth={STROKE_W}
            fill="none"
            strokeLinecap="round"
            strokeDasharray={`${CIRC}`}
            animatedProps={animatedProps}
            transform={`rotate(-90 ${RING_SIZE / 2} ${RING_SIZE / 2})`}
          />
        </Svg>
        <View style={styles.ringCenter}>
          {showDays ? (
            <Animated.View
              entering={FadeIn.duration(200)}
              style={{ alignItems: 'center' }}
            >
              <Text style={[TYPE.heading, { color: COLORS.primary }]}>
                {daysLeft}
              </Text>
              <Text style={[TYPE.caption, { color: COLORS.textSecondary }]}>
                days left
              </Text>
            </Animated.View>
          ) : (
            <Animated.View
              entering={FadeIn.duration(200)}
              style={{ alignItems: 'center' }}
            >
              <AnimatedCounter
                target={percent}
                suffix="%"
                style={[TYPE.heading, { color: COLORS.primary }]}
              />
              <Text style={[TYPE.caption, { color: COLORS.textSecondary }]}>
                progress
              </Text>
            </Animated.View>
          )}
        </View>
      </View>
      <View style={{ height: SPACING.xs }} />
      <Text style={[TYPE.caption, { color: COLORS.textMuted }]}>
        tap to toggle
      </Text>
    </Pressable>
  );
}

// ── Milestone Card ───────────────────────────────────────
function MilestoneCard({
  milestone,
  index,
  isUnlocked,
  isNext,
}: {
  milestone: (typeof MOCK_MILESTONES)[number];
  index: number;
  isUnlocked: boolean;
  isNext: boolean;
}) {
  const [expanded, setExpanded] = useState(false);

  const handlePress = () => {
    setExpanded((e) => !e);
  };

  return (
    <Animated.View entering={FadeIn.delay(index * 60).duration(400)}>
      <GlassCard
        onPress={isUnlocked || isNext ? handlePress : undefined}
        style={{ opacity: isUnlocked || isNext ? 1 : 0.4 }}
      >
        <View style={styles.milestoneRow}>
          <View
            style={[
              styles.milestoneIcon,
              {
                backgroundColor: isUnlocked
                  ? 'rgba(104,211,145,0.1)'
                  : 'rgba(62,74,90,0.1)',
              },
            ]}
          >
            <Text style={{ fontSize: 18 }}>{milestone.icon}</Text>
          </View>
          <View style={styles.milestoneText}>
            <Text
              style={[
                TYPE.body,
                { color: isUnlocked ? COLORS.text : COLORS.textMuted },
              ]}
            >
              {milestone.title}
            </Text>
            <Text style={[TYPE.caption, { color: COLORS.textSecondary }]}>
              {milestone.time}
            </Text>
          </View>
          {isUnlocked ? (
            <View style={styles.checkCircle}>
              <Check size={14} color="#fff" />
            </View>
          ) : isNext ? (
            <View style={styles.nextPill}>
              <Text style={styles.nextPillText}>NEXT</Text>
            </View>
          ) : (
            <Lock size={18} color={COLORS.textMuted} />
          )}
        </View>

        {expanded && (
          <Animated.View entering={FadeIn.duration(200)}>
            <View style={{ height: SPACING.sm }} />
            <View style={styles.detailBox}>
              <Text
                style={[
                  TYPE.caption,
                  { color: COLORS.textSecondary, lineHeight: 18 },
                ]}
              >
                {isUnlocked ? 'Done ' : 'Pending '}
                {milestone.detail}
              </Text>
            </View>
          </Animated.View>
        )}
      </GlassCard>
    </Animated.View>
  );
}

// ── Calendar ─────────────────────────────────────────────
function StreakCalendar() {
  const { width: screenWidth } = useWindowDimensions();
  const cellWidth = (screenWidth - 40 - 40) / 7;
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth();
  const today = now.getDate();

  const calendarDays = useMemo(() => {
    const firstDayOfWeek = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const days: {
      day: number;
      type: 'empty' | 'clean' | 'today' | 'future';
    }[] = [];

    for (let i = 0; i < firstDayOfWeek; i++) {
      days.push({ day: 0, type: 'empty' });
    }

    for (let d = 1; d <= daysInMonth; d++) {
      const date = new Date(year, month, d);
      const isToday = d === today;
      const isFuture = date > now;

      if (isToday) days.push({ day: d, type: 'today' });
      else if (isFuture) days.push({ day: d, type: 'future' });
      else days.push({ day: d, type: 'clean' });
    }

    return days;
  }, [year, month, today]);

  const monthName = new Date(year, month).toLocaleString('default', {
    month: 'long',
  });

  return (
    <GlassCard>
      <Text
        style={[TYPE.body, { color: COLORS.text, textAlign: 'center' }]}
      >
        {monthName} {year}
      </Text>
      <View style={{ height: SPACING.sm }} />
      <View style={styles.calendarRow}>
        {DAY_LABELS.map((label, i) => (
          <View key={i} style={[styles.calendarCell, { width: cellWidth }]}>
            <Text style={[TYPE.caption, { color: COLORS.textMuted }]}>
              {label}
            </Text>
          </View>
        ))}
      </View>
      <View style={styles.calendarGrid}>
        {calendarDays.map((cell, i) => {
          if (cell.type === 'empty') {
            return <View key={`e${i}`} style={[styles.calendarCell, { width: cellWidth }]} />;
          }
          const isClean = cell.type === 'clean';
          const isToday = cell.type === 'today';
          const isFuture = cell.type === 'future';

          return (
            <View
              key={`d${cell.day}`}
              style={[
                styles.calendarCell,
                { width: cellWidth },
                isClean && styles.calendarClean,
                isToday && styles.calendarToday,
              ]}
            >
              <Text
                style={[
                  TYPE.caption,
                  {
                    color:
                      isClean || isToday
                        ? '#fff'
                        : isFuture
                          ? COLORS.textMuted
                          : COLORS.text,
                  },
                ]}
              >
                {cell.day}
              </Text>
            </View>
          );
        })}
      </View>
    </GlassCard>
  );
}

// ── Screen ───────────────────────────────────────────────
export default function ProgressScreen() {
  // Replace with real app data
  const mockPercent = 25;
  const mockDaysLeft = 67;
  const mockHours = 96;

  const firstLockedIndex = MOCK_MILESTONES.findIndex(
    (m) => m.hoursRequired > mockHours,
  );

  return (
    <ScreenWrapper scrollable>
      <View style={{ paddingBottom: 100 }}>
        <Text style={[TYPE.heading, { color: COLORS.text }]}>
          Your Progress
        </Text>

        <View style={{ height: SPACING.lg }} />

        {/* ── Progress Ring ── */}
        <GlassCard>
          <Text
            style={[
              TYPE.subheading,
              { color: COLORS.text, textAlign: 'center' },
            ]}
          >
            Overall Progress
          </Text>
          <View style={{ height: SPACING.md }} />
          <CircularProgress percent={mockPercent} daysLeft={mockDaysLeft} />
          <View style={{ height: SPACING.sm }} />
          <Text
            style={[
              TYPE.caption,
              { color: COLORS.textSecondary, textAlign: 'center' },
            ]}
          >
            Replace with your app's progress description.
          </Text>
        </GlassCard>

        <View style={{ height: SPACING.md }} />

        {/* ── Milestones ── */}
        <Text style={[TYPE.subheading, { color: COLORS.text }]}>
          Milestones
        </Text>
        <View style={{ height: SPACING.xs }} />
        <Text style={[TYPE.caption, { color: COLORS.textMuted }]}>
          Tap unlocked milestones for details
        </Text>
        <View style={{ height: SPACING.sm }} />
        <View style={{ gap: 10 }}>
          {MOCK_MILESTONES.map((milestone, index) => {
            const isUnlocked = milestone.hoursRequired <= mockHours;
            const isNext = index === firstLockedIndex;
            return (
              <MilestoneCard
                key={milestone.id}
                milestone={milestone}
                index={index}
                isUnlocked={isUnlocked}
                isNext={isNext}
              />
            );
          })}
        </View>

        <View style={{ height: SPACING.md }} />

        {/* ── Stats ── */}
        <Text style={[TYPE.subheading, { color: COLORS.text }]}>
          Stats
        </Text>
        <View style={{ height: SPACING.sm }} />
        <View style={styles.statsRow}>
          <GlassCard style={{ flex: 1 }}>
            <AnimatedCounter
              target={12}
              style={[TYPE.heading, { color: COLORS.accent }]}
            />
            <Text style={[TYPE.caption, { color: COLORS.textSecondary }]}>
              stat label
            </Text>
          </GlassCard>
          <GlassCard style={{ flex: 1 }}>
            <Text style={[TYPE.heading, { color: COLORS.textSecondary }]}>
              3.2
            </Text>
            <Text style={[TYPE.caption, { color: COLORS.textSecondary }]}>
              stat label
            </Text>
          </GlassCard>
        </View>

        <View style={{ height: SPACING.md }} />

        {/* ── Calendar ── */}
        <Text style={[TYPE.subheading, { color: COLORS.text }]}>
          Calendar
        </Text>
        <View style={{ height: SPACING.sm }} />
        <StreakCalendar />
      </View>
    </ScreenWrapper>
  );
}

// ── Styles ───────────────────────────────────────────────
const styles = StyleSheet.create({
  ringCenter: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
  },

  // Milestones
  milestoneRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  milestoneIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  milestoneText: {
    flex: 1,
    marginLeft: 12,
  },
  checkCircle: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: COLORS.success,
    alignItems: 'center',
    justifyContent: 'center',
  },
  nextPill: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    backgroundColor: COLORS.primary,
    borderRadius: 8,
  },
  nextPillText: {
    ...TYPE.caption,
    color: '#07090E',
    fontSize: 11,
  },
  detailBox: {
    backgroundColor: 'rgba(255,255,255,0.04)',
    borderRadius: 10,
    padding: 12,
  },

  // Stats
  statsRow: {
    flexDirection: 'row',
    gap: 12,
  },

  // Calendar
  calendarRow: {
    flexDirection: 'row',
  },
  calendarGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  calendarCell: {
    height: 36,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  calendarClean: {
    backgroundColor: COLORS.primary,
  },
  calendarToday: {
    borderWidth: 1,
    borderColor: COLORS.glassBorderBright,
    backgroundColor: COLORS.primary,
  },
});
