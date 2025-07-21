'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input, Select } from '@/components/ui'
import { useToast } from '@/components/ui/toast'
import { createBrowserSupabaseClient } from '@/lib/supabase'
import { useRouter } from 'next/navigation'

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

interface UserEditModalProps {
  user: User
  isOpen: boolean
  onClose: () => void
  currentUserId: string
}

export default function UserEditModal({ user, isOpen, onClose, currentUserId }: UserEditModalProps) {
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    full_name: user.full_name,
    email: user.email,
    company: user.company || '',
    country: user.country || '',
    avatar_url: user.avatar_url || '',
    role: user.role
  })

  const { addToast } = useToast()
  const router = useRouter()
  const supabase = createBrowserSupabaseClient()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const { error } = await supabase
        .from('user_profiles')
        .update({
          full_name: formData.full_name,
          email: formData.email,
          company: formData.company || null,
          country: formData.country || null,
          avatar_url: formData.avatar_url || null,
          role: formData.role,
          updated_at: new Date().toISOString()
        })
        .eq('id', user.id)

      if (error) {
        addToast({
          type: 'error',
          message: `Failed to update user: ${error.message}`
        })
        return
      }

      addToast({
        type: 'success',
        message: `Successfully updated ${formData.full_name}'s profile`
      })

      onClose()
      router.refresh()
    } catch (error) {
      addToast({
        type: 'error',
        message: 'An error occurred while updating the user'
      })
    } finally {
      setLoading(false)
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg w-full max-w-md">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">Edit User Profile</h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <Input
            label="Full Name"
            id="full_name"
            name="full_name"
            value={formData.full_name}
            onChange={handleInputChange}
            required
          />

          <Input
            label="Email"
            type="email"
            id="email"
            name="email"
            value={formData.email}
            onChange={handleInputChange}
            required
          />

          <div>
            <Select
              label="Role"
              id="role"
              name="role"
              value={formData.role}
              onChange={handleInputChange}
              disabled={user.id === currentUserId} // Don't allow changing own role
            >
              <option value="client">Client</option>
              <option value="author">Author</option>
              <option value="admin">Admin</option>
            </Select>
            {user.id === currentUserId && (
              <p className="text-xs text-gray-500 mt-1">You cannot change your own role</p>
            )}
          </div>

          <Input
            label="Company"
            id="company"
            name="company"
            value={formData.company}
            onChange={handleInputChange}
            placeholder="Optional"
          />

          <Input
            label="Country"
            id="country"
            name="country"
            value={formData.country}
            onChange={handleInputChange}
            placeholder="Optional"
          />

          <Input
            label="Avatar URL"
            type="url"
            id="avatar_url"
            name="avatar_url"
            value={formData.avatar_url}
            onChange={handleInputChange}
            placeholder="Optional"
          />

          <div className="flex justify-end space-x-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="bg-red-500 hover:bg-red-600 text-white"
              disabled={loading}
            >
              {loading ? 'Saving...' : 'Save Changes'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
} 