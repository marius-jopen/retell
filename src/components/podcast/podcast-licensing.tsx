'use client'

import { COUNTRIES, countryNameByCode } from '@/lib/countries'

interface PodcastLicensingProps {
  podcast: any
}

export function PodcastLicensing({ podcast }: PodcastLicensingProps) {
  if (!podcast.license_format && !podcast.license_territory && !podcast.license_total_listeners && !podcast.license_copyright && !podcast.license_rights_ownership) {
    return null
  }

  return (
    <div className="border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center mb-12">
          <div className="text-4xl mb-4">🏛️</div>
          <h2 className="text-3xl font-bold text-gray-900 mb-3">Licensing Information</h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Complete licensing details and terms for this premium podcast content
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
          {/* Left Column - Licensing Terms */}
          <div className="space-y-6">
            <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
              <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center">
                <span className="text-2xl mr-3">📜</span>
                Copyright Terms
              </h3>
              
              <div className="space-y-4">
                {podcast.license_copyright && (
                  <div className="flex justify-between items-center py-3 border-b border-gray-100">
                    <span className="font-medium text-gray-700">License Duration</span>
                    <span className="text-gray-900 font-semibold">
                      {podcast.license_copyright === 'lifetime' ? 'Lifetime + 70 years' : '5 years'}
                    </span>
                  </div>
                )}
                
                {podcast.license_rights_ownership && (
                  <div className="flex justify-between items-center py-3 border-b border-gray-100">
                    <span className="font-medium text-gray-700">Content Rights</span>
                    <span className="text-gray-900 font-semibold">
                      {podcast.license_rights_ownership === 'full_owner' ? 'Full Commercial Use' :
                       podcast.license_rights_ownership === 'granted_rights' ? 'Licensed Use' :
                       podcast.license_rights_ownership === 'partial_rights' ? 'Limited Use' : 'Restricted Use'}
                    </span>
                  </div>
                )}
                
                {podcast.license_territory && (
                  <div className="flex justify-between items-center py-3 border-b border-gray-100">
                    <span className="font-medium text-gray-700">Territory</span>
                    <span className="text-gray-900 font-semibold">
                      {podcast.license_territory === 'worldwide' ? 'Worldwide' : 'Limited Regions'}
                    </span>
                  </div>
                )}
                
                {podcast.license_excluded_countries && podcast.license_excluded_countries.length > 0 && (
                  <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                    <div className="flex items-center mb-2">
                      <span className="text-lg mr-2">🚫</span>
                      <span className="text-sm font-medium text-red-800">
                        {podcast.license_excluded_countries.length === 1 
                          ? 'Not Available in This Country:'
                          : 'Not Available in These Countries:'
                        }
                      </span>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {podcast.license_excluded_countries.map((countryCode: string) => (
                        <span
                          key={countryCode}
                          className="px-3 py-1 text-sm bg-red-100 text-red-800 rounded-full border border-red-300"
                        >
                          {countryNameByCode(countryCode)}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Content Package */}
            <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
              <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center">
                <span className="text-2xl mr-3">📦</span>
                Content Package
              </h3>
              
              <div className="space-y-3">
                <div className="flex items-center text-gray-700">
                  <span className="text-green-500 mr-3">✓</span>
                  <span>High-quality audio files (320kbps)</span>
                </div>
                <div className="flex items-center text-gray-700">
                  <span className="text-green-500 mr-3">✓</span>
                  <span>Complete episode scripts</span>
                </div>
                <div className="flex items-center text-gray-700">
                  <span className="text-green-500 mr-3">✓</span>
                  <span>Metadata & show notes</span>
                </div>
                <div className="flex items-center text-gray-700">
                  <span className="text-green-500 mr-3">✓</span>
                  <span>Cover art & branding</span>
                </div>
                <div className="flex items-center text-gray-700">
                  <span className="text-green-500 mr-3">✓</span>
                  <span>Professional production</span>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column - Demographics & Performance */}
          <div className="space-y-6">
            {/* Performance Metrics */}
            {(podcast.license_total_listeners || podcast.license_listeners_per_episode) && (
              <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
                <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center">
                  <span className="text-2xl mr-3">📊</span>
                  Demographics
                </h3>
                
                <div className="grid grid-cols-2 gap-4 mb-6">
                  {podcast.license_total_listeners && (
                    <div className="text-center p-4 bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl">
                      <div className="text-2xl font-bold text-blue-600 mb-1">
                        {podcast.license_total_listeners >= 1000 
                          ? `${Math.round(podcast.license_total_listeners / 1000)}K+` 
                          : podcast.license_total_listeners.toLocaleString()}
                      </div>
                      <div className="text-sm text-blue-700 font-medium">Total Listeners</div>
                      <div className="text-xs text-blue-600">per launch</div>
                    </div>
                  )}
                  
                  {podcast.license_listeners_per_episode && (
                    <div className="text-center p-4 bg-gradient-to-br from-green-50 to-green-100 rounded-xl">
                      <div className="text-2xl font-bold text-green-600 mb-1">
                        {podcast.license_listeners_per_episode >= 1000 
                          ? `${Math.round(podcast.license_listeners_per_episode / 1000)}K+` 
                          : podcast.license_listeners_per_episode.toLocaleString()}
                      </div>
                      <div className="text-sm text-green-700 font-medium">Per Episode</div>
                      <div className="text-xs text-green-600">average</div>
                    </div>
                  )}
                </div>

                {/* Age Groups */}
                {podcast.license_demographics?.age && (
                  <div>
                    <h4 className="font-semibold text-gray-800 mb-3">Age Groups</h4>
                    <div className="space-y-2">
                      {podcast.license_demographics.age.age_18_27 && (
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-gray-600">18-27 years</span>
                          <span className="font-semibold text-gray-900">{podcast.license_demographics.age.age_18_27}%</span>
                        </div>
                      )}
                      {podcast.license_demographics.age.age_27_34 && (
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-gray-600">27-34 years</span>
                          <span className="font-semibold text-gray-900">{podcast.license_demographics.age.age_27_34}%</span>
                        </div>
                      )}
                      {podcast.license_demographics.age.age_35_45 && (
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-gray-600">35-45 years</span>
                          <span className="font-semibold text-gray-900">{podcast.license_demographics.age.age_35_45}%</span>
                        </div>
                      )}
                      {podcast.license_demographics.age.age_45_plus && (
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-gray-600">45+ years</span>
                          <span className="font-semibold text-gray-900">{podcast.license_demographics.age.age_45_plus}%</span>
                        </div>
                      )}
                      
                      {/* Show primary age group summary */}
                      {(podcast.license_demographics.age.age_27_34 && podcast.license_demographics.age.age_35_45) && (
                        <div className="mt-3 p-3 bg-purple-50 rounded-lg border border-purple-200">
                          <span className="text-sm font-medium text-purple-800">
                            25-45 ({(podcast.license_demographics.age.age_27_34 + podcast.license_demographics.age.age_35_45)}%)
                          </span>
                          <span className="text-sm text-purple-600 ml-2">primary audience</span>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Gender Demographics */}
            {podcast.license_demographics?.gender && (
              <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
                <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center">
                  <span className="text-xl mr-2">👥</span>
                  Gender Distribution
                </h3>
                
                <div className="space-y-3">
                  {podcast.license_demographics.gender.male && (
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">Male</span>
                      <div className="flex items-center">
                        <div className="w-20 h-2 bg-gray-200 rounded-full mr-3">
                          <div 
                            className="h-2 bg-blue-500 rounded-full" 
                            style={{ width: `${podcast.license_demographics.gender.male}%` }}
                          ></div>
                        </div>
                        <span className="font-semibold text-gray-900 w-8 text-right">
                          {podcast.license_demographics.gender.male}%
                        </span>
                      </div>
                    </div>
                  )}
                  
                  {podcast.license_demographics.gender.female && (
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">Female</span>
                      <div className="flex items-center">
                        <div className="w-20 h-2 bg-gray-200 rounded-full mr-3">
                          <div 
                            className="h-2 bg-pink-500 rounded-full" 
                            style={{ width: `${podcast.license_demographics.gender.female}%` }}
                          ></div>
                        </div>
                        <span className="font-semibold text-gray-900 w-8 text-right">
                          {podcast.license_demographics.gender.female}%
                        </span>
                      </div>
                    </div>
                  )}
                  
                  {podcast.license_demographics.gender.diverse && (
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">Diverse</span>
                      <div className="flex items-center">
                        <div className="w-20 h-2 bg-gray-200 rounded-full mr-3">
                          <div 
                            className="h-2 bg-purple-500 rounded-full" 
                            style={{ width: `${podcast.license_demographics.gender.diverse}%` }}
                          ></div>
                        </div>
                        <span className="font-semibold text-gray-900 w-8 text-right">
                          {podcast.license_demographics.gender.diverse}%
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Production Format Badge */}
        {podcast.license_format && (
          <div className="text-center">
            <div className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-full font-semibold shadow-lg">
              <span className="text-xl mr-2">📻</span>
              <span>
                {podcast.license_format === 'always_on' ? 'Always On Production' : 'Seasonal Series'}
              </span>
              <span className="ml-2 text-orange-100">
                {podcast.license_format === 'always_on' ? '• Continuous Episodes' : '• Planned Seasons'}
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
