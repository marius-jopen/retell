import { requireAdmin } from '@/lib/auth'
import { createAdminSupabaseClient } from '@/lib/supabase'
import { Button } from '@/components/ui/button'
import { StatsCard } from '@/components/ui/stats-card'
import AdminUserTable from '@/components/admin/admin-user-table'
import Link from 'next/link'

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
    authors: users.filter(u => u.role === 'author').length
  }

  return (
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
            <Button variant="outline">Back to Dashboard</Button>
          </Link>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <StatsCard
          title="Total Users"
          value={stats.total}
          icon="👥"
          color="blue"
        />
        <StatsCard
          title="Admins"
          value={stats.admins}
          icon="🔑"
          color="red"
        />
        <StatsCard
          title="Authors"
          value={stats.authors}
          icon="🎙️"
          color="blue"
        />
      </div>

      {/* User List */}
      <AdminUserTable users={users} currentUserId={currentUser.id} />
    </div>
  )
} 