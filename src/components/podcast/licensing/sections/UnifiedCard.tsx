import type { ReactNode } from 'react'

interface UnifiedCardProps {
  headline: string
  text: string
  subtext: string
  icon?: ReactNode
}

export function UnifiedCard({ headline, text, subtext, icon }: UnifiedCardProps) {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 sm:p-6 sm:aspect-square flex flex-col justify-between min-h-0">
      <div>
        <p className="text-xs uppercase tracking-wide font-semibold text-orange-500 mb-2 sm:mb-3">{headline}</p>
        {/* {icon && <div className="mb-3">{icon}</div>} */}
        <p className="text-xl sm:text-2xl font-semibold text-gray-900 mb-2 break-words">{text}</p>
      </div>
      <p className="text-xs sm:text-sm text-gray-500 break-words">{subtext}</p>
    </div>
  )
}

