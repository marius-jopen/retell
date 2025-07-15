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
  ({ title, icon, href, onClick, description, variant = 'default', className, ...props }, ref) => {
    const cardContent = (
      <Card 
        ref={ref} 
        interactive="hover" 
        variant={variant === 'featured' ? 'gradient' : 'default'}
        className={cn('cursor-pointer', className)} 
        {...props}
      >
        <CardContent className="p-6 text-center">
          <div className="text-3xl mb-3">{icon}</div>
          <div className="text-sm font-medium text-gray-900">{title}</div>
          {description && (
            <div className="text-xs text-gray-600 mt-1">{description}</div>
          )}
        </CardContent>
      </Card>
    )

    if (href) {
      return (
        <Link href={href}>
          {cardContent}
        </Link>
      )
    }

    if (onClick) {
      return (
        <div onClick={onClick}>
          {cardContent}
        </div>
      )
    }

    return cardContent
  }
)
ActionCard.displayName = 'ActionCard'

export { ActionCard } 