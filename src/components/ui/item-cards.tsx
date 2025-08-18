import { forwardRef, HTMLAttributes } from 'react'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from './card'
import { Button } from './button'
import { cn } from '@/lib/utils'
import Link from 'next/link'

// Podcast Card - for displaying podcast information
export interface PodcastCardProps extends HTMLAttributes<HTMLDivElement> {
  podcast: {
    id: string
    title: string
    description: string
    category: string
    language: string
    cover_image_url?: string
    episodes?: { length: number } | any[]
  }
  href?: string
  showActions?: boolean
  variant?: 'default' | 'featured' | 'minimal'
}

const PodcastCard = forwardRef<HTMLDivElement, PodcastCardProps>(
  ({ podcast, href, showActions = true, variant = 'default', className, ...props }, ref) => {
    const cardContent = (
      <Card
        ref={ref}
        variant={variant === 'featured' ? 'gradient' : 'default'}
        rounded={variant === 'featured' ? 'xl' : 'default'}
        className={cn('overflow-hidden', className)}
        {...props}
      >
        {/* Cover Image */}
        <div className="relative h-48 w-full">
          {podcast.cover_image_url ? (
            <img
              src={podcast.cover_image_url}
              alt={podcast.title}
              className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center bg-red-600 transition-all duration-300">
              <span className="text-3xl font-bold text-white">
                {podcast.title.substring(0, 2).toUpperCase()}
              </span>
            </div>
          )}
          {/* Episode Count Badge */}
          <div className="absolute right-4 top-4">
            <span className="rounded-full bg-white/90 px-3 py-1 text-xs font-medium text-gray-800 backdrop-blur-sm">
              {Array.isArray(podcast.episodes) ? podcast.episodes.length : podcast.episodes?.length || 0} episodes
            </span>
          </div>
        </div>

        <CardHeader>
          <div className="flex items-center justify-between">
            <span className="rounded-full bg-red-100 px-2.5 py-0.5 text-xs font-medium capitalize text-red-800">
              {podcast.category}
            </span>
            <span className="text-xs uppercase tracking-wide text-gray-500">
              {podcast.language}
            </span>
          </div>
        </CardHeader>

        <CardContent>
          <CardTitle className="mb-2 text-xl transition-colors group-hover:text-red-600">
            {podcast.title}
          </CardTitle>
          <CardDescription className="line-clamp-3 leading-relaxed">
            {podcast.description}
          </CardDescription>
        </CardContent>

        {showActions && (
          <CardFooter className="justify-between">
            <Button variant="outline" size="sm">
              Preview
            </Button>
            <Button variant="primary" size="sm">
              License
            </Button>
          </CardFooter>
        )}
      </Card>
    )

    if (href) {
      return (
        <Link href={href} className="group">
          {cardContent}
        </Link>
      )
    }

    return cardContent
  }
)
PodcastCard.displayName = 'PodcastCard'



// Feature Card - for showcasing features or benefits
export interface FeatureCardProps extends HTMLAttributes<HTMLDivElement> {
  icon: React.ReactNode
  title: string
  description: string
  action?: {
    label: string
    href?: string
    onClick?: () => void
  }
}

const FeatureCard = forwardRef<HTMLDivElement, FeatureCardProps>(
  ({ icon, title, description, action, className, ...props }, ref) => {
    return (
      <Card
        ref={ref}
        variant="default"
        className={cn('text-center', className)}
        {...props}
      >
        <CardHeader>
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-red-100 text-3xl shadow-lg transition-transform duration-300 group-hover:scale-110">
            {icon}
          </div>
          <CardTitle className="text-xl">{title}</CardTitle>
        </CardHeader>
        <CardContent>
          <CardDescription className="leading-relaxed">{description}</CardDescription>
        </CardContent>
        {action && (
          <CardFooter className="justify-center">
            {action.href ? (
              <Link href={action.href}>
                <Button variant="outline">{action.label}</Button>
              </Link>
            ) : (
              <Button variant="outline" onClick={action.onClick}>
                {action.label}
              </Button>
            )}
          </CardFooter>
        )}
      </Card>
    )
  }
)
FeatureCard.displayName = 'FeatureCard'

// Pricing Card - for displaying pricing tiers
export interface PricingCardProps extends HTMLAttributes<HTMLDivElement> {
  name: string
  price: string
  period?: string
  description: string
  features: string[]
  highlighted?: boolean
  buttonText: string
  onSelect?: () => void
}

const PricingCard = forwardRef<HTMLDivElement, PricingCardProps>(
  ({ name, price, period, description, features, highlighted = false, buttonText, onSelect, className, ...props }, ref) => {
    return (
      <Card
        ref={ref}
        variant={highlighted ? 'outlined' : 'default'}
        size="lg"
        rounded="xl"
        className={cn(
          'relative',
          highlighted && 'border-red-500 shadow-2xl scale-105',
          className
        )}
        {...props}
      >
        {highlighted && (
          <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
            <span className="bg-red-600 text-white px-6 py-2 rounded-full text-sm font-semibold shadow-lg">
              🔥 Most Popular
            </span>
          </div>
        )}

        <CardHeader>
          <CardTitle className="text-center">{name}</CardTitle>
          <CardDescription className="text-center">{description}</CardDescription>
        </CardHeader>

        <CardContent>
          <div className="mb-6 text-center">
            <span className="text-4xl font-bold text-gray-900">{price}</span>
            {period && <span className="ml-2 text-gray-600">{period}</span>}
          </div>

          <ul className="space-y-3">
            {features.map((feature, index) => (
              <li key={index} className="flex items-center text-sm">
                <svg className="mr-3 h-4 w-4 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                {feature}
              </li>
            ))}
          </ul>
        </CardContent>

        <CardFooter>
          <Button
            variant={highlighted ? 'gradient' : 'primary'}
            size="lg"
            rounded="lg"
            className="w-full"
            onClick={onSelect}
          >
            {buttonText}
          </Button>
        </CardFooter>
      </Card>
    )
  }
)
PricingCard.displayName = 'PricingCard'

export { PodcastCard, FeatureCard, PricingCard } 