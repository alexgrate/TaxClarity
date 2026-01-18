import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Header, Button, Checkbox, SuccessModal } from '@/components/ui';
import { Colors, Fonts, Spacing } from '@/constants/theme';
import { useTaxClarityStore } from '@/store';

export default function NextStepsScreen() {
  const router = useRouter();
  const { checklist, toggleChecklistItem, setHasCompletedOnboarding } =
    useTaxClarityStore();
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  const handleSetReminder = () => {
    // Check if all items are completed
    const allCompleted = checklist.every((item) => item.completed);

    if (allCompleted) {
      setShowSuccessModal(true);
    } else {
      // Show reminder set confirmation
      Alert.alert(
        'Reminder Set',
        'We will remind you to complete your tax compliance checklist.',
        [
          {
            text: 'OK',
            onPress: () => {
              setShowSuccessModal(true);
            },
          },
        ]
      );
    }
  };

  const handleDone = () => {
    setShowSuccessModal(false);
    setHasCompletedOnboarding(true);
    // Navigate back to home or show completion state
    router.replace('/');
  };

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      {/* Header */}
      <Header />

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Title */}
        <Text style={styles.title}>Your Next Steps</Text>

        {/* Checklist */}
        <View style={styles.checklistContainer}>
          {checklist.map((item) => (
            <Checkbox
              key={item.id}
              label={item.title}
              checked={item.completed}
              onPress={() => toggleChecklistItem(item.id)}
            />
          ))}
        </View>

        {/* Set Reminder Button */}
        <View style={styles.buttonContainer}>
          <Button title="Set Reminder" onPress={handleSetReminder} />
        </View>
      </ScrollView>

      {/* Success Modal */}
      <SuccessModal
        visible={showSuccessModal}
        message="You're on track to stay compliant"
        onDone={handleDone}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.white,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.xxl,
    paddingBottom: Spacing.xxl,
  },
  title: {
    fontSize: Fonts.sizes.xxl,
    fontWeight: Fonts.weights.bold,
    color: Colors.text.primary,
    textAlign: 'center',
    marginBottom: Spacing.xxl,
  },
  checklistContainer: {
    marginBottom: Spacing.xl,
  },
  buttonContainer: {
    alignItems: 'center',
    marginTop: Spacing.lg,
  },
});
