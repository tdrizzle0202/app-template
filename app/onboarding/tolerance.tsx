import React, { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { ChevronLeft } from 'lucide-react-native';
import { PressableScale } from '@/components/ui/PressableScale';
import { ScreenWrapper } from '@/components/ui/ScreenWrapper';
import { Button } from '@/components/ui/Button';
import { SegmentedProgressBar } from '@/components/ui/SegmentedProgressBar';
import { SelectablePill } from '@/components/ui/SelectablePill';
import { useOnboardingStore } from '@/store/useOnboardingStore';
import { COLORS, TYPE } from '@/constants/theme';

const TOLERANCE_OPTIONS = [
  'Less than 1 hour',
  '1\u20133 hours',
  '3\u20136 hours',
  '6\u201312 hours',
  'A full day or more',
];

export default function Tolerance() {
  const router = useRouter();
  const setToleranceWindow = useOnboardingStore((s) => s.setToleranceWindow);
  const [tolerance, setTolerance] = useState('');

  return (
    <ScreenWrapper>
      <View style={styles.topRow}>
        <PressableScale onPress={() => router.back()} scaleDown={0.9}>
          <ChevronLeft size={24} color={COLORS.textSecondary} />
        </PressableScale>
        <SegmentedProgressBar totalSteps={11} currentStep={5} />
      </View>

      <View style={styles.content}>
        <Text style={styles.heading}>How long can you go without?</Text>
        <View style={styles.pills}>
          {TOLERANCE_OPTIONS.map((opt) => (
            <SelectablePill
              key={opt}
              label={opt}
              selected={tolerance === opt}
              onPress={() => setTolerance(opt)}
            />
          ))}
        </View>
      </View>

      <View style={styles.bottom}>
        <Button
          title="Continue"
          onPress={() => {
            setToleranceWindow(tolerance);
            router.push('/onboarding/quit-attempts');
          }}
          disabled={!tolerance}
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
    marginTop: 32,
    flex: 1,
  },
  heading: {
    ...TYPE.heading,
    color: COLORS.text,
  },
  pills: {
    marginTop: 16,
    gap: 8,
  },
  bottom: {
    paddingBottom: 16,
    paddingTop: 24,
  },
  button: {
    height: 56,
  },
});
