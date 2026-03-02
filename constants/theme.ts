import { StyleSheet } from 'react-native';

// ── Fonts ──────────────────────────────────────────────
export const FONTS = {
  regular: 'PlusJakartaSans_400Regular',
  medium: 'PlusJakartaSans_500Medium',
  semibold: 'PlusJakartaSans_600SemiBold',
  bold: 'PlusJakartaSans_700Bold',
  extrabold: 'PlusJakartaSans_800ExtraBold',
} as const;

// ── Colors ─────────────────────────────────────────────
export const COLORS = {
  bg: '#07090E',
  bgElevated: '#0F1218',
  bgGlass: 'rgba(255,255,255,0.06)',
  bgGlassHover: 'rgba(255,255,255,0.09)',
  glassBorder: 'rgba(255,255,255,0.08)',
  glassBorderBright: 'rgba(255,255,255,0.14)',
  glassTopEdge: 'rgba(255,255,255,0.12)',

  primary: '#4FD1C5',
  primaryGlow: 'rgba(79,209,197,0.15)',
  primaryMuted: 'rgba(79,209,197,0.08)',

  accent: '#F6AD55',
  accentGlow: 'rgba(246,173,85,0.18)',

  danger: '#D95555',
  dangerGlow: 'rgba(217,85,85,0.15)',

  success: '#68D391',
  successGlow: 'rgba(104,211,145,0.12)',

  text: '#F0F2F5',
  textSecondary: '#8B98A9',
  textMuted: '#3E4A5A',

  black: '#000000',
  white: '#FFFFFF',
  gray500: '#6B7280',
  gray600: '#4B5563',
} as const;

// ── Typography ─────────────────────────────────────────
export const TYPE = StyleSheet.create({
  display: {
    fontSize: 34,
    lineHeight: 41,
    fontWeight: '800',
    fontFamily: FONTS.extrabold,
  },
  heading: {
    fontSize: 24,
    lineHeight: 31,
    fontWeight: '700',
    fontFamily: FONTS.bold,
  },
  subheading: {
    fontSize: 17,
    lineHeight: 23,
    fontWeight: '600',
    fontFamily: FONTS.semibold,
  },
  body: {
    fontSize: 16,
    lineHeight: 22,
    fontWeight: '500',
    fontFamily: FONTS.medium,
  },
  caption: {
    fontSize: 13,
    lineHeight: 18,
    fontWeight: '600',
    fontFamily: FONTS.semibold,
  },
  streakNumber: {
    fontSize: 64,
    lineHeight: 70,
    fontWeight: '900',
    fontFamily: FONTS.extrabold,
  },
});

// ── TEXT_STYLES alias (legacy names → TYPE) ──────────────
export const TEXT_STYLES = {
  h0: TYPE.display,
  h1: TYPE.heading,
  h2: TYPE.subheading,
  h3: TYPE.body,
  body: TYPE.body,
  small: TYPE.caption,
};

// ── Spacing (8px grid) ─────────────────────────────────
export const SPACING = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 40,
  '3xl': 48,
} as const;

// ── Radius ─────────────────────────────────────────────
export const RADIUS = {
  sm: 12,
  md: 16,
  lg: 22,
  xl: 28,
  pill: 40,
} as const;

// ── Shadows ────────────────────────────────────────────
export const SHADOWS = {
  sm: {
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 2,
  },
  md: {
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 4,
  },
  lg: {
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.5,
    shadowRadius: 16,
    elevation: 8,
  },
  glow: {
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 8,
  },
} as const;

// ── Animation ──────────────────────────────────────────
export const SPRING_CONFIG = {
  damping: 15,
  stiffness: 150,
} as const;

export const SPRING_BUTTON = {
  damping: 12,
  stiffness: 200,
  mass: 0.8,
} as const;

export const TIMING_CONFIG = {
  entrance: 400,
  counter: 600,
} as const;

// ── Glass Card ─────────────────────────────────────────
export const GLASS_BLUR = 16;

export const glassCard = StyleSheet.create({
  container: {
    backgroundColor: COLORS.bgGlass,
    borderWidth: 1,
    borderColor: COLORS.glassBorder,
    borderRadius: RADIUS.lg,
    borderCurve: 'continuous',
    overflow: 'hidden' as const,
  },
});
