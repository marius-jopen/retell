import { createServerSupabaseClient } from '@/lib/supabase'
import { CatalogClient } from '@/components/catalog/catalog-client'

export default async function CatalogPage() {
  const supabase = await createServerSupabaseClient()

  // Get approved podcasts
  const { data: podcasts } = await supabase
    .from('podcasts')
    .select(`
      *,
      episodes (
        id,
        title,
        duration,
        episode_number
      )
    `)
    .eq('status', 'approved')
    .order('created_at', { ascending: false })

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-red-500 to-red-600 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center">
            <h1 className="text-3xl font-bold mb-2">
              Discover Podcasts
            </h1>
            <p className="text-red-100 max-w-2xl mx-auto">
              Explore premium content from creators worldwide
            </p>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <CatalogClient podcasts={podcasts || []} />
      </div>
    </div>
  )
} 