import { getCurrentUser } from '@/lib/auth'
import Navbar from './navbar'

interface MainLayoutProps {
  children: React.ReactNode
}

export default async function MainLayout({ children }: MainLayoutProps) {
  const user = await getCurrentUser()

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar user={user} />
      <main className="flex-1">
        {children}
      </main>
      <footer className="bg-white/80 backdrop-blur-sm border-t border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <h3 className="text-lg font-semibold bg-gradient-to-r from-red-600 to-red-700 bg-clip-text text-transparent mb-4">RETELL</h3>
              <p className="text-gray-600 leading-relaxed">
                The modern platform for podcast licensing and distribution.
              </p>
            </div>
            <div>
              <h4 className="text-sm font-semibold text-gray-900 mb-4">For Authors</h4>
              <ul className="space-y-2">
                <li><a href="/author" className="text-gray-600 hover:text-red-600 transition-colors duration-200">Upload Content</a></li>
                <li><a href="/author/podcasts" className="text-gray-600 hover:text-red-600 transition-colors duration-200">My Podcasts</a></li>
                <li><a href="/pricing" className="text-gray-600 hover:text-red-600 transition-colors duration-200">Pricing</a></li>
              </ul>
            </div>
            <div>
              <h4 className="text-sm font-semibold text-gray-900 mb-4">Platform</h4>
              <ul className="space-y-2">
                <li><a href="/catalog" className="text-gray-600 hover:text-red-600 transition-colors duration-200">Browse Catalog</a></li>
                <li><a href="/support" className="text-gray-600 hover:text-red-600 transition-colors duration-200">Support</a></li>
              </ul>
            </div>
            <div>
              <h4 className="text-sm font-semibold text-gray-900 mb-4">Company</h4>
              <ul className="space-y-2">
                <li><a href="/about" className="text-gray-600 hover:text-red-600 transition-colors duration-200">About</a></li>
                <li><a href="/contact" className="text-gray-600 hover:text-red-600 transition-colors duration-200">Contact</a></li>
                <li><a href="/privacy" className="text-gray-600 hover:text-red-600 transition-colors duration-200">Privacy Policy</a></li>
              </ul>
            </div>
          </div>
          <div className="mt-8 pt-8 border-t border-gray-200">
            <p className="text-center text-gray-600">
              © 2024 RETELL. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
} 