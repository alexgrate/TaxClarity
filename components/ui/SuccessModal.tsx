import React from 'react';
import {
  View,
  Text,
  Modal,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import { Colors, Fonts, Spacing, BorderRadius } from '@/constants/theme';
import { Button } from './Button';

interface SuccessModalProps {
  visible: boolean;
  message: string;
  onDone: () => void;
}

export const SuccessModal: React.FC<SuccessModalProps> = ({
  visible,
  message,
  onDone,
}) => {
  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onDone}
    >
      <View style={styles.overlay}>
        <View style={styles.modalContent}>
          {/* Checkmark Circle */}
          <View style={styles.checkmarkContainer}>
            <View style={styles.checkmarkCircle}>
              <Text style={styles.checkmark}>✓</Text>
            </View>
          </View>

          {/* Message */}
          <Text style={styles.message}>{message}</Text>

          {/* Done Button */}
          <Button title="Done" onPress={onDone} style={styles.button} />
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: Spacing.lg,
  },
  modalContent: {
    backgroundColor: Colors.white,
    borderRadius: BorderRadius.xl,
    padding: Spacing.xl,
    alignItems: 'center',
    width: '100%',
    maxWidth: 320,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 8,
  },
  checkmarkContainer: {
    marginBottom: Spacing.lg,
  },
  checkmarkCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: Colors.text.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkmark: {
    color: Colors.white,
    fontSize: 32,
    fontWeight: Fonts.weights.bold,
  },
  message: {
    fontSize: Fonts.sizes.lg,
    fontWeight: Fonts.weights.medium,
    color: Colors.text.primary,
    textAlign: 'center',
    marginBottom: Spacing.xl,
    lineHeight: 28,
  },
  button: {
    width: '100%',
  },
});
