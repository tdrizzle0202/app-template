import React from 'react';
import Svg, { Defs, LinearGradient, Stop, Rect, Path, G, Circle, RadialGradient } from 'react-native-svg';

const SIZE = 24;
const RADIUS = 6;

export function InstagramIcon({ size = SIZE }: { size?: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      <Defs>
        <RadialGradient id="ig1" cx="30%" cy="107%" r="150%">
          <Stop offset="0%" stopColor="#fdf497" />
          <Stop offset="5%" stopColor="#fdf497" />
          <Stop offset="45%" stopColor="#fd5949" />
          <Stop offset="60%" stopColor="#d6249f" />
          <Stop offset="90%" stopColor="#285AEB" />
        </RadialGradient>
      </Defs>
      <Rect width="24" height="24" rx={RADIUS} fill="url(#ig1)" />
      <G stroke="#fff" strokeWidth="1.5" fill="none">
        <Rect x="5.5" y="5.5" width="13" height="13" rx="3.5" />
        <Circle cx="12" cy="12" r="3.2" />
        <Circle cx="16.2" cy="7.8" r="0.9" fill="#fff" stroke="none" />
      </G>
    </Svg>
  );
}

export function TikTokIcon({ size = SIZE }: { size?: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      <Rect width="24" height="24" rx={RADIUS} fill="#000" />
      <Path
        d="M16.5 4.5c-.2-1-.8-1.5-1.5-1.5h-1.5v10.5c0 1.4-1.1 2.5-2.5 2.5s-2.5-1.1-2.5-2.5 1.1-2.5 2.5-2.5c.3 0 .5 0 .8.1V9c-.3 0-.5-.1-.8-.1-2.5 0-4.5 2-4.5 4.5s2 4.5 4.5 4.5 4.5-2 4.5-4.5V9.5c.8.6 1.8 1 3 1V8.5c-1.5 0-2.5-1.5-2.5-4z"
        fill="#fff"
      />
      <Path
        d="M17 4.8c-.2-1-.8-1.8-1.5-1.8h-1v10.5c0 1.4-1.1 2.5-2.5 2.5s-2.5-1.1-2.5-2.5 1.1-2.5 2.5-2.5c.3 0 .5 0 .8.1V9c-.3 0-.5-.1-.8-.1-2.5 0-4.5 2-4.5 4.5s2 4.5 4.5 4.5 4.5-2 4.5-4.5V9.8c.8.6 1.8 1 3 1V8.8c-1.5 0-2.5-1.5-2.5-4z"
        fill="#25F4EE"
        opacity={0.7}
      />
      <Path
        d="M16 4.2c-.2-1-.8-1.2-1.5-1.2h-1v10.5c0 1.4-1.1 2.5-2.5 2.5s-2.5-1.1-2.5-2.5 1.1-2.5 2.5-2.5c.3 0 .5 0 .8.1V9c-.3 0-.5-.1-.8-.1-2.5 0-4.5 2-4.5 4.5s2 4.5 4.5 4.5 4.5-2 4.5-4.5V9.2c.8.6 1.8 1 3 1V8.2c-1.5 0-2.5-1.5-2.5-4z"
        fill="#FE2C55"
        opacity={0.7}
      />
    </Svg>
  );
}

export function FacebookIcon({ size = SIZE }: { size?: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      <Rect width="24" height="24" rx={RADIUS} fill="#1877F2" />
      <Path
        d="M16.5 15.5l.5-3.5h-3v-2.2c0-1 .5-1.8 1.8-1.8H17V5.3s-1-.2-2-.2c-2.1 0-3.5 1.3-3.5 3.6V12H8.5v3.5H11.5V24h3.5V15.5z"
        fill="#fff"
      />
    </Svg>
  );
}
