import Link from 'next/link'
import { Button } from '@/components/ui/button'

export default function PricingPage() {
  const pricingTiers = [
    {
      name: "Starter",
      price: "$29",
      period: "per month",
      description: "Perfect for individual creators and small projects",
      features: [
        "Up to 10 podcast downloads per month",
        "Personal use license",
        "Standard quality audio (MP3)",
        "Basic metadata access",
        "7-day free trial"
      ],
      highlighted: false,
      buttonText: "Start Free Trial",
      color: "gray"
    },
    {
      name: "Professional",
      price: "$89",
      period: "per month",
      description: "Ideal for businesses and professional content creators",
      features: [
        "Up to 50 podcast downloads per month",
        "Commercial use license",
        "High-quality audio (MP3 + WAV)",
        "Complete metadata & transcripts",
        "Advanced search & filtering",
        "Content usage analytics",
        "14-day free trial"
      ],
      highlighted: true,
      buttonText: "Start Free Trial",
      color: "red"
    },
    {
      name: "Enterprise",
      price: "Custom",
      period: "per month",
      description: "Tailored solutions for large organizations",
      features: [
        "Unlimited podcast downloads",
        "Full commercial & broadcast license",
        "Premium audio formats (WAV, FLAC)",
        "Complete content library access",
        "Custom integration support",
        "Bulk licensing agreements",
        "White-label options"
      ],
      highlighted: false,
      buttonText: "Get Started",
      color: "stone"
    }
  ]

  const getCardClasses = (tier: any) => {
    if (tier.highlighted) {
      return "bg-white border-2 border-red-500 shadow-2xl scale-105 relative"
    }
    return "bg-white border border-gray-200 shadow-lg hover:shadow-xl transition-shadow"
  }

  const getButtonClasses = (tier: any) => {
    if (tier.highlighted) {
      return "w-full bg-gradient-to-r from-red-500 to-red-600 text-white rounded-2xl hover:from-red-600 hover:to-red-700 transition-all transform hover:scale-105"
    }
    if (tier.color === "stone") {
      return "w-full bg-gradient-to-r from-stone-500 to-stone-600 text-white rounded-2xl hover:from-stone-600 hover:to-stone-700 transition-all transform hover:scale-105"
    }
    return "w-full bg-gradient-to-r from-gray-500 to-gray-600 text-white rounded-2xl hover:from-gray-600 hover:to-gray-700 transition-all transform hover:scale-105"
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-gradient-to-br from-red-400 via-red-500 to-red-600 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              💰 Pricing & Licensing
            </h1>
            <p className="text-xl text-red-100 max-w-3xl mx-auto mb-8">
              Choose the perfect licensing plan for your podcast content needs. 
              From individual creators to enterprise solutions.
            </p>
            <div className="flex justify-center space-x-4">
              <span className="px-4 py-2 bg-red-400/30 rounded-full text-red-100 text-sm">
                ✨ 30-day money-back guarantee
              </span>
              <span className="px-4 py-2 bg-red-400/30 rounded-full text-red-100 text-sm">
                🚫 No setup fees
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Pricing Cards */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {pricingTiers.map((tier, index) => (
            <div key={tier.name} className={`${getCardClasses(tier)} rounded-3xl p-8 relative`}>
              {tier.highlighted && (
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                  <span className="bg-gradient-to-r from-red-500 to-red-600 text-white px-6 py-2 rounded-full text-sm font-semibold shadow-lg">
                    🔥 Most Popular
                  </span>
                </div>
              )}
              
              <div className="text-center mb-8">
                <h3 className="text-2xl font-bold text-gray-900 mb-2">{tier.name}</h3>
                <p className="text-gray-600 mb-6">{tier.description}</p>
                
                <div className="mb-6">
                  <span className="text-4xl font-bold text-gray-900">{tier.price}</span>
                  {tier.price !== "Custom" && (
                    <span className="text-gray-600 ml-2">{tier.period}</span>
                  )}
                </div>
                
                <Button className={getButtonClasses(tier)}>
                  {tier.buttonText}
                </Button>
              </div>

              <div className="space-y-4">
                <h4 className="font-semibold text-gray-900 text-center mb-4">What's included:</h4>
                <ul className="space-y-3">
                  {tier.features.map((feature, featureIndex) => (
                    <li key={featureIndex} className="flex items-start">
                      <svg className="w-5 h-5 text-green-500 mr-3 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      <span className="text-gray-700 text-sm">{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* FAQ Section */}
      <div className="bg-white py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              ❓ Frequently Asked Questions
            </h2>
            <p className="text-lg text-gray-600">
              Everything you need to know about our pricing and licensing
            </p>
          </div>

          <div className="space-y-8">
            <div className="bg-gray-50 rounded-2xl p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-3">
                What's included in the commercial license?
              </h3>
              <p className="text-gray-700 leading-relaxed">
                Our commercial license allows you to use podcast content for business purposes including 
                marketing campaigns, corporate presentations, commercial videos, and broadcast media. 
                The license covers distribution across multiple platforms and channels.
              </p>
            </div>

            <div className="bg-gray-50 rounded-2xl p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-3">
                Can I upgrade or downgrade my plan?
              </h3>
              <p className="text-gray-700 leading-relaxed">
                Yes! You can change your plan at any time. Upgrades take effect immediately, while 
                downgrades take effect at the next billing cycle. We'll prorate any differences 
                and ensure you get the most value from your subscription.
              </p>
            </div>

            <div className="bg-gray-50 rounded-2xl p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-3">
                What happens if I exceed my download limit?
              </h3>
              <p className="text-gray-700 leading-relaxed">
                If you approach your monthly download limit, we'll notify you via email. You can either 
                upgrade to a higher tier or purchase additional downloads for $2.99 per download. 
                We never cut off access without warning.
              </p>
            </div>

            <div className="bg-gray-50 rounded-2xl p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-3">
                Do you offer volume discounts for large organizations?
              </h3>
              <p className="text-gray-700 leading-relaxed">
                Absolutely! Our Enterprise plan includes custom pricing based on your specific needs. 
                We offer significant discounts for annual subscriptions, educational institutions, 
                and high-volume usage.
              </p>
            </div>

            <div className="bg-gray-50 rounded-2xl p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-3">
                What formats are available for podcast downloads?
              </h3>
              <p className="text-gray-700 leading-relaxed">
                Starter plans include standard MP3 files. Professional plans add high-quality WAV files. 
                Enterprise customers get access to premium formats including FLAC, and can request 
                custom formats. All downloads include metadata and, where available, transcripts.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="bg-gradient-to-br from-red-500 via-red-600 to-red-700 text-white py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold mb-4">
            🚀 Ready to Start Licensing Great Content?
          </h2>
          <p className="text-xl text-red-100 mb-8 max-w-2xl mx-auto">
            Join thousands of creators and businesses who trust RETELL for their podcast licensing needs. 
            Start your free trial today!
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/auth/signup">
              <Button size="lg" className="bg-white text-red-600 hover:bg-red-50 shadow-2xl hover:shadow-3xl transition-all duration-300 px-8 py-4 text-lg font-semibold">
                🎯 Start Free Trial
              </Button>
            </Link>
            <Link href="/catalog">
              <Button size="lg" variant="outline" className="border-2 border-white text-white hover:bg-white hover:text-red-600 shadow-xl hover:shadow-2xl transition-all duration-300 px-8 py-4 text-lg font-semibold">
                🎧 Browse Content First
              </Button>
            </Link>
          </div>
          <p className="text-sm text-red-200 mt-6">
            No credit card required • Cancel anytime • 30-day money-back guarantee
          </p>
        </div>
      </div>

      {/* Back Navigation */}
      <div className="bg-gray-50 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <Link href="/">
            <Button variant="outline" className="border-red-200 text-red-700 hover:bg-red-50">
              ← Back to Home
            </Button>
          </Link>
        </div>
      </div>
    </div>
  )
} 