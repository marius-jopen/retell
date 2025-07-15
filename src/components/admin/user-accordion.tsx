'use client'

import React, { useState } from 'react'
import { Button } from '@/components/ui/button'
import UserRoleActions from './user-role-actions'

interface User {
  id: string
  email: string
  role: 'admin' | 'author' | 'client'
  full_name: string
  avatar_url: string | null
  company: string | null
  country: string | null
  created_at: string
  updated_at: string
}

interface UserAccordionProps {
  user: User
  currentUserId: string
}

export default function UserAccordion({ user, currentUserId }: UserAccordionProps) {
  const [isExpanded, setIsExpanded] = useState(false)

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'admin':
        return 'bg-red-100 text-red-800'
      case 'author':
        return 'bg-blue-100 text-blue-800'
      case 'client':
        return 'bg-green-100 text-green-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'admin':
        return '👑'
      case 'author':
        return '🎤'
      case 'client':
        return '🎧'
      default:
        return '👤'
    }
  }

  return (
    <div className="border-gray-200">
      {/* Header - Always Visible */}
      <div 
        className="px-6 py-4 hover:bg-orange-50 transition-colors cursor-pointer"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            {/* Avatar */}
            <div className="flex-shrink-0">
              {user.avatar_url ? (
                <img 
                  src={user.avatar_url} 
                  alt={user.full_name}
                  className="h-12 w-12 rounded-full object-cover"
                />
              ) : (
                <div className="h-12 w-12 rounded-full bg-gradient-to-br from-orange-500 to-orange-600 flex items-center justify-center">
                  <span className="text-white font-bold text-sm">
                    {user.full_name.split(' ').map(n => n[0]).join('').toUpperCase()}
                  </span>
                </div>
              )}
            </div>

            {/* Basic Info */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center space-x-3">
                <h3 className="text-lg font-semibold text-gray-900 truncate">
                  {user.full_name}
                </h3>
                <span className={`inline-flex items-center px-3 py-1 text-xs font-medium rounded-full ${getRoleColor(user.role)}`}>
                  {getRoleIcon(user.role)} {user.role}
                </span>
              </div>
              <p className="text-sm text-gray-600 truncate">{user.email}</p>
              <div className="flex items-center space-x-4 text-xs text-gray-500 mt-1">
                <span>{user.company || 'No company'}</span>
                <span>•</span>
                <span>{user.country || 'No country'}</span>
                <span>•</span>
                <span>Joined {new Date(user.created_at).toLocaleDateString()}</span>
              </div>
            </div>
          </div>

          {/* Expand Arrow */}
          <div className="flex items-center space-x-2">
            <UserRoleActions
              userId={user.id}
              currentRole={user.role}
              userName={user.full_name}
              currentUserId={currentUserId}
            />
            <button className="p-2 hover:bg-orange-100 rounded-full transition-colors">
              <svg 
                className={`w-5 h-5 text-gray-400 transition-transform ${isExpanded ? 'rotate-180' : ''}`}
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Expanded Content */}
      {isExpanded && (
        <div className="px-6 pb-6 bg-orange-50 border-t border-gray-200">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-4">
            {/* Personal Information */}
            <div className="bg-white rounded-modern p-4 border border-orange-200">
              <h4 className="text-sm font-semibold text-gray-900 mb-3">Personal Information</h4>
              <div className="space-y-2 text-sm">
                <div>
                  <span className="font-medium text-gray-700">Full Name:</span>
                  <span className="ml-2 text-gray-600">{user.full_name}</span>
                </div>
                <div>
                  <span className="font-medium text-gray-700">Email:</span>
                  <span className="ml-2 text-gray-600">{user.email}</span>
                </div>
                <div>
                  <span className="font-medium text-gray-700">User ID:</span>
                  <span className="ml-2 text-gray-600 font-mono text-xs">{user.id}</span>
                </div>
              </div>
            </div>

            {/* Account Details */}
            <div className="bg-white rounded-modern p-4 border border-orange-200">
              <h4 className="text-sm font-semibold text-gray-900 mb-3">Account Details</h4>
              <div className="space-y-2 text-sm">
                <div>
                  <span className="font-medium text-gray-700">Role:</span>
                  <span className={`ml-2 px-2 py-1 text-xs rounded-full ${getRoleColor(user.role)}`}>
                    {getRoleIcon(user.role)} {user.role}
                  </span>
                </div>
                <div>
                  <span className="font-medium text-gray-700">Company:</span>
                  <span className="ml-2 text-gray-600">{user.company || 'Not specified'}</span>
                </div>
                <div>
                  <span className="font-medium text-gray-700">Country:</span>
                  <span className="ml-2 text-gray-600">{user.country || 'Not specified'}</span>
                </div>
              </div>
            </div>

            {/* Activity & Timestamps */}
            <div className="bg-white rounded-modern p-4 border border-orange-200">
              <h4 className="text-sm font-semibold text-gray-900 mb-3">Activity</h4>
              <div className="space-y-2 text-sm">
                <div>
                  <span className="font-medium text-gray-700">Joined:</span>
                  <span className="ml-2 text-gray-600">
                    {new Date(user.created_at).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </span>
                </div>
                <div>
                  <span className="font-medium text-gray-700">Last Updated:</span>
                  <span className="ml-2 text-gray-600">
                    {new Date(user.updated_at).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </span>
                </div>
                <div>
                  <span className="font-medium text-gray-700">Status:</span>
                  <span className="ml-2">
                    <span className="inline-flex items-center px-2 py-1 text-xs font-medium bg-green-100 text-green-800 rounded-full">
                      ✅ Active
                    </span>
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="mt-6 pt-4 border-t border-gray-200">
            <h4 className="text-sm font-semibold text-gray-900 mb-3">Quick Actions</h4>
            <div className="flex flex-wrap gap-2">
              <Button size="sm" variant="outline" className="rounded-full border-orange-200 text-orange-600 hover:bg-orange-50">
                📧 Send Email
              </Button>
              <Button size="sm" variant="outline" className="rounded-full border-orange-200 text-orange-600 hover:bg-orange-50">
                🔍 View Activity
              </Button>
              <Button size="sm" variant="outline" className="rounded-full border-orange-200 text-orange-600 hover:bg-orange-50">
                ⚙️ Edit Profile
              </Button>
              {user.role === 'author' && (
                <Button size="sm" variant="outline" className="rounded-full border-orange-200 text-orange-600 hover:bg-orange-50">
                  🎤 View Podcasts
                </Button>
              )}
              {user.id !== currentUserId && (
                <Button size="sm" variant="outline" className="rounded-full border-red-200 text-red-600 hover:bg-red-50">
                  🚫 Suspend User
                </Button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}