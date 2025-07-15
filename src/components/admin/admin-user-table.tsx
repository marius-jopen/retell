'use client'

import { Table, TableColumn } from '@/components/ui/table'
import UserRoleActions from '@/components/admin/user-role-actions'

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

interface AdminUserTableProps {
  users: User[]
  currentUserId: string
}

function getRoleColor(role: string) {
  switch (role) {
    case 'admin': return 'bg-red-100 text-red-800'
    case 'author': return 'bg-blue-100 text-blue-800'
    case 'client': return 'bg-green-100 text-green-800'
    default: return 'bg-gray-100 text-gray-800'
  }
}

export default function AdminUserTable({ users, currentUserId }: AdminUserTableProps) {
  const columns: TableColumn<User>[] = [
    {
      key: 'user',
      title: 'User',
      render: (_, user) => (
        <div className="flex items-center space-x-3">
          <div className="flex-shrink-0">
            {user.avatar_url ? (
              <img 
                src={user.avatar_url} 
                alt={user.full_name}
                className="w-10 h-10 rounded-full object-cover"
              />
            ) : (
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-red-500 to-red-600 flex items-center justify-center">
                <span className="text-white font-bold text-xs">
                  {user.full_name.split(' ').map(n => n[0]).join('').toUpperCase()}
                </span>
              </div>
            )}
          </div>
          <div className="min-w-0">
            <div className="text-sm font-medium text-gray-900">
              {user.full_name}
            </div>
            <div className="text-xs text-gray-500">
              ID: {user.id.slice(0, 8)}...
            </div>
          </div>
        </div>
      ),
    },
    {
      key: 'email',
      title: 'Email',
      render: (_, user) => (
        <div className="text-sm text-gray-900">{user.email}</div>
      ),
    },
    {
      key: 'role',
      title: 'Role',
      render: (_, user) => (
        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getRoleColor(user.role)}`}>
          {user.role}
        </span>
      ),
      align: 'center'
    },
    {
      key: 'company',
      title: 'Company',
      render: (_, user) => (
        <span className="text-sm text-gray-500">
          {user.company || '-'}
        </span>
      ),
    },
    {
      key: 'country',
      title: 'Country',
      render: (_, user) => (
        <span className="text-sm text-gray-500">
          {user.country || '-'}
        </span>
      ),
    },
    {
      key: 'created_at',
      title: 'Joined',
      render: (_, user) => (
        <span className="text-xs text-gray-500">
          {new Date(user.created_at).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
          })}
        </span>
      ),
      sortable: true
    },
    {
      key: 'actions',
      title: 'Actions',
      render: (_, user) => (
        <UserRoleActions
          userId={user.id}
          currentRole={user.role}
          userName={user.full_name}
          currentUserId={currentUserId}
        />
      ),
      align: 'right'
    }
  ]

  return (
    <Table
      title="All Users"
      columns={columns}
      data={users}
      emptyStateMessage="No users have registered yet."
      emptyStateIcon="👥"
    />
  )
} 