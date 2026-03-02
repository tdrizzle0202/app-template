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
import { InstagramIcon, TikTokIcon, FacebookIcon } from '@/components/icons/SocialIcons';

const OPTIONS = [
  { icon: <InstagramIcon />, label: 'Instagram' },
  { icon: <TikTokIcon />, label: 'TikTok' },
  { icon: <FacebookIcon />, label: 'Facebook' },
  { emoji: '\u{1F464}', label: 'Friend or family' },
  { emoji: '\u{1F50D}', label: 'App Store search' },
  { emoji: '\u{1F310}', label: 'Website or blog' },
];

export default function HearAbout() {
  const router = useRouter();
  const setReferralSource = useOnboardingStore((s) => s.setReferralSource);
  const [selected, setSelected] = useState('');

  return (
    <ScreenWrapper scrollable={false}>
      <View style={styles.topRow}>
        <PressableScale onPress={() => router.back()} scaleDown={0.9}>
          <ChevronLeft size={24} color={COLORS.textSecondary} />
        </PressableScale>
        <SegmentedProgressBar totalSteps={11} currentStep={9} />
      </View>

      <View style={styles.content}>
        <Text style={styles.heading}>How did you hear about Fein?</Text>
        <Text style={styles.subtitle}>This helps us reach more people like you</Text>

        <View style={styles.pills}>
          {OPTIONS.map((opt) => (
            <SelectablePill
              key={opt.label}
              emoji={'emoji' in opt ? opt.emoji : undefined}
              icon={'icon' in opt ? opt.icon : undefined}
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
            setReferralSource(selected);
            router.push('/onboarding/rate-us');
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
