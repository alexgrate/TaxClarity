import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useForm, Controller } from 'react-hook-form';
import { Header, Button, RadioButton, Dropdown } from '@/components/ui';
import { Colors, Fonts, Spacing } from '@/constants/theme';
import { USER_TYPES, INCOME_RANGES, NIGERIAN_STATES } from '@/constants/data';
import { useTaxClarityStore } from '@/store';
import { taxClarityApi } from '@/services';

interface FormData {
  userType: string;
  incomeRange: string;
  state: string;
}

export default function ProfileSetupScreen() {
  const router = useRouter();
  const { setUserType, setIncomeRange, setState } = useTaxClarityStore();
  const [isLoading, setIsLoading] = useState(false);

  const {
    control,
    handleSubmit,
    formState: { isValid },
  } = useForm<FormData>({
    defaultValues: {
      userType: '',
      incomeRange: '',
      state: '',
    },
    mode: 'onChange',
  });

  const stateOptions = NIGERIAN_STATES.map((state) => ({
    label: state,
    value: state,
  }));

  const onSubmit = async (data: FormData) => {
    // Save to local state
    setUserType(data.userType);
    setIncomeRange(data.incomeRange);
    setState(data.state);

    // Optional: Save to backend API
    // Uncomment the code below when backend is ready
    /*
    setIsLoading(true);
    try {
      await taxClarityApi.createProfile({
        userType: data.userType,
        incomeRange: data.incomeRange,
        state: data.state,
      });
      router.push('/next-steps');
    } catch (error) {
      Alert.alert(
        'Error',
        'Failed to save profile. Please try again.',
        [{ text: 'OK' }]
      );
      console.error('Profile save error:', error);
    } finally {
      setIsLoading(false);
    }
    */

    // For now, just navigate (remove this when backend is ready)
    router.push('/next-steps');
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
        {/* User Type Selection */}
        <View style={styles.section}>
          <Controller
            control={control}
            name="userType"
            rules={{ required: true }}
            render={({ field: { onChange, value } }) => (
              <View>
                {USER_TYPES.map((type) => (
                  <RadioButton
                    key={type.value}
                    label={type.label}
                    selected={value === type.value}
                    onPress={() => onChange(type.value)}
                  />
                ))}
              </View>
            )}
          />
        </View>

        {/* Income Range Dropdown */}
        <View style={styles.section}>
          <Controller
            control={control}
            name="incomeRange"
            rules={{ required: true }}
            render={({ field: { onChange, value } }) => (
              <Dropdown
                placeholder="Enter income range in Naira"
                options={INCOME_RANGES}
                selectedValue={value}
                onSelect={onChange}
              />
            )}
          />
        </View>

        {/* State Dropdown */}
        <View style={styles.section}>
          <Controller
            control={control}
            name="state"
            rules={{ required: true }}
            render={({ field: { onChange, value } }) => (
              <Dropdown
                placeholder="Enter the state you live"
                options={stateOptions}
                selectedValue={value}
                onSelect={onChange}
              />
            )}
          />
        </View>

        {/* Submit Button */}
        <View style={styles.buttonContainer}>
          <Button
            title="Get Started"
            onPress={handleSubmit(onSubmit)}
            disabled={!isValid || isLoading}
            loading={isLoading}
          />
        </View>
      </ScrollView>
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
    paddingTop: Spacing.xl,
    paddingBottom: Spacing.xxl,
  },
  section: {
    marginBottom: Spacing.lg,
  },
  buttonContainer: {
    alignItems: 'center',
    marginTop: Spacing.xl,
  },
});
