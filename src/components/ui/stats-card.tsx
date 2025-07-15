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
    return (
      <Card ref={ref} className={cn('', className)} {...props}>
        <CardContent className="p-6">
          <div className="flex items-center">
            {icon && (
              <div className={cn('w-12 h-12 rounded-lg flex items-center justify-center', colorMap[color])}>
                <div className="text-white">
                  {icon}
                </div>
              </div>
            )}
            <div className={cn('flex-1', icon && 'ml-4')}>
              <p className="text-sm font-medium text-gray-600">{title}</p>
              <div className="flex items-baseline space-x-2">
                <p className="text-2xl font-bold text-gray-900">{value}</p>
                {trend && (
                  <span className={cn(
                    'text-sm font-medium',
                    trend.isPositive ? 'text-green-600' : 'text-red-600'
                  )}>
                    {trend.isPositive ? '↗' : '↘'} {Math.abs(trend.value)}%
                    {trend.label && <span className="text-gray-500 ml-1">{trend.label}</span>}
                  </span>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }
)
StatsCard.displayName = 'StatsCard'

export { StatsCard } 