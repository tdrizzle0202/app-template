import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

// ── Types ────────────────────────────────────────────────
type DayState = 'completed' | 'missed' | 'today' | 'future';

type UserState = {
  // Onboarding data
  name: string;
  gender: string;
  nicotineTypes: string[];
  usageDuration: string;
  toleranceWindow: string;
  quitAttempts: string;
  triggers: string[];
  monthlySpend: number;
  referralSource: string;

  // Core state
  quitDate: string | null;
  relapses: number;
  onboardingComplete: boolean;
};

type UserActions = {
  completeOnboarding: (data: Omit<UserState, 'quitDate' | 'relapses' | 'onboardingComplete'>) => void;
  resetStreak: () => void;
  clearAllData: () => void;
};

const initialState: UserState = {
  name: '',
  gender: '',
  nicotineTypes: [],
  usageDuration: '',
  toleranceWindow: '',
  quitAttempts: '',
  triggers: [],
  monthlySpend: 0,
  referralSource: '',
  quitDate: null,
  relapses: 0,
  onboardingComplete: false,
};

// ── Store ────────────────────────────────────────────────
export const useUserStore = create<UserState & UserActions>()(
  persist(
    (set) => ({
      ...initialState,

      completeOnboarding: (data) => {
        // Start from day 1 — set quit date 24 hours in the past
        const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000);
        set({
          ...data,
          quitDate: yesterday.toISOString(),
          relapses: 0,
          onboardingComplete: true,
        });
      },

      resetStreak: () =>
        set((state) => ({
          quitDate: new Date().toISOString(),
          relapses: state.relapses + 1,
        })),

      clearAllData: () => set(initialState),
    }),
    {
      name: 'user-store',
      storage: createJSONStorage(() => AsyncStorage),
    },
  ),
);

// ── Pure Helper Functions ────────────────────────────────

export function getDaysSinceQuit(quitDate: string | null): number {
  if (!quitDate) return 0;
  const diff = Date.now() - new Date(quitDate).getTime();
  return Math.max(Math.floor(diff / (24 * 60 * 60 * 1000)), 0);
}

export function getHoursSinceQuit(quitDate: string | null): number {
  if (!quitDate) return 0;
  const diff = Date.now() - new Date(quitDate).getTime();
  return Math.max(Math.floor(diff / (60 * 60 * 1000)), 0);
}

export function getDailySpend(monthlySpend: number): number {
  return monthlySpend / 30;
}

export function getMoneySaved(quitDate: string | null, monthlySpend: number): number {
  const days = getDaysSinceQuit(quitDate);
  return Math.round(days * getDailySpend(monthlySpend));
}

export function getBrainRewirePercent(quitDate: string | null): number {
  const days = getDaysSinceQuit(quitDate);
  return Math.min(Math.round((days / 90) * 100), 100);
}

export function getPhaseLabel(quitDate: string | null): string {
  const days = getDaysSinceQuit(quitDate);
  if (days < 7) return 'INITIATE';
  if (days < 30) return 'BREAKTHROUGH';
  if (days < 60) return 'ESTABLISH';
  return 'MASTERY';
}

export function getWeekStates(quitDate: string | null): DayState[] {
  if (!quitDate) return Array(7).fill('future') as DayState[];

  const now = new Date();
  const today = now.getDay(); // 0 = Sunday
  // Week starts Monday: reorder so Monday = index 0
  const mondayOffset = today === 0 ? -6 : 1 - today;

  const quit = new Date(quitDate);
  const states: DayState[] = [];

  for (let i = 0; i < 7; i++) {
    const date = new Date(now);
    date.setDate(now.getDate() + mondayOffset + i);
    date.setHours(0, 0, 0, 0);

    const todayStart = new Date(now);
    todayStart.setHours(0, 0, 0, 0);

    if (date.getTime() === todayStart.getTime()) {
      states.push('today');
    } else if (date > todayStart) {
      states.push('future');
    } else if (date < new Date(quit.getFullYear(), quit.getMonth(), quit.getDate())) {
      states.push('future'); // before quit date, show as future/inactive
    } else {
      states.push('completed');
    }
  }

  return states;
}

export function getJoinDateString(quitDate: string | null): string {
  if (!quitDate) return '';
  const d = new Date(quitDate);
  return d.toLocaleString('default', { month: 'long', year: 'numeric' });
}
