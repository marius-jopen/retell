import Link from 'next/link'
import { Button } from '@/components/ui/button'

export default function HomePage() {
  return (
    <div className="bg-white">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-red-400 via-red-500 to-red-600 text-white overflow-hidden">
        <div className="absolute inset-0 bg-red-600/20 backdrop-blur-sm"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-32">
          <div className="text-center animate-in fade-in-0 slide-in-from-bottom-4 duration-1000">
            <h1 className="text-5xl md:text-7xl font-bold mb-8 tracking-tight">
              <span className="block text-red-100 ">Welcome to</span>
              <span className="block animate-in fade-in-0 slide-in-from-bottom-2 duration-1000 delay-300">
                🎙️ RETELL ✨
              </span>
            </h1>
            <p className="text-xl md:text-2xl mb-12 max-w-4xl mx-auto leading-relaxed opacity-90 animate-in fade-in-0 slide-in-from-bottom-2 duration-1000 delay-500">
              🚀 Create amazing podcast content and connect with passionate listeners worldwide. 
              Discover incredible stories from talented creators everywhere! 💫
            </p>
            <div className="flex flex-col sm:flex-row gap-6 justify-center animate-in fade-in-0 slide-in-from-bottom-2 duration-1000 delay-700">
              <Link href="/catalog">
                <Button size="lg" className="bg-white text-red-600 hover:bg-red-50 shadow-2xl hover:shadow-3xl transition-all duration-300 rounded-full px-8 py-4 text-lg font-semibold">
                  🎧 Explore Podcasts
                </Button>
              </Link>
              <Link href="/auth/signup?role=author">
                <Button size="lg" variant="outline" className="border-2 border-white text-white hover:bg-white hover:text-red-600 shadow-xl hover:shadow-2xl transition-all duration-300 rounded-full px-8 py-4 text-lg font-semibold">
                  🎤 Start Creating
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24 bg-gradient-to-br from-red-50 to-orange-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-20 animate-in fade-in-0 slide-in-from-bottom-4 duration-1000">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
              ✨ Why Creators Love Us
            </h2>
            <p className="text-xl text-gray-600 max-w-4xl mx-auto leading-relaxed">
              🎯 Everything you need to share your amazing podcast stories with the world! 
              Made with 💖 for passionate creators.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
            <div className="text-center group animate-in fade-in-0 slide-in-from-bottom-4 duration-1000 delay-200">
              <div className="bg-gradient-to-br from-red-100 to-red-200 rounded-3xl w-20 h-20 flex items-center justify-center mx-auto mb-6 shadow-lg group-hover:scale-110 transition-all duration-300">
                <span className="text-3xl">🎤</span>
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">For Creators 🌟</h3>
              <p className="text-gray-600 leading-relaxed">
                Share your amazing podcast stories with the world! 🚀 Build your audience and connect with passionate listeners everywhere.
              </p>
            </div>

            <div className="text-center group animate-in fade-in-0 slide-in-from-bottom-4 duration-1000 delay-400">
              <div className="bg-gradient-to-br from-orange-100 to-orange-200 rounded-3xl w-20 h-20 flex items-center justify-center mx-auto mb-6 shadow-lg group-hover:scale-110 transition-all duration-300">
                <span className="text-3xl">🎧</span>
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">For Listeners 🎵</h3>
              <p className="text-gray-600 leading-relaxed">
                Discover incredible podcast content from talented creators worldwide! 🌍 Find your next favorite show in our curated collection.
              </p>
            </div>

            <div className="text-center group animate-in fade-in-0 slide-in-from-bottom-4 duration-1000 delay-600">
              <div className="bg-gradient-to-br from-pink-100 to-pink-200 rounded-3xl w-20 h-20 flex items-center justify-center mx-auto mb-6 shadow-lg group-hover:scale-110 transition-all duration-300">
                <span className="text-3xl">🛡️</span>
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">Safe & Secure 🔐</h3>
              <p className="text-gray-600 leading-relaxed">
                Your content is protected with industry-leading security! 💪 We handle all the technical stuff so you can focus on creating amazing content.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-20 animate-in fade-in-0 slide-in-from-bottom-4 duration-1000">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
              🚀 How It Works
            </h2>
            <p className="text-xl text-gray-600 leading-relaxed">
              Super simple steps to start your podcast journey! ✨ We've made it easy and fun.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            <div className="text-center group animate-in fade-in-0 slide-in-from-bottom-4 duration-1000 delay-200">
              <div className="bg-gradient-to-br from-red-500 to-red-600 text-white rounded-3xl w-16 h-16 flex items-center justify-center mx-auto mb-6 text-2xl font-bold shadow-lg group-hover:scale-110 transition-all duration-300">
                1️⃣
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">🎧 Browse & Discover</h3>
              <p className="text-gray-600 leading-relaxed">
                Explore our amazing catalog of premium podcast content from talented creators worldwide! 🌍 Find your perfect match.
              </p>
            </div>

            <div className="text-center group animate-in fade-in-0 slide-in-from-bottom-4 duration-1000 delay-400">
              <div className="bg-gradient-to-br from-orange-500 to-orange-600 text-white rounded-3xl w-16 h-16 flex items-center justify-center mx-auto mb-6 text-2xl font-bold shadow-lg group-hover:scale-110 transition-all duration-300">
                2️⃣
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">🎤 Create & Upload</h3>
              <p className="text-gray-600 leading-relaxed">
                Upload your amazing podcast content and manage your episodes through our super friendly platform! 📱 Easy as pie.
              </p>
            </div>

            <div className="text-center group animate-in fade-in-0 slide-in-from-bottom-4 duration-1000 delay-600">
              <div className="bg-gradient-to-br from-pink-500 to-pink-600 text-white rounded-3xl w-16 h-16 flex items-center justify-center mx-auto mb-6 text-2xl font-bold shadow-lg group-hover:scale-110 transition-all duration-300">
                3️⃣
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">🚀 Reach Audiences</h3>
              <p className="text-gray-600 leading-relaxed">
                Get your content approved and reach amazing new audiences through our discovery platform! 🎯 Watch your community grow.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 bg-gradient-to-br from-red-500 via-red-600 to-red-700 text-white relative overflow-hidden">
        <div className="absolute inset-0 bg-red-600/30 backdrop-blur-sm"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="animate-in fade-in-0 slide-in-from-bottom-4 duration-1000">
            <h2 className="text-4xl md:text-6xl font-bold mb-8 tracking-tight">
              ✨ Ready to Start Your Journey?
            </h2>
            <p className="text-xl md:text-2xl mb-12 max-w-4xl mx-auto leading-relaxed opacity-90">
              🎉 Join thousands of amazing creators already using RETELL to share their incredible podcast stories with the world! 
              Your adventure starts here! 🚀
            </p>
            <div className="flex flex-col sm:flex-row gap-6 justify-center">
              <Link href="/auth/signup?role=author">
                <Button size="lg" className="bg-white text-red-600 hover:bg-red-50 shadow-2xl hover:shadow-3xl transition-all duration-300 rounded-full px-8 py-4 text-lg font-semibold">
                  🎤 Start Creating Now
                </Button>
              </Link>
              <Link href="/catalog">
                <Button size="lg" variant="outline" className="border-2 border-white text-white hover:bg-white hover:text-red-600 shadow-xl hover:shadow-2xl transition-all duration-300 rounded-full px-8 py-4 text-lg font-semibold">
                  🎧 Explore Amazing Content
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
