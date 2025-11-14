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
  const baseCardClasses =
    'bg-white rounded-2xl border border-orange-100 shadow-sm p-6 aspect-square flex flex-col justify-between h-full'

  return (
    <>
      {licenseDurationLabel && (
        <div key="license-duration" className={baseCardClasses}>
          <div>
            <p className="text-xs uppercase tracking-wide font-semibold text-orange-500 mb-2">License duration</p>
            <p className="text-2xl font-semibold text-gray-900">{licenseDurationLabel}</p>
          </div>
          <p className="text-sm text-gray-500 mt-4">Matches industry-standard copyright protection.</p>
        </div>
      )}

      {rightsLabel && (
        <div key="rights-ownership" className={baseCardClasses}>
          <div>
            <p className="text-xs uppercase tracking-wide font-semibold text-orange-500 mb-2">Rights & ownership</p>
            <p className="text-2xl font-semibold text-gray-900">{rightsLabel}</p>
          </div>
          <p className="text-sm text-gray-500 mt-4">Single entity with authority to transfer rights.</p>
        </div>
      )}

      {territoryLabel && (
        <div key="territory" className={baseCardClasses}>
          <div>
            <p className="text-xs uppercase tracking-wide font-semibold text-orange-500 mb-2">Territory</p>
            <p className="text-2xl font-semibold text-gray-900">{territoryLabel}</p>
          </div>
          {hasExclusions ? (
            <p className="text-sm text-gray-500 mt-4">Exceptions: {excludedCountries.join(', ')}</p>
          ) : (
            <p className="text-sm text-gray-500 mt-4">Cleared for worldwide distribution.</p>
          )}
        </div>
      )}
    </>
  )
}

