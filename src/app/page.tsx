import Link from 'next/link'
import { Button } from '@/components/ui/button'
import Image from 'next/image'
import { createServerSupabaseClient } from '@/lib/supabase'

async function getFeaturedPodcasts() {
  const supabase = await createServerSupabaseClient()
  
  const { data: podcasts, error } = await supabase
    .from('podcasts')
    .select(`
      id,
      title,
      description,
      cover_image_url,
      category,
      language,
      country,
      episodes (
        id,
        title
      )
    `)
    .eq('status', 'approved')
    .order('created_at', { ascending: false })
    .limit(3)
  
  if (error) {
    console.error('Error fetching featured podcasts:', error)
    return []
  }
  
  return podcasts || []
}

async function getMockupPodcasts() {
  const supabase = await createServerSupabaseClient()
  
  const { data: podcasts, error } = await supabase
    .from('podcasts')
    .select(`
      id,
      title,
      cover_image_url,
      language,
      episodes (
        id,
        title
      )
    `)
    .eq('status', 'approved')
    .order('created_at', { ascending: false })
    .limit(4)
  
  if (error) {
    console.error('Error fetching mockup podcasts:', error)
    return []
  }
  
  return podcasts || []
}

export default async function HomePage() {
  const featuredPodcasts = await getFeaturedPodcasts()
  const mockupPodcasts = await getMockupPodcasts()
  return (
    <div className="bg-white">
      {/* Hero Section */}
      <section className="relative bg-brand text-white overflow-hidden">
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-32">
          <div className="text-center animate-in fade-in-0 slide-in-from-bottom-4 duration-1000">
            <h1 className="sr-only">RETELL</h1>
            <div className="mx-auto w-fit mb-12 animate-in fade-in-0 slide-in-from-bottom-2 duration-1000 delay-300">
              <img src="/logo-text.avif" alt="RETELL" className="h-24 md:h-24 w-auto" />
            </div>
            <h2 className="text-3xl md:text-5xl font-bold mb-8 tracking-tight max-w-4xl mx-auto">
              Explore the best podcasts in every market for your language
            </h2>
            <p className="text-lg md:text-xl mb-8 max-w-3xl mx-auto leading-relaxed text-red-50">
              Discover high-quality podcast scripts and content ready for licensing. Filter by countries, genre, and license packages to find the perfect content for your market.
            </p>
            <div className="flex flex-col sm:flex-row gap-6 justify-center animate-in fade-in-0 slide-in-from-bottom-2 duration-1000 delay-700">
              <Link href="/catalog">
                <Button size="lg" className="bg-white text-orange-600 hover:bg-orange-50 shadow-modern-lg hover:shadow-modern-hover transition-all duration-300 rounded-full px-8 py-4 text-lg font-semibold">
                  🎧 Explore Podcasts
                </Button>
              </Link>
              <Link href="/auth/signup?role=author">
                <Button size="lg" variant="outline" className="border-2 border-white text-white hover:bg-white hover:text-orange-600 shadow-modern hover:shadow-modern-lg transition-all duration-300 rounded-full px-8 py-4 text-lg font-semibold bg-transparent">
                  🎤 Start Creating
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Platform Mockups Section */}
      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              See RETELL in Action
            </h2>
            <p className="text-lg text-gray-600 max-w-3xl mx-auto">
              Experience our platform from both perspectives - as a content creator and as a content buyer
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-16">
            {/* Licensor (Authors) Interface */}
            <div className="text-center flex flex-col">
              <h3 className="text-2xl font-bold text-gray-900 mb-6">For Licensors (Authors)</h3>
              <div className="relative max-w-2xl mx-auto flex-1">
                <div className="rounded-xl overflow-hidden shadow-2xl bg-white border-2 border-gray-200 h-full flex flex-col">
                  <div className="bg-gray-100 px-6 py-4 border-b">
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-red-500 rounded-full flex items-center justify-center">
                        <span className="text-white font-bold text-sm">R</span>
                      </div>
                      <span className="font-semibold text-gray-900">Author Dashboard</span>
                    </div>
                  </div>
                  <div className="p-6 flex-1 flex flex-col">
                    <div className="grid grid-cols-2 gap-4 mb-6">
                      <div className="bg-red-50 p-4 rounded-lg text-center">
                        <div className="text-2xl font-bold text-red-600 mb-1">5</div>
                        <div className="text-sm text-gray-600">Total Podcasts</div>
                      </div>
                      <div className="bg-red-50 p-4 rounded-lg text-center">
                        <div className="text-2xl font-bold text-red-600 mb-1">4</div>
                        <div className="text-sm text-gray-600">Published</div>
                      </div>
                    </div>
                    <div className="space-y-3 flex-1">
                      <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div>
                          <div className="font-medium text-gray-900">Servus. Grüezi. Hallo.</div>
                          <div className="text-sm text-gray-600">General • DE, 83 episodes</div>
                        </div>
                        <span className="px-2 py-1 bg-yellow-100 text-yellow-800 text-xs rounded-full">Draft</span>
                      </div>
                      <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div>
                          <div className="font-medium text-gray-900">OK, America?</div>
                          <div className="text-sm text-gray-600">General • DE, 78 episodes</div>
                        </div>
                        <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">Approved</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Licensee (Buyers) Interface */}
            <div className="text-center flex flex-col">
              <h3 className="text-2xl font-bold text-gray-900 mb-6">For Licensees (Buyers)</h3>
              <div className="relative max-w-2xl mx-auto flex-1">
                <div className="rounded-xl overflow-hidden shadow-2xl bg-white border-2 border-gray-200 h-full flex flex-col">
                  <div className="bg-gray-100 px-6 py-4 border-b">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 bg-red-500 rounded-full flex items-center justify-center">
                          <span className="text-white font-bold text-sm">R</span>
                        </div>
                        <span className="font-semibold text-gray-900">RETELL Marketplace</span>
                      </div>
                      <div className="flex space-x-2">
                        <span className="px-3 py-1 bg-red-500 text-white text-sm rounded-full">Top Search</span>
                        <span className="px-3 py-1 text-gray-600 text-sm">True Crime</span>
                      </div>
                    </div>
                  </div>
                  <div className="p-6">
                    <div className="grid grid-cols-2 gap-4">
                      {mockupPodcasts.length > 0 ? (
                        mockupPodcasts.map((podcast, index) => (
                          <div key={podcast.id} className="bg-red-50 p-4 rounded-lg border border-red-200">
                            <div className="w-16 h-16 bg-red-500 rounded-lg mb-3 mx-auto flex items-center justify-center overflow-hidden">
                              {podcast.cover_image_url ? (
                                <Image
                                  src={podcast.cover_image_url}
                                  alt={podcast.title}
                                  width={64}
                                  height={64}
                                  className="w-full h-full object-cover rounded-lg"
                                />
                              ) : (
                                <span className="text-white font-bold text-lg">
                                  {podcast.title.substring(0, 2).toUpperCase()}
                                </span>
                              )}
                            </div>
                            <div className="text-gray-900 font-medium text-sm line-clamp-2 text-center">
                              {podcast.title}
                            </div>
                          </div>
                        ))
                      ) : (
                        // Fallback content if no podcasts are available
                        <>
                          <div className="bg-red-50 p-4 rounded-lg border border-red-200">
                            <div className="w-16 h-16 bg-red-500 rounded-lg mb-3 mx-auto flex items-center justify-center">
                              <span className="text-white font-bold text-lg">JR</span>
                            </div>
                            <div className="text-gray-900 font-medium text-sm">The Joe Rogan Experience</div>
                          </div>
                          <div className="bg-red-50 p-4 rounded-lg border border-red-200">
                            <div className="w-16 h-16 bg-red-500 rounded-lg mb-3 mx-auto flex items-center justify-center">
                              <span className="text-white font-bold text-lg">CJ</span>
                            </div>
                            <div className="text-gray-900 font-medium text-sm">Crime Junkie</div>
                          </div>
                          <div className="bg-red-50 p-4 rounded-lg border border-red-200">
                            <div className="w-16 h-16 bg-red-500 rounded-lg mb-3 mx-auto flex items-center justify-center">
                              <span className="text-white font-bold text-lg">HBT</span>
                            </div>
                            <div className="text-gray-900 font-medium text-sm">How I Built This</div>
                          </div>
                          <div className="bg-red-50 p-4 rounded-lg border border-red-200">
                            <div className="w-16 h-16 bg-red-500 rounded-lg mb-3 mx-auto flex items-center justify-center">
                              <span className="text-white font-bold text-lg">TD</span>
                            </div>
                            <div className="text-gray-900 font-medium text-sm">The Daily</div>
                          </div>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Content Marketplace Section */}
      <section className="py-24 bg-red-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              RETELL - Your Content Marketplace
            </h2>
            <p className="text-lg text-gray-600 max-w-3xl mx-auto">
              A curated marketplace where podcast creators showcase their scripts and content, while media buyers discover premium audio content for licensing across global markets.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center mb-16">
            <div>
              <h3 className="text-2xl font-bold text-gray-900 mb-6">For Licensors (Authors)</h3>
              <ul className="space-y-4">
                <li className="flex items-start">
                  <div className="w-6 h-6 bg-red-100 text-red-600 rounded-full flex items-center justify-center text-sm font-semibold mr-3 mt-0.5">✓</div>
                  <div>
                    <h4 className="font-semibold text-gray-900">Showcase Your Scripts</h4>
                    <p className="text-gray-600">Upload your podcast scripts and episodes to reach global buyers looking for quality content</p>
                  </div>
                </li>
                <li className="flex items-start">
                  <div className="w-6 h-6 bg-red-100 text-red-600 rounded-full flex items-center justify-center text-sm font-semibold mr-3 mt-0.5">✓</div>
                  <div>
                    <h4 className="font-semibold text-gray-900">Global Reach</h4>
                    <p className="text-gray-600">Connect with media companies worldwide seeking fresh podcast content for their markets</p>
                  </div>
                </li>
                <li className="flex items-start">
                  <div className="w-6 h-6 bg-red-100 text-red-600 rounded-full flex items-center justify-center text-sm font-semibold mr-3 mt-0.5">✓</div>
                  <div>
                    <h4 className="font-semibold text-gray-900">Exclusive Rights Management</h4>
                    <p className="text-gray-600">Manage exclusive licensing rights per market with our professional platform</p>
                  </div>
                </li>
              </ul>
            </div>

            <div>
              <h3 className="text-2xl font-bold text-gray-900 mb-6">For Licensees (Buyers)</h3>
              <ul className="space-y-4">
                <li className="flex items-start">
                  <div className="w-6 h-6 bg-red-100 text-red-600 rounded-full flex items-center justify-center text-sm font-semibold mr-3 mt-0.5">✓</div>
                  <div>
                    <h4 className="font-semibold text-gray-900">Curated Content Library</h4>
                    <p className="text-gray-600">Browse high-quality podcast scripts and content from verified creators across various categories and languages</p>
                  </div>
                </li>
                <li className="flex items-start">
                  <div className="w-6 h-6 bg-red-100 text-red-600 rounded-full flex items-center justify-center text-sm font-semibold mr-3 mt-0.5">✓</div>
                  <div>
                    <h4 className="font-semibold text-gray-900">Market-Specific Licensing</h4>
                    <p className="text-gray-600">Secure exclusive rights for your specific market with streamlined licensing agreements</p>
                  </div>
                </li>
                <li className="flex items-start">
                  <div className="w-6 h-6 bg-red-100 text-red-600 rounded-full flex items-center justify-center text-sm font-semibold mr-3 mt-0.5">✓</div>
                  <div>
                    <h4 className="font-semibold text-gray-900">Quality Assurance</h4>
                    <p className="text-gray-600">All content is reviewed and approved to ensure professional standards and market readiness</p>
                  </div>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Exclusive Rights Section */}
      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Found the Perfect Podcast for Your Market?
            </h2>
            <p className="text-xl text-gray-600 max-w-4xl mx-auto">
              Reserve exclusive rights at RETELL for your market. Podcast content is only licensed once per country, ensuring you get unique content for your audience.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-red-500 text-white rounded-full flex items-center justify-center mx-auto mb-6 text-2xl font-bold">
                1
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-4">Browse & Filter</h3>
              <p className="text-gray-600">
                Explore our curated library by country, genre, language, and license packages to find content that fits your market.
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-red-500 text-white rounded-full flex items-center justify-center mx-auto mb-6 text-2xl font-bold">
                2
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-4">Reserve Exclusive Rights</h3>
              <p className="text-gray-600">
                Secure exclusive licensing rights for your specific market. Each podcast is only licensed once per country.
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-red-500 text-white rounded-full flex items-center justify-center mx-auto mb-6 text-2xl font-bold">
                3
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-4">Global Partnership</h3>
              <p className="text-gray-600">
                We facilitate the matching process for global partnerships, handling contracts, pricing, and content delivery.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Matching Process Section */}
      <section className="py-24 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Matching Process for Global Partnerships
            </h2>
            <p className="text-lg text-gray-600 max-w-3xl mx-auto">
              We schedule appointments to handle licensing contracts, pricing, and content delivery for seamless global partnerships.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h3 className="text-2xl font-bold text-gray-900 mb-6">How Our Matching Works</h3>
              <ul className="space-y-4">
                <li className="flex items-start">
                  <div className="w-6 h-6 bg-red-100 text-red-600 rounded-full flex items-center justify-center text-sm font-semibold mr-3 mt-0.5">1</div>
                  <div>
                    <h4 className="font-semibold text-gray-900">Content Discovery</h4>
                    <p className="text-gray-600">Buyers browse and filter content by market, genre, and language preferences</p>
                  </div>
                </li>
                <li className="flex items-start">
                  <div className="w-6 h-6 bg-red-100 text-red-600 rounded-full flex items-center justify-center text-sm font-semibold mr-3 mt-0.5">2</div>
                  <div>
                    <h4 className="font-semibold text-gray-900">Interest Expression</h4>
                    <p className="text-gray-600">Express interest in specific content and request exclusive rights for your market</p>
                  </div>
                </li>
                <li className="flex items-start">
                  <div className="w-6 h-6 bg-red-100 text-red-600 rounded-full flex items-center justify-center text-sm font-semibold mr-3 mt-0.5">3</div>
                  <div>
                    <h4 className="font-semibold text-gray-900">Partnership Facilitation</h4>
                    <p className="text-gray-600">We coordinate between licensors and licensees to schedule meetings and finalize agreements</p>
                  </div>
                </li>
                <li className="flex items-start">
                  <div className="w-6 h-6 bg-red-100 text-red-600 rounded-full flex items-center justify-center text-sm font-semibold mr-3 mt-0.5">4</div>
                  <div>
                    <h4 className="font-semibold text-gray-900">Content Delivery</h4>
                    <p className="text-gray-600">Secure transfer of podcast scripts and content with proper licensing documentation</p>
                  </div>
                </li>
              </ul>
            </div>

            <div className="bg-white p-10 rounded-xl shadow-lg h-full flex flex-col justify-center">
              <h4 className="text-2xl font-bold text-gray-900 mb-6">Ready to Start?</h4>
              <p className="text-lg text-gray-600 mb-8 leading-relaxed">
                Schedule a consultation to discuss your content needs and explore our available podcast scripts for your market.
              </p>
              <div className="flex flex-col gap-4">
                <Link href="/catalog">
                  <Button size="lg" className="w-full bg-red-500 text-white hover:bg-red-600 py-4 text-lg font-semibold">
                    Browse Available Content
                  </Button>
                </Link>
                <Link href="/auth/signup?role=author">
                  <Button size="lg" variant="outline" className="w-full border-red-500 text-red-600 hover:bg-red-50 py-4 text-lg font-semibold">
                    Start as Content Creator
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-16 lg:py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              How It Works
            </h2>
            <p className="text-lg text-gray-600">
              Simple steps to get started, whether you're creating or sourcing content
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-red-500 text-white rounded-full flex items-center justify-center mx-auto mb-6 text-2xl font-bold">
                1
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-4">Create Your Account</h3>
              <p className="text-gray-600">
                Sign up as a creator to showcase your podcast content, or as a buyer to access our curated marketplace.
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-red-500 text-white rounded-full flex items-center justify-center mx-auto mb-6 text-2xl font-bold">
                2
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-4">Upload or Browse</h3>
              <p className="text-gray-600">
                Creators upload their episodes with detailed information. Buyers browse and filter content by category, language, and style.
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-red-500 text-white rounded-full flex items-center justify-center mx-auto mb-6 text-2xl font-bold">
                3
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-4">Connect & License</h3>
              <p className="text-gray-600">
                Start the licensing process for content that fits your needs. We facilitate the connection between creators and buyers.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Hits of the Month Section */}
      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Hits of the Month
            </h2>
            <p className="text-lg text-gray-600 max-w-3xl mx-auto">
              Discover our most popular podcast scripts and content from our curated portfolio
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
            {featuredPodcasts.length > 0 ? (
              featuredPodcasts.map((podcast, index) => (
                <Link key={podcast.id} href={`/podcast/${podcast.id}`} className="block">
                  <div className="bg-white rounded-xl shadow-lg overflow-hidden border-2 border-gray-100 hover:shadow-xl transition-shadow cursor-pointer">
                    <div className="h-48 bg-red-500 flex items-center justify-center">
                      {podcast.cover_image_url ? (
                        <Image
                          src={podcast.cover_image_url}
                          alt={podcast.title}
                          width={192}
                          height={192}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="text-white text-4xl font-bold">
                          {podcast.title.substring(0, 2).toUpperCase()}
                        </div>
                      )}
                    </div>
                    <div className="p-6">
                      <h3 className="text-xl font-bold text-gray-900 mb-2 line-clamp-2">{podcast.title}</h3>
                      <p className="text-gray-600 mb-4 line-clamp-3">{podcast.description}</p>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-500">
                          {podcast.language?.toUpperCase() || 'EN'} • {podcast.episodes?.length || 0} Episodes
                        </span>
                        <span className={`px-3 py-1 text-sm rounded-full ${
                          index === 0 ? 'bg-red-100 text-red-600' : 
                          index === 1 ? 'bg-green-100 text-green-600' : 
                          'bg-yellow-100 text-yellow-600'
                        }`}>
                          {index === 0 ? 'Trending' : index === 1 ? 'New' : 'Popular'}
                        </span>
                      </div>
                    </div>
                  </div>
                </Link>
              ))
            ) : (
              // Fallback content if no podcasts are available
              <>
                <div className="bg-white rounded-xl shadow-lg overflow-hidden border-2 border-gray-100 hover:shadow-xl transition-shadow">
                  <div className="h-48 bg-red-500 flex items-center justify-center">
                    <div className="text-white text-4xl font-bold">TC</div>
                  </div>
                  <div className="p-6">
                    <h3 className="text-xl font-bold text-gray-900 mb-2">True Crime Stories</h3>
                    <p className="text-gray-600 mb-4">Compelling true crime narratives perfect for mystery and crime podcast formats</p>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-500">English • 12 Episodes</span>
                      <span className="px-3 py-1 bg-red-100 text-red-600 text-sm rounded-full">Trending</span>
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-xl shadow-lg overflow-hidden border-2 border-gray-100 hover:shadow-xl transition-shadow">
                  <div className="h-48 bg-red-500 flex items-center justify-center">
                    <div className="text-white text-4xl font-bold">BI</div>
                  </div>
                  <div className="p-6">
                    <h3 className="text-xl font-bold text-gray-900 mb-2">Business Insights</h3>
                    <p className="text-gray-600 mb-4">Expert business analysis and entrepreneurial success stories</p>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-500">German • 8 Episodes</span>
                      <span className="px-3 py-1 bg-green-100 text-green-600 text-sm rounded-full">New</span>
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-xl shadow-lg overflow-hidden border-2 border-gray-100 hover:shadow-xl transition-shadow">
                  <div className="h-48 bg-red-500 flex items-center justify-center">
                    <div className="text-white text-4xl font-bold">SC</div>
                  </div>
                  <div className="p-6">
                    <h3 className="text-xl font-bold text-gray-900 mb-2">Science & Culture</h3>
                    <p className="text-gray-600 mb-4">Fascinating science discoveries and cultural deep-dives</p>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-500">Spanish • 15 Episodes</span>
                      <span className="px-3 py-1 bg-yellow-100 text-yellow-600 text-sm rounded-full">Popular</span>
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>

          <div className="text-center">
            <Link href="/catalog">
              <Button size="lg" className="bg-red-500 text-white hover:bg-red-600 px-8 py-4 text-lg font-semibold rounded-full">
                View All Featured Content
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-24 bg-gray-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Frequently Asked Questions
            </h2>
            <p className="text-lg text-gray-600">
              Everything you need to know about RETELL's content marketplace
            </p>
          </div>

          <div className="space-y-6">
            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-3">How does the exclusive licensing work?</h3>
              <p className="text-gray-600">
                Each podcast script is only licensed once per country, ensuring you get unique content for your market. This exclusivity is guaranteed through our platform's licensing system.
              </p>
            </div>

            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-3">What types of content are available?</h3>
              <p className="text-gray-600">
                We offer podcast scripts across various genres including true crime, business, science, culture, and more. All content is available in multiple languages and comes with detailed episode information.
              </p>
            </div>

            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-3">How do I get started as a content creator?</h3>
              <p className="text-gray-600">
                Simply sign up as an author, upload your podcast scripts and episodes, and our team will review and approve your content for the marketplace. You'll get access to our creator dashboard to manage your portfolio.
              </p>
            </div>

            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-3">What markets do you serve?</h3>
              <p className="text-gray-600">
                We serve global markets with content available in 10+ languages. You can filter content by country, language, and genre to find the perfect fit for your specific market needs.
              </p>
            </div>

            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-3">How does the matching process work?</h3>
              <p className="text-gray-600">
                Once you express interest in content, we facilitate the connection between you and the content creator. We schedule meetings to discuss licensing terms, pricing, and content delivery arrangements.
              </p>
            </div>

            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-3">What's included in the licensing package?</h3>
              <p className="text-gray-600">
                Each licensing package includes the complete podcast scripts, episode information, and all necessary documentation for production. Additional support and consultation can be arranged based on your needs.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            <div>
              <div className="text-3xl font-bold text-red-600 mb-2">500+</div>
              <div className="text-gray-600">Episodes Available</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-red-600 mb-2">50+</div>
              <div className="text-gray-600">Verified Creators</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-red-600 mb-2">15+</div>
              <div className="text-gray-600">Categories</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-red-600 mb-2">10+</div>
              <div className="text-gray-600">Languages</div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 bg-brand text-white relative overflow-hidden">
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="animate-in fade-in-0 slide-in-from-bottom-4 duration-1000">
            <h2 className="text-4xl md:text-6xl font-bold mb-8 tracking-tight">
              ✨ Ready to Start Your Journey?
            </h2>
            <p className="text-xl md:text-2xl mb-12 max-w-4xl mx-auto leading-relaxed opacity-90">
              🎉 Join our global content marketplace! Whether you're a creator looking to license your podcast scripts or a buyer seeking exclusive content for your market, RETELL connects you with the perfect partners worldwide! 🚀
            </p>
            <div className="flex flex-col sm:flex-row gap-6 justify-center">
              <Link href="/auth/signup?role=author">
                <Button size="lg" className="bg-white text-orange-600 hover:bg-orange-50 shadow-modern-lg hover:shadow-modern-hover transition-all duration-300 rounded-full px-8 py-4 text-lg font-semibold">
                  🎤 Start as Creator
                </Button>
              </Link>
              <Link href="/catalog">
                <Button size="lg" variant="outline" className="border-2 border-white text-white hover:bg-white hover:text-orange-600 shadow-modern hover:shadow-modern-lg transition-all duration-300 rounded-full px-8 py-4 text-lg font-semibold bg-transparent">
                  🎧 Browse Content
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
