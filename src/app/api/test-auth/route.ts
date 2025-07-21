import { NextRequest, NextResponse } from 'next/server'
import { getCurrentUser } from '@/lib/auth'

export async function GET(request: NextRequest) {
  try {
    console.log('Test auth endpoint called')
    
    const user = await getCurrentUser()
    
    console.log('User from getCurrentUser:', user ? 'exists' : 'null')
    if (user) {
      console.log('User ID:', user.id)
      console.log('User role:', user.profile?.role)
    }
    
    return NextResponse.json({
      authenticated: !!user,
      user: user ? {
        id: user.id,
        email: user.email,
        role: user.profile?.role
      } : null
    })
  } catch (error) {
    console.error('Test auth error:', error)
    return NextResponse.json({ error: 'Error testing auth', details: error }, { status: 500 })
  }
} 