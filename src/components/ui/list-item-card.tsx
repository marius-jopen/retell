import { forwardRef, HTMLAttributes, ReactNode } from 'react'
import { cn } from '@/lib/utils'
import Link from 'next/link'

export interface ListItemCardProps extends HTMLAttributes<HTMLDivElement> {
  title: string
  subtitle?: string
  metadata?: string
  status?: {
    label: string
    variant: 'approved' | 'pending' | 'draft' | 'published' | 'rejected' | 'success' | 'warning' | 'error' | 'info' | 'default'
  }
  avatar?: {
    src?: string
    fallback: string
  }
  action?: ReactNode
  href?: string
  variant?: 'default' | 'compact'
}

const statusVariants = {
  approved: 'bg-green-100 text-green-800',
  pending: 'bg-yellow-100 text-yellow-800',
  draft: 'bg-gray-100 text-gray-800',
  published: 'bg-green-100 text-green-800',
  rejected: 'bg-red-100 text-red-800',
  success: 'bg-green-100 text-green-800',
  warning: 'bg-yellow-100 text-yellow-800',
  error: 'bg-red-100 text-red-800',
  info: 'bg-blue-100 text-blue-800',
  default: 'bg-gray-100 text-gray-800',
}

const ListItemCard = forwardRef<HTMLDivElement, ListItemCardProps>(
  ({ title, subtitle, metadata, status, avatar, action, href, variant = 'default', className, ...props }, ref) => {
    const content = (
      <div 
        ref={ref}
        className={cn(
          'flex items-center justify-between p-4 bg-gray-50 rounded-lg transition-colors',
          href && 'hover:bg-gray-100 cursor-pointer',
          variant === 'compact' && 'p-3',
          className
        )}
        {...props}
      >
        <div className="flex items-center space-x-3 flex-1 min-w-0">
          {avatar && (
            <div className="flex-shrink-0">
              {avatar.src ? (
                <img
                  src={avatar.src}
                  alt={title}
                  className={cn(
                    'rounded-full object-cover',
                    variant === 'compact' ? 'w-8 h-8' : 'w-10 h-10'
                  )}
                />
              ) : (
                <div className={cn(
                  'rounded-full bg-gradient-to-br from-red-500 to-red-600 flex items-center justify-center',
                  variant === 'compact' ? 'w-8 h-8' : 'w-10 h-10'
                )}>
                  <span className={cn(
                    'text-white font-medium',
                    variant === 'compact' ? 'text-xs' : 'text-sm'
                  )}>
                    {avatar.fallback}
                  </span>
                </div>
              )}
            </div>
          )}
          
          <div className="flex-1 min-w-0">
            <h3 className={cn(
              'font-semibold text-gray-900 truncate',
              variant === 'compact' ? 'text-xs' : 'text-sm'
            )}>
              {title}
            </h3>
            {subtitle && (
              <p className={cn(
                'text-gray-600 truncate',
                variant === 'compact' ? 'text-xs' : 'text-sm'
              )}>
                {subtitle}
              </p>
            )}
            {metadata && (
              <p className="text-xs text-gray-500 truncate">
                {metadata}
              </p>
            )}
          </div>
        </div>

        <div className="flex items-center space-x-2 flex-shrink-0">
          {status && (
            <span className={cn(
              'inline-flex items-center px-2 py-1 rounded-full text-xs font-medium',
              statusVariants[status.variant]
            )}>
              {status.label}
            </span>
          )}
          {action && <div>{action}</div>}
        </div>
      </div>
    )

    if (href) {
      return (
        <Link href={href}>
          {content}
        </Link>
      )
    }

    return content
  }
)
ListItemCard.displayName = 'ListItemCard'

export { ListItemCard } 