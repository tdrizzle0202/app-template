import React, { useState } from 'react';
import { Dimensions, StyleSheet, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { ChevronLeft, Check } from 'lucide-react-native';
import { PressableScale } from '@/components/ui/PressableScale';
import { ScreenWrapper } from '@/components/ui/ScreenWrapper';
import { Button } from '@/components/ui/Button';
import { SegmentedProgressBar } from '@/components/ui/SegmentedProgressBar';
import { useOnboardingStore } from '@/store/useOnboardingStore';
import { COLORS, TYPE, FONTS, RADIUS } from '@/constants/theme';

const SCREEN_WIDTH = Dimensions.get('window').width;
const PILL_WIDTH = (SCREEN_WIDTH - 40 - 12) / 2;

const OPTIONS = [
  { emoji: '\u{1F630}', label: 'Stress' },
  { emoji: '\u{1F37B}', label: 'Social / Drinking' },
  { emoji: '\u{1F634}', label: 'Boredom' },
  { emoji: '\u{1F37D}\uFE0F', label: 'After meals' },
  { emoji: '\u2600\uFE0F', label: 'Morning' },
  { emoji: '\u{1F61F}', label: 'Anxiety' },
  { emoji: '\u{1F697}', label: 'Driving' },
  { emoji: '\u2615', label: 'With coffee' },
];

function TriggerPill({ emoji, label, selected, onPress }: {
  emoji: string; label: string; selected: boolean; onPress: () => void;
}) {
  return (
    <PressableScale
      onPress={onPress}
      scaleDown={0.97}
      haptic="Selection"
      style={[styles.triggerPill, selected && styles.triggerPillSelected]}
    >
      <Text style={styles.triggerEmoji}>{emoji}</Text>
      <Text style={styles.triggerLabel}>{label}</Text>
      {selected && (
        <View style={styles.checkCircle}>
          <Check size={10} color="#fff" strokeWidth={3} />
        </View>
      )}
    </PressableScale>
  );
}

export default function Triggers() {
  const router = useRouter();
  const setTriggers = useOnboardingStore((s) => s.setTriggers);
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
        <SegmentedProgressBar totalSteps={11} currentStep={7} />
      </View>

      <View style={styles.content}>
        <Text style={styles.heading}>When do you feel the urge most?</Text>
        <Text style={styles.subtitle}>Pick all that apply</Text>

        <View style={styles.grid}>
          {OPTIONS.map((opt) => (
            <TriggerPill
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
            setTriggers(selected);
            router.push('/onboarding/spending');
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
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginTop: 24,
  },
  triggerPill: {
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
    position: 'relative',
  },
  triggerPillSelected: {
    borderColor: COLORS.primary,
    backgroundColor: 'rgba(79,209,197,0.08)',
  },
  triggerEmoji: {
    fontSize: 20,
  },
  triggerLabel: {
    fontSize: 13,
    fontFamily: FONTS.medium,
    color: COLORS.text,
  },
  checkCircle: {
    position: 'absolute',
    top: 6,
    right: 6,
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  bottom: {
    paddingBottom: 16,
    paddingTop: 24,
  },
  button: {
    height: 56,
  },
});
