export type NicotineType = 'cigarettes' | 'vape' | 'pouches' | 'chewing' | 'other';

export type User = {
  quitDate: Date;
  quitReason: string;
  nicotineType: NicotineType;
  dailySpend: number;
  onboardingComplete: boolean;
};

export type CravingTrigger = 'stress' | 'social' | 'boredom' | 'after_meal' | 'morning' | 'alcohol' | 'anxiety' | 'custom';

export type CravingLog = {
  id: string;
  timestamp: Date;
  intensity: 1 | 2 | 3 | 4 | 5;
  trigger: CravingTrigger;
  survived: boolean;
};

export type Milestone = {
  id: string;
  title: string;
  description: string;
  hoursRequired: number;
  icon: string;
  unlocked: boolean;
  unlockedAt: Date | null;
};

export type MascotState = 'idle' | 'happy' | 'celebrating' | 'concerned' | 'zen';
