'use client'

import { countryNameByCode } from '@/lib/countries'

import { AudienceSnapshot } from './sections/AudienceSnapshot'
import { ContentPackage } from './sections/ContentPackage'
import { FormatBadge } from './sections/FormatBadge'
import { GenderDistribution } from './sections/GenderDistribution'
import { LicenseHighlights } from './sections/LicenseHighlights'
import { LicensingCTA } from './sections/LicensingCTA'
import { LicensingHeader } from './sections/LicensingHeader'
import { StatsGrid } from './sections/StatsGrid'

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
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z"
          />
        </svg>
      ),
    },
    {
      label: 'Language',
      value: podcast.language?.toUpperCase() || '—',
      iconBg: 'bg-purple-100 text-purple-600',
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M3 5h12M9 3v2m1.048 9.5A18.022 18.022 0 016.412 9m6.088 9h7M11 21l5-10 5 10M12.751 5C11.783 10.77 8.07 15.61 3 18.129"
          />
        </svg>
      ),
    },
    {
      label: 'Genre',
      value: podcast.category || '—',
      iconBg: 'bg-orange-100 text-orange-600',
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z"
          />
        </svg>
      ),
    },
  ]

  const contentHighlights = [
    'High-quality audio masters (320kbps)',
    'Complete scripts & metadata',
    'Cover art & localization kit',
    'Cleared music beds & stems',
    'Talent bios & host assets',
  ]

  const formatBadge =
    podcast.license_format === 'always_on'
      ? { title: 'Always on production', subtitle: 'Continuous episodes all year' }
      : podcast.license_format === 'series'
        ? { title: 'Series format', subtitle: 'Structured seasonal drops' }
        : null

  const excludedCountries = podcast.license_excluded_countries?.map((c: string) => countryNameByCode(c)) ?? []

  return (
    <section id="licensing-section" className="bg-orange-50 border-y border-orange-100">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <LicensingHeader />

        <StatsGrid cards={statCards} />

        <LicenseHighlights
          licenseDurationLabel={licenseDurationLabel}
          rightsLabel={rightsLabel}
          territoryLabel={territoryLabel}
          excludedCountries={excludedCountries}
        />

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 mb-6">
          <ContentPackage items={contentHighlights} />

          {(podcast.license_total_listeners || podcast.license_listeners_per_episode || podcast.license_demographics?.age) && (
            <AudienceSnapshot
              totalListeners={podcast.license_total_listeners}
              listenersPerEpisode={podcast.license_listeners_per_episode}
              age={podcast.license_demographics?.age}
            />
          )}

          {podcast.license_demographics?.gender && (
            <GenderDistribution gender={podcast.license_demographics.gender} />
          )}
        </div>

        <div className="mt-12 flex flex-col items-center gap-6">
          <FormatBadge formatBadge={formatBadge} />
          <LicensingCTA />
        </div>
      </div>
    </section>
  )
}

