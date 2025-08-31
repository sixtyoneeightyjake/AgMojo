import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { clsx } from "clsx";

interface PremiumInputProps {
  type?: "text" | "email" | "password" | "number" | "url" | "search";
  placeholder?: string;
  value?: string;
  defaultValue?: string;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onFocus?: (e: React.FocusEvent<HTMLInputElement>) => void;
  onBlur?: (e: React.FocusEvent<HTMLInputElement>) => void;
  disabled?: boolean;
  error?: string;
  label?: string;
  icon?: React.ReactNode;
  iconPosition?: "left" | "right";
  size?: "sm" | "md" | "lg";
  variant?: "default" | "ghost" | "bordered";
  fullWidth?: boolean;
  loading?: boolean;
  className?: string;
  inputClassName?: string;
  required?: boolean;
  glass?: boolean;
}

const sizeStyles = {
  sm: "px-3 py-2 text-sm",
  md: "px-4 py-3 text-base",
  lg: "px-5 py-4 text-lg",
};

const variantStyles = {
  default: "bg-base-secondary border-border-primary focus:border-primary",
  ghost:
    "bg-transparent border-transparent focus:bg-base-secondary focus:border-primary",
  bordered: "bg-transparent border-border-secondary focus:border-primary",
};

const iconSizes = {
  sm: "w-4 h-4",
  md: "w-5 h-5",
  lg: "w-6 h-6",
};

export function PremiumInput({
  type = "text",
  placeholder,
  value,
  defaultValue,
  onChange,
  onFocus,
  onBlur,
  disabled = false,
  error,
  label,
  icon,
  iconPosition = "left",
  size = "md",
  variant = "default",
  fullWidth = false,
  loading = false,
  className,
  inputClassName,
  required = false,
  glass = false,
}: PremiumInputProps) {
  const [isFocused, setIsFocused] = React.useState(false);

  const handleFocus = (e: React.FocusEvent<HTMLInputElement>) => {
    setIsFocused(true);
    onFocus?.(e);
  };

  const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    setIsFocused(false);
    onBlur?.(e);
  };

  const containerClasses = clsx(
    "relative",
    {
      "w-full": fullWidth,
    },
    className,
  );

  const inputContainerClasses = clsx(
    "relative flex items-center overflow-hidden rounded-xl border transition-all duration-300",
    sizeStyles[size],
    variantStyles[variant],
    {
      "opacity-50 cursor-not-allowed": disabled,
      "border-danger": error,
      "glass backdrop-blur-lg": glass,
      "shadow-glow-red": isFocused && !error,
      "shadow-lg": isFocused,
    },
  );

  const inputClasses = clsx(
    "flex-1 bg-transparent outline-none placeholder-content-tertiary text-content",
    {
      "pl-0": icon && iconPosition === "left",
      "pr-0": icon && iconPosition === "right",
      "cursor-not-allowed": disabled,
    },
    inputClassName,
  );

  const iconClasses = clsx(
    iconSizes[size],
    "text-content-tertiary transition-colors duration-200",
    {
      "mr-3": iconPosition === "left",
      "ml-3": iconPosition === "right",
      "text-primary": isFocused && !error,
      "text-danger": error,
    },
  );

  const labelClasses = clsx(
    "block text-sm font-medium mb-2 transition-colors duration-200",
    {
      "text-content": !error && !isFocused,
      "text-primary": isFocused && !error,
      "text-danger": error,
    },
  );

  return (
    <div className={containerClasses}>
      {/* Label */}
      {label && (
        <motion.label
          className={labelClasses}
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.2 }}
        >
          {label}
          {required && <span className="text-danger ml-1">*</span>}
        </motion.label>
      )}

      {/* Input container */}
      <motion.div
        className={inputContainerClasses}
        initial={{ scale: 1 }}
        whileFocus={{ scale: 1.02 }}
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
      >
        {/* Left icon */}
        {icon && iconPosition === "left" && (
          <motion.div
            className={iconClasses}
            animate={{
              scale: isFocused ? 1.1 : 1,
              rotate: isFocused ? 5 : 0,
            }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
          >
            {icon}
          </motion.div>
        )}

        {/* Input field */}
        <input
          type={type}
          placeholder={placeholder}
          value={value}
          defaultValue={defaultValue}
          onChange={onChange}
          onFocus={handleFocus}
          onBlur={handleBlur}
          disabled={disabled || loading}
          required={required}
          className={inputClasses}
        />

        {/* Loading spinner */}
        {loading && (
          <motion.div
            className="ml-3"
            initial={{ opacity: 0, scale: 0 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0 }}
          >
            <motion.div
              className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full"
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
            />
          </motion.div>
        )}

        {/* Right icon */}
        {icon && iconPosition === "right" && !loading && (
          <motion.div
            className={iconClasses}
            animate={{
              scale: isFocused ? 1.1 : 1,
              rotate: isFocused ? -5 : 0,
            }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
          >
            {icon}
          </motion.div>
        )}

        {/* Focus glow effect */}
        <AnimatePresence>
          {isFocused && !error && (
            <motion.div
              className="absolute inset-0 bg-gradient-to-r from-primary/10 to-primary-light/10 rounded-xl pointer-events-none"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
            />
          )}
        </AnimatePresence>
      </motion.div>

      {/* Error message */}
      <AnimatePresence>
        {error && (
          <motion.div
            className="mt-2 text-sm text-danger flex items-center"
            initial={{ opacity: 0, y: -10, height: 0 }}
            animate={{ opacity: 1, y: 0, height: "auto" }}
            exit={{ opacity: 0, y: -10, height: 0 }}
            transition={{ duration: 0.2 }}
          >
            <svg
              className="w-4 h-4 mr-2 flex-shrink-0"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path
                fillRule="evenodd"
                d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                clipRule="evenodd"
              />
            </svg>
            {error}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// Specialized input variants
export function SearchInput(props: Omit<PremiumInputProps, "type" | "icon">) {
  return (
    <PremiumInput
      type="search"
      icon={
        <svg
          className="w-full h-full"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
          />
        </svg>
      }
      // eslint-disable-next-line react/jsx-props-no-spreading
      {...props}
    />
  );
}

export function PasswordInput(
  props: Omit<PremiumInputProps, "type" | "icon" | "iconPosition">,
) {
  const [showPassword, setShowPassword] = React.useState(false);

  return (
    <PremiumInput
      type={showPassword ? "text" : "password"}
      icon={
        <button
          type="button"
          onClick={() => setShowPassword(!showPassword)}
          className="text-current hover:text-primary transition-colors"
        >
          {showPassword ? (
            <svg
              className="w-full h-full"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21"
              />
            </svg>
          ) : (
            <svg
              className="w-full h-full"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
              />
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
              />
            </svg>
          )}
        </button>
      }
      iconPosition="right"
      // eslint-disable-next-line react/jsx-props-no-spreading
      {...props}
    />
  );
}
