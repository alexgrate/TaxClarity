// API Configuration

// ===========================================
// HOW TO USE:
// ===========================================
// 1. If testing on WEB (Expo Web): Use 'http://localhost:8000'
// 2. If testing on PHONE (Expo Go): Use your computer's local IP
//    - Find your IP: Run 'ipconfig' in terminal, look for IPv4 Address
//    - Example: 'http://192.168.1.100:8000'
// 3. Both frontend and backend must be on the same WiFi network
// ===========================================

// For Expo Web testing (browser)
const LOCALHOST_URL = "http://localhost:8000";

// For Expo Go on physical device - Replace with YOUR computer's IP
// Run 'ipconfig' in terminal to find your IPv4 address
const LOCAL_NETWORK_URL = "http://192.168.1.100:8000"; // ← UPDATE THIS

// For production deployment
const PROD_API_URL = "https://your-production-api.com";

// Choose which URL to use based on how you're testing
// Options: LOCALHOST_URL (web), LOCAL_NETWORK_URL (phone), PROD_API_URL (production)
export const API_BASE_URL = __DEV__ ? LOCAL_NETWORK_URL : PROD_API_URL;

// API Endpoints - Django REST Framework (trailing slashes required)
// These should match exactly what the backend implements
export const ENDPOINTS = {
  // User Profile
  createProfile: "/api/profile/create/", // POST - Create user tax profile
  getProfile: "/api/profile", // GET - /api/profile/{user_id}/

  // Tax Information
  checkTax: "/api/tax/check/", // POST - Check tax applicability
  getTaxExplanation: "/api/tax/explanation/", // GET - Get simplified tax explanation
  getTaxRules: "/api/tax/rules/", // GET - Get all tax rules

  // Compliance Checklist
  getChecklist: "/api/checklist/", // GET - Get compliance checklist (requires ?user_id=)
  updateChecklist: "/api/checklist", // PATCH - /api/checklist/{item_id}/

  // Reminders
  reminders: "/api/reminders/", // GET/POST - Reminders (requires ?user_id= for GET)
};
