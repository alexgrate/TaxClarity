// API Configuration
// Replace with your actual backend URL

// For local development - ASK YOUR TEAMMATE FOR THEIR IP ADDRESS
// When testing on physical device, both devices must be on the same WiFi network
const DEV_API_URL = 'http://TEAMMATE_IP:8000'; // Replace TEAMMATE_IP with actual IP (e.g., 192.168.1.100)

// For production - UPDATE WHEN BACKEND IS DEPLOYED (e.g., Render.com)
const PROD_API_URL = 'https://your-production-api.com';

// Toggle this based on your environment
export const API_BASE_URL = __DEV__ ? DEV_API_URL : PROD_API_URL;

// API Endpoints - Django REST Framework (trailing slashes required)
// These should match exactly what the backend implements
export const ENDPOINTS = {
  // User Profile
  createProfile: '/api/profile/create/',     // POST - Create user tax profile
  getProfile: '/api/profile',                // GET - /api/profile/{user_id}/
  
  // Tax Information
  checkTax: '/api/tax/check/',               // POST - Check tax applicability
  getTaxExplanation: '/api/tax/explanation/', // GET - Get simplified tax explanation
  getTaxRules: '/api/tax/rules/',            // GET - Get all tax rules
  
  // Compliance Checklist
  getChecklist: '/api/checklist/',           // GET - Get compliance checklist (requires ?user_id=)
  updateChecklist: '/api/checklist',         // PATCH - /api/checklist/{item_id}/
  
  // Reminders
  reminders: '/api/reminders/',              // GET/POST - Reminders (requires ?user_id= for GET)
};
