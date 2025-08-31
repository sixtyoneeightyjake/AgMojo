import React from "react";
import { motion } from "framer-motion";
import { clsx } from "clsx";

interface PremiumLoadingProps {
  size?: "sm" | "md" | "lg" | "xl";
  variant?: "spinner" | "dots" | "pulse" | "bars" | "wave";
  color?: "primary" | "white" | "secondary";
  className?: string;
  text?: string;
}

const sizeMap = {
  sm: {
    spinner: "w-4 h-4",
    container: "text-sm",
    dots: "w-1 h-1",
    bars: "w-1 h-4",
  },
  md: {
    spinner: "w-6 h-6",
    container: "text-base",
    dots: "w-1.5 h-1.5",
    bars: "w-1.5 h-6",
  },
  lg: {
    spinner: "w-8 h-8",
    container: "text-lg",
    dots: "w-2 h-2",
    bars: "w-2 h-8",
  },
  xl: {
    spinner: "w-12 h-12",
    container: "text-xl",
    dots: "w-3 h-3",
    bars: "w-3 h-12",
  },
};

const colorMap = {
  primary: "border-primary text-primary",
  white: "border-white text-white",
  secondary: "border-content-secondary text-content-secondary",
};

export function PremiumLoading({
  size = "md",
  variant = "spinner",
  color = "primary",
  className,
  text,
}: PremiumLoadingProps) {
  const containerClasses = clsx(
    "flex items-center justify-center gap-3",
    sizeMap[size].container,
    className,
  );

  const renderSpinner = () => (
    <motion.div
      className={clsx(
        "border-2 border-t-transparent rounded-full",
        sizeMap[size].spinner,
        colorMap[color],
      )}
      animate={{ rotate: 360 }}
      transition={{
        duration: 1,
        repeat: Infinity,
        ease: "linear",
      }}
    />
  );

  const renderDots = () => (
    <div className="flex space-x-1">
      {[0, 1, 2].map((i) => (
        <motion.div
          key={i}
          className={clsx(
            "rounded-full bg-current",
            sizeMap[size].dots,
            colorMap[color],
          )}
          animate={{
            scale: [1, 1.5, 1],
            opacity: [0.5, 1, 0.5],
          }}
          transition={{
            duration: 1.2,
            repeat: Infinity,
            delay: i * 0.2,
            ease: "easeInOut",
          }}
        />
      ))}
    </div>
  );

  const renderPulse = () => (
    <motion.div
      className={clsx(
        "rounded-full bg-current",
        sizeMap[size].spinner,
        colorMap[color],
      )}
      animate={{
        scale: [1, 1.3, 1],
        opacity: [0.7, 1, 0.7],
      }}
      transition={{
        duration: 1.5,
        repeat: Infinity,
        ease: "easeInOut",
      }}
    />
  );

  const renderBars = () => (
    <div className="flex items-end space-x-1">
      {[0, 1, 2, 3].map((i) => (
        <motion.div
          key={i}
          className={clsx(
            "bg-current rounded-sm",
            sizeMap[size].bars,
            colorMap[color],
          )}
          animate={{
            scaleY: [1, 1.5, 0.5, 1],
          }}
          transition={{
            duration: 1,
            repeat: Infinity,
            delay: i * 0.1,
            ease: "easeInOut",
          }}
        />
      ))}
    </div>
  );

  const renderWave = () => (
    <div className="flex items-center space-x-1">
      {[0, 1, 2, 3, 4].map((i) => (
        <motion.div
          key={i}
          className={clsx("w-1 h-1 bg-current rounded-full", colorMap[color])}
          animate={{
            y: [0, -8, 0],
          }}
          transition={{
            duration: 0.8,
            repeat: Infinity,
            delay: i * 0.1,
            ease: "easeInOut",
          }}
        />
      ))}
    </div>
  );

  const renderVariant = () => {
    switch (variant) {
      case "dots":
        return renderDots();
      case "pulse":
        return renderPulse();
      case "bars":
        return renderBars();
      case "wave":
        return renderWave();
      default:
        return renderSpinner();
    }
  };

  return (
    <div className={containerClasses}>
      {renderVariant()}
      {text && (
        <motion.span
          className={colorMap[color]}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          {text}
        </motion.span>
      )}
    </div>
  );
}

// Specialized loading components
export function LoadingSpinner(props: Omit<PremiumLoadingProps, "variant">) {
  // eslint-disable-next-line react/jsx-props-no-spreading
  return <PremiumLoading {...props} variant="spinner" />;
}

export function LoadingDots(props: Omit<PremiumLoadingProps, "variant">) {
  // eslint-disable-next-line react/jsx-props-no-spreading
  return <PremiumLoading {...props} variant="dots" />;
}

export function LoadingPulse(props: Omit<PremiumLoadingProps, "variant">) {
  // eslint-disable-next-line react/jsx-props-no-spreading
  return <PremiumLoading {...props} variant="pulse" />;
}

export function LoadingBars(props: Omit<PremiumLoadingProps, "variant">) {
  // eslint-disable-next-line react/jsx-props-no-spreading
  return <PremiumLoading {...props} variant="bars" />;
}

export function LoadingWave(props: Omit<PremiumLoadingProps, "variant">) {
  // eslint-disable-next-line react/jsx-props-no-spreading
  return <PremiumLoading {...props} variant="wave" />;
}

// Full screen loading overlay
interface LoadingOverlayProps {
  visible: boolean;
  text?: string;
  variant?: PremiumLoadingProps["variant"];
}

export function LoadingOverlay({
  visible,
  text = "Loading...",
  variant = "spinner",
}: LoadingOverlayProps) {
  if (!visible) return null;

  return (
    <motion.div
      className="fixed inset-0 bg-base/80 backdrop-blur-sm flex items-center justify-center z-50"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
    >
      <motion.div
        className="glass rounded-3xl p-8 border border-glass-border shadow-glass-lg"
        initial={{ opacity: 0, scale: 0.8, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.8, y: 20 }}
        transition={{ delay: 0.1, duration: 0.4, type: "spring" }}
      >
        <PremiumLoading size="lg" variant={variant} text={text} />
      </motion.div>
    </motion.div>
  );
}
