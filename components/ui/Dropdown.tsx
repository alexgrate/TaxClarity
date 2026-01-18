import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Modal,
  FlatList,
  SafeAreaView,
} from 'react-native';
import { Colors, Fonts, Spacing, BorderRadius } from '@/constants/theme';

interface DropdownOption {
  label: string;
  value: string;
}

interface DropdownProps {
  placeholder: string;
  options: DropdownOption[];
  selectedValue: string | null;
  onSelect: (value: string) => void;
}

export const Dropdown: React.FC<DropdownProps> = ({
  placeholder,
  options,
  selectedValue,
  onSelect,
}) => {
  const [isOpen, setIsOpen] = useState(false);

  const selectedOption = options.find((opt) => opt.value === selectedValue);

  const handleSelect = (value: string) => {
    onSelect(value);
    setIsOpen(false);
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={styles.dropdownButton}
        onPress={() => setIsOpen(true)}
        activeOpacity={0.7}
      >
        <Text
          style={[
            styles.dropdownText,
            !selectedOption && styles.placeholderText,
          ]}
        >
          {selectedOption ? selectedOption.label : placeholder}
        </Text>
        <Text style={styles.arrow}>{isOpen ? '∧' : '∨'}</Text>
      </TouchableOpacity>

      <Modal
        visible={isOpen}
        transparent
        animationType="fade"
        onRequestClose={() => setIsOpen(false)}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setIsOpen(false)}
        >
          <SafeAreaView style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>{placeholder}</Text>
              <TouchableOpacity onPress={() => setIsOpen(false)}>
                <Text style={styles.closeButton}>✕</Text>
              </TouchableOpacity>
            </View>
            <FlatList
              data={options}
              keyExtractor={(item) => item.value}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={[
                    styles.optionItem,
                    item.value === selectedValue && styles.selectedOption,
                  ]}
                  onPress={() => handleSelect(item.value)}
                >
                  <Text
                    style={[
                      styles.optionText,
                      item.value === selectedValue && styles.selectedOptionText,
                    ]}
                  >
                    {item.label}
                  </Text>
                </TouchableOpacity>
              )}
              showsVerticalScrollIndicator={false}
            />
          </SafeAreaView>
        </TouchableOpacity>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: Spacing.sm,
  },
  dropdownButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: BorderRadius.md,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.md,
    backgroundColor: Colors.white,
  },
  dropdownText: {
    fontSize: Fonts.sizes.md,
    color: Colors.text.primary,
    flex: 1,
  },
  placeholderText: {
    color: Colors.text.secondary,
  },
  arrow: {
    fontSize: Fonts.sizes.md,
    color: Colors.text.secondary,
    marginLeft: Spacing.sm,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: Colors.white,
    borderTopLeftRadius: BorderRadius.xl,
    borderTopRightRadius: BorderRadius.xl,
    maxHeight: '70%',
    paddingBottom: Spacing.xl,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  modalTitle: {
    fontSize: Fonts.sizes.lg,
    fontWeight: Fonts.weights.semibold,
    color: Colors.text.primary,
  },
  closeButton: {
    fontSize: Fonts.sizes.xl,
    color: Colors.text.secondary,
    padding: Spacing.sm,
  },
  optionItem: {
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.lightGray,
  },
  selectedOption: {
    backgroundColor: Colors.lightGray,
  },
  optionText: {
    fontSize: Fonts.sizes.md,
    color: Colors.text.primary,
    textAlign: 'center',
  },
  selectedOptionText: {
    color: Colors.primary,
    fontWeight: Fonts.weights.medium,
  },
});
