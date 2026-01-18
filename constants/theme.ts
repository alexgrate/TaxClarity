// Color palette based on Figma design
export const Colors = {
  primary: "#3B4CCA", // Blue color from buttons and logo
  primaryDark: "#2D3A9E",
  white: "#FFFFFF",
  black: "#000000",
  gray: "#6B7280",
  lightGray: "#F3F4F6",
  border: "#E5E7EB",
  success: "#10B981",
  background: "#FFFFFF",
  text: {
    primary: "#111827",
    secondary: "#6B7280",
    light: "#9CA3AF",
  },
  checkbox: {
    unchecked: "#D1D5DB",
    checked: "#3B4CCA",
  },
};

export const Fonts = {
  sizes: {
    xs: 12,
    sm: 14,
    md: 16,
    lg: 18,
    xl: 20,
    xxl: 24,
    xxxl: 28,
  },
  weights: {
    regular: "400" as const,
    medium: "500" as const,
    semibold: "600" as const,
    bold: "700" as const,
  },
};

export const Spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
};

export const BorderRadius = {
  sm: 4,
  md: 8,
  lg: 12,
  xl: 16,
  full: 9999,
};
