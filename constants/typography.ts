// constants/typography.ts

// Centralized font + text system

export const FONTS = {
  regular: "Nunito_400Regular",
  medium: "Nunito_500Medium",
  semibold: "Nunito_600SemiBold",
  bold: "Nunito_700Bold",
  extrabold: "Nunito_800ExtraBold",
  black: "Nunito_900Black",
} as const;

export const FONT_SIZES = {
  sm: 14,
  base: 16,
  lg: 18,
  xl: 20,
  "2xl": 24,
  "3xl": 28,
  "4xl": 32,
} as const;

export const TEXT_STYLES = {
  h00:  { fontSize: FONT_SIZES["4xl"], fontFamily: FONTS.black },
  h0:   { fontSize: FONT_SIZES["4xl"], fontFamily: FONTS.extrabold },
  h1:   { fontSize: FONT_SIZES["3xl"], fontFamily: FONTS.bold },
  h2:   { fontSize: FONT_SIZES["2xl"], fontFamily: FONTS.semibold },
  h3:   { fontSize: FONT_SIZES.xl,   fontFamily: FONTS.medium },
  body: { fontSize: FONT_SIZES.base, fontFamily: FONTS.regular },
  small:{ fontSize: FONT_SIZES.sm,   fontFamily: FONTS.regular },
} as const;