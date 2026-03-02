import React from 'react';
import Svg, { Ellipse, Circle, Path, G } from 'react-native-svg';

// ── Cloud ────────────────────────────────────────────────
// A puffy cumulus cloud shape. Scale via `width`; height auto-proportional.
export function Cloud({ width = 120, opacity = 0.85 }: { width?: number; opacity?: number }) {
  const height = width * 0.5;
  return (
    <Svg width={width} height={height} viewBox="0 0 120 60" opacity={opacity}>
      <G fill="#FFFFFF">
        <Ellipse cx="60" cy="40" rx="50" ry="18" />
        <Circle cx="40" cy="30" r="22" />
        <Circle cx="65" cy="25" r="26" />
        <Circle cx="85" cy="35" r="16" />
        <Circle cx="30" cy="38" r="14" />
      </G>
    </Svg>
  );
}

// ── Laurel Wreath ────────────────────────────────────────
// Left+right leaf branches that frame children. Standalone SVG.
export function LaurelWreath({ size = 48 }: { size?: number }) {
  const h = size * 1.2;
  return (
    <Svg width={size} height={h} viewBox="0 0 48 58">
      {/* Left branch */}
      <G fill="#48BB78" opacity={0.9}>
        <Ellipse cx="12" cy="14" rx="5" ry="9" transform="rotate(20 12 14)" />
        <Ellipse cx="8" cy="26" rx="5" ry="8" transform="rotate(10 8 26)" />
        <Ellipse cx="7" cy="38" rx="4.5" ry="7.5" transform="rotate(-5 7 38)" />
        <Ellipse cx="10" cy="49" rx="4" ry="7" transform="rotate(-15 10 49)" />
      </G>
      {/* Right branch */}
      <G fill="#48BB78" opacity={0.9}>
        <Ellipse cx="36" cy="14" rx="5" ry="9" transform="rotate(-20 36 14)" />
        <Ellipse cx="40" cy="26" rx="5" ry="8" transform="rotate(-10 40 26)" />
        <Ellipse cx="41" cy="38" rx="4.5" ry="7.5" transform="rotate(5 41 38)" />
        <Ellipse cx="38" cy="49" rx="4" ry="7" transform="rotate(15 38 49)" />
      </G>
      {/* Stems */}
      <Path d="M14 8 Q10 30 14 55" stroke="#2F855A" strokeWidth="1.5" fill="none" />
      <Path d="M34 8 Q38 30 34 55" stroke="#2F855A" strokeWidth="1.5" fill="none" />
    </Svg>
  );
}

// ── Sprout ───────────────────────────────────────────────
// Small two-leaf sprout for decorative use.
export function Sprout({ size = 28 }: { size?: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 28 28">
      {/* Stem */}
      <Path d="M14 28 Q14 16 14 10" stroke="#2F855A" strokeWidth="2" fill="none" strokeLinecap="round" />
      {/* Left leaf */}
      <Path d="M14 16 Q6 12 4 6 Q12 8 14 16Z" fill="#68D391" />
      {/* Right leaf */}
      <Path d="M14 12 Q22 8 24 2 Q16 4 14 12Z" fill="#48BB78" />
    </Svg>
  );
}
