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
        <CardHeader className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <CardTitle className="text-xl font-semibold text-gray-900">{title}</CardTitle>
            {action && <div>{action}</div>}
          </div>
        </CardHeader>
        <CardContent className="p-6">
          {isEmpty && emptyState ? (
            <div className="text-center py-8">
              {emptyState.icon && (
                <div className="text-4xl mb-4">{emptyState.icon}</div>
              )}
              <p className="text-gray-500 mb-4">{emptyState.message}</p>
              {emptyState.action && <div>{emptyState.action}</div>}
            </div>
          ) : (
            <div className="space-y-4">
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