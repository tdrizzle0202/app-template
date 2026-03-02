import React from 'react';
import { StyleSheet, Text, View, TextStyle } from 'react-native';
import { useTypewriter } from '@/hooks/useTypewriter';

interface TypewriterTextProps {
  text: string;
  speed?: number;
  delay?: number;
  style?: TextStyle;
  highlightWord?: string;
  highlightStyle?: TextStyle;
  onDone?: () => void;
}

function renderWithHighlight(displayed: string, word: string, baseStyle: TextStyle | undefined, hlStyle: TextStyle) {
  const idx = displayed.indexOf(word);
  if (idx === -1) return <Text style={baseStyle}>{displayed}</Text>;
  return (
    <Text style={baseStyle}>
      {displayed.slice(0, idx)}
      <Text style={hlStyle}>{displayed.slice(idx, idx + word.length)}</Text>
      {displayed.slice(idx + word.length)}
    </Text>
  );
}

export function TypewriterText({
  text,
  speed = 20,
  delay = 0,
  style,
  highlightWord,
  highlightStyle,
  onDone,
}: TypewriterTextProps) {
  const { displayed, done } = useTypewriter(text, speed, delay);

  React.useEffect(() => {
    if (done && onDone) onDone();
  }, [done]);

  return (
    <View>
      {/* Invisible placeholder to reserve space */}
      <Text style={[style, { opacity: 0 }]}>{text}</Text>
      <View style={StyleSheet.absoluteFill}>
        {highlightWord && highlightStyle
          ? renderWithHighlight(displayed, highlightWord, style, highlightStyle)
          : <Text style={style}>{displayed}</Text>}
      </View>
    </View>
  );
}
