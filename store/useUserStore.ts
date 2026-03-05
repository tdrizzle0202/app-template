import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

// ── Types ────────────────────────────────────────────────
type UserState = {
  // Onboarding data
  name: string;
  gender: string;
  referralSource: string;

  // Core state
  onboardingComplete: boolean;
};

type UserActions = {
  completeOnboarding: (data: Omit<UserState, 'onboardingComplete'>) => void;
  clearAllData: () => void;
};

const initialState: UserState = {
  name: '',
  gender: '',
  referralSource: '',
  onboardingComplete: false,
};

// ── Store ────────────────────────────────────────────────
export const useUserStore = create<UserState & UserActions>()(
  persist(
    (set) => ({
      ...initialState,

      completeOnboarding: (data) => {
        set({
          ...data,
          onboardingComplete: true,
        });
      },

      clearAllData: () => set(initialState),
    }),
    {
      name: 'user-store',
      storage: createJSONStorage(() => AsyncStorage),
    },
  ),
);
