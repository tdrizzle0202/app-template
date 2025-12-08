import { create } from 'zustand';
import { checkProStatus as checkProStatusFromRevenueCat } from './revenueCat';

const PRO_STATUS_REFRESH_INTERVAL = 5 * 60 * 1000;

let refreshPromise: Promise<void> | null = null;

interface ProStatusStore {
  // State
  hasPro: boolean;
  isLoading: boolean;
  lastChecked: number | null;

  // Actions
  refreshProStatus: () => Promise<void>;
  setProStatus: (hasPro: boolean) => void;
}

export const useProStatusStore = create<ProStatusStore>((set, get) => ({
  // Initial state
  hasPro: false,
  isLoading: false,
  lastChecked: null,

  // Refresh Pro status from RevenueCat
  refreshProStatus: async () => {
    const { isLoading } = get();

    // Prevent multiple simultaneous checks
    if (isLoading) return;

    set({ isLoading: true });

    try {
      const hasPro = await checkProStatusFromRevenueCat();
      set({
        hasPro,
        isLoading: false,
        lastChecked: Date.now(),
      });
    } catch (error) {
      console.error('Failed to refresh Pro status:', error);
      set({ isLoading: false });
    }
  },

  // Manually set Pro status (useful after successful purchase)
  setProStatus: (hasPro: boolean) => {
    set({
      hasPro,
      lastChecked: Date.now()
    });
  },
}));

// Helper hook to check if Pro status needs refresh
export const useShouldRefreshProStatus = () => {
  const lastChecked = useProStatusStore((state) => state.lastChecked);
  if (!lastChecked) return true;
  return Date.now() - lastChecked > PRO_STATUS_REFRESH_INTERVAL;
};

async function ensureProStatusFresh(forceRefresh = false) {
  const state = useProStatusStore.getState();
  const isStale = forceRefresh || !state.lastChecked || Date.now() - state.lastChecked > PRO_STATUS_REFRESH_INTERVAL;

  if (!isStale) {
    return;
  }

  if (!refreshPromise) {
    refreshPromise = state.refreshProStatus().finally(() => {
      refreshPromise = null;
    });
  }

  await refreshPromise;
}

export async function getCachedProStatus(options: { forceRefresh?: boolean } = {}) {
  await ensureProStatusFresh(options.forceRefresh);
  return useProStatusStore.getState().hasPro;
}

export const PRO_STATUS_TTL_MS = PRO_STATUS_REFRESH_INTERVAL;
