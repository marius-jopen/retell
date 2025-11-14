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
    <div className="inline-flex flex-col sm:flex-row sm:items-center gap-2 px-6 py-4 rounded-full bg-white text-black font-semibold shadow-lg">
      <span>📻 {formatBadge.title}</span>
      <span className="text-primary text-sm sm:ml-2">{formatBadge.subtitle}</span>
    </div>
  )
}

