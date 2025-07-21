import Link from 'next/link'
import { Button } from './button'

interface ErrorStateProps {
  title: string
  message: string
  actionText?: string
  actionHref?: string
  icon?: 'not-found' | 'access-denied' | 'server-error'
}

export function ErrorState({ 
  title, 
  message, 
  actionText = "Go Back", 
  actionHref = "/catalog",
  icon = 'not-found'
}: ErrorStateProps) {
  const iconSvg = {
    'not-found': (
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 12h6m-6-4h6m2 5.291A7.962 7.962 0 0112 15c-2.34 0-4.29-1.194-5.5-3M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
    ),
    'access-denied': (
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
    ),
    'server-error': (
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
    )
  }

  return (
    <div className="min-h-screen bg-stone-50 flex items-center justify-center">
      <div className="text-center max-w-md mx-auto px-4">
        <div className="mb-8">
          <svg className="mx-auto h-16 w-16 text-stone-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            {iconSvg[icon]}
          </svg>
        </div>
        <h1 className="text-2xl font-light text-stone-800 mb-3">{title}</h1>
        <p className="text-stone-600 mb-8 font-light">{message}</p>
        <Link href={actionHref}>
          <Button className="bg-red-500 hover:bg-red-600 text-white">
            {actionText}
          </Button>
        </Link>
      </div>
    </div>
  )
} 