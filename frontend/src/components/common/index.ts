// Premium UI Components for AgentMojo
// Export all premium components for easy importing

export {
  PremiumButton,
  PrimaryButton,
  SecondaryButton,
  GhostButton,
  DangerButton,
  GlassButton,
} from "./premium-button";

export { PremiumCard, FeatureCard } from "./premium-card";

export { PremiumInput, SearchInput, PasswordInput } from "./premium-input";

export {
  PremiumLoading,
  LoadingSpinner,
  LoadingDots,
  LoadingPulse,
  LoadingBars,
  LoadingWave,
  LoadingOverlay,
} from "./premium-loading";

// Premium styles and utilities
export const premiumStyles = {
  glass: "bg-glass backdrop-blur-lg border border-glass-border",
  glassCard:
    "bg-glass backdrop-blur-lg border border-glass-border shadow-glass rounded-2xl",
  gradientText:
    "bg-gradient-to-r from-content via-primary to-content bg-clip-text text-transparent",
  glowEffect: "shadow-glow-red",
  hoverGlow: "hover:shadow-glow-red-lg transition-shadow duration-300",
  slideUp: "animate-slide-up",
  fadeIn: "animate-fade-in",
  scaleIn: "animate-scale-in",
  float: "animate-float",
  shimmer: "animate-shimmer",
  pulseGlow: "animate-pulse-glow",
} as const;

// Premium color palette
export const premiumColors = {
  primary: "#DC2626",
  primaryLight: "#EF4444",
  primaryDark: "#B91C1C",
  base: "#000000",
  baseSecondary: "#1A1A1A",
  baseTertiary: "#2A2A2A",
  content: "#FFFFFF",
  contentSecondary: "#E5E7EB",
  contentTertiary: "#9CA3AF",
  glass: "rgba(255, 255, 255, 0.05)",
  glassBorder: "rgba(255, 255, 255, 0.1)",
  borderPrimary: "#374151",
  borderSecondary: "#4B5563",
  success: "#10B981",
  warning: "#F59E0B",
  danger: "#DC2626",
} as const;

// Premium animation presets
export const premiumAnimations = {
  slideUp: {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.5, ease: "easeOut" },
  },
  slideLeft: {
    initial: { opacity: 0, x: 30 },
    animate: { opacity: 1, x: 0 },
    transition: { duration: 0.5, ease: "easeOut" },
  },
  slideRight: {
    initial: { opacity: 0, x: -30 },
    animate: { opacity: 1, x: 0 },
    transition: { duration: 0.5, ease: "easeOut" },
  },
  fadeIn: {
    initial: { opacity: 0 },
    animate: { opacity: 1 },
    transition: { duration: 0.5 },
  },
  scaleIn: {
    initial: { opacity: 0, scale: 0.8 },
    animate: { opacity: 1, scale: 1 },
    transition: { duration: 0.4, type: "spring", stiffness: 300, damping: 20 },
  },
  glow: {
    initial: { boxShadow: "0 0 0px rgba(220, 38, 38, 0)" },
    animate: { boxShadow: "0 0 20px rgba(220, 38, 38, 0.3)" },
    transition: { duration: 0.3 },
  },
} as const;
