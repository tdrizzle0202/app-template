import AsyncStorage from '@react-native-async-storage/async-storage';

const UNIT_KEY = '@height_unit_preference';

export type UnitType = 'ft' | 'cm';

export async function getUnitPreference(): Promise<UnitType> {
  try {
    const unit = await AsyncStorage.getItem(UNIT_KEY);
    return (unit as UnitType) || 'ft';
  } catch (error) {
    console.error('Error getting unit preference:', error);
    return 'ft';
  }
}

export async function setUnitPreference(unit: UnitType): Promise<void> {
  try {
    await AsyncStorage.setItem(UNIT_KEY, unit);
  } catch (error) {
    console.error('Error setting unit preference:', error);
  }
}

export function formatHeight(heightCm: number, unit: UnitType): string {
  if (unit === 'cm') {
    return `${heightCm} cm`;
  }
  const totalInches = Math.round(heightCm / 2.54);
  const feet = Math.floor(totalInches / 12);
  const inches = totalInches % 12;
  return `${feet}′${inches}″`;
}
