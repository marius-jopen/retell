'use client'

import type { ReactNode } from 'react'

import { countryNameByCode } from '@/lib/countries'

import { LicensingCTA } from './sections/LicensingCTA'
import { LicensingHeader } from './sections/LicensingHeader'
import { UnifiedCard } from './sections/UnifiedCard'

interface PodcastLicensingProps {
  podcast: any
}

export function PodcastLicensing({ podcast }: PodcastLicensingProps) {
  if (
    !podcast.license_format &&
    !podcast.license_territory &&
    !podcast.license_total_listeners &&
    !podcast.license_copyright &&
    !podcast.license_rights_ownership
  ) {
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

  const episodes = podcast.episodes || []
  const estimatedDuration = Math.round((episodes.length || 0) * 35)
  const totalHours = Math.floor(estimatedDuration / 60)
  const remainingMinutes = estimatedDuration % 60

  const excludedCountries = podcast.license_excluded_countries?.map((c: string) => countryNameByCode(c)) ?? []

  // Build unified grid cards
  const gridCards: Array<{ headline: string; text: string; subtext: string; icon?: ReactNode }> = []

  // Total Duration
  gridCards.push({
    headline: 'TOTAL DURATION',
    text: `${totalHours}h ${remainingMinutes}m`,
    subtext: 'Complete audio library available for licensing',
    icon: (
      <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-2xl flex items-center justify-center">
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      </div>
    ),
  })

  // Episodes
  gridCards.push({
    headline: 'EPISODES',
    text: episodes.length.toString(),
    subtext: 'Ready-to-use premium content',
    icon: (
      <div className="w-12 h-12 bg-red-100 text-red-600 rounded-2xl flex items-center justify-center">
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z"
          />
        </svg>
      </div>
    ),
  })

  // Language
  gridCards.push({
    headline: 'LANGUAGE',
    text: podcast.language?.toUpperCase() || '—',
    subtext: 'Primary content language',
    icon: (
      <div className="w-12 h-12 bg-purple-100 text-purple-600 rounded-2xl flex items-center justify-center">
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M3 5h12M9 3v2m1.048 9.5A18.022 18.022 0 016.412 9m6.088 9h7M11 21l5-10 5 10M12.751 5C11.783 10.77 8.07 15.61 3 18.129"
          />
        </svg>
      </div>
    ),
  })

  // Genre
  gridCards.push({
    headline: 'GENRE',
    text: podcast.category || '—',
    subtext: 'Content category and focus',
    icon: (
      <div className="w-12 h-12 bg-orange-100 text-orange-600 rounded-2xl flex items-center justify-center">
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z"
          />
        </svg>
      </div>
    ),
  })

  // License Duration
  if (licenseDurationLabel) {
    gridCards.push({
      headline: 'LICENSE DURATION',
      text: licenseDurationLabel,
      subtext: 'Matches industry-standard copyright protection',
    })
  }

  // Rights & Ownership
  if (rightsLabel) {
    gridCards.push({
      headline: 'RIGHTS & OWNERSHIP',
      text: rightsLabel,
      subtext: 'Single entity with authority to transfer rights',
    })
  }

  // Territory
  if (territoryLabel) {
    const territorySubtext = excludedCountries.length > 0
      ? `Exceptions: ${excludedCountries.slice(0, 2).join(', ')}${excludedCountries.length > 2 ? '...' : ''}`
      : 'Cleared for worldwide distribution'
    gridCards.push({
      headline: 'TERRITORY',
      text: territoryLabel,
      subtext: territorySubtext,
    })
  }

  // Content Package
  gridCards.push({
    headline: 'CONTENT PACKAGE',
    text: '5 premium assets',
    subtext: 'High-quality audio, scripts, art & more',
  })

  // Audience Snapshot
  if (podcast.license_total_listeners || podcast.license_listeners_per_episode || podcast.license_demographics?.age) {
    const totalListeners = podcast.license_total_listeners
    const formattedListeners = totalListeners
      ? totalListeners >= 1000
        ? `${Math.round(totalListeners / 1000)}K+`
        : totalListeners.toLocaleString()
      : null

    gridCards.push({
      headline: 'AUDIENCE SNAPSHOT',
      text: formattedListeners ? `${formattedListeners} listeners` : 'Performance data',
      subtext: formattedListeners
        ? 'Total audience reach per launch'
        : podcast.license_listeners_per_episode
          ? 'Detailed analytics available'
          : 'Age demographics included',
    })
  }

  // Gender Distribution
  if (podcast.license_demographics?.gender) {
    const gender = podcast.license_demographics.gender
    const topGender = gender.female && gender.female > (gender.male || 0) && gender.female > (gender.diverse || 0)
      ? 'Female'
      : gender.male && gender.male > (gender.diverse || 0)
        ? 'Male'
        : gender.diverse
          ? 'Diverse'
          : null

    gridCards.push({
      headline: 'GENDER DISTRIBUTION',
      text: topGender ? `${topGender} majority` : 'Balanced reach',
      subtext: 'Cross-demographic audience engagement',
    })
  }

  // Production Cadence
  const formatBadge =
    podcast.license_format === 'always_on'
      ? { title: 'Always on production', subtitle: 'Continuous episodes all year' }
      : podcast.license_format === 'series'
        ? { title: 'Series format', subtitle: 'Structured seasonal drops' }
        : null

  if (formatBadge) {
    gridCards.push({
      headline: 'PRODUCTION CADENCE',
      text: formatBadge.title,
      subtext: formatBadge.subtitle,
    })
  }

  return (
    <section id="licensing-section" className="bg-orange-50 border-y border-orange-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <LicensingHeader />

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-12">
          {gridCards.map((card, index) => (
            <UnifiedCard key={index} headline={card.headline} text={card.text} subtext={card.subtext} icon={card.icon} />
          ))}
        </div>

        <div className="mt-20 flex flex-col items-center">
          <LicensingCTA />
        </div>
      </div>
    </section>
  )
}

