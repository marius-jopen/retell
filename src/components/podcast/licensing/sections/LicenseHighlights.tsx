interface LicenseHighlightsProps {
  licenseDurationLabel: string | null
  rightsLabel: string | null
  territoryLabel: string | null
  excludedCountries: string[]
}

export function LicenseHighlights({ licenseDurationLabel, rightsLabel, territoryLabel, excludedCountries }: LicenseHighlightsProps) {
  if (!licenseDurationLabel && !rightsLabel && !territoryLabel) {
    return null
  }

  const hasExclusions = excludedCountries.length > 0

  return (
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
          {hasExclusions ? (
            <p className="text-sm text-gray-500 mt-2">Exceptions: {excludedCountries.join(', ')}</p>
          ) : (
            <p className="text-sm text-gray-500 mt-2">Cleared for worldwide distribution.</p>
          )}
        </div>
      )}
    </div>
  )
}

