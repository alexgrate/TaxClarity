// Nigerian States
export const NIGERIAN_STATES = [
  "Abia",
  "Adamawa",
  "Akwa Ibom",
  "Anambra",
  "Bauchi",
  "Bayelsa",
  "Benue",
  "Borno",
  "Cross River",
  "Delta",
  "Ebonyi",
  "Edo",
  "Ekiti",
  "Enugu",
  "FCT - Abuja",
  "Gombe",
  "Imo",
  "Jigawa",
  "Kaduna",
  "Kano",
  "Katsina",
  "Kebbi",
  "Kogi",
  "Kwara",
  "Lagos",
  "Nasarawa",
  "Niger",
  "Ogun",
  "Ondo",
  "Osun",
  "Oyo",
  "Plateau",
  "Rivers",
  "Sokoto",
  "Taraba",
  "Yobe",
  "Zamfara",
];

// Income Ranges based on NTA 2025 Tax Brackets
export const INCOME_RANGES = [
  { label: "Below ₦800,000 (Tax-Free)", value: "below_800k" },
  { label: "₦800,000 - ₦3,000,000", value: "800k_3m" },
  { label: "₦3,000,000 - ₦12,000,000", value: "3m_12m" },
  { label: "₦12,000,000 - ₦25,000,000", value: "12m_25m" },
  { label: "₦25,000,000 - ₦50,000,000", value: "25m_50m" },
  { label: "Above ₦50,000,000", value: "above_50m" },
];

// User Types
export const USER_TYPES = [
  { label: "Salary Earner (PAYE)", value: "salary_earner", description: "Employed, tax deducted by employer" },
  { label: "Freelancer / Self-Employed", value: "freelancer", description: "Independent contractor, consultant" },
  { label: "Small Business Owner", value: "small_business_owner", description: "Sole proprietor or company owner" },
];

// Static Compliance Checklist (fallback if API unavailable)
// Full checklist is generated dynamically based on user type
export const COMPLIANCE_CHECKLIST = [
  { id: "1", title: "Register for Tax ID (TIN)", description: "Visit taxid.jrb.gov.ng" },
  { id: "2", title: "Gather income documents", description: "Payslips, invoices, bank statements" },
  { id: "3", title: "Calculate annual income", description: "First ₦800,000 is tax-free" },
  { id: "4", title: "Identify deductions", description: "Pension, NHF, rent relief" },
  { id: "5", title: "File tax return by March 31", description: "Via State IRS portal (e.g., LIRS)" },
];

// Tax Rates for display (NTA 2025)
export const TAX_BRACKETS = [
  { min: 0, max: 800000, rate: 0, label: "₦0 - ₦800,000" },
  { min: 800001, max: 3000000, rate: 15, label: "₦800,001 - ₦3,000,000" },
  { min: 3000001, max: 12000000, rate: 18, label: "₦3,000,001 - ₦12,000,000" },
  { min: 12000001, max: 25000000, rate: 21, label: "₦12,000,001 - ₦25,000,000" },
  { min: 25000001, max: 50000000, rate: 23, label: "₦25,000,001 - ₦50,000,000" },
  { min: 50000001, max: Infinity, rate: 25, label: "Above ₦50,000,000" },
];
