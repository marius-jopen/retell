export default function AboutPage() {
  return (
    <div className="min-h-screen bg-orange-50">
      {/* Hero Section */}
      <section className="relative bg-brand text-white overflow-hidden">
        <div className="absolute inset-0 bg-orange-600/20 backdrop-blur-sm"></div>
        <div className="relative max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="text-center animate-in fade-in-0 slide-in-from-bottom-4 duration-1000">
            <div className="mb-8">
              <h1 className="text-4xl md:text-6xl font-bold mb-6 tracking-tight">
                <span className="block text-orange-100">About</span>
                <span className="block animate-in fade-in-0 slide-in-from-bottom-2 duration-1000 delay-300">
                  RETELL
                </span>
              </h1>
            </div>
            <p className="text-xl md:text-2xl mb-8 max-w-4xl mx-auto leading-relaxed opacity-90 animate-in fade-in-0 slide-in-from-bottom-2 duration-1000 delay-500">
              The first licensing platform for narrative podcasts built to unlock global storytelling
            </p>
            <div className="flex flex-wrap gap-3 justify-center animate-in fade-in-0 slide-in-from-bottom-2 duration-1000 delay-700">
              <span className="bg-white/20 backdrop-blur-sm text-white px-4 py-2 rounded-full text-sm font-medium tracking-wide">
                Founded 2024
              </span>
              <span className="bg-white/20 backdrop-blur-sm text-white px-4 py-2 rounded-full text-sm font-medium tracking-wide">
                Hamburg Based
              </span>
              <span className="bg-white/20 backdrop-blur-sm text-white px-4 py-2 rounded-full text-sm font-medium tracking-wide">
                Global Reach
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* About RETELL Section */}
      <section className="py-20 bg-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="animate-in fade-in-0 slide-in-from-bottom-4 duration-1000">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                About RETELL
              </h2>
              <p className="text-lg text-gray-600 max-w-3xl mx-auto">
                Transforming successful podcasts into licensable IP for global storytelling
              </p>
            </div>
            <div className="max-w-4xl mx-auto">
              <div className="bg-white rounded-2xl shadow-lg p-8 md:p-12 border border-orange-100 hover:shadow-xl transition-all duration-300">
                <div className="space-y-6">
                  <p className="text-lg text-gray-700 leading-relaxed">
                    Founded in 2024 and based in Hamburg, RETELL transforms successful podcasts into licensable IP — giving creators the chance to scale their stories beyond borders, and giving media companies a fast, cost-efficient way to bring proven formats to their audiences.
                  </p>
                  <p className="text-lg text-gray-700 leading-relaxed">
                    We believe podcast storytelling is one of the richest, most intimate formats of our time. But too often, great shows remain locked in a single language, a single market, a single moment.
                  </p>
                  <div className="bg-transparent rounded-xl p-6 border-2 border-orange-200">
                    <p className="text-lg text-gray-800 font-semibold text-center">
                      RETELL changes that.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* What We Do Section */}
      <section className="py-20 bg-orange-50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="animate-in fade-in-0 slide-in-from-bottom-4 duration-1000">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                What We Do
              </h2>
              <p className="text-lg text-gray-600 max-w-3xl mx-auto">
                RETELL is a B2B platform for the licensing, translation, and adaptation of podcast scripts.
              </p>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div className="bg-white rounded-2xl shadow-lg p-8 border border-orange-100 hover:shadow-xl transition-all duration-300">
                <h3 className="text-xl font-bold text-gray-900 mb-6">We Help Production Companies</h3>
                <ul className="space-y-4 text-gray-700">
                  <li className="flex items-start space-x-3">
                    <div className="w-2 h-2 bg-orange-500 rounded-full mt-2"></div>
                    <span>Discover award-winning and audience-proven podcast IP</span>
                  </li>
                  <li className="flex items-start space-x-3">
                    <div className="w-2 h-2 bg-orange-500 rounded-full mt-2"></div>
                    <span>License scripts, music, voice, and brand assets</span>
                  </li>
                  <li className="flex items-start space-x-3">
                    <div className="w-2 h-2 bg-orange-500 rounded-full mt-2"></div>
                    <span>Adapt content to new languages and markets</span>
                  </li>
                  <li className="flex items-start space-x-3">
                    <div className="w-2 h-2 bg-orange-500 rounded-full mt-2"></div>
                    <span>Skip the long and expensive development phase</span>
                  </li>
                </ul>
              </div>
              <div className="bg-white rounded-2xl shadow-lg p-8 border border-orange-100 hover:shadow-xl transition-all duration-300">
                <h3 className="text-xl font-bold text-gray-900 mb-6">Our Process</h3>
                <div className="space-y-4">
                  <p className="text-gray-700">
                    Each podcast submitted to RETELL goes through a rigorous rights and licensing review.
                  </p>
                  <div className="bg-transparent rounded-xl p-4 border-2 border-orange-200">
                    <p className="text-gray-800 font-semibold">
                      Once cleared, it is made available to international buyers who can instantly license and localize it — often in a matter of days.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Why It Matters Section */}
      <section className="py-20 bg-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="animate-in fade-in-0 slide-in-from-bottom-4 duration-1000">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                Why It Matters
              </h2>
              <p className="text-lg text-gray-600 max-w-3xl mx-auto">
                In a saturated media landscape, proven content is more valuable than ever. RETELL bridges the gap between creators with amazing stories and publishers hungry for high-quality, low-risk formats.
              </p>
            </div>
            <div className="max-w-4xl mx-auto">
              <div className="bg-white rounded-2xl shadow-lg p-8 md:p-12 border border-orange-100 hover:shadow-xl transition-all duration-300">
                <div className="text-center mb-8">
                  <h3 className="text-2xl font-bold text-gray-900">We Simplify the Licensing Process</h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                  <div className="text-center p-4 rounded-xl hover:bg-orange-50 transition-colors duration-200">
                    <h4 className="font-semibold text-gray-900 mb-2">No Endless Negotiations</h4>
                    <p className="text-gray-600 text-sm">Quick, streamlined licensing process</p>
                  </div>
                  <div className="text-center p-4 rounded-xl hover:bg-orange-50 transition-colors duration-200">
                    <h4 className="font-semibold text-gray-900 mb-2">No Legal Guesswork</h4>
                    <p className="text-gray-600 text-sm">Clear, transparent legal framework</p>
                  </div>
                  <div className="text-center p-4 rounded-xl hover:bg-orange-50 transition-colors duration-200">
                    <h4 className="font-semibold text-gray-900 mb-2">No Reinvention From Scratch</h4>
                    <p className="text-gray-600 text-sm">Build on proven successful formats</p>
                  </div>
                </div>
                <div className="bg-transparent rounded-xl p-6 border-2 border-orange-200">
                  <p className="text-center text-lg text-gray-800 font-semibold">
                    Instead, we offer a transparent, scalable system where creators maintain control and licensors get exactly what they need.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Our Vision Section */}
      <section className="py-20 bg-orange-50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="animate-in fade-in-0 slide-in-from-bottom-4 duration-1000">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                Our Vision
              </h2>
              <p className="text-lg text-gray-600 max-w-3xl mx-auto">
                RETELL is building the infrastructure for the next wave of global audio storytelling.
              </p>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div className="bg-white rounded-2xl shadow-lg p-8 border border-orange-100 hover:shadow-xl transition-all duration-300">
                <h3 className="text-xl font-bold text-gray-900 mb-6">We Want To:</h3>
                <ul className="space-y-4 text-gray-700">
                  <li className="flex items-start space-x-3">
                    <div className="w-2 h-2 bg-orange-500 rounded-full mt-2"></div>
                    <span>Make it radically easy to adapt podcasts across languages</span>
                  </li>
                  <li className="flex items-start space-x-3">
                    <div className="w-2 h-2 bg-orange-500 rounded-full mt-2"></div>
                    <span>Offer creators fair revenue from international rights</span>
                  </li>
                  <li className="flex items-start space-x-3">
                    <div className="w-2 h-2 bg-orange-500 rounded-full mt-2"></div>
                    <span>Empower production companies to act faster and more creatively</span>
                  </li>
                  <li className="flex items-start space-x-3">
                    <div className="w-2 h-2 bg-orange-500 rounded-full mt-2"></div>
                    <span>Help media companies build strong portfolios without reinventing the wheel</span>
                  </li>
                </ul>
              </div>
              <div className="bg-white rounded-2xl shadow-lg p-8 border border-orange-100 hover:shadow-xl transition-all duration-300">
                <h3 className="text-xl font-bold text-gray-900 mb-6">Global Impact</h3>
                <div className="space-y-4">
                  <p className="text-gray-700 leading-relaxed">
                    From Europe to Asia to the Americas, we're creating a shared space where local voices become global properties.
                  </p>
                  <div className="bg-transparent rounded-xl p-4 border-2 border-orange-200">
                    <p className="text-center text-orange-600 font-semibold">
                      Local Stories, Global Reach
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Who We Are Section */}
      <section className="py-20 bg-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="animate-in fade-in-0 slide-in-from-bottom-4 duration-1000">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                Who We Are
              </h2>
            </div>
            <div className="max-w-4xl mx-auto">
              <div className="bg-white rounded-2xl shadow-lg p-8 md:p-12 border border-orange-100 hover:shadow-xl transition-all duration-300">
                <div className="text-center mb-8">
                  <h3 className="text-2xl font-bold text-gray-900 mb-4">Founded by Media Professionals</h3>
                </div>
                <div className="space-y-6">
                  <p className="text-lg text-gray-700 leading-relaxed">
                    RETELL was founded by <strong>Marie Luise Nolte</strong> and <strong>Nina Glaser</strong> — two media professionals with deep experience in podcast development, licensing, and storytelling.
                  </p>
                  <p className="text-lg text-gray-700 leading-relaxed">
                    Backed by <strong>IFB Hamburg</strong> and supported by a growing network of producers, legal experts, and technologists, we're scaling a model that has already led to international sales.
                  </p>
                  <div className="bg-transparent rounded-xl p-6 border-2 border-orange-200">
                    <p className="text-center text-lg text-gray-800 font-semibold">
                      <strong>Proven track record</strong> with real international success stories
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Get In Touch Section */}
      <section className="py-20 bg-orange-50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="animate-in fade-in-0 slide-in-from-bottom-4 duration-1000">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                Get In Touch
              </h2>
              <p className="text-lg text-gray-600 max-w-3xl mx-auto">
                Whether you're a creator looking to license your show or a company looking to acquire your next hit — RETELL can help you move faster, smarter, and further.
              </p>
            </div>
            <div className="max-w-2xl mx-auto">
              <div className="bg-white rounded-2xl shadow-lg p-8 md:p-12 border border-orange-100 hover:shadow-xl transition-all duration-300 text-center">
                <h3 className="text-2xl font-bold text-gray-900 mb-8">Ready to Connect?</h3>
                <div className="space-y-4">
                  <div className="bg-transparent rounded-xl p-6 border-2 border-orange-200 hover:shadow-md transition-all duration-200">
                    <p className="text-lg text-gray-800">
                      <strong>Email:</strong> <a href="mailto:hello@retellpodcasthub.com" className="text-orange-600 hover:text-orange-700 transition-colors font-semibold">hello@retellpodcasthub.com</a>
                    </p>
                  </div>
                  <div className="bg-transparent rounded-xl p-6 border-2 border-orange-200 hover:shadow-md transition-all duration-200">
                    <p className="text-lg text-gray-800">
                      <strong>Location:</strong> Based in Hamburg. Operating globally.
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