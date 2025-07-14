export default function AboutPage() {
  return (
    <div className="bg-white">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-red-400 via-red-500 to-red-600 text-white overflow-hidden">
        <div className="absolute inset-0 bg-red-600/20 backdrop-blur-sm"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-32">
          <div className="text-center animate-in fade-in-0 slide-in-from-bottom-4 duration-1000">
            <h1 className="text-5xl md:text-7xl font-bold mb-8 tracking-tight">
              <span className="block text-red-100">About</span>
              <span className="block animate-in fade-in-0 slide-in-from-bottom-2 duration-1000 delay-300">
                🎙️ RETELL ✨
              </span>
            </h1>
            <p className="text-xl md:text-2xl mb-12 max-w-4xl mx-auto leading-relaxed opacity-90 animate-in fade-in-0 slide-in-from-bottom-2 duration-1000 delay-500">
              🚀 The first licensing platform for narrative podcasts built to unlock global storytelling 🌍
            </p>
          </div>
        </div>
      </section>

      {/* About RETELL Section */}
      <section className="py-24 bg-gradient-to-br from-red-50 to-orange-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="animate-in fade-in-0 slide-in-from-bottom-4 duration-1000">
            <div className="text-center mb-16">
              <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
              📣 About RETELL
              </h2>
            </div>
            <div className="max-w-4xl mx-auto">
              <div className="bg-white rounded-3xl shadow-2xl p-8 md:p-12 mb-12 border border-red-100">
                <p className="text-lg md:text-xl text-gray-700 leading-relaxed mb-6">
                  Founded in 2024 and based in Hamburg, RETELL transforms successful podcasts into licensable IP — giving creators the chance to scale their stories beyond borders, and giving media companies a fast, cost-efficient way to bring proven formats to their audiences.
                </p>
                <p className="text-lg md:text-xl text-gray-700 leading-relaxed mb-6">
                  We believe podcast storytelling is one of the richest, most intimate formats of our time. But too often, great shows remain locked in a single language, a single market, a single moment. 
                </p>
                <p className="text-lg md:text-xl text-gray-700 leading-relaxed font-semibold text-red-600">
                  🌟 RETELL changes that.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* What We Do Section */}
      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="animate-in fade-in-0 slide-in-from-bottom-4 duration-1000">
            <div className="text-center mb-16">
              <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
                🎯 What We Do
              </h2>
              <p className="text-xl text-gray-600 max-w-4xl mx-auto leading-relaxed">
                RETELL is a B2B platform for the licensing, translation, and adaptation of podcast scripts.
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-16">
              <div className="bg-gradient-to-br from-red-50 to-orange-50 rounded-3xl p-8 border border-red-100">
                <h3 className="text-xl font-bold text-gray-900 mb-4">🎪 We Help Production Companies</h3>
                <ul className="space-y-3 text-gray-700">
                  <li className="flex items-start space-x-3">
                    <span className="text-red-500 text-lg">🏆</span>
                    <span>Discover award-winning and audience-proven podcast IP</span>
                  </li>
                  <li className="flex items-start space-x-3">
                    <span className="text-red-500 text-lg">📝</span>
                    <span>License scripts, music, voice, and brand assets</span>
                  </li>
                  <li className="flex items-start space-x-3">
                    <span className="text-red-500 text-lg">🌐</span>
                    <span>Adapt content to new languages and markets</span>
                  </li>
                  <li className="flex items-start space-x-3">
                    <span className="text-red-500 text-lg">⚡</span>
                    <span>Skip the long and expensive development phase</span>
                  </li>
                </ul>
              </div>
              <div className="bg-gradient-to-br from-orange-50 to-red-50 rounded-3xl p-8 border border-orange-100">
                <h3 className="text-xl font-bold text-gray-900 mb-4">🔍 Our Process</h3>
                <p className="text-gray-700 mb-4">
                  Each podcast submitted to RETELL goes through a rigorous rights and licensing review.
                </p>
                <p className="text-gray-700 font-semibold">
                  ⚡ Once cleared, it is made available to international buyers who can instantly license and localize it — often in a matter of days.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Why It Matters Section */}
      <section className="py-24 bg-gradient-to-br from-orange-50 to-red-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="animate-in fade-in-0 slide-in-from-bottom-4 duration-1000">
            <div className="text-center mb-16">
              <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
                💡 Why It Matters
              </h2>
              <p className="text-xl text-gray-600 max-w-4xl mx-auto leading-relaxed">
                In a saturated media landscape, proven content is more valuable than ever. RETELL bridges the gap between creators with amazing stories and publishers hungry for high-quality, low-risk formats.
              </p>
            </div>
            <div className="max-w-4xl mx-auto">
              <div className="bg-white rounded-3xl shadow-2xl p-8 md:p-12 border border-red-100">
                <h3 className="text-2xl font-bold text-gray-900 mb-8 text-center">🚀 We Simplify the Licensing Process</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="text-center">
                    <div className="text-4xl mb-4">❌</div>
                    <h4 className="font-semibold text-gray-900 mb-2">No Endless Negotiations</h4>
                    <p className="text-gray-600">Quick, streamlined licensing process</p>
                  </div>
                  <div className="text-center">
                    <div className="text-4xl mb-4">⚖️</div>
                    <h4 className="font-semibold text-gray-900 mb-2">No Legal Guesswork</h4>
                    <p className="text-gray-600">Clear, transparent legal framework</p>
                  </div>
                  <div className="text-center">
                    <div className="text-4xl mb-4">🔄</div>
                    <h4 className="font-semibold text-gray-900 mb-2">No Reinvention From Scratch</h4>
                    <p className="text-gray-600">Build on proven successful formats</p>
                  </div>
                </div>
                <div className="mt-8 p-6 bg-gradient-to-r from-red-50 to-orange-50 rounded-2xl border border-red-100">
                  <p className="text-center text-lg text-gray-700">
                    ✨ Instead, we offer a transparent, scalable system where creators maintain control and licensors get exactly what they need.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Our Vision Section */}
      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="animate-in fade-in-0 slide-in-from-bottom-4 duration-1000">
            <div className="text-center mb-16">
              <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
                🌟 Our Vision
              </h2>
              <p className="text-xl text-gray-600 max-w-4xl mx-auto leading-relaxed">
                RETELL is building the infrastructure for the next wave of global audio storytelling.
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-16">
              <div className="bg-gradient-to-br from-red-50 to-orange-50 rounded-3xl p-8 border border-red-100">
                <h3 className="text-xl font-bold text-gray-900 mb-6">🎯 We Want To:</h3>
                <ul className="space-y-4 text-gray-700">
                  <li className="flex items-start space-x-3">
                    <span className="text-red-500 text-lg">🌍</span>
                    <span>Make it radically easy to adapt podcasts across languages</span>
                  </li>
                  <li className="flex items-start space-x-3">
                    <span className="text-red-500 text-lg">💰</span>
                    <span>Offer creators fair revenue from international rights</span>
                  </li>
                  <li className="flex items-start space-x-3">
                    <span className="text-red-500 text-lg">⚡</span>
                    <span>Empower production companies to act faster and more creatively</span>
                  </li>
                  <li className="flex items-start space-x-3">
                    <span className="text-red-500 text-lg">🏢</span>
                    <span>Help media companies build strong portfolios without reinventing the wheel</span>
                  </li>
                </ul>
              </div>
              <div className="bg-gradient-to-br from-orange-50 to-red-50 rounded-3xl p-8 border border-orange-100">
                <h3 className="text-xl font-bold text-gray-900 mb-6">🌐 Global Impact</h3>
                <p className="text-gray-700 text-lg leading-relaxed">
                  From Europe to Asia to the Americas, we're creating a shared space where local voices become global properties.
                </p>
                <div className="mt-6 p-4 bg-white rounded-xl border border-red-100">
                  <p className="text-center text-red-600 font-semibold">
                    🚀 Local Stories, Global Reach
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Who We Are Section */}
      <section className="py-24 bg-gradient-to-br from-red-50 to-orange-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="animate-in fade-in-0 slide-in-from-bottom-4 duration-1000">
            <div className="text-center mb-16">
              <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
                👥 Who We Are
              </h2>
            </div>
            <div className="max-w-4xl mx-auto">
              <div className="bg-white rounded-3xl shadow-2xl p-8 md:p-12 border border-red-100">
                <div className="text-center mb-8">
                  <div className="text-6xl mb-4">🎭</div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-4">Founded by Media Professionals</h3>
                </div>
                <p className="text-lg text-gray-700 leading-relaxed mb-6">
                  RETELL was founded by <strong>Marie Luise Nolte</strong> and <strong>Nina Glaser</strong> — two media professionals with deep experience in podcast development, licensing, and storytelling.
                </p>
                <p className="text-lg text-gray-700 leading-relaxed mb-6">
                  Backed by <strong>IFB Hamburg</strong> and supported by a growing network of producers, legal experts, and technologists, we're scaling a model that has already led to international sales.
                </p>
                <div className="bg-gradient-to-r from-red-50 to-orange-50 rounded-2xl p-6 border border-red-100">
                  <p className="text-center text-lg text-gray-700">
                    🏆 <strong>Proven track record</strong> with real international success stories
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Get In Touch Section */}
      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="animate-in fade-in-0 slide-in-from-bottom-4 duration-1000">
            <div className="text-center mb-16">
              <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
                💬 Get In Touch
              </h2>
              <p className="text-xl text-gray-600 max-w-4xl mx-auto leading-relaxed">
                Whether you're a creator looking to license your show or a company looking to acquire your next hit — RETELL can help you move faster, smarter, and further.
              </p>
            </div>
            <div className="max-w-2xl mx-auto">
              <div className="bg-gradient-to-br from-red-50 to-orange-50 rounded-3xl p-8 md:p-12 border border-red-100 text-center">
                <div className="text-6xl mb-6">📧</div>
                <h3 className="text-2xl font-bold text-gray-900 mb-6">Ready to Connect?</h3>
                <div className="space-y-4">
                  <div className="bg-white rounded-2xl p-6 border border-red-100">
                    <p className="text-lg text-gray-700">
                      📬 <strong>Email:</strong> <a href="mailto:hello@retellpodcasthub.com" className="text-red-600 hover:text-red-700 transition-colors">hello@retellpodcasthub.com</a>
                    </p>
                  </div>
                  <div className="bg-white rounded-2xl p-6 border border-red-100">
                    <p className="text-lg text-gray-700">
                      📍 <strong>Location:</strong> Based in Hamburg. Operating globally.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
} 