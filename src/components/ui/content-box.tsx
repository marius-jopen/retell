import { forwardRef, HTMLAttributes, ReactNode } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from './card'
import { cn } from '@/lib/utils'

export interface ContentBoxProps extends HTMLAttributes<HTMLDivElement> {
  title: string
  children: ReactNode
  action?: ReactNode
  emptyState?: {
    message: string
    icon?: ReactNode
    action?: ReactNode
  }
  isEmpty?: boolean
  variant?: 'default' | 'featured'
}

const ContentBox = forwardRef<HTMLDivElement, ContentBoxProps>(
  ({ title, children, action, emptyState, isEmpty = false, variant = 'default', className, ...props }, ref) => {
    return (
      <Card 
        ref={ref} 
        variant={variant === 'featured' ? 'gradient' : 'default'}
        className={cn('', className)} 
        {...props}
      >
        <CardHeader className="p-4 border-b border-gray-100">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg font-semibold text-gray-900">{title}</CardTitle>
            {action && <div>{action}</div>}
          </div>
        </CardHeader>
        <CardContent className="p-4">
          {isEmpty && emptyState ? (
            <div className="text-center py-6">
              {emptyState.icon && (
                <div className="text-3xl mb-3">{emptyState.icon}</div>
              )}
              <p className="text-sm text-gray-500">{emptyState.message}</p>
              {emptyState.action && <div className="mt-3">{emptyState.action}</div>}
            </div>
          ) : (
            <div className="space-y-3">
              {children}
            </div>
          )}
        </CardContent>
      </Card>
    )
  }
)
ContentBox.displayName = 'ContentBox'

export { ContentBox } 