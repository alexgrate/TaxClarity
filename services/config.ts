// API Configuration
// Replace with your actual backend URL

// For local development (when backend runs on your computer)
// Use your computer's IP address instead of localhost for mobile testing
const DEV_API_URL = 'http://10.0.2.2:8000'; // Android emulator
// const DEV_API_URL = 'http://localhost:8000'; // iOS simulator
// const DEV_API_URL = 'http://YOUR_IP:8000'; // Physical device (replace YOUR_IP with your computer's IP)

// For production
const PROD_API_URL = 'https://your-production-api.com';

// Use development URL for now
export const API_BASE_URL = __DEV__ ? DEV_API_URL : PROD_API_URL;

// API Endpoints
export const ENDPOINTS = {
  // Auth
  login: '/auth/login',
  register: '/auth/register',
  
  // User Profile
  userProfile: '/users/profile',
  updateProfile: '/users/profile',
  
  // Tax Information
  taxRules: '/tax/rules',
  taxCalculation: '/tax/calculate',
  
  // Compliance
  complianceChecklist: '/compliance/checklist',
  updateChecklist: '/compliance/checklist',
  
  // Reminders
  reminders: '/reminders',
  createReminder: '/reminders',
};
