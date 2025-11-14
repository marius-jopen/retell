'use client'

import { countryNameByCode } from '@/lib/countries'

interface PodcastLicensingProps {
  podcast: any
}

export function PodcastLicensing({ podcast }: PodcastLicensingProps) {
  if (!podcast.license_format && !podcast.license_territory && !podcast.license_total_listeners && !podcast.license_copyright && !podcast.license_rights_ownership) {
    return null
  }

  const licenseDurationLabel =
    podcast.license_copyright === 'lifetime'
      ? 'Lifetime + 70 years'
      : podcast.license_copyright === 'five_years'
        ? '5 years fixed term'
        : null

  const rightsLabel =
    podcast.license_rights_ownership === 'full_owner'
      ? 'Full commercial use'
      : podcast.license_rights_ownership === 'granted_rights'
        ? 'Extended licensed use'
        : podcast.license_rights_ownership === 'partial_rights'
          ? 'Partial rights available'
          : podcast.license_rights_ownership === 'other_rights'
            ? 'Shared / negotiable'
            : null

  const territoryLabel =
    podcast.license_territory === 'worldwide'
      ? 'All countries'
      : podcast.license_territory === 'limited'
        ? 'Specific regions'
        : null

  const contentHighlights = [
    'High-quality audio masters (320kbps)',
    'Complete scripts & metadata',
    'Cover art & localization kit',
    'Cleared music beds & stems',
    'Talent bios & host assets',
  ]

  const formatBadge =
    podcast.license_format === 'always_on'
      ? {
          title: 'Always on production',
          subtitle: 'Continuous episodes all year',
        }
      : podcast.license_format === 'series'
        ? {
            title: 'Series format',
            subtitle: 'Structured seasonal drops',
          }
        : null

  const episodes = podcast.episodes || []
  const estimatedDuration = Math.round((episodes.length || 0) * 35)
  const totalHours = Math.floor(estimatedDuration / 60)
  const remainingMinutes = estimatedDuration % 60

  const statCards = [
    {
      label: 'Total Duration',
      value: `${totalHours}h ${remainingMinutes}m`,
      iconBg: 'bg-blue-100 text-blue-600',
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
    },
    {
      label: 'Episodes',
      value: episodes.length.toString(),
      iconBg: 'bg-red-100 text-red-600',
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
        </svg>
      ),
    },
    {
      label: 'Language',
      value: podcast.language?.toUpperCase() || '—',
      iconBg: 'bg-purple-100 text-purple-600',
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5h12M9 3v2m1.048 9.5A18.022 18.022 0 016.412 9m6.088 9h7M11 21l5-10 5 10M12.751 5C11.783 10.77 8.07 15.61 3 18.129" />
        </svg>
      ),
    },
    {
      label: 'Genre',
      value: podcast.category || '—',
      iconBg: 'bg-orange-100 text-orange-600',
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
        </svg>
      ),
    },
  ]

  return (
    <section className="bg-orange-50 border-y border-orange-100">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center mb-10">
          <span className="inline-flex items-center justify-center px-4 py-2 rounded-full bg-white text-orange-500 font-semibold shadow-sm mb-4">
            🏛️ About This Podcast
          </span>
          <h2 className="text-3xl font-bold text-gray-900 mb-3">Complete licensing package for premium buyers</h2>
          <p className="text-lg text-gray-600">
            The entire rights stack, audience data, and production assets you need to re-license TRUE LOVE confidently.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          {statCards.map((card) => (
            <div key={card.label} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 text-center">
              <div className={`w-12 h-12 ${card.iconBg} rounded-2xl flex items-center justify-center mx-auto mb-3`}>
                {card.icon}
              </div>
              <p className="text-2xl font-bold text-gray-900">{card.value}</p>
              <p className="text-sm text-gray-500 mt-1">{card.label}</p>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 mb-6">
          {licenseDurationLabel && (
            <div className="bg-white rounded-2xl border border-orange-100 shadow-sm p-6">
              <p className="text-xs uppercase tracking-wide font-semibold text-orange-500 mb-2">License duration</p>
              <p className="text-2xl font-semibold text-gray-900">{licenseDurationLabel}</p>
              <p className="text-sm text-gray-500 mt-2">Matches industry-standard copyright protection.</p>
            </div>
          )}
          {rightsLabel && (
            <div className="bg-white rounded-2xl border border-orange-100 shadow-sm p-6">
              <p className="text-xs uppercase tracking-wide font-semibold text-orange-500 mb-2">Rights & ownership</p>
              <p className="text-2xl font-semibold text-gray-900">{rightsLabel}</p>
              <p className="text-sm text-gray-500 mt-2">Single entity with authority to transfer rights.</p>
            </div>
          )}
          {territoryLabel && (
            <div className="bg-white rounded-2xl border border-orange-100 shadow-sm p-6">
              <p className="text-xs uppercase tracking-wide font-semibold text-orange-500 mb-2">Territory</p>
              <p className="text-2xl font-semibold text-gray-900">{territoryLabel}</p>
              {podcast.license_excluded_countries?.length ? (
                <p className="text-sm text-gray-500 mt-2">
                  Exceptions: {podcast.license_excluded_countries.map((c: string) => countryNameByCode(c)).join(', ')}
                </p>
              ) : (
                <p className="text-sm text-gray-500 mt-2">Cleared for worldwide distribution.</p>
              )}
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
            <p className="text-xs uppercase tracking-wide font-semibold text-orange-500 mb-3">Content package</p>
            <h3 className="text-xl font-semibold text-gray-900 mb-4">Everything included in the license</h3>
            <ul className="space-y-3 text-sm text-gray-700">
              {contentHighlights.map((item) => (
                <li key={item} className="flex items-start gap-3">
                  <span className="text-green-500 mt-0.5">✓</span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>

          {(podcast.license_total_listeners || podcast.license_listeners_per_episode || podcast.license_demographics?.age) && (
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
              <p className="text-xs uppercase tracking-wide font-semibold text-orange-500 mb-3">Audience snapshot</p>
              <h3 className="text-xl font-semibold text-gray-900 mb-6">Performance & age groups</h3>
              <div className="grid grid-cols-2 gap-4 mb-6">
                {podcast.license_total_listeners && (
                  <div className="rounded-2xl border border-gray-100 bg-white p-4 text-center">
                    <p className="text-xs uppercase tracking-wide text-gray-500 mb-1">Total listeners</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {podcast.license_total_listeners >= 1000
                        ? `${Math.round(podcast.license_total_listeners / 1000)}K+`
                        : podcast.license_total_listeners.toLocaleString()}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">per launch</p>
                  </div>
                )}
                {podcast.license_listeners_per_episode && (
                  <div className="rounded-2xl border border-gray-100 bg-white p-4 text-center">
                    <p className="text-xs uppercase tracking-wide text-gray-500 mb-1">Per episode avg</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {podcast.license_listeners_per_episode >= 1000
                        ? `${Math.round(podcast.license_listeners_per_episode / 1000)}K+`
                        : podcast.license_listeners_per_episode.toLocaleString()}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">across latest season</p>
                  </div>
                )}
              </div>
              {podcast.license_demographics?.age && (
                <div className="space-y-3">
                  {[
                    { label: '18-27 yrs', value: podcast.license_demographics.age.age_18_27 },
                    { label: '27-34 yrs', value: podcast.license_demographics.age.age_27_34 },
                    { label: '35-45 yrs', value: podcast.license_demographics.age.age_35_45 },
                    { label: '45+ yrs', value: podcast.license_demographics.age.age_45_plus },
                  ].map(
                    (item) =>
                      item.value && (
                        <div key={item.label}>
                          <div className="flex justify-between text-sm text-gray-600 mb-1">
                            <span>{item.label}</span>
                            <span className="font-semibold text-gray-900">{item.value}%</span>
                          </div>
                          <div className="w-full h-2 bg-gray-100 rounded-full">
                            <div className="h-2 rounded-full bg-gradient-to-r from-orange-400 to-pink-500" style={{ width: `${item.value}%` }} />
                          </div>
                        </div>
                      ),
                  )}
                </div>
              )}
            </div>
          )}

          {podcast.license_demographics?.gender && (
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
              <p className="text-xs uppercase tracking-wide font-semibold text-orange-500 mb-3">Gender distribution</p>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Balanced reach across identities</h3>
              <div className="space-y-4">
                {[
                  { label: 'Female', value: podcast.license_demographics.gender.female, color: 'bg-orange-500' },
                  { label: 'Male', value: podcast.license_demographics.gender.male, color: 'bg-blue-300' },
                  { label: 'Diverse', value: podcast.license_demographics.gender.diverse, color: 'bg-purple-300' },
                ].map(
                  (item) =>
                    item.value && (
                      <div key={item.label} className="space-y-1">
                        <div className="flex justify-between text-sm text-gray-600">
                          <span>{item.label}</span>
                          <span className="font-semibold text-gray-900">{item.value}%</span>
                        </div>
                        <div className="w-full h-2 bg-gray-100 rounded-full">
                          <div className={`h-2 rounded-full ${item.color}`} style={{ width: `${item.value}%` }} />
                        </div>
                      </div>
                    ),
                )}
              </div>
            </div>
          )}
        </div>

        <div className="mt-12 flex flex-col items-center gap-6">
          {formatBadge && (
            <div className="inline-flex flex-col sm:flex-row sm:items-center gap-2 px-6 py-4 rounded-full bg-white text-black font-semibold shadow-lg">
              <span>📻 {formatBadge.title}</span>
              <span className="text-primary text-sm sm:ml-2">{formatBadge.subtitle}</span>
            </div>
          )}

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
        </div>
      </div>
    </section>
  )
}
