'use client'

import { Table, TableColumn } from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import PodcastActions from '@/components/admin/podcast-actions'

interface Podcast {
  id: string
  title: string
  description: string
  cover_image_url: string | null
  author_id: string
  category: string
  language: string
  country: string
  status: 'draft' | 'pending' | 'approved' | 'rejected'
  rss_url: string | null
  created_at: string
  updated_at: string
  user_profiles: {
    full_name: string
    email: string
    company: string | null
  } | null
  episodes: Array<{
    id: string
    title: string
    status: 'draft' | 'pending' | 'approved' | 'rejected'
  }>
}

interface AdminPodcastTableProps {
  podcasts: Podcast[]
}

function formatDate(dateString: string) {
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

function getStatusColor(status: string) {
  switch (status) {
    case 'approved': return 'bg-green-100 text-green-800'
    case 'rejected': return 'bg-red-100 text-red-800'
    case 'pending': return 'bg-yellow-100 text-yellow-800'
    case 'draft': return 'bg-gray-100 text-gray-800'
    default: return 'bg-gray-100 text-gray-800'
  }
}

export default function AdminPodcastTable({ podcasts }: AdminPodcastTableProps) {
  const columns: TableColumn<Podcast>[] = [
    {
      key: 'podcast',
      title: 'Podcast',
      render: (_, podcast) => (
        <div className="flex items-center space-x-3 sm:space-x-4">
          <div className="flex-shrink-0">
            {podcast.cover_image_url ? (
              <img 
                src={podcast.cover_image_url} 
                alt={podcast.title}
                className="w-12 h-12 sm:w-14 sm:h-14 rounded-xl object-cover shadow-sm"
              />
            ) : (
              <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-xl bg-gradient-to-br from-red-500 to-red-600 flex items-center justify-center shadow-sm">
                <span className="text-white font-bold text-sm">
                  {podcast.title.substring(0, 2).toUpperCase()}
                </span>
              </div>
            )}
          </div>
          <div className="min-w-0">
            <div className="text-sm sm:text-base font-semibold text-gray-900 truncate mb-1">
              {podcast.title}
            </div>
            <div className="text-xs sm:text-sm text-gray-500">
              {podcast.language.toUpperCase()} • {podcast.country}
            </div>
          </div>
        </div>
      ),
    },
    {
      key: 'author',
      title: 'Author',
      render: (_, podcast) => (
        <div>
          <div className="text-sm font-medium text-gray-900 truncate mb-0.5">{podcast.user_profiles?.full_name || 'Unknown Author'}</div>
          <div className="text-xs text-gray-500 truncate">{podcast.user_profiles?.email || 'No email'}</div>
        </div>
      ),
    },

    {
      key: 'status',
      title: 'Status',
      render: (_, podcast) => (
        <span className={`inline-flex items-center px-3 py-1.5 rounded-full text-xs font-medium ${getStatusColor(podcast.status)}`}>
          {podcast.status}
        </span>
      ),
      align: 'center'
    },
    {
      key: 'created_at',
      title: 'Submitted',
      render: (_, podcast) => (
        <span className="text-xs sm:text-sm text-gray-600">
          {formatDate(podcast.created_at)}
        </span>
      ),
      sortable: true
    },
    {
      key: 'actions',
      title: 'Actions',
      render: (_, podcast) => (
        <div className="flex flex-wrap gap-2 justify-end">
          <Link href={`/podcast/${podcast.id}`}>
            <Button variant="outline" size="sm" className="text-xs sm:text-sm px-2 sm:px-3 py-1.5 h-7 sm:h-8 min-w-0">
              <span className="hidden sm:inline">View</span>
              <span className="sm:hidden">👁</span>
            </Button>
          </Link>
          <Link href={`/admin/podcasts/${podcast.id}/edit`}>
            <Button variant="outline" size="sm" className="text-xs sm:text-sm px-2 sm:px-3 py-1.5 h-7 sm:h-8 min-w-0">
              <span className="hidden sm:inline">Edit</span>
              <span className="sm:hidden">✏</span>
            </Button>
          </Link>
          <PodcastActions
            podcastId={podcast.id}
            podcastTitle={podcast.title}
            status={podcast.status}
          />
        </div>
      ),
      align: 'right'
    }
  ]

  return (
    <Table
      title="All Podcasts"
      columns={columns}
      data={podcasts}
      emptyStateMessage="No podcasts have been submitted yet."
      emptyStateIcon="🎙️"
    />
  )
} 