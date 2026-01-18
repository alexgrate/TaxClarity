import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Colors, Fonts, Spacing } from '@/constants/theme';
import { LogoIcon } from './LogoIcon';

interface HeaderProps {
  showNav?: boolean;
  onNavPress?: (route: string) => void;
}

export const Header: React.FC<HeaderProps> = ({
  showNav = false,
  onNavPress,
}) => {
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.container, { paddingTop: insets.top + Spacing.sm }]}>
      <View style={styles.logoContainer}>
        <LogoIcon size={32} />
        <Text style={styles.logoText}>TaxClarity NG</Text>
      </View>

      {showNav && (
        <View style={styles.navContainer}>
          <TouchableOpacity onPress={() => onNavPress?.('home')}>
            <Text style={styles.navItem}>Home</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => onNavPress?.('about')}>
            <Text style={styles.navItem}>About Us</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => onNavPress?.('contact')}>
            <Text style={styles.navItem}>Contact</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.lg,
    paddingBottom: Spacing.md,
    backgroundColor: Colors.white,
  },
  logoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  logoText: {
    fontSize: Fonts.sizes.lg,
    fontWeight: Fonts.weights.bold,
    color: Colors.text.primary,
    marginLeft: Spacing.sm,
  },
  navContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  navItem: {
    fontSize: Fonts.sizes.sm,
    color: Colors.text.primary,
    marginLeft: Spacing.md,
  },
});
