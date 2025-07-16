import React from 'react'
import { cn } from '@/lib/utils'

export interface SelectOption {
  value: string
  label: string
}

export interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string
  error?: string
  helperText?: string
  options?: SelectOption[]
  placeholder?: string
}

export const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
  ({ className, label, error, helperText, id, options = [], placeholder = 'Select...', children, ...props }, ref) => {
    const selectId = id || label?.toLowerCase().replace(/\s+/g, '_')

    return (
      <div className="space-y-2">
        {label && (
          <label 
            htmlFor={selectId} 
            className="block text-sm font-medium text-gray-700"
          >
            {label}
            {props.required && <span className="text-red-500 ml-1">*</span>}
          </label>
        )}
        <select
          id={selectId}
          className={cn(
            "w-full px-4 py-3 border border-gray-300 rounded-xl shadow-sm",
            "transition-colors appearance-none bg-white",
            "focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500",
            "disabled:cursor-not-allowed disabled:opacity-50",
            error && "border-red-300 focus:border-red-500",
            className
          )}
          ref={ref}
          {...props}
        >
          {placeholder && (
            <option value="" disabled>
              {placeholder}
            </option>
          )}
          {options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
          {children}
        </select>
        {error && (
          <p className="text-sm text-red-600">{error}</p>
        )}
        {helperText && !error && (
          <p className="text-sm text-gray-500">{helperText}</p>
        )}
      </div>
    )
  }
)

Select.displayName = 'Select' 