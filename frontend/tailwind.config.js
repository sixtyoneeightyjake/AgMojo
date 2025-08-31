/** @type {import('tailwindcss').Config} */
import { heroui } from "@heroui/react";
import typography from "@tailwindcss/typography";
export default {
  theme: {
    extend: {
      colors: {
        primary: "#DC2626", // blood red
        "primary-light": "#EF4444", // lighter blood red
        "primary-dark": "#B91C1C", // darker blood red
        logo: "#DC2626", // blood red for logos and icons
        base: "#000000", // pure black background
        "base-secondary": "#1A1A1A", // dark grey background
        "base-tertiary": "#2A2A2A", // lighter grey background
        danger: "#DC2626", // blood red for danger states
        success: "#10B981", // emerald green for success
        warning: "#F59E0B", // amber for warnings
        basic: "#6B7280", // medium grey
        tertiary: "#374151", // dark grey for inputs
        "tertiary-light": "#9CA3AF", // light grey for borders and placeholder text
        content: "#FFFFFF", // pure white for text
        "content-secondary": "#E5E7EB", // light grey for secondary text
        "content-tertiary": "#9CA3AF", // medium grey for tertiary text
        "border-primary": "#374151", // dark grey borders
        "border-secondary": "#4B5563", // medium grey borders
        glass: "rgba(255, 255, 255, 0.05)", // glassmorphism effect
        "glass-border": "rgba(255, 255, 255, 0.1)",
      },
      animation: {
        "fade-in": "fadeIn 0.5s ease-in-out",
        "slide-up": "slideUp 0.3s ease-out",
        "slide-down": "slideDown 0.3s ease-out",
        "slide-left": "slideLeft 0.3s ease-out",
        "slide-right": "slideRight 0.3s ease-out",
        "scale-in": "scaleIn 0.2s ease-out",
        "pulse-glow": "pulseGlow 2s ease-in-out infinite",
        "shimmer": "shimmer 2s linear infinite",
        "float": "float 3s ease-in-out infinite",
        "glow": "glow 1.5s ease-in-out infinite alternate",
      },
      keyframes: {
        fadeIn: {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        slideUp: {
          "0%": { transform: "translateY(20px)", opacity: "0" },
          "100%": { transform: "translateY(0)", opacity: "1" },
        },
        slideDown: {
          "0%": { transform: "translateY(-20px)", opacity: "0" },
          "100%": { transform: "translateY(0)", opacity: "1" },
        },
        slideLeft: {
          "0%": { transform: "translateX(20px)", opacity: "0" },
          "100%": { transform: "translateX(0)", opacity: "1" },
        },
        slideRight: {
          "0%": { transform: "translateX(-20px)", opacity: "0" },
          "100%": { transform: "translateX(0)", opacity: "1" },
        },
        scaleIn: {
          "0%": { transform: "scale(0.9)", opacity: "0" },
          "100%": { transform: "scale(1)", opacity: "1" },
        },
        pulseGlow: {
          "0%, 100%": { boxShadow: "0 0 20px rgba(220, 38, 38, 0.3)" },
          "50%": { boxShadow: "0 0 40px rgba(220, 38, 38, 0.6)" },
        },
        shimmer: {
          "0%": { transform: "translateX(-100%)" },
          "100%": { transform: "translateX(100%)" },
        },
        float: {
          "0%, 100%": { transform: "translateY(0px)" },
          "50%": { transform: "translateY(-10px)" },
        },
        glow: {
          "0%": { textShadow: "0 0 10px rgba(220, 38, 38, 0.5)" },
          "100%": { textShadow: "0 0 20px rgba(220, 38, 38, 0.8)" },
        },
      },
      backdropBlur: {
        xs: "2px",
      },
      boxShadow: {
        "glow-red": "0 0 20px rgba(220, 38, 38, 0.3)",
        "glow-red-lg": "0 0 40px rgba(220, 38, 38, 0.4)",
        "glass": "0 8px 32px rgba(0, 0, 0, 0.3)",
        "glass-lg": "0 20px 60px rgba(0, 0, 0, 0.4)",
      },
      borderRadius: {
        "xl": "16px",
        "2xl": "20px",
        "3xl": "24px",
      },
      fontFamily: {
        display: ["Inter", "SF Pro Display", "-apple-system", "BlinkMacSystemFont", "Segoe UI", "sans-serif"],
        body: ["Inter", "-apple-system", "BlinkMacSystemFont", "Segoe UI", "sans-serif"],
      },
    },
  },
  darkMode: "class",
  plugins: [
    typography,
    heroui({
      themes: {
        dark: {
          colors: {
            background: "#000000",
            foreground: "#FFFFFF",
            primary: {
              50: "#FEF2F2",
              100: "#FEE2E2",
              200: "#FECACA",
              300: "#FCA5A5",
              400: "#F87171",
              500: "#EF4444",
              600: "#DC2626",
              700: "#B91C1C",
              800: "#991B1B",
              900: "#7F1D1D",
              DEFAULT: "#DC2626",
              foreground: "#FFFFFF",
            },
          },
        },
      },
    }),
  ],
};
