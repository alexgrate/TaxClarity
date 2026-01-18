import apiClient from "./apiClient";
import { ENDPOINTS } from "./config";

// Types for API responses - Based on PRD requirements
export interface UserProfile {
  id?: string;
  user_type: "salary_earner" | "freelancer" | "small_business_owner";
  income_range: string;
  state: string;
  created_at?: string;
}

export interface TaxCheckResult {
  applicable: boolean;
  tax_type: string;
  description: string;
  rate?: number;
}

export interface TaxExplanation {
  title: string;
  summary: string;
  details: string[];
  exemptions?: string[];
}

export interface ChecklistItem {
  id: string;
  title: string;
  description?: string;
  completed: boolean;
  due_date?: string;
}

// API Service functions - Matching PRD endpoints
export const taxClarityApi = {
  // ============ USER PROFILE (PRD: /api/profile/...) ============

  /**
   * Create user tax profile
   * PRD: POST /api/profile/create
   */
  createProfile: async (profileData: {
    user_type: string;
    income_range: string;
    state: string;
  }): Promise<UserProfile> => {
    const response = await apiClient.post(ENDPOINTS.createProfile, profileData);
    return response.data;
  },

  /**
   * Get user profile by ID
   * PRD: GET /api/profile/{user_id}
   */
  getProfile: async (userId: string): Promise<UserProfile> => {
    const response = await apiClient.get(`${ENDPOINTS.getProfile}/${userId}`);
    return response.data;
  },

  // ============ TAX INFORMATION (PRD: /api/tax/...) ============

  /**
   * Check tax applicability based on user profile
   * PRD: POST /api/tax/check
   */
  checkTaxApplicability: async (profileData: {
    user_type: string;
    income_range: string;
    state: string;
  }): Promise<TaxCheckResult[]> => {
    const response = await apiClient.post(ENDPOINTS.checkTax, profileData);
    return response.data;
  },

  /**
   * Get simplified tax explanation
   * PRD: GET /api/tax/explanation
   */
  getTaxExplanation: async (taxType?: string): Promise<TaxExplanation> => {
    const response = await apiClient.get(ENDPOINTS.getTaxExplanation, {
      params: taxType ? { tax_type: taxType } : {},
    });
    return response.data;
  },

  // ============ COMPLIANCE CHECKLIST (PRD: /api/checklist) ============

  /**
   * Get compliance checklist
   * PRD: GET /api/checklist
   */
  getChecklist: async (userId?: string): Promise<ChecklistItem[]> => {
    const response = await apiClient.get(ENDPOINTS.getChecklist, {
      params: userId ? { user_id: userId } : {},
    });
    return response.data;
  },

  /**
   * Update checklist item status
   */
  updateChecklistItem: async (
    itemId: string,
    completed: boolean,
  ): Promise<ChecklistItem> => {
    const response = await apiClient.patch(
      `${ENDPOINTS.updateChecklist}/${itemId}`,
      {
        completed,
      },
    );
    return response.data;
  },

  // ============ REMINDERS (Additional) ============

  /**
   * Create a reminder
   */
  createReminder: async (reminder: {
    title: string;
    date: string;
  }): Promise<any> => {
    const response = await apiClient.post(ENDPOINTS.reminders, reminder);
    return response.data;
  },

  /**
   * Get all reminders
   */
  getReminders: async (): Promise<any[]> => {
    const response = await apiClient.get(ENDPOINTS.reminders);
    return response.data;
  },
};

export default taxClarityApi;
