interface FormatBadgeProps {
  formatBadge: {
    title: string
    subtitle: string
  } | null
}

export function FormatBadge({ formatBadge }: FormatBadgeProps) {
  if (!formatBadge) {
    return null
  }

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 aspect-square flex flex-col justify-between">
      <div>
        <p className="text-xs uppercase tracking-wide font-semibold text-orange-500 mb-2">Production cadence</p>
        <h3 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
          <span role="img" aria-label="radio">
            📻
          </span>
          {formatBadge.title}
        </h3>
      </div>
      <p className="text-sm text-gray-600">{formatBadge.subtitle}</p>
    </div>
  )
}

