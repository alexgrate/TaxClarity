import React from 'react';
import { View, StyleSheet } from 'react-native';
import Svg, { Path, Rect, G } from 'react-native-svg';
import { Colors } from '@/constants/theme';

interface LogoIconProps {
  size?: number;
  color?: string;
}

export const LogoIcon: React.FC<LogoIconProps> = ({
  size = 40,
  color = Colors.primary,
}) => {
  return (
    <View style={[styles.container, { width: size, height: size }]}>
      <Svg width={size} height={size} viewBox="0 0 40 40" fill="none">
        {/* Square background */}
        <Rect
          x="2"
          y="2"
          width="36"
          height="36"
          rx="4"
          stroke={color}
          strokeWidth="2"
          fill="transparent"
        />
        {/* Cross/Plus shape in center */}
        <G>
          {/* Vertical bar */}
          <Rect x="17" y="8" width="6" height="24" fill={color} rx="1" />
          {/* Horizontal bar */}
          <Rect x="8" y="17" width="24" height="6" fill={color} rx="1" />
        </G>
        {/* Corner accent squares */}
        <Rect x="8" y="8" width="5" height="5" fill={color} />
        <Rect x="27" y="8" width="5" height="5" fill={color} />
        <Rect x="8" y="27" width="5" height="5" fill={color} />
        <Rect x="27" y="27" width="5" height="5" fill={color} />
      </Svg>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
  },
});
