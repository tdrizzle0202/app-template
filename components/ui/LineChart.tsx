import React, { useEffect, useMemo, useRef } from 'react';
import { Dimensions, StyleSheet, View, Text, ViewStyle } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedProps,
  useAnimatedReaction,
  withTiming,
  withDelay,
  runOnJS,
  Easing,
} from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import Svg, { Path, Line as SvgLine } from 'react-native-svg';
import { COLORS, TYPE } from '@/constants/theme';

const AnimatedPath = Animated.createAnimatedComponent(Path);

const { width: SCREEN_WIDTH } = Dimensions.get('window');

export interface LineConfig {
  data: number[];
  color: string;
  label: string;
  delay?: number;
}

interface LineChartProps {
  lines: LineConfig[];
  width?: number;
  height?: number;
  strokeWidth?: number;
  duration?: number;
  gridLines?: number;
  startLabel?: string;
  endLabel?: string;
  style?: ViewStyle;
}

function dataToPoints(
  data: number[],
  chartWidth: number,
  chartHeight: number,
): { x: number; y: number }[] {
  return data.map((v, i) => ({
    x: (i / (data.length - 1)) * chartWidth,
    y: (1 - v) * chartHeight,
  }));
}

function catmullRomPath(points: { x: number; y: number }[]): string {
  if (points.length < 2) return '';

  let d = `M ${points[0].x} ${points[0].y}`;

  for (let i = 0; i < points.length - 1; i++) {
    const p0 = points[Math.max(0, i - 1)];
    const p1 = points[i];
    const p2 = points[i + 1];
    const p3 = points[Math.min(points.length - 1, i + 2)];

    const cp1x = p1.x + (p2.x - p0.x) / 6;
    const cp1y = p1.y + (p2.y - p0.y) / 6;
    const cp2x = p2.x - (p3.x - p1.x) / 6;
    const cp2y = p2.y - (p3.y - p1.y) / 6;

    d += ` C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${p2.x} ${p2.y}`;
  }

  return d;
}

function approximatePathLength(points: { x: number; y: number }[]): number {
  let length = 0;
  const SAMPLES = 50;

  for (let i = 0; i < points.length - 1; i++) {
    const p0 = points[Math.max(0, i - 1)];
    const p1 = points[i];
    const p2 = points[i + 1];
    const p3 = points[Math.min(points.length - 1, i + 2)];

    const cp1x = p1.x + (p2.x - p0.x) / 6;
    const cp1y = p1.y + (p2.y - p0.y) / 6;
    const cp2x = p2.x - (p3.x - p1.x) / 6;
    const cp2y = p2.y - (p3.y - p1.y) / 6;

    let prevX = p1.x;
    let prevY = p1.y;

    for (let s = 1; s <= SAMPLES; s++) {
      const t = s / SAMPLES;
      const t2 = t * t;
      const t3 = t2 * t;
      const mt = 1 - t;
      const mt2 = mt * mt;
      const mt3 = mt2 * mt;

      const x = mt3 * p1.x + 3 * mt2 * t * cp1x + 3 * mt * t2 * cp2x + t3 * p2.x;
      const y = mt3 * p1.y + 3 * mt2 * t * cp1y + 3 * mt * t2 * cp2y + t3 * p2.y;

      length += Math.sqrt((x - prevX) ** 2 + (y - prevY) ** 2);
      prevX = x;
      prevY = y;
    }
  }

  return length;
}

function tickHaptic() {
  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
}

function finishHaptic() {
  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
}

function AnimatedLine({
  pathD,
  pathLength,
  color,
  delay,
  strokeWidth,
  duration,
}: {
  pathD: string;
  pathLength: number;
  color: string;
  delay: number;
  strokeWidth: number;
  duration: number;
}) {
  const progress = useSharedValue(0);
  const lastTick = useSharedValue(0);

  useEffect(() => {
    progress.value = withDelay(
      delay,
      withTiming(1, { duration, easing: Easing.out(Easing.cubic) }),
    );
  }, []);

  useAnimatedReaction(
    () => progress.value,
    (current, previous) => {
      if (previous === null || previous === current) return;
      // Tick every ~20% of progress
      const step = Math.floor(current * 5);
      if (step > lastTick.value && current < 1) {
        lastTick.value = step;
        runOnJS(tickHaptic)();
      }
      // Finish haptic
      if (current >= 1 && (previous ?? 0) < 1) {
        runOnJS(finishHaptic)();
      }
    },
  );

  const animatedProps = useAnimatedProps(() => ({
    strokeDashoffset: pathLength * (1 - progress.value),
  }));

  return (
    <AnimatedPath
      d={pathD}
      stroke={color}
      strokeWidth={strokeWidth}
      fill="none"
      strokeLinecap="round"
      strokeDasharray={`${pathLength}`}
      animatedProps={animatedProps}
    />
  );
}

export function LineChart({
  lines,
  width = SCREEN_WIDTH - 40,
  height = 200,
  strokeWidth = 4.5,
  duration = 1800,
  gridLines = 3,
  startLabel,
  endLabel,
  style,
}: LineChartProps) {
  const lineData = useMemo(
    () =>
      lines.map((line, i) => {
        const points = dataToPoints(line.data, width, height);
        const pathD = catmullRomPath(points);
        const pathLength = approximatePathLength(points);
        return { ...line, pathD, pathLength, delay: line.delay ?? i * 300 };
      }),
    [lines, width, height],
  );

  const gridYPositions = useMemo(
    () =>
      Array.from({ length: gridLines }, (_, i) => ((i + 1) / (gridLines + 1)) * height),
    [gridLines, height],
  );

  return (
    <View style={[styles.container, style]}>
      <Svg width={width} height={height}>
        {gridYPositions.map((y, i) => (
          <SvgLine
            key={i}
            x1={0}
            y1={y}
            x2={width}
            y2={y}
            stroke="rgba(255,255,255,0.06)"
            strokeWidth={1}
            strokeDasharray="6 4"
          />
        ))}
        {lineData.map((line, i) => (
          <AnimatedLine
            key={i}
            pathD={line.pathD}
            pathLength={line.pathLength}
            color={line.color}
            delay={line.delay}
            strokeWidth={strokeWidth}
            duration={duration}
          />
        ))}
      </Svg>

      {(startLabel || endLabel) && (
        <View style={[styles.xAxis, { width }]}>
          <Text style={styles.axisLabel}>{startLabel}</Text>
          <Text style={styles.axisLabel}>{endLabel}</Text>
        </View>
      )}

      <View style={styles.legend}>
        {lines.map((line, i) => (
          <View key={i} style={styles.legendItem}>
            <View style={[styles.legendDot, { backgroundColor: line.color }]} />
            <Text style={styles.legendLabel}>{line.label}</Text>
          </View>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
  },
  xAxis: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  axisLabel: {
    ...TYPE.caption,
    color: COLORS.textSecondary,
  },
  legend: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 20,
    marginTop: 24,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  legendDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  legendLabel: {
    ...TYPE.caption,
    color: COLORS.textSecondary,
  },
});
