import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { ChevronLeft } from 'lucide-react-native';
import { PressableScale } from '@/components/ui/PressableScale';
import { ScreenWrapper } from '@/components/ui/ScreenWrapper';
import { Button } from '@/components/ui/Button';
import { SegmentedProgressBar } from '@/components/ui/SegmentedProgressBar';
import { LineChart } from '@/components/ui/LineChart';
import { COLORS, TYPE } from '@/constants/theme';

const CHART_LINES = [
  { data: [0.95, 0.75, 0.45, 0.22, 0.10], color: COLORS.danger, label: 'Vaping', delay: 200 },
  { data: [0.15, 0.30, 0.55, 0.78, 0.90], color: COLORS.success, label: 'Health', delay: 500 },
];

export default function Infographic() {
  const router = useRouter();

  return (
    <ScreenWrapper scrollable={false}>
      <View style={styles.topRow}>
        <PressableScale onPress={() => router.back()} scaleDown={0.9}>
          <ChevronLeft size={24} color={COLORS.textSecondary} />
        </PressableScale>
        <SegmentedProgressBar totalSteps={11} currentStep={11} />
      </View>

      <View style={styles.content}>
        <Text style={styles.heading}>Quitting changes everything</Text>
        <LineChart
          lines={CHART_LINES}
          startLabel="Day 1"
          endLabel="Day 90"
        />
      </View>

      <View style={styles.bottom}>
        <Button
          title="Got it!"
          onPress={() => router.push('/onboarding/loading')}
          style={styles.button}
        />
      </View>
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  heading: {
    ...TYPE.heading,
    color: COLORS.text,
    textAlign: 'center',
    marginBottom: 32,
  },
  bottom: {
    paddingBottom: 16,
    gap: 12,
  },
  button: {
    height: 56,
  },
});
