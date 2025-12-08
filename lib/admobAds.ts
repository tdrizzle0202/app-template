import { Platform } from 'react-native';
import Constants, { ExecutionEnvironment } from 'expo-constants';
import MobileAds, { InterstitialAd, AdEventType, TestIds } from 'react-native-google-mobile-ads';
import { getCachedProStatus } from './proStatusStore';

// ============================================
// ADS MASTER SWITCH
// Set to true to enable ads, false to disable
// ============================================
const ADS_ENABLED = false;

const IOS_ID = process.env.EXPO_PUBLIC_ADMOB_IOS_INTERSTITIAL_ID || TestIds.INTERSTITIAL;
const ANDROID_ID = process.env.EXPO_PUBLIC_ADMOB_ANDROID_INTERSTITIAL_ID || TestIds.INTERSTITIAL;
const INTERSTITIAL_ID = Platform.OS === 'ios' ? IOS_ID : ANDROID_ID;

// Skip in Expo Go
const isExpoGo = Constants.executionEnvironment === ExecutionEnvironment.StoreClient;

let initialized = false;
let interstitialAd: InterstitialAd | null = null;
let adLoaded = false;
let loading = false;

function ensureInterstitial(): InterstitialAd {
  if (interstitialAd) return interstitialAd;

  interstitialAd = InterstitialAd.createForAdRequest(INTERSTITIAL_ID);

  interstitialAd.addAdEventListener(AdEventType.LOADED, () => {
    adLoaded = true;
    loading = false;
    if (__DEV__) console.log('[AdMob] Interstitial LOADED');
  });

  interstitialAd.addAdEventListener(AdEventType.ERROR, (e) => {
    loading = false;
    adLoaded = false;
    if (__DEV__) console.warn('[AdMob] Interstitial ERROR', e);
  });

  interstitialAd.addAdEventListener(AdEventType.CLOSED, () => {
    adLoaded = false; // consumed
    if (__DEV__) console.log('[AdMob] Interstitial CLOSED → preload next');
    void preloadInterstitialAd();
  });

  return interstitialAd;
}

function waitForLoaded(timeoutMs = 3000): Promise<boolean> {
  if (adLoaded) return Promise.resolve(true);

  return new Promise((resolve) => {
    let done = false;
    const ad = ensureInterstitial();

    const onLoaded = () => {
      if (done) return;
      done = true;
      cleanup();
      resolve(true);
    };

    const onError = () => {
      if (done) return;
      done = true;
      cleanup();
      resolve(false);
    };

    const t = setTimeout(() => {
      if (done) return;
      done = true;
      cleanup();
      resolve(false);
    }, timeoutMs);

    const subLoaded = ad.addAdEventListener(AdEventType.LOADED, onLoaded);
    const subError = ad.addAdEventListener(AdEventType.ERROR, onError);

    function cleanup() {
      clearTimeout(t);
      subLoaded();
      subError();
    }
  });
}

export async function initializeAdMob() {
  if (!ADS_ENABLED) {
    if (__DEV__) console.log('[AdMob] Skipped init (ads disabled)');
    return;
  }
  if (isExpoGo) {
    if (__DEV__) console.log('[AdMob] Skipped init (Expo Go)');
    return;
  }
  if (initialized) return;

  try {
    await MobileAds().initialize();
    initialized = true;
    ensureInterstitial();
    if (__DEV__) console.log('[AdMob] Initialized');
    void preloadInterstitialAd();
  } catch (e) {
    if (__DEV__) console.error('[AdMob] Init failed', e);
  }
}

export async function preloadInterstitialAd() {
  if (!ADS_ENABLED) return;
  if (isExpoGo) return;

  ensureInterstitial();

  if (adLoaded || loading) {
    if (__DEV__) console.log('[AdMob] Preload skipped (loaded or loading)');
    return;
  }

  loading = true;
  try {
    interstitialAd!.load();
    if (__DEV__) console.log('[AdMob] Interstitial LOAD requested');
  } catch (e) {
    loading = false;
    if (__DEV__) console.warn('[AdMob] Preload threw (rare)', e);
  }
}

export async function showWaitingAd(hasPro = false) {
  if (!ADS_ENABLED) {
    if (__DEV__) console.log('[AdMob] Skipped show (ads disabled)');
    return;
  }
  if (isExpoGo) {
    if (__DEV__) console.log('[AdMob] Skipped show (Expo Go)');
    return;
  }

  try {
    let shouldSkip = hasPro;
    if (!shouldSkip) {
      try {
        shouldSkip = await getCachedProStatus();
      } catch (err) {
        if (__DEV__) console.warn('[AdMob] Pro check failed; continuing as non-pro', err);
      }
    }
    if (shouldSkip) return;

    ensureInterstitial();

    if (!adLoaded) {
      void preloadInterstitialAd();
      const loaded = await waitForLoaded(3000);
      if (!loaded) {
        if (__DEV__) console.warn('[AdMob] Ad not ready after wait, skipping');
        return;
      }
    }

    try {
      await interstitialAd!.show();
      // After show, CLOSED listener will queue next preload.
    } catch (showErr) {
      if (__DEV__) console.warn('[AdMob] Show failed', showErr);
    }
  } catch (e) {
    if (__DEV__) console.warn('[AdMob] showWaitingAd swallowed error', e);
  }
}