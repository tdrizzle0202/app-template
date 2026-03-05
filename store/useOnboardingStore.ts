import { create } from 'zustand';

type OnboardingState = {
  name: string;
  gender: string;
  referralSource: string;

  setName: (name: string) => void;
  setGender: (gender: string) => void;
  setReferralSource: (source: string) => void;
  reset: () => void;
};

const initialState = {
  name: '',
  gender: '',
  referralSource: '',
};

export const useOnboardingStore = create<OnboardingState>((set) => ({
  ...initialState,

  setName: (name) => set({ name }),
  setGender: (gender) => set({ gender }),
  setReferralSource: (referralSource) => set({ referralSource }),
  reset: () => set(initialState),
}));
