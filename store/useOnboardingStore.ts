import { create } from 'zustand';

type OnboardingState = {
  name: string;
  gender: string;
  nicotineTypes: string[];
  usageDuration: string;
  toleranceWindow: string;
  quitAttempts: string;
  triggers: string[];
  monthlySpend: number;
  referralSource: string;

  setName: (name: string) => void;
  setGender: (gender: string) => void;
  setNicotineTypes: (types: string[]) => void;
  setUsageDuration: (duration: string) => void;
  setToleranceWindow: (window: string) => void;
  setQuitAttempts: (attempts: string) => void;
  setTriggers: (triggers: string[]) => void;
  setMonthlySpend: (spend: number) => void;
  setReferralSource: (source: string) => void;
  reset: () => void;
};

const initialState = {
  name: '',
  gender: '',
  nicotineTypes: [] as string[],
  usageDuration: '',
  toleranceWindow: '',
  quitAttempts: '',
  triggers: [] as string[],
  monthlySpend: 0,
  referralSource: '',
};

export const useOnboardingStore = create<OnboardingState>((set) => ({
  ...initialState,

  setName: (name) => set({ name }),
  setGender: (gender) => set({ gender }),
  setNicotineTypes: (nicotineTypes) => set({ nicotineTypes }),
  setUsageDuration: (usageDuration) => set({ usageDuration }),
  setToleranceWindow: (toleranceWindow) => set({ toleranceWindow }),
  setQuitAttempts: (quitAttempts) => set({ quitAttempts }),
  setTriggers: (triggers) => set({ triggers }),
  setMonthlySpend: (monthlySpend) => set({ monthlySpend }),
  setReferralSource: (referralSource) => set({ referralSource }),
  reset: () => set(initialState),
}));
