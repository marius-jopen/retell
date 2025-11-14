import type { ReactNode } from 'react'

interface StatCard {
  label: string
  value: string
  iconBg: string
  icon: ReactNode
}

interface StatsGridProps {
  cards: StatCard[]
}

export function StatsGrid({ cards }: StatsGridProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      {cards.map((card) => (
        <div key={card.label} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 text-center">
          <div className={`w-12 h-12 ${card.iconBg} rounded-2xl flex items-center justify-center mx-auto mb-3`}>{card.icon}</div>
          <p className="text-2xl font-bold text-gray-900">{card.value}</p>
          <p className="text-sm text-gray-500 mt-1">{card.label}</p>
        </div>
      ))}
    </div>
  )
}

