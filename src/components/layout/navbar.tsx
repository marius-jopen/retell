'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { createBrowserSupabaseClient } from '@/lib/supabase'
import { Button } from '@/components/ui/button'
import { UserRole } from '@/lib/auth'

interface NavbarProps {
  user?: {
    id: string
    profile: {
      role: UserRole
      full_name: string
      avatar_url: string | null
    }
  } | null
}

const publicNavItems = [
  { href: '/', label: 'Home' },
  { href: '/catalog', label: 'Catalog' },
  { href: '/about', label: 'About' },
]

const roleBasedNavItems = {
  admin: [
    { href: '/admin', label: 'Dashboard' },
    { href: '/admin/podcasts', label: 'Podcasts' },
    { href: '/admin/users', label: 'Users' },
    { href: '/admin/analytics', label: 'Analytics' },
    { href: '/catalog', label: 'Catalog' },
    { href: '/about', label: 'About' },
  ],
  author: [
    { href: '/author', label: 'Dashboard' },
    { href: '/author/podcasts', label: 'My Podcasts' },
    { href: '/author/analytics', label: 'Analytics' },
    { href: '/catalog', label: 'Catalog' },
    { href: '/about', label: 'About' },
  ],
}

export default function Navbar({ user }: NavbarProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const router = useRouter()
  const supabase = createBrowserSupabaseClient()

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    router.push('/')
    router.refresh()
  }

  const navItems = user?.profile?.role && (user.profile.role === 'admin' || user.profile.role === 'author')
    ? roleBasedNavItems[user.profile.role]
    : publicNavItems

  return (
    <nav className="sticky top-0 z-50 bg-white/95 backdrop-blur-lg border-b border-gray-100 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          {/* Logo */}
          <div className="flex items-center">
            <Link href="/" className="flex items-center group">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-gradient-to-br from-red-500 to-red-600 rounded-xl flex items-center justify-center shadow-sm group-hover:shadow-md transition-all duration-200">
                  <span className="text-white font-bold text-sm">🎙️</span>
                </div>
                <span className="text-xl font-semibold bg-gradient-to-r from-red-600 to-red-700 bg-clip-text text-transparent group-hover:from-red-700 group-hover:to-red-800 transition-all duration-200">
                  RETELL
                </span>
              </div>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-1">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="text-gray-600 hover:text-red-600 px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 hover:bg-red-50/80 hover:shadow-sm"
              >
                {item.label}
              </Link>
            ))}
          </div>

          {/* User Menu */}
          <div className="flex items-center space-x-3">
            {user ? (
              <div className="flex items-center space-x-3">
                <div className="hidden md:flex items-center space-x-3">
                  <div className="text-right">
                    <div className="text-sm font-medium text-gray-900">
                      {user.profile.full_name}
                    </div>
                    <div className="text-xs text-gray-500">
                      {user.profile.role === 'admin' ? 'Administrator' : 'Content Creator'}
                    </div>
                  </div>
                  <div className={`inline-flex items-center px-3 py-1.5 rounded-full text-sm font-medium transition-all duration-200 ${
                    user.profile.role === 'admin' 
                      ? 'bg-red-50 text-red-700 border border-red-200' 
                      : 'bg-red-50 text-red-700 border border-red-200'
                  }`}>
                    {user.profile.role === 'admin' ? 'Admin' : 'Author'}
                  </div>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleSignOut}
                  className="rounded-xl border-gray-200 text-gray-600 hover:bg-red-50 hover:border-red-200 hover:text-red-600 transition-all duration-200 font-medium"
                >
                  Sign Out
                </Button>
              </div>
            ) : (
              <div className="flex items-center space-x-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => router.push('/auth/login')}
                  className="rounded-xl text-gray-600 hover:bg-red-50 hover:text-red-600 transition-all duration-200 font-medium"
                >
                  Sign In
                </Button>
                <Button
                  size="sm"
                  onClick={() => router.push('/auth/signup')}
                  className="rounded-xl bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white shadow-sm hover:shadow-md transition-all duration-200 font-semibold"
                >
                  Get Started
                </Button>
              </div>
            )}

            {/* Mobile menu button */}
            <button
              className="md:hidden inline-flex items-center justify-center p-2 rounded-xl text-gray-500 hover:text-red-600 hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 transition-all duration-200"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              <span className="sr-only">Open main menu</span>
              {!isMenuOpen ? (
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              ) : (
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMenuOpen && (
        <div className="md:hidden animate-in slide-in-from-top-2 duration-300 ease-out">
          <div className="px-4 pt-2 pb-4 space-y-1 bg-white/95 backdrop-blur-lg border-t border-gray-100">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="text-gray-600 hover:text-red-600 block px-4 py-3 rounded-xl text-base font-medium transition-all duration-200 hover:bg-red-50/80"
                onClick={() => setIsMenuOpen(false)}
              >
                {item.label}
              </Link>
            ))}
            
            {/* Mobile User Info */}
            {user && (
              <div className="pt-4 mt-4 border-t border-gray-100">
                <div className="px-4 py-2">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-base font-medium text-gray-900">
                        {user.profile.full_name}
                      </div>
                      <div className="text-sm text-gray-500">
                        {user.profile.role === 'admin' ? 'Administrator' : 'Content Creator'}
                      </div>
                    </div>
                    <div className={`inline-flex items-center px-3 py-1.5 rounded-full text-sm font-medium ${
                      user.profile.role === 'admin' 
                        ? 'bg-red-50 text-red-700 border border-red-200' 
                        : 'bg-red-50 text-red-700 border border-red-200'
                    }`}>
                      {user.profile.role === 'admin' ? 'Admin' : 'Author'}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </nav>
  )
} 