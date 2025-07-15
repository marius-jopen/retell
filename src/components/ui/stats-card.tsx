import { forwardRef, HTMLAttributes, ReactNode } from 'react'
import { Card, CardContent } from './card'
import { cn } from '@/lib/utils'

export interface StatsCardProps extends HTMLAttributes<HTMLDivElement> {
  title: string
  value: string | number
  icon?: ReactNode
  color?: 'orange' | 'amber' | 'rose' | 'stone' | 'yellow' | 'gray' | 'blue' | 'green' | 'red' | 'purple'
  trend?: {
    value: number
    isPositive: boolean
    label?: string
  }
}

const colorMap = {
  orange: 'bg-orange-500',
  amber: 'bg-amber-500',
  rose: 'bg-rose-500',
  stone: 'bg-stone-500',
  yellow: 'bg-yellow-500',
  gray: 'bg-gray-500',
  blue: 'bg-blue-500',
  green: 'bg-green-500',
  red: 'bg-red-500',
  purple: 'bg-purple-500',
}

const StatsCard = forwardRef<HTMLDivElement, StatsCardProps>(
  ({ title, value, icon, color = 'blue', trend, className, ...props }, ref) => {
    const isEmoji = typeof icon === 'string'
    
    return (
      <Card ref={ref} className={cn('', className)} {...props}>
        <CardContent className="p-4">
          <div className="flex items-center">
            {icon && (
              <>
                {isEmoji ? (
                  <div className="text-3xl mr-3">
                    {icon}
                  </div>
                ) : (
                  <div className={cn('w-10 h-10 rounded-xl flex items-center justify-center mr-3', colorMap[color])}>
                    <div className="text-white text-sm">
                      {icon}
                    </div>
                  </div>
                )}
              </>
            )}
            <div className="flex-1 min-w-0">
              <p className="text-xs font-medium text-gray-500 mb-1">{title}</p>
              <p className="text-xl font-bold text-gray-900 leading-none">{value}</p>
              {trend && (
                <div className="flex items-center mt-1">
                  <span className={cn(
                    'text-xs font-medium',
                    trend.isPositive ? 'text-green-600' : 'text-red-600'
                  )}>
                    {trend.isPositive ? '↗' : '↘'} {Math.abs(trend.value)}%
                  </span>
                  {trend.label && (
                    <span className="text-xs text-gray-400 ml-1">{trend.label}</span>
                  )}
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }
)
StatsCard.displayName = 'StatsCard'

export { StatsCard } 