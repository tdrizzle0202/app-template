import React, { useState } from 'react';
import { Dimensions, StyleSheet, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { ChevronLeft } from 'lucide-react-native';
import { PressableScale } from '@/components/ui/PressableScale';
import { ScreenWrapper } from '@/components/ui/ScreenWrapper';
import { Button } from '@/components/ui/Button';
import { SegmentedProgressBar } from '@/components/ui/SegmentedProgressBar';
import { useOnboardingStore } from '@/store/useOnboardingStore';
import { COLORS, TYPE, FONTS, RADIUS } from '@/constants/theme';

const SCREEN_WIDTH = Dimensions.get('window').width;
const PILL_WIDTH = (SCREEN_WIDTH - 40 - 12) / 2;

const OPTIONS = [
  { emoji: '\u{1F468}', label: 'Male' },
  { emoji: '\u{1F469}', label: 'Female' },
  { emoji: '\u{1F9D1}', label: 'Non-binary' },
  { emoji: '\u{1F92B}', label: 'Prefer not to say' },
];

function GenderPill({ emoji, label, selected, onPress }: {
  emoji: string; label: string; selected: boolean; onPress: () => void;
}) {
  return (
    <PressableScale
      onPress={onPress}
      scaleDown={0.97}
      haptic="Selection"
      style={[styles.genderPill, selected && styles.genderPillSelected]}
    >
      <Text style={styles.genderEmoji}>{emoji}</Text>
      <Text style={styles.genderLabel}>{label}</Text>
    </PressableScale>
  );
}

export default function Gender() {
  const router = useRouter();
  const setGender = useOnboardingStore((s) => s.setGender);
  const [selected, setSelected] = useState('');

  return (
    <ScreenWrapper scrollable={false}>
      <View style={styles.topRow}>
        <PressableScale onPress={() => router.back()} scaleDown={0.9}>
          <ChevronLeft size={24} color={COLORS.textSecondary} />
        </PressableScale>
        <SegmentedProgressBar totalSteps={5} currentStep={2} />
      </View>

      <View style={styles.content}>
        <Text style={styles.heading}>Tell us about yourself</Text>
        <Text style={styles.subtitle}>This helps personalize your experience</Text>

        <View style={styles.grid}>
          {OPTIONS.map((opt) => (
            <GenderPill
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
            setGender(selected);
            router.push('/onboarding/hear-about');
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
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginTop: 24,
  },
  genderPill: {
    width: PILL_WIDTH,
    height: 64,
    borderRadius: RADIUS.md,
    borderCurve: 'continuous',
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
  },
  genderPillSelected: {
    borderColor: COLORS.primary,
    backgroundColor: 'rgba(79,209,197,0.08)',
  },
  genderEmoji: {
    fontSize: 20,
  },
  genderLabel: {
    fontSize: 13,
    fontFamily: FONTS.medium,
    color: COLORS.text,
  },
  bottom: {
    paddingBottom: 16,
  },
  button: {
    height: 56,
  },
});
