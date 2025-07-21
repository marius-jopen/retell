import { requireAdmin } from '@/lib/auth'
import { createAdminSupabaseClient } from '@/lib/supabase'
import { Button } from '@/components/ui/button'
import { StatsCard } from '@/components/ui/stats-card'
import AdminUserTable from '@/components/admin/admin-user-table'
import Link from 'next/link'
import UserRoleActions from '@/components/admin/user-role-actions'
import UserAccordion from '@/components/admin/user-accordion'

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

async function getUsers() {
  const supabase = createAdminSupabaseClient()
  
  const { data: users, error } = await supabase
    .from('user_profiles')
    .select('*')
    .order('created_at', { ascending: false })
  
  if (error) {
    console.error('Error fetching users:', error)
    return []
  }
  
  return users as User[]
}

export default async function AdminUsersPage() {
  const currentUser = await requireAdmin()
  const users = await getUsers()
  
  const stats = {
    total: users.length,
    admins: users.filter(u => u.role === 'admin').length,
    authors: users.filter(u => u.role === 'author').length,
    clients: users.filter(u => u.role === 'client').length
  }

  return (
    <div className="min-h-screen bg-orange-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">User Management</h1>
              <p className="mt-2 text-lg text-gray-600">
                Manage user accounts and roles
              </p>
            </div>
            <Link href="/admin">
              <Button variant="outline" className="rounded-full border-orange-200 text-orange-600 hover:bg-orange-50">
                Back to Dashboard
              </Button>
            </Link>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-modern-lg shadow-modern p-6 border border-orange-200">
            <h3 className="text-lg font-semibold text-gray-900">Total Users</h3>
            <p className="text-3xl font-bold text-orange-600">{stats.total}</p>
          </div>
          <div className="bg-white rounded-modern-lg shadow-modern p-6 border border-orange-200">
            <h3 className="text-lg font-semibold text-gray-900">Admins</h3>
            <p className="text-3xl font-bold text-red-600">{stats.admins}</p>
          </div>
          <div className="bg-white rounded-modern-lg shadow-modern p-6 border border-orange-200">
            <h3 className="text-lg font-semibold text-gray-900">Authors</h3>
            <p className="text-3xl font-bold text-blue-600">{stats.authors}</p>
          </div>
          <div className="bg-white rounded-modern-lg shadow-modern p-6 border border-orange-200">
            <h3 className="text-lg font-semibold text-gray-900">Clients</h3>
            <p className="text-3xl font-bold text-green-600">{stats.clients}</p>
          </div>
        </div>

        {/* User List */}
        <div className="bg-white rounded-modern-lg shadow-modern overflow-hidden border border-orange-200">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-xl font-semibold text-gray-900">All Users</h2>
          </div>
          
          {users.length === 0 ? (
            <div className="text-center py-12">
              <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
              </svg>
              <h3 className="mt-2 text-sm font-medium text-gray-900">No users</h3>
              <p className="mt-1 text-sm text-gray-500">
                No users have registered yet.
              </p>
            </div>
          ) : (
            <div className="divide-y divide-gray-200">
              {users.map((user) => (
                <UserAccordion
                  key={user.id}
                  user={user}
                  currentUserId={currentUser.id}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
} 