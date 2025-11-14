export function LicensingCTA() {
  return (
    <div className="bg-white mt-20 rounded-2xl shadow-lg p-8 text-center border border-gray-200 max-w-3xl w-full">
      <div className="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
        <svg className="w-8 h-8 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
        </svg>
      </div>
      <h3 className="text-2xl font-bold mb-4 text-gray-900">Ready to License This Podcast?</h3>
      <p className="text-lg text-gray-600 mb-6 leading-relaxed">
        Get instant access to premium podcast content with comprehensive licensing terms. Perfect for platforms, networks, and content creators.
      </p>
      <div className="flex flex-col sm:flex-row gap-3 justify-center">
        <a href="https://google.com" target="_blank" rel="noopener noreferrer" className="flex-1">
          <div className="bg-brand-500 hover:bg-red-700 text-white font-semibold py-3 rounded-xl text-sm shadow-lg text-center">
            🚀 Start Licensing
          </div>
        </a>
        <a href="/catalog" className="flex-1">
          <div className="border-2 border-gray-300 text-gray-700 hover:bg-gray-50 hover:border-gray-400 font-semibold py-3 rounded-xl text-sm text-center">
            📚 Browse Catalog
          </div>
        </a>
      </div>
    </div>
  )
}

