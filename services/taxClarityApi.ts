import apiClient from './apiClient';
import { ENDPOINTS } from './config';

// Types for API responses (adjust based on your backend)
export interface UserProfile {
  id: string;
  userType: string;
  incomeRange: string;
  state: string;
  email?: string;
  name?: string;
}

export interface TaxRule {
  id: string;
  title: string;
  description: string;
  applicableTo: string[];
  incomeThreshold?: number;
}

export interface ChecklistItem {
  id: string;
  title: string;
  completed: boolean;
  dueDate?: string;
}

export interface Reminder {
  id: string;
  title: string;
  date: string;
  completed: boolean;
}

// API Service functions
export const taxClarityApi = {
  // ============ USER PROFILE ============
  
  /**
   * Get user profile
   */
  getProfile: async (): Promise<UserProfile> => {
    const response = await apiClient.get(ENDPOINTS.userProfile);
    return response.data;
  },

  /**
   * Update user profile
   */
  updateProfile: async (profileData: Partial<UserProfile>): Promise<UserProfile> => {
    const response = await apiClient.put(ENDPOINTS.updateProfile, profileData);
    return response.data;
  },

  /**
   * Create user profile (for new users)
   */
  createProfile: async (profileData: {
    userType: string;
    incomeRange: string;
    state: string;
  }): Promise<UserProfile> => {
    const response = await apiClient.post(ENDPOINTS.userProfile, profileData);
    return response.data;
  },

  // ============ TAX INFORMATION ============

  /**
   * Get tax rules based on user profile
   */
  getTaxRules: async (userType: string, incomeRange: string, state: string): Promise<TaxRule[]> => {
    const response = await apiClient.get(ENDPOINTS.taxRules, {
      params: { userType, incomeRange, state },
    });
    return response.data;
  },

  /**
   * Calculate tax based on income
   */
  calculateTax: async (income: number, userType: string): Promise<{ taxAmount: number; breakdown: any }> => {
    const response = await apiClient.post(ENDPOINTS.taxCalculation, {
      income,
      userType,
    });
    return response.data;
  },

  // ============ COMPLIANCE CHECKLIST ============

  /**
   * Get compliance checklist
   */
  getChecklist: async (): Promise<ChecklistItem[]> => {
    const response = await apiClient.get(ENDPOINTS.complianceChecklist);
    return response.data;
  },

  /**
   * Update checklist item status
   */
  updateChecklistItem: async (itemId: string, completed: boolean): Promise<ChecklistItem> => {
    const response = await apiClient.patch(`${ENDPOINTS.updateChecklist}/${itemId}`, {
      completed,
    });
    return response.data;
  },

  // ============ REMINDERS ============

  /**
   * Get all reminders
   */
  getReminders: async (): Promise<Reminder[]> => {
    const response = await apiClient.get(ENDPOINTS.reminders);
    return response.data;
  },

  /**
   * Create a reminder
   */
  createReminder: async (reminder: { title: string; date: string }): Promise<Reminder> => {
    const response = await apiClient.post(ENDPOINTS.createReminder, reminder);
    return response.data;
  },

  /**
   * Delete a reminder
   */
  deleteReminder: async (reminderId: string): Promise<void> => {
    await apiClient.delete(`${ENDPOINTS.reminders}/${reminderId}`);
  },
};

export default taxClarityApi;
