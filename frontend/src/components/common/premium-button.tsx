import React from "react";
import { motion } from "framer-motion";
import { clsx } from "clsx";

interface PremiumButtonProps {
  children: React.ReactNode;
  variant?: "primary" | "secondary" | "ghost" | "danger";
  size?: "sm" | "md" | "lg" | "xl";
  disabled?: boolean;
  loading?: boolean;
  fullWidth?: boolean;
  icon?: React.ReactNode;
  iconPosition?: "left" | "right";
  onClick?: () => void;
  type?: "button" | "submit" | "reset";
  className?: string;
  glow?: boolean;
  glass?: boolean;
}

const buttonVariants = {
  primary:
    "bg-gradient-to-r from-primary to-primary-light text-white border-primary hover:from-primary-light hover:to-primary shadow-glow-red",
  secondary:
    "bg-base-secondary text-content border-border-primary hover:bg-base-tertiary hover:border-primary",
  ghost:
    "bg-transparent text-content border-transparent hover:bg-base-secondary hover:border-border-primary",
  danger:
    "bg-gradient-to-r from-red-600 to-red-500 text-white border-red-600 hover:from-red-500 hover:to-red-400",
};

const sizeVariants = {
  sm: "px-3 py-1.5 text-sm",
  md: "px-4 py-2 text-sm",
  lg: "px-6 py-3 text-base",
  xl: "px-8 py-4 text-lg",
};

const iconSizes = {
  sm: "w-4 h-4",
  md: "w-4 h-4",
  lg: "w-5 h-5",
  xl: "w-6 h-6",
};

export function PremiumButton({
  children,
  variant = "primary",
  size = "md",
  disabled = false,
  loading = false,
  fullWidth = false,
  icon,
  iconPosition = "left",
  onClick,
  type = "button",
  className,
  glow = false,
  glass = false,
}: PremiumButtonProps) {
  const baseClasses = clsx(
    // Base styles
    "relative inline-flex items-center justify-center",
    "font-medium rounded-xl border transition-all duration-300",
    "focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-offset-base",
    "overflow-hidden group",

    // Variant styles
    buttonVariants[variant],

    // Size styles
    sizeVariants[size],

    // State styles
    {
      "opacity-50 cursor-not-allowed": disabled || loading,
      "w-full": fullWidth,
      glass,
      "glow-red": glow && variant === "primary",
    },

    className,
  );

  const iconClasses = clsx(iconSizes[size], {
    "mr-2": iconPosition === "left" && children,
    "ml-2": iconPosition === "right" && children,
  });

  const shimmerClasses =
    "absolute inset-0 -top-px bg-gradient-to-r from-transparent via-white/20 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700 ease-out";

  return (
    <motion.button
      type={type}
      className={baseClasses}
      onClick={onClick}
      disabled={disabled || loading}
      whileHover={{
        scale: disabled ? 1 : 1.02,
        y: disabled ? 0 : -2,
      }}
      whileTap={{
        scale: disabled ? 1 : 0.98,
      }}
      transition={{
        type: "spring",
        stiffness: 400,
        damping: 17,
      }}
    >
      {/* Shimmer effect */}
      <div className={shimmerClasses} />

      {/* Content */}
      <div className="relative flex items-center justify-center">
        {loading ? (
          <div className="flex items-center">
            <motion.div
              className={clsx(
                "border-2 border-current border-t-transparent rounded-full",
                iconSizes[size],
              )}
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
            />
            {children && <span className="ml-2">{children}</span>}
          </div>
        ) : (
          <>
            {icon && iconPosition === "left" && (
              <span className={iconClasses}>{icon}</span>
            )}
            {children}
            {icon && iconPosition === "right" && (
              <span className={iconClasses}>{icon}</span>
            )}
          </>
        )}
      </div>

      {/* Glow effect for primary variant */}
      {variant === "primary" && (
        <motion.div
          className="absolute inset-0 rounded-xl bg-gradient-to-r from-primary/20 to-primary-light/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
          initial={{ opacity: 0 }}
          whileHover={{ opacity: 1 }}
        />
      )}
    </motion.button>
  );
}

// Export a specialized version for common use cases
export function PrimaryButton(props: Omit<PremiumButtonProps, "variant">) {
  // eslint-disable-next-line react/jsx-props-no-spreading
  return <PremiumButton {...props} variant="primary" glow />;
}

export function SecondaryButton(props: Omit<PremiumButtonProps, "variant">) {
  // eslint-disable-next-line react/jsx-props-no-spreading
  return <PremiumButton {...props} variant="secondary" />;
}

export function GhostButton(props: Omit<PremiumButtonProps, "variant">) {
  // eslint-disable-next-line react/jsx-props-no-spreading
  return <PremiumButton {...props} variant="ghost" />;
}

export function DangerButton(props: Omit<PremiumButtonProps, "variant">) {
  // eslint-disable-next-line react/jsx-props-no-spreading
  return <PremiumButton {...props} variant="danger" />;
}

export function GlassButton(props: Omit<PremiumButtonProps, "glass">) {
  // eslint-disable-next-line react/jsx-props-no-spreading
  return <PremiumButton {...props} glass />;
}
