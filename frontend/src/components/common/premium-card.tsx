import React from "react";
import { motion } from "framer-motion";
import { clsx } from "clsx";

interface PremiumCardProps {
  children: React.ReactNode;
  variant?: "default" | "glass" | "solid" | "bordered";
  hoverable?: boolean;
  clickable?: boolean;
  padding?: "none" | "sm" | "md" | "lg" | "xl";
  radius?: "none" | "sm" | "md" | "lg" | "xl" | "2xl" | "3xl";
  shadow?: "none" | "sm" | "md" | "lg" | "xl" | "glow";
  className?: string;
  onClick?: () => void;
  header?: React.ReactNode;
  footer?: React.ReactNode;
  loading?: boolean;
  glow?: boolean;
}

const variantStyles = {
  default: "bg-base-secondary border border-border-primary",
  glass: "bg-glass backdrop-blur-lg border border-glass-border",
  solid: "bg-base-tertiary border border-border-secondary",
  bordered: "bg-transparent border-2 border-border-primary",
};

const paddingStyles = {
  none: "",
  sm: "p-3",
  md: "p-4",
  lg: "p-6",
  xl: "p-8",
};

const radiusStyles = {
  none: "",
  sm: "rounded-sm",
  md: "rounded-md",
  lg: "rounded-lg",
  xl: "rounded-xl",
  "2xl": "rounded-2xl",
  "3xl": "rounded-3xl",
};

const shadowStyles = {
  none: "",
  sm: "shadow-sm",
  md: "shadow-md",
  lg: "shadow-lg",
  xl: "shadow-xl",
  glow: "shadow-glass",
};

export function PremiumCard({
  children,
  variant = "default",
  hoverable = false,
  clickable = false,
  padding = "md",
  radius = "xl",
  shadow = "md",
  className,
  onClick,
  header,
  footer,
  loading = false,
  glow = false,
}: PremiumCardProps) {
  const baseClasses = clsx(
    "relative overflow-hidden transition-all duration-300 ease-out",
    variantStyles[variant],
    radiusStyles[radius],
    shadowStyles[shadow],
    {
      "cursor-pointer": clickable || onClick,
      "card-premium": hoverable || clickable,
      "glow-red": glow,
    },
    className,
  );

  const contentClasses = clsx("relative z-10", paddingStyles[padding]);

  const hoverAnimation =
    hoverable || clickable
      ? {
          y: -4,
          scale: 1.02,
        }
      : {};

  const tapAnimation = clickable
    ? {
        scale: 0.98,
      }
    : {};

  return (
    <motion.div
      className={baseClasses}
      onClick={onClick}
      whileHover={hoverAnimation}
      whileTap={tapAnimation}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        duration: 0.5,
        ease: "easeOut",
        type: "spring" as const,
        stiffness: 300,
        damping: 20,
      }}
    >
      {/* Loading overlay */}
      {loading && (
        <div className="absolute inset-0 bg-base/50 backdrop-blur-sm flex items-center justify-center z-20">
          <motion.div
            className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full"
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          />
        </div>
      )}

      {/* Glow effect */}
      {glow && (
        <motion.div
          className="absolute inset-0 bg-gradient-to-r from-primary/10 to-primary-light/10 opacity-0 hover:opacity-100 transition-opacity duration-300"
          initial={{ opacity: 0 }}
          whileHover={{ opacity: 1 }}
        />
      )}

      {/* Header */}
      {header && (
        <div className="relative z-10 border-b border-border-primary">
          <div className={paddingStyles[padding]}>{header}</div>
        </div>
      )}

      {/* Content */}
      <div className={contentClasses}>{children}</div>

      {/* Footer */}
      {footer && (
        <div className="relative z-10 border-t border-border-primary">
          <div className={paddingStyles[padding]}>{footer}</div>
        </div>
      )}

      {/* Hover shimmer effect */}
      {(hoverable || clickable) && (
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700 ease-out" />
      )}
    </motion.div>
  );
}

// Feature card with icon and description
interface FeatureCardProps {
  title: string;
  description: string;
  icon: React.ReactNode;
  className?: string;
  onClick?: () => void;
}

export function FeatureCard({
  title,
  description,
  icon,
  className,
  onClick,
}: FeatureCardProps) {
  return (
    <PremiumCard
      className={className}
      onClick={onClick}
      variant="glass"
      clickable
      hoverable
      glow
    >
      <div className="flex flex-col items-center text-center space-y-4">
        <motion.div
          className="p-3 rounded-2xl bg-gradient-to-br from-primary/20 to-primary-light/20 border border-primary/30"
          whileHover={{ scale: 1.1, rotate: 5 }}
          transition={{ type: "spring", stiffness: 300, damping: 20 }}
        >
          <div className="w-8 h-8 text-primary">{icon}</div>
        </motion.div>
        <div>
          <h3 className="text-lg font-semibold text-content mb-2 gradient-text">
            {title}
          </h3>
          <p className="text-content-tertiary text-sm leading-relaxed">
            {description}
          </p>
        </div>
      </div>
    </PremiumCard>
  );
}
