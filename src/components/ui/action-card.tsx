import { forwardRef, HTMLAttributes, ReactNode } from 'react'
import { Card, CardContent } from './card'
import { cn } from '@/lib/utils'
import Link from 'next/link'

export interface ActionCardProps extends HTMLAttributes<HTMLDivElement> {
  title: string
  icon: ReactNode
  href?: string
  onClick?: () => void
  description?: string
  variant?: 'default' | 'featured'
}

const ActionCard = forwardRef<HTMLDivElement, ActionCardProps>(
  ({ title, description, icon, href, onClick, variant = 'default', className, ...props }, ref) => {
    const content = (
      <Card 
        ref={ref} 
        variant={variant === 'featured' ? 'gradient' : 'default'}
        className={cn(
          'transition-all duration-200 hover:shadow-md border-gray-100 hover:border-gray-200',
          onClick || href ? 'cursor-pointer hover:scale-[1.02]' : '',
          className
        )} 
        {...props}
        onClick={onClick}
      >
        <CardContent className="p-4 text-center">
          {icon && (
            <div className="text-2xl mb-2">
              {icon}
            </div>
          )}
          <div>
            <h3 className="text-sm font-semibold text-gray-900 mb-1">
              {title}
            </h3>
            {description && (
              <p className="text-xs text-gray-500 leading-relaxed">
                {description}
              </p>
            )}
          </div>
        </CardContent>
      </Card>
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
ActionCard.displayName = 'ActionCard'

export { ActionCard } 