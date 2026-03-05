import React, { useState } from 'react';
import { Keyboard, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { useRouter } from 'expo-router';
import { ChevronLeft } from 'lucide-react-native';
import { PressableScale } from '@/components/ui/PressableScale';
import { ScreenWrapper } from '@/components/ui/ScreenWrapper';
import { Button } from '@/components/ui/Button';
import { SegmentedProgressBar } from '@/components/ui/SegmentedProgressBar';
import { GlassCard } from '@/components/ui/GlassCard';
import { useOnboardingStore } from '@/store/useOnboardingStore';
import { COLORS, TYPE, FONTS } from '@/constants/theme';

export default function Name() {
  const router = useRouter();
  const setName = useOnboardingStore((s) => s.setName);
  const [value, setValue] = useState('');

  const handleContinue = () => {
    setName(value.trim());
    router.push('/onboarding/gender');
  };

  const handleSkip = () => {
    setName('Friend');
    router.push('/onboarding/gender');
  };

  return (
    <ScreenWrapper scrollable={false}>
      <Pressable style={styles.flex} onPress={Keyboard.dismiss}>
        <View style={styles.topRow}>
          <PressableScale onPress={() => router.back()} scaleDown={0.9}>
            <ChevronLeft size={24} color={COLORS.textSecondary} />
          </PressableScale>
          <SegmentedProgressBar totalSteps={5} currentStep={1} />
        </View>

        <View style={styles.content}>
          <Text style={styles.heading}>What should we call you?</Text>
          <Text style={styles.subtitle}>We'll personalize your experience</Text>

          <GlassCard style={styles.inputCard}>
            <TextInput
              style={styles.input}
              placeholder="Your first name"
              placeholderTextColor={COLORS.textMuted}
              value={value}
              onChangeText={setValue}
              autoCapitalize="words"
              maxLength={20}
            />
          </GlassCard>
        </View>

        <View style={styles.bottom}>
          <Button
            title="Continue"
            onPress={handleContinue}
            disabled={value.trim().length === 0}
            style={styles.button}
          />
          <Pressable onPress={handleSkip}>
            <Text style={styles.skip}>Skip</Text>
          </Pressable>
        </View>
      </Pressable>
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
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
  inputCard: {
    marginTop: 24,
    padding: 0,
  },
  input: {
    height: 56,
    paddingHorizontal: 16,
    color: COLORS.text,
    fontSize: 20,
    fontWeight: '600',
    fontFamily: FONTS.semibold,
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
