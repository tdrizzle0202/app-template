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

const OPTIONS = [
  { emoji: '\u{1F331}', label: 'This is my first time' },
  { emoji: '\u270C\uFE0F', label: 'Once or twice' },
  { emoji: '\u{1F504}', label: 'A few times (3\u20135)' },
  { emoji: '\u{1F4AA}', label: 'Many times (5+)' },
  { emoji: '\u{1F3C6}', label: "I've lost count" },
];

export default function QuitAttempts() {
  const router = useRouter();
  const setQuitAttempts = useOnboardingStore((s) => s.setQuitAttempts);
  const [selected, setSelected] = useState('');

  return (
    <ScreenWrapper scrollable={false}>
      <View style={styles.topRow}>
        <PressableScale onPress={() => router.back()} scaleDown={0.9}>
          <ChevronLeft size={24} color={COLORS.textSecondary} />
        </PressableScale>
        <SegmentedProgressBar totalSteps={11} currentStep={6} />
      </View>

      <View style={styles.content}>
        <Text style={styles.heading}>How many times have you tried to quit?</Text>
        <Text style={styles.subtitle}>No judgment. Every attempt taught you something.</Text>

        <View style={styles.pills}>
          {OPTIONS.map((opt) => (
            <SelectablePill
              key={opt.label}
              emoji={opt.emoji}
              label={opt.label}
              selected={selected === opt.label}
              onPress={() => setSelected(opt.label)}
            />
          ))}
        </View>
      </View>

      <View style={styles.bottom}>
        <Button
          title="Continue"
          onPress={() => {
            setQuitAttempts(selected);
            router.push('/onboarding/triggers');
          }}
          disabled={!selected}
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
  subtitle: {
    ...TYPE.body,
    color: COLORS.textSecondary,
    marginTop: 8,
  },
  pills: {
    marginTop: 24,
    gap: 10,
  },
  bottom: {
    paddingBottom: 16,
  },
  button: {
    height: 56,
  },
});
