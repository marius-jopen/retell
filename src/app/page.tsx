import Link from 'next/link'
import { Button } from '@/components/ui/button'
import Image from 'next/image'

export default function HomePage() {
  return (
    <div className="bg-white">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-red-500 via-red-600 to-red-700 text-white overflow-hidden">
        <div className="absolute inset-0 bg-black/10"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 lg:py-24">
          <div className="text-center">
            <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold mb-6 tracking-tight">
              <span className="block">Premium Podcast</span>
              <span className="block text-red-100">Content Marketplace</span>
            </h1>
            <p className="text-xl md:text-2xl mb-8 max-w-3xl mx-auto leading-relaxed text-red-50">
              Connect podcast creators with content buyers. Discover high-quality podcast content ready for licensing, or showcase your own productions to reach new audiences.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center max-w-md mx-auto">
              <Link href="/catalog" className="flex-1">
                <Button size="lg" className="w-full bg-white text-red-600 hover:bg-red-50 font-semibold py-3">
                  Browse Content
                </Button>
              </Link>
              <Link href="/auth/signup?role=author" className="flex-1">
                <Button size="lg" variant="outline" className="w-full border-2 border-white text-white hover:bg-white hover:text-red-600 font-semibold py-3">
                  Become a Creator
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* What We Do Section */}
      <section className="py-16 lg:py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              What is RETELL?
            </h2>
            <p className="text-lg text-gray-600 max-w-3xl mx-auto">
              RETELL is a curated marketplace where podcast creators can showcase their content and media buyers can discover premium audio content for licensing.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center mb-16">
            <div>
              <h3 className="text-2xl font-bold text-gray-900 mb-6">For Content Creators</h3>
              <ul className="space-y-4">
                <li className="flex items-start">
                  <div className="w-6 h-6 bg-red-100 text-red-600 rounded-full flex items-center justify-center text-sm font-semibold mr-3 mt-0.5">✓</div>
                  <div>
                    <h4 className="font-semibold text-gray-900">Showcase Your Work</h4>
                    <p className="text-gray-600">Upload your podcast episodes and reach potential buyers looking for quality content</p>
                  </div>
                </li>
                <li className="flex items-start">
                  <div className="w-6 h-6 bg-red-100 text-red-600 rounded-full flex items-center justify-center text-sm font-semibold mr-3 mt-0.5">✓</div>
                  <div>
                    <h4 className="font-semibold text-gray-900">Professional Platform</h4>
                    <p className="text-gray-600">Manage your content portfolio with our easy-to-use creator dashboard</p>
                  </div>
                </li>
                <li className="flex items-start">
                  <div className="w-6 h-6 bg-red-100 text-red-600 rounded-full flex items-center justify-center text-sm font-semibold mr-3 mt-0.5">✓</div>
                  <div>
                    <h4 className="font-semibold text-gray-900">Expand Your Reach</h4>
                    <p className="text-gray-600">Connect with media companies and platforms seeking fresh podcast content</p>
                  </div>
                </li>
              </ul>
            </div>

            <div>
              <h3 className="text-2xl font-bold text-gray-900 mb-6">For Content Buyers</h3>
              <ul className="space-y-4">
                <li className="flex items-start">
                  <div className="w-6 h-6 bg-red-100 text-red-600 rounded-full flex items-center justify-center text-sm font-semibold mr-3 mt-0.5">✓</div>
                  <div>
                    <h4 className="font-semibold text-gray-900">Curated Selection</h4>
                    <p className="text-gray-600">Browse high-quality podcast content from verified creators across various categories</p>
                  </div>
                </li>
                <li className="flex items-start">
                  <div className="w-6 h-6 bg-red-100 text-red-600 rounded-full flex items-center justify-center text-sm font-semibold mr-3 mt-0.5">✓</div>
                  <div>
                    <h4 className="font-semibold text-gray-900">Easy Licensing</h4>
                    <p className="text-gray-600">Streamlined process to license content for your platform or media needs</p>
                  </div>
                </li>
                <li className="flex items-start">
                  <div className="w-6 h-6 bg-red-100 text-red-600 rounded-full flex items-center justify-center text-sm font-semibold mr-3 mt-0.5">✓</div>
                  <div>
                    <h4 className="font-semibold text-gray-900">Quality Assurance</h4>
                    <p className="text-gray-600">All content is reviewed and approved to ensure professional standards</p>
                  </div>
                </li>
              </ul>
            </div>
          </div>

          {/* Creator Dashboard Preview */}
          <div className="text-center">
            <h3 className="text-2xl font-bold text-gray-900 mb-4">
              Professional Creator Dashboard
            </h3>
            <p className="text-lg text-gray-600 mb-8 max-w-2xl mx-auto">
              Manage your podcast portfolio with our intuitive interface designed for content creators
            </p>
            <div className="relative max-w-5xl mx-auto">
              <div className="rounded-xl overflow-hidden shadow-2xl bg-white">
                <Image
                  src="/author.png"
                  alt="RETELL Creator Dashboard"
                  width={1200}
                  height={800}
                  className="w-full h-auto"
                  priority
                />
              </div>
              <div className="absolute inset-0 rounded-xl ring-1 ring-inset ring-gray-900/10"></div>
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

      {/* Stats Section */}
      <section className="py-16 bg-gray-50">
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
      <section className="py-16 lg:py-20 bg-gradient-to-br from-red-500 via-red-600 to-red-700 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">
            Ready to Get Started?
          </h2>
          <p className="text-xl mb-8 max-w-2xl mx-auto text-red-50">
            Join our growing community of podcast creators and content buyers. Start exploring premium podcast content today.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center max-w-md mx-auto">
            <Link href="/auth/signup?role=client" className="flex-1">
              <Button size="lg" className="w-full bg-white text-red-600 hover:bg-red-50 font-semibold py-3">
                License Content
              </Button>
            </Link>
            <Link href="/auth/signup?role=author" className="flex-1">
              <Button size="lg" variant="outline" className="w-full border-2 border-white text-white hover:bg-white hover:text-red-600 font-semibold py-3">
                Share Your Content
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}
