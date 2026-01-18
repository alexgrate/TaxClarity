# TaxClarity NG

A React Native mobile app built with Expo SDK 52 that helps Nigerians understand the 2026 tax reforms and stay compliant.

## Features

- **User Tax Profile Setup**: Select user type (Salary Earner, Freelancer, Small Business Owner), income range, and state
- **Personalized Tax Guidance**: Get tailored information based on your profile
- **Compliance Checklist**: Track your tax compliance steps
- **Reminders**: Set reminders to complete your tax obligations

## Tech Stack

- **Framework**: React Native with Expo SDK 52
- **Navigation**: Expo Router (file-based routing)
- **State Management**: Zustand with AsyncStorage persistence
- **Form Handling**: React Hook Form
- **Styling**: React Native StyleSheet

## Project Structure

```
TaxClarity-Frontend/
├── app/                    # Expo Router screens
│   ├── _layout.tsx        # Root layout with navigation
│   ├── index.tsx          # Home/Landing screen
│   ├── profile-setup.tsx  # User profile setup screen
│   └── next-steps.tsx     # Compliance checklist screen
├── components/
│   └── ui/                # Reusable UI components
│       ├── Button.tsx
│       ├── Checkbox.tsx
│       ├── Dropdown.tsx
│       ├── Header.tsx
│       ├── LogoIcon.tsx
│       ├── RadioButton.tsx
│       ├── SuccessModal.tsx
│       └── TaxHeroImage.tsx
├── constants/
│   ├── data.ts            # App data (states, income ranges)
│   └── theme.ts           # Colors, fonts, spacing
├── store/
│   └── useTaxClarityStore.ts  # Zustand store
└── assets/
    └── images/            # App icons and images
```

## Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn
- Expo CLI (`npm install -g expo-cli`)
- Expo Go app on your mobile device (for testing)

### Installation

1. Navigate to the project directory:
   ```bash
   cd TaxClarity-Frontend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the development server:
   ```bash
   npm start
   ```

4. Scan the QR code with Expo Go (Android) or Camera app (iOS)

## Screens

1. **Home Screen**: Landing page with hero image and "Get Started" button
2. **Profile Setup**: Select user type, income range, and state
3. **Next Steps**: Compliance checklist with reminder functionality
4. **Success Modal**: Confirmation when all steps are completed

## Color Palette

- Primary Blue: `#3B4CCA`
- White: `#FFFFFF`
- Text Primary: `#111827`
- Text Secondary: `#6B7280`
- Border: `#E5E7EB`

## License

MIT
