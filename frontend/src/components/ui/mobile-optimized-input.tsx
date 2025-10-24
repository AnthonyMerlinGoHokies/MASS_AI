import * as React from "react"
import { cn } from "@/lib/utils"

export interface MobileOptimizedInputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
  helperText?: string
}

const MobileOptimizedInput = React.forwardRef<HTMLInputElement, MobileOptimizedInputProps>(
  ({ className, type, label, error, helperText, id, ...props }, ref) => {
    const inputId = id || React.useId()
    const errorId = error ? `${inputId}-error` : undefined
    const helperTextId = helperText ? `${inputId}-helper` : undefined
    
    return (
      <div className="space-y-2">
        {label && (
          <label 
            htmlFor={inputId}
            className="block text-base font-medium text-foreground"
          >
            {label}
          </label>
        )}
        <input
          id={inputId}
          type={type}
          className={cn(
            "flex min-h-[48px] w-full rounded-md border border-input bg-background px-4 py-3 text-base text-foreground placeholder:text-muted-foreground",
            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
            "disabled:cursor-not-allowed disabled:opacity-50",
            "touch-manipulation",
            // Mobile-specific optimizations
            "text-[16px]", // Prevent zoom on iOS
            error && "border-red-500 focus-visible:ring-red-500",
            className
          )}
          ref={ref}
          aria-describedby={cn(
            error ? errorId : undefined,
            helperText ? helperTextId : undefined
          )}
          aria-invalid={!!error}
          {...props}
        />
        {error && (
          <p 
            id={errorId}
            className="text-base text-red-500 flex items-center gap-2"
            role="alert"
            aria-live="polite"
          >
            {error}
          </p>
        )}
        {helperText && !error && (
          <p 
            id={helperTextId}
            className="text-sm text-muted-foreground"
          >
            {helperText}
          </p>
        )}
      </div>
    )
  }
)
MobileOptimizedInput.displayName = "MobileOptimizedInput"

export { MobileOptimizedInput }