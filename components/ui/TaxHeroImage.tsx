import React from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import Svg, { Rect, Polygon, Circle, Ellipse, G, Defs, LinearGradient, Stop } from 'react-native-svg';
import { Colors } from '@/constants/theme';

const { width } = Dimensions.get('window');

interface TaxHeroImageProps {
  size?: number;
}

export const TaxHeroImage: React.FC<TaxHeroImageProps> = ({ size = width * 0.8 }) => {
  const scale = size / 300;

  return (
    <View style={[styles.container, { width: size, height: size * 0.7 }]}>
      <Svg width={size} height={size * 0.7} viewBox="0 0 300 210">
        <Defs>
          <LinearGradient id="redGradient" x1="0" y1="0" x2="1" y2="1">
            <Stop offset="0%" stopColor="#E53935" />
            <Stop offset="100%" stopColor="#B71C1C" />
          </LinearGradient>
          <LinearGradient id="darkRedGradient" x1="0" y1="0" x2="1" y2="1">
            <Stop offset="0%" stopColor="#B71C1C" />
            <Stop offset="100%" stopColor="#7F0000" />
          </LinearGradient>
        </Defs>

        {/* T Letter - 3D */}
        <G transform="translate(30, 90)">
          {/* Front face */}
          <Rect x="0" y="0" width="55" height="14" fill="url(#redGradient)" />
          <Rect x="18" y="14" width="19" height="55" fill="url(#redGradient)" />
          {/* Right side - 3D effect */}
          <Polygon points="55,0 65,12 65,26 55,14" fill="url(#darkRedGradient)" />
          <Polygon points="37,14 47,26 47,81 37,69" fill="url(#darkRedGradient)" />
          {/* Top 3D */}
          <Polygon points="0,0 10,12 65,12 55,0" fill="#C62828" />
        </G>

        {/* A Letter - 3D */}
        <G transform="translate(100, 90)">
          {/* Front face */}
          <Polygon points="28,0 56,69 44,69 37,52 19,52 12,69 0,69 28,0" fill="url(#redGradient)" />
          {/* Inner triangle (hole) */}
          <Polygon points="28,22 35,42 21,42" fill="white" />
          {/* Right side - 3D */}
          <Polygon points="56,69 66,81 38,12 28,0" fill="url(#darkRedGradient)" />
          {/* Top 3D */}
          <Polygon points="28,0 38,12 66,81 56,69" fill="#C62828" opacity="0.8" />
        </G>

        {/* X Letter - 3D */}
        <G transform="translate(165, 90)">
          {/* Front face */}
          <Polygon points="0,0 14,0 28,28 42,0 56,0 35,37 56,69 42,69 28,41 14,69 0,69 21,37" fill="url(#redGradient)" />
          {/* Right side - 3D */}
          <Polygon points="56,0 66,12 45,49 66,81 56,69 35,37" fill="url(#darkRedGradient)" />
          {/* Top 3D effects */}
          <Polygon points="42,0 52,12 66,12 56,0" fill="#C62828" />
        </G>

        {/* Running Figure */}
        <G transform="translate(105, 15)">
          {/* Shadow on letters */}
          <Ellipse cx="45" cy="85" rx="25" ry="8" fill="rgba(0,0,0,0.2)" />

          {/* Head */}
          <Circle cx="55" cy="12" r="11" fill="#E8E8E8" />
          <Circle cx="55" cy="12" r="9" fill="#F5F5F5" />

          {/* Body/Torso */}
          <Ellipse cx="50" cy="35" rx="12" ry="16" fill="#E8E8E8" />
          <Ellipse cx="50" cy="35" rx="10" ry="14" fill="#F5F5F5" />

          {/* Left Arm (back) */}
          <G transform="rotate(-45 35 30)">
            <Ellipse cx="35" cy="30" rx="4" ry="14" fill="#E8E8E8" />
          </G>

          {/* Right Arm (forward) */}
          <G transform="rotate(50 70 25)">
            <Ellipse cx="70" cy="25" rx="4" ry="16" fill="#E8E8E8" />
          </G>

          {/* Left Leg (back) */}
          <G transform="rotate(-35 35 60)">
            <Ellipse cx="35" cy="60" rx="5" ry="18" fill="#E8E8E8" />
          </G>

          {/* Right Leg (forward) */}
          <G transform="rotate(40 70 55)">
            <Ellipse cx="70" cy="55" rx="5" ry="20" fill="#E8E8E8" />
          </G>
        </G>

        {/* Floor reflection/shadow */}
        <Ellipse cx="150" cy="180" rx="100" ry="15" fill="rgba(0,0,0,0.08)" />
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
