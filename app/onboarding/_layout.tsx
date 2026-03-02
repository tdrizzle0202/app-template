import { Stack } from 'expo-router';
import { StyleSheet, View } from 'react-native';
import { COLORS } from '@/constants/theme';
import { AnimatedBackground } from '@/components/ui/AnimatedBackground';
import { LayoutBackgroundContext } from '@/components/ui/ScreenWrapper';

export default function OnboardingLayout() {
  return (
    <LayoutBackgroundContext.Provider value={true}>
      <View style={styles.container}>
        <AnimatedBackground />
        <Stack
          screenOptions={{
            headerShown: false,
            contentStyle: { backgroundColor: 'transparent' },
          }}
        >
          <Stack.Screen name="welcome" options={{ gestureEnabled: false }} />
        </Stack>
      </View>
    </LayoutBackgroundContext.Provider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.bg,
  },
});
