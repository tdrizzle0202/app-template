import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { ChevronLeft } from 'lucide-react-native';
import { PressableScale } from '@/components/ui/PressableScale';
import * as StoreReview from 'expo-store-review';
import { ScreenWrapper } from '@/components/ui/ScreenWrapper';
import { Button } from '@/components/ui/Button';
import { SegmentedProgressBar } from '@/components/ui/SegmentedProgressBar';
import { COLORS, TYPE } from '@/constants/theme';

export default function RateUs() {
  const router = useRouter();

  const handleRate = async () => {
    try {
      if (await StoreReview.isAvailableAsync()) {
        await StoreReview.requestReview();
      }
    } catch {}
    setTimeout(() => router.push('/onboarding/loading'), 1500);
  };

  return (
    <ScreenWrapper scrollable={false}>
      <View style={styles.topRow}>
        <PressableScale onPress={() => router.back()} scaleDown={0.9}>
          <ChevronLeft size={24} color={COLORS.textSecondary} />
        </PressableScale>
        <SegmentedProgressBar totalSteps={5} currentStep={4} />
      </View>

      <View style={styles.center}>
        <Text style={styles.star}>{'\u2B50'}</Text>
        <Text style={styles.heading}>Enjoying the app so far?</Text>
        <Text style={styles.subtitle}>A quick rating helps others discover us</Text>
      </View>

      <View style={styles.bottom}>
        <Button
          title={'\u2B50  Rate Us'}
          onPress={handleRate}
          style={styles.button}
        />
        <Button
          title="Maybe later"
          variant="glass"
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
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  star: {
    fontSize: 48,
  },
  heading: {
    ...TYPE.heading,
    color: COLORS.text,
    textAlign: 'center',
    marginTop: 16,
  },
  subtitle: {
    ...TYPE.body,
    color: COLORS.textSecondary,
    textAlign: 'center',
    marginTop: 8,
  },
  bottom: {
    paddingBottom: 16,
    gap: 12,
  },
  button: {
    height: 56,
  },
});
