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
  { emoji: '\u{1F6AC}', label: 'Cigarettes' },
  { emoji: '\u{1F4A8}', label: 'Vape / E-cig' },
  { emoji: '\u{1FAD8}', label: 'Nicotine Pouches' },
  { emoji: '\u{1F33F}', label: 'Chewing Tobacco' },
  { emoji: '\u{1F937}', label: 'Other' },
];

export default function NicotineType() {
  const router = useRouter();
  const setNicotineTypes = useOnboardingStore((s) => s.setNicotineTypes);
  const [selected, setSelected] = useState<string[]>([]);

  const toggle = (label: string) => {
    setSelected((prev) =>
      prev.includes(label) ? prev.filter((l) => l !== label) : [...prev, label]
    );
  };

  return (
    <ScreenWrapper>
      <View style={styles.topRow}>
        <PressableScale onPress={() => router.back()} scaleDown={0.9}>
          <ChevronLeft size={24} color={COLORS.textSecondary} />
        </PressableScale>
        <SegmentedProgressBar totalSteps={11} currentStep={3} />
      </View>

      <View style={styles.content}>
        <Text style={styles.heading}>What are you leaving behind?</Text>
        <Text style={styles.subtitle}>Select all that apply</Text>

        <View style={styles.pills}>
          {OPTIONS.map((opt) => (
            <SelectablePill
              key={opt.label}
              emoji={opt.emoji}
              label={opt.label}
              selected={selected.includes(opt.label)}
              onPress={() => toggle(opt.label)}
            />
          ))}
        </View>
      </View>

      <View style={styles.bottom}>
        <Button
          title="Continue"
          onPress={() => {
            setNicotineTypes(selected);
            router.push('/onboarding/usage-history');
          }}
          disabled={selected.length === 0}
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
    paddingTop: 24,
  },
  button: {
    height: 56,
  },
});
