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
  { href: '/catalog', label: 'Podcasts' },
  { href: '/about', label: 'About' },
]

const roleBasedNavItems = {
  admin: [
    { href: '/admin', label: 'Dashboard' },
    { href: '/admin/podcasts', label: 'Podcasts' },
    { href: '/admin/users', label: 'Users' },
    { href: '/catalog', label: 'Catalog' },
  ],
  author: [
    { href: '/author', label: 'Dashboard' },
    { href: '/author/podcasts', label: 'My Podcasts' },
    { href: '/catalog', label: 'Podcasts' },
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
    <nav className="bg-white/80 backdrop-blur-md shadow-modern border-b border-orange-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          {/* Logo */}
          <div className="flex items-center">
            <Link href="/" className="flex items-center group">
              <span className="text-xl font-bold text-orange-500 group-hover:text-orange-600 transition-colors duration-200">
                🎙️ RETELL
              </span>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-1">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="text-gray-700 hover:text-orange-500 px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 hover:bg-orange-50"
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
                  className="rounded-full border-orange-200 text-orange-600 hover:bg-orange-50 hover:border-orange-300 transition-all duration-200"
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
                  className="rounded-full text-orange-600 hover:bg-orange-50 transition-all duration-200"
                >
                  Sign In
                </Button>
                <Button
                  size="sm"
                  onClick={() => router.push('/auth/signup')}
                  className="rounded-full bg-orange-500 hover:bg-orange-600 text-white shadow-modern hover:shadow-modern-lg transition-all duration-200"
                >
                  Get Started
                </Button>
              </div>
            )}

            {/* Mobile menu button */}
            <button
              className="md:hidden inline-flex items-center justify-center p-2 rounded-full text-gray-700 hover:text-orange-500 hover:bg-orange-50 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-orange-400 transition-all duration-200"
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
        <div className="md:hidden animate-in slide-in-from-top-2 duration-200">
          <div className="px-4 pt-4 pb-6 space-y-2 sm:px-6 bg-white/90 backdrop-blur-md border-t border-orange-100">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="text-gray-700 hover:text-orange-500 block px-4 py-3 rounded-modern text-base font-medium transition-all duration-200 hover:bg-orange-50"
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