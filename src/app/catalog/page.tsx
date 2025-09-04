import { createServerSupabaseClient } from '@/lib/supabase'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { CatalogClient } from '@/components/catalog/catalog-client'

export default async function CatalogPage() {
  const supabase = await createServerSupabaseClient()

  // Get approved podcasts with episodes data for enhanced search
  const { data: podcasts, error } = await supabase
    .from('podcasts')
    .select(`
      *,
      episodes (
        id,
        title,
        description,
        episode_number,
        season_number
      )
    `)
    .eq('status', 'approved')
    .order('created_at', { ascending: false })



  return (
    <div className="min-h-screen bg-orange-50">
      {/* Hero Section */}
      <div className="bg-brand text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="text-center">
            <h1 className="text-3xl font-bold mb-2">
              Discover Podcasts
            </h1>
            <p className="text-xl text-orange-100 max-w-3xl mx-auto">
              Explore premium podcast content from talented creators worldwide. Find your next favorite show.
            </p>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <CatalogClient podcasts={podcasts || []} />
      </div>
    </div>
  )
} 