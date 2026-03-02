import React, { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { ChevronLeft } from 'lucide-react-native';
import { PressableScale } from '@/components/ui/PressableScale';
import { ScreenWrapper } from '@/components/ui/ScreenWrapper';
import { Button } from '@/components/ui/Button';
import { SegmentedProgressBar } from '@/components/ui/SegmentedProgressBar';
import { SelectablePill } from '@/components/ui/SelectablePill';
import { useOnboardingStore } from '@/store/useOnboardingStore';
import { COLORS, TYPE, FONTS } from '@/constants/theme';

const OPTIONS = [
  { emoji: '\u{1F4B5}', label: 'Under $50/month', midpoint: 35 },
  { emoji: '\u{1F4B8}', label: '$50\u2013100/month', midpoint: 75 },
  { emoji: '\u{1F525}', label: '$100\u2013200/month', midpoint: 150 },
  { emoji: '\u{1F62C}', label: '$200\u2013300/month', midpoint: 250 },
  { emoji: '\u{1F480}', label: '$300+/month', midpoint: 350 },
];

export default function Spending() {
  const router = useRouter();
  const setMonthlySpend = useOnboardingStore((s) => s.setMonthlySpend);
  const [selected, setSelected] = useState('');

  const handleContinue = () => {
    const opt = OPTIONS.find((o) => o.label === selected);
    if (opt) setMonthlySpend(opt.midpoint);
    router.push('/onboarding/hear-about');
  };

  const handleSkip = () => {
    setMonthlySpend(100);
    router.push('/onboarding/hear-about');
  };

  return (
    <ScreenWrapper scrollable={false}>
      <View style={styles.topRow}>
        <PressableScale onPress={() => router.back()} scaleDown={0.9}>
          <ChevronLeft size={24} color={COLORS.textSecondary} />
        </PressableScale>
        <SegmentedProgressBar totalSteps={11} currentStep={8} />
      </View>

      <View style={styles.content}>
        <Text style={styles.heading}>How much do you spend on nicotine?</Text>
        <Text style={styles.subtitle}>Per month — your best guess</Text>

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
          onPress={handleContinue}
          disabled={!selected}
          style={styles.button}
        />
        <Pressable onPress={handleSkip}>
          <Text style={styles.skip}>I'd rather not say</Text>
        </Pressable>
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
    gap: 12,
    alignItems: 'center',
  },
  button: {
    height: 56,
  },
  skip: {
    fontSize: 13,
    color: COLORS.textMuted,
    fontFamily: FONTS.medium,
  },
});
