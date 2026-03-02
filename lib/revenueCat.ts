import Purchases, { CustomerInfo, PurchasesPackage } from 'react-native-purchases';

const API_KEY = process.env.EXPO_PUBLIC_REVENUECAT_IOS_API_KEY || '';
const PRO_ENTITLEMENT_ID = 'pro';

let isInitialized = false;

export async function initializeRevenueCat(): Promise<void> {
  if (isInitialized) return;

  try {
    if (!API_KEY) {
      console.warn('RevenueCat API key not configured');
      return;
    }

    await Purchases.configure({ apiKey: API_KEY });
    isInitialized = true;

    if (__DEV__) {
      console.log('RevenueCat initialized');
    }
  } catch (error) {
    console.error('RevenueCat initialization failed:', error);
  }
}

/**
 * Check if user has active pro subscription
 */
export async function checkProStatus(): Promise<boolean> {
  if (!isInitialized) {
    await initializeRevenueCat();

    // Bail out if initialization still failed (e.g. missing API key)
    if (!isInitialized) {
      return false;
    }
  }

  try {
    const customerInfo = await Purchases.getCustomerInfo();

    // Check if user has any active entitlement
    // Entitlement identifier from RevenueCat dashboard: 'Custom'
    return Boolean(customerInfo.entitlements.active[PRO_ENTITLEMENT_ID]);
  } catch (error) {
    console.error('Failed to check pro status:', error);
    return false;
  }
}

/**
 * Get available subscription packages
 */
export async function getSubscriptionPackages(): Promise<PurchasesPackage[]> {
  try {
    const offerings = await Purchases.getOfferings();

    if (offerings.current && offerings.current.availablePackages.length > 0) {
      return offerings.current.availablePackages;
    }

    return [];
  } catch (error) {
    console.error('Failed to get subscription packages:', error);
    return [];
  }
}

/**
 * Purchase a subscription package
 */
export async function purchasePackage(pkg: PurchasesPackage): Promise<{ success: boolean; customerInfo?: CustomerInfo }> {
  try {
    const { customerInfo } = await Purchases.purchasePackage(pkg);

    return {
      success: true,
      customerInfo,
    };
  } catch (error: any) {
    // User cancelled or error occurred
    if (error.userCancelled) {
      console.log('User cancelled purchase');
    } else {
      console.error('Purchase failed:', error);
    }

    return { success: false };
  }
}

/**
 * Restore previous purchases
 */
export async function restorePurchases(): Promise<{ success: boolean; customerInfo?: CustomerInfo }> {
  try {
    const customerInfo = await Purchases.restorePurchases();

    return {
      success: true,
      customerInfo,
    };
  } catch (error) {
    console.error('Restore purchases failed:', error);
    return { success: false };
  }
}
