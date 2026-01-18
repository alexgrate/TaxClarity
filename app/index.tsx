import React from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Header, Button, TaxHeroImage } from '@/components/ui';
import { Colors, Fonts, Spacing } from '@/constants/theme';

const { width } = Dimensions.get('window');

export default function HomeScreen() {
  const router = useRouter();

  const handleGetStarted = () => {
    router.push('/profile-setup');
  };

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      {/* Header */}
      <Header />

      {/* Main Content */}
      <View style={styles.content}>
        {/* Hero Image - TAX illustration */}
        <View style={styles.imageContainer}>
          <TaxHeroImage size={width * 0.85} />
        </View>

        {/* Headline */}
        <Text style={styles.headline}>
          Understanding Nigeria's{'\n'}2026 tax reforms in minutes
        </Text>

        {/* CTA Button */}
        <Button
          title="Get Started"
          onPress={handleGetStarted}
          style={styles.button}
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.white,
  },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: Spacing.lg,
  },
  imageContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.xl,
  },
  headline: {
    fontSize: Fonts.sizes.xxl,
    fontWeight: Fonts.weights.bold,
    color: Colors.text.primary,
    textAlign: 'center',
    lineHeight: 36,
    marginBottom: Spacing.xxl,
  },
  button: {
    marginTop: Spacing.lg,
  },
});
