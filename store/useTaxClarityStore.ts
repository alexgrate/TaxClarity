import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import AsyncStorage from "@react-native-async-storage/async-storage";

export interface UserProfile {
  userType: string | null;
  incomeRange: string | null;
  state: string | null;
}

export interface ChecklistItem {
  id: string;
  title: string;
  completed: boolean;
}

interface TaxClarityStore {
  // User Profile
  userProfile: UserProfile;
  setUserType: (type: string) => void;
  setIncomeRange: (range: string) => void;
  setState: (state: string) => void;
  resetProfile: () => void;

  // Checklist
  checklist: ChecklistItem[];
  setChecklist: (items: ChecklistItem[]) => void;
  toggleChecklistItem: (id: string) => void;
  resetChecklist: () => void;

  // App State
  hasCompletedOnboarding: boolean;
  setHasCompletedOnboarding: (value: boolean) => void;
}

const initialUserProfile: UserProfile = {
  userType: null,
  incomeRange: null,
  state: null,
};

const initialChecklist: ChecklistItem[] = [
  { id: "1", title: "Register with State IRS", completed: false },
  { id: "2", title: "File annual tax return", completed: false },
  { id: "3", title: "Keep income records", completed: false },
];

export const useTaxClarityStore = create<TaxClarityStore>()(
  persist(
    (set) => ({
      // User Profile
      userProfile: initialUserProfile,
      setUserType: (type) =>
        set((state) => ({
          userProfile: { ...state.userProfile, userType: type },
        })),
      setIncomeRange: (range) =>
        set((state) => ({
          userProfile: { ...state.userProfile, incomeRange: range },
        })),
      setState: (userState) =>
        set((state) => ({
          userProfile: { ...state.userProfile, state: userState },
        })),
      resetProfile: () => set({ userProfile: initialUserProfile }),

      // Checklist
      checklist: initialChecklist,
      setChecklist: (items) => set({ checklist: items }),
      toggleChecklistItem: (id) =>
        set((state) => ({
          checklist: state.checklist.map((item) =>
            item.id === id ? { ...item, completed: !item.completed } : item
          ),
        })),
      resetChecklist: () => set({ checklist: initialChecklist }),

      // App State
      hasCompletedOnboarding: false,
      setHasCompletedOnboarding: (value) =>
        set({ hasCompletedOnboarding: value }),
    }),
    {
      name: "taxclarity-storage",
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
