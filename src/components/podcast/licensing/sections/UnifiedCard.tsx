import type { ReactNode } from 'react'

interface UnifiedCardProps {
  headline: string
  text: string
  subtext: string
  icon?: ReactNode
}

export function UnifiedCard({ headline, text, subtext, icon }: UnifiedCardProps) {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 aspect-square flex flex-col justify-between">
      <div>
        <p className="text-xs uppercase tracking-wide font-semibold text-orange-500 mb-3">{headline}</p>
        {/* {icon && <div className="mb-3">{icon}</div>} */}
        <p className="text-2xl font-semibold text-gray-900 mb-2">{text}</p>
      </div>
      <p className="text-sm text-gray-500">{subtext}</p>
    </div>
  )
}

