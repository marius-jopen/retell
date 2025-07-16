import React from 'react'
import { cn } from '@/lib/utils'

export interface TextAreaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string
  error?: string
  helperText?: string
}

export const TextArea = React.forwardRef<HTMLTextAreaElement, TextAreaProps>(
  ({ className, label, error, helperText, id, rows = 4, ...props }, ref) => {
    const textareaId = id || label?.toLowerCase().replace(/\s+/g, '_')

    return (
      <div className="space-y-2">
        {label && (
          <label 
            htmlFor={textareaId} 
            className="block text-sm font-medium text-gray-700"
          >
            {label}
            {props.required && <span className="text-red-500 ml-1">*</span>}
          </label>
        )}
        <textarea
          id={textareaId}
          rows={rows}
          className={cn(
            "w-full px-4 py-3 border border-gray-300 rounded-xl shadow-sm",
            "placeholder-gray-400 transition-colors resize-vertical",
            "focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500",
            "disabled:cursor-not-allowed disabled:opacity-50",
            error && "border-red-300 focus:border-red-500",
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

TextArea.displayName = 'TextArea' 