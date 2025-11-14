interface AgeBreakdown {
  age_18_27?: number
  age_27_34?: number
  age_35_45?: number
  age_45_plus?: number
}

interface AudienceSnapshotProps {
  totalListeners?: number
  listenersPerEpisode?: number
  age?: AgeBreakdown
}

const ageRanges: { label: string; key: keyof AgeBreakdown }[] = [
  { label: '18-27 yrs', key: 'age_18_27' },
  { label: '27-34 yrs', key: 'age_27_34' },
  { label: '35-45 yrs', key: 'age_35_45' },
  { label: '45+ yrs', key: 'age_45_plus' },
]

function formatListenerCount(value?: number) {
  if (!value && value !== 0) {
    return null
  }

  if (value >= 1000) {
    return `${Math.round(value / 1000)}K+`
  }

  return value.toLocaleString()
}

export function AudienceSnapshot({ totalListeners, listenersPerEpisode, age }: AudienceSnapshotProps) {
  const totalListenersLabel = formatListenerCount(totalListeners)
  const perEpisodeLabel = formatListenerCount(listenersPerEpisode)

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 aspect-square flex flex-col">
      <p className="text-xs uppercase tracking-wide font-semibold text-orange-500 mb-3">Audience snapshot</p>
      <h3 className="text-xl font-semibold text-gray-900 mb-6">Performance & age groups</h3>

      {(totalListenersLabel || perEpisodeLabel) && (
        <div className="grid grid-cols-2 gap-4 mb-6">
          {totalListenersLabel && (
            <div className="rounded-2xl border border-gray-100 bg-white p-4 text-center">
              <p className="text-xs uppercase tracking-wide text-gray-500 mb-1">Total listeners</p>
              <p className="text-2xl font-bold text-gray-900">{totalListenersLabel}</p>
              <p className="text-xs text-gray-500 mt-1">per launch</p>
            </div>
          )}

          {perEpisodeLabel && (
            <div className="rounded-2xl border border-gray-100 bg-white p-4 text-center">
              <p className="text-xs uppercase tracking-wide text-gray-500 mb-1">Per episode avg</p>
              <p className="text-2xl font-bold text-gray-900">{perEpisodeLabel}</p>
              <p className="text-xs text-gray-500 mt-1">across latest season</p>
            </div>
          )}
        </div>
      )}

      {age && (
        <div className="space-y-3 mt-auto">
          {ageRanges.map(
            ({ label, key }) =>
              age[key] && (
                <div key={key}>
                  <div className="flex justify-between text-sm text-gray-600 mb-1">
                    <span>{label}</span>
                    <span className="font-semibold text-gray-900">{age[key]}%</span>
                  </div>
                  <div className="w-full h-2 bg-gray-100 rounded-full">
                    <div className="h-2 rounded-full bg-gradient-to-r from-orange-400 to-pink-500" style={{ width: `${age[key]}%` }} />
                  </div>
                </div>
              ),
          )}
        </div>
      )}
    </div>
  )
}

