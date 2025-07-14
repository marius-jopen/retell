'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { useToast } from '@/components/ui/toast'
import { createBrowserSupabaseClient } from '@/lib/supabase'

interface UserRoleActionsProps {
  userId: string
  currentRole: 'admin' | 'author'
  userName: string
  currentUserId: string
}

export default function UserRoleActions({ userId, currentRole, userName, currentUserId }: UserRoleActionsProps) {
  const [loading, setLoading] = useState<'admin' | 'author' | null>(null)
  const { addToast } = useToast()
  const router = useRouter()
  const supabase = createBrowserSupabaseClient()

  const updateUserRole = async (newRole: 'admin' | 'author') => {
    setLoading(newRole)
    
    try {
      const { error } = await supabase
        .from('user_profiles')
        .update({ role: newRole })
        .eq('id', userId)

      if (error) {
        addToast({
          type: 'error',
          message: `Failed to update user role: ${error.message}`
        })
        return
      }

      addToast({
        type: 'success',
        message: `Successfully changed ${userName}'s role to ${newRole}`
      })

      // Refresh the page to show updated role
      router.refresh()
    } catch (error) {
      addToast({
        type: 'error',
        message: `An error occurred while updating the user role`
      })
    } finally {
      setLoading(null)
    }
  }

  // Don't show actions for current user
  if (userId === currentUserId) {
    return <span className="text-xs text-gray-500 italic">You</span>
  }

  return (
    <div className="flex space-x-1">
      {currentRole !== 'admin' && (
        <Button
          size="sm"
          variant="outline"
          className="text-xs"
          onClick={() => updateUserRole('admin')}
          disabled={loading !== null}
        >
          {loading === 'admin' ? 'Updating...' : 'Make Admin'}
        </Button>
      )}
      {currentRole !== 'author' && (
        <Button
          size="sm"
          variant="outline"
          className="text-xs"
          onClick={() => updateUserRole('author')}
          disabled={loading !== null}
        >
          {loading === 'author' ? 'Updating...' : 'Make Author'}
        </Button>
      )}
    </div>
  )
} 