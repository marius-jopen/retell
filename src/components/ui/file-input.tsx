import React from 'react'
import { cn } from '@/lib/utils'

export interface FileInputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'type'> {
  label?: string
  error?: string
  helperText?: string
}

export const FileInput = React.forwardRef<HTMLInputElement, FileInputProps>(
  ({ className, label, error, helperText, id, ...props }, ref) => {
    const inputId = id || label?.toLowerCase().replace(/\s+/g, '_')

    return (
      <div className="space-y-2">
        {label && (
          <label 
            htmlFor={inputId} 
            className="block text-sm font-medium text-gray-700"
          >
            {label}
            {props.required && <span className="text-red-500 ml-1">*</span>}
          </label>
        )}
        <input
          id={inputId}
          type="file"
          className={cn(
            "block w-full text-sm text-gray-500",
            "file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0",
            "file:text-sm file:font-semibold file:bg-red-50 file:text-red-700",
            "hover:file:bg-red-100 file:transition-colors",
            "focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2",
            "disabled:cursor-not-allowed disabled:opacity-50",
            className
          )}
          ref={ref}
          {...props}
        />
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

FileInput.displayName = 'FileInput' 