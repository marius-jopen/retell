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
  ],
  author: [
    { href: '/author', label: 'Dashboard' },
    { href: '/author/podcasts', label: 'My Podcasts' },
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
    <nav className="bg-white/80 backdrop-blur-md shadow-lg border-b border-red-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link href="/" className="flex items-center group">
              <span className="text-xl font-bold text-red-500 group-hover:text-red-600 transition-colors duration-200">
                🎙️ RETELL
              </span>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-6">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="text-gray-700 hover:text-red-500 px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 hover:bg-red-50"
              >
                {item.label}
              </Link>
            ))}
          </div>

          {/* User Menu */}
          <div className="flex items-center space-x-4">
            {user ? (
              <div className="flex items-center space-x-4">
                <div className="hidden md:block">
                  <span className="text-sm text-gray-700">
                    {user.profile.full_name}
                  </span>
                  <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ml-2 transition-all duration-200 ${
                    user.profile.role === 'admin' 
                      ? 'bg-red-100 text-red-700 shadow-sm' 
                      : 'bg-orange-100 text-orange-700 shadow-sm'
                  }`}>
                    {user.profile.role === 'admin' ? '👑' : '✨'} {user.profile.role}
                  </span>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleSignOut}
                  className="rounded-full border-red-200 text-red-600 hover:bg-red-50 hover:border-red-300 transition-all duration-200"
                >
                  👋 Sign Out
                </Button>
              </div>
            ) : (
              <div className="flex items-center space-x-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => router.push('/auth/login')}
                  className="rounded-full text-red-600 hover:bg-red-50 transition-all duration-200"
                >
                  ✨ Sign In
                </Button>
                <Button
                  size="sm"
                  onClick={() => router.push('/auth/signup')}
                  className="rounded-full bg-red-500 hover:bg-red-600 text-white shadow-lg hover:shadow-xl transition-all duration-200"
                >
                  🚀 Sign Up
                </Button>
              </div>
            )}

            {/* Mobile menu button */}
            <button
              className="md:hidden inline-flex items-center justify-center p-2 rounded-full text-gray-700 hover:text-red-500 hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-red-400 transition-all duration-200"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              <span className="sr-only">Open main menu</span>
              <svg
                className="h-6 w-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 6h16M4 12h16M4 18h16"
                />
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMenuOpen && (
        <div className="md:hidden animate-in slide-in-from-top-2 duration-200">
          <div className="px-4 pt-4 pb-6 space-y-2 sm:px-6 bg-white/90 backdrop-blur-md border-t border-red-100">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="text-gray-700 hover:text-red-500 block px-4 py-3 rounded-2xl text-base font-medium transition-all duration-200 hover:bg-red-50"
                onClick={() => setIsMenuOpen(false)}
              >
                {item.label}
              </Link>
            ))}
          </div>
        </div>
      )}
    </nav>
  )
} 