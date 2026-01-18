// API Configuration
// Replace with your actual backend URL

// For local development - ASK YOUR TEAMMATE FOR THEIR IP ADDRESS
// When testing on physical device, both devices must be on the same WiFi network
const DEV_API_URL = 'http://TEAMMATE_IP:8000'; // Replace TEAMMATE_IP with actual IP (e.g., 192.168.1.100)

// For production - UPDATE WHEN BACKEND IS DEPLOYED (e.g., Render.com)
const PROD_API_URL = 'https://your-production-api.com';

// Toggle this based on your environment
export const API_BASE_URL = __DEV__ ? DEV_API_URL : PROD_API_URL;

// API Endpoints - Based on PRD specification
// These should match exactly what the backend implements
export const ENDPOINTS = {
  // User Profile (PRD: /api/profile/...)
  createProfile: '/api/profile/create',      // POST - Create user tax profile
  getProfile: '/api/profile',                // GET - Retrieve user profile (add /{user_id})
  
  // Tax Information (PRD: /api/tax/...)
  checkTax: '/api/tax/check',                // POST - Check tax applicability
  getTaxExplanation: '/api/tax/explanation', // GET - Get simplified tax explanation
  
  // Compliance (PRD: /api/checklist)
  getChecklist: '/api/checklist',            // GET - Get compliance checklist
  updateChecklist: '/api/checklist',         // PATCH - Update checklist item
  
  // Additional endpoints (not in PRD but useful)
  reminders: '/api/reminders',               // GET/POST - Reminders
};
