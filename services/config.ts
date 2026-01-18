// API Configuration
// Replace with your actual backend URL

// For local development - ASK YOUR TEAMMATE FOR THEIR IP ADDRESS
// When testing on physical device, both devices must be on the same WiFi network
const DEV_API_URL = 'http://TEAMMATE_IP:8000'; // Replace TEAMMATE_IP with actual IP (e.g., 192.168.1.100)

// For production - UPDATE WHEN BACKEND IS DEPLOYED
const PROD_API_URL = 'https://your-production-api.com';

// Toggle this based on your environment
export const API_BASE_URL = __DEV__ ? DEV_API_URL : PROD_API_URL;

// API Endpoints - COORDINATE THESE WITH YOUR TEAMMATE
// Make sure these match the FastAPI routes in the backend
export const ENDPOINTS = {
  // Auth
  login: '/api/auth/login',
  register: '/api/auth/register',
  
  // User Profile
  userProfile: '/api/users/profile',
  updateProfile: '/api/users/profile',
  
  // Tax Information
  getTaxInfo: '/api/tax/info',
  taxRules: '/api/tax/rules',
  taxCalculation: '/api/tax/calculate',
  
  // Compliance
  complianceChecklist: '/api/compliance/checklist',
  updateChecklist: '/api/compliance/checklist',
  
  // Reminders
  reminders: '/api/reminders',
  createReminder: '/api/reminders',
};
