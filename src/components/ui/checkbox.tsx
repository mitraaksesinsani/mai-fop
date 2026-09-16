"use client"

import * as React from "react"
import { Check } from "lucide-react"
import { cn } from "@/lib/utils"

export interface CheckboxProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  checked?: boolean
  onCheckedChange?: (checked: boolean) => void
}

const Checkbox = React.forwardRef<HTMLButtonElement, CheckboxProps>(
  ({ className, checked = false, onCheckedChange, disabled, ...props }, ref) => {
    return (
      <button
        type="button"
        role="checkbox"
        ref={ref}
        aria-checked={checked}
        data-state={checked ? "checked" : "unchecked"}
        disabled={disabled}
        onClick={(e) => {
          e.stopPropagation()
          if (!disabled && onCheckedChange) {
            onCheckedChange(!checked)
          }
        }}
        className={cn(
          "peer size-4 shrink-0 rounded-[4px] border border-input bg-background shadow-xs transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50",
          checked && "bg-primary text-primary-foreground border-primary",
          className
        )}
        {...props}
      >
        {checked && (
          <Check className="size-3.5 stroke-[3] text-primary-foreground mx-auto" />
        )}
      </button>
    )
  }
)
Checkbox.displayName = "Checkbox"

export { Checkbox }
