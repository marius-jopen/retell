import { createServerSupabaseClient } from './supabase'
import { redirect } from 'next/navigation'
import { type Database } from '../types/database'

export type UserRole = 'admin' | 'author'

export interface UserProfile {
  id: string
  email: string
  role: UserRole
  full_name: string
  avatar_url: string | null
  company: string | null
  country: string | null
  created_at: string
  updated_at: string
}

export async function getCurrentUser() {
  const supabase = await createServerSupabaseClient()
  
  try {
    const {
      data: { user },
      error,
    } = await supabase.auth.getUser()

    if (error || !user) {
      return null
    }

    // Get user profile
    const { data: profile } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('id', user.id)
      .single()

    if (!profile) {
      return null
    }

    return {
      ...user,
      profile,
    }
  } catch (error) {
    console.error('Error getting current user:', error)
    return null
  }
}

export async function requireAuth(redirectTo: string = '/auth/login') {
  const user = await getCurrentUser()
  
  console.log('requireAuth - user:', user ? 'exists' : 'null', 'redirectTo:', redirectTo)
  
  if (!user) {
    console.log('requireAuth - redirecting to:', redirectTo)
    redirect(redirectTo)
  }
  
  return user
}

export async function requireRole(role: UserRole | UserRole[], redirectTo: string = '/unauthorized') {
  const user = await requireAuth()
  
  console.log('requireRole - user:', user ? 'exists' : 'null', 'role:', role)
  
  if (!user?.profile) {
    console.log('requireRole - no profile, redirecting to /auth/login')
    redirect('/auth/login')
  }
  
  const userRole = user.profile.role
  const allowedRoles = Array.isArray(role) ? role : [role]
  
  console.log('requireRole - userRole:', userRole, 'allowedRoles:', allowedRoles)
  
  if (!allowedRoles.includes(userRole)) {
    console.log('requireRole - wrong role, redirecting to:', redirectTo)
    redirect(redirectTo)
  }
  
  return user
}

export async function requireAdmin() {
  console.log('requireAdmin - called')
  return await requireRole('admin', '/unauthorized')
}

export async function requireAuthor() {
  return await requireRole('author', '/unauthorized')
}



export async function createUserProfile(userId: string, email: string, role: UserRole, fullName: string) {
  const supabase = await createServerSupabaseClient()
  
  const { data, error } = await supabase
    .from('user_profiles')
    .insert({
      id: userId,
      email,
      role,
      full_name: fullName,
    })
    .select()
    .single()

  if (error) {
    console.error('Error creating user profile:', error)
    throw error
  }

  return data
}

export async function updateUserProfile(userId: string, updates: Partial<UserProfile>) {
  const supabase = await createServerSupabaseClient()
  
  const { data, error } = await supabase
    .from('user_profiles')
    .update(updates)
    .eq('id', userId)
    .select()
    .single()

  if (error) {
    console.error('Error updating user profile:', error)
    throw error
  }

  return data
}

export function getRedirectForRole(role: UserRole): string {
  switch (role) {
    case 'admin':
      return '/admin'
    case 'author':
      return '/author'
    default:
      return '/'
  }
} 