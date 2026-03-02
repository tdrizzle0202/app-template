import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Check } from 'lucide-react-native';
import { PressableScale } from '@/components/ui/PressableScale';
import { COLORS, RADIUS, FONTS } from '@/constants/theme';

interface SelectablePillProps {
  label: string;
  emoji?: string;
  icon?: React.ReactNode;
  selected: boolean;
  onPress: () => void;
}

export function SelectablePill({ label, emoji, icon, selected, onPress }: SelectablePillProps) {
  return (
    <PressableScale
      onPress={onPress}
      scaleDown={0.97}
      haptic="Medium"
      style={[
        styles.pill,
        selected && styles.pillSelected,
      ]}
    >
      <View style={styles.row}>
        {icon ? icon : emoji ? <Text style={styles.emoji}>{emoji}</Text> : null}
        <Text style={styles.label}>{label}</Text>
      </View>
      {selected && (
        <View style={styles.checkCircle}>
          <Check size={14} color="#fff" strokeWidth={3} />
        </View>
      )}
    </PressableScale>
  );
}

const styles = StyleSheet.create({
  pill: {
    height: 56,
    borderRadius: RADIUS.md,
    borderCurve: 'continuous',
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
  },
  pillSelected: {
    borderColor: COLORS.primary,
    backgroundColor: 'rgba(79,209,197,0.08)',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  emoji: {
    fontSize: 20,
  },
  label: {
    fontSize: 16,
    fontFamily: FONTS.medium,
    color: COLORS.text,
  },
  checkCircle: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
