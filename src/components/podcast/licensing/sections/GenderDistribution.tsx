interface GenderBreakdown {
  female?: number
  male?: number
  diverse?: number
}

interface GenderDistributionProps {
  gender: GenderBreakdown
}

const genderRanges: { label: string; key: keyof GenderBreakdown; color: string }[] = [
  { label: 'Female', key: 'female', color: 'bg-orange-500' },
  { label: 'Male', key: 'male', color: 'bg-blue-300' },
  { label: 'Diverse', key: 'diverse', color: 'bg-purple-300' },
]

export function GenderDistribution({ gender }: GenderDistributionProps) {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 aspect-square flex flex-col">
      <p className="text-xs uppercase tracking-wide font-semibold text-orange-500 mb-3">Gender distribution</p>
      <h3 className="text-xl font-semibold text-gray-900 mb-4">Balanced reach across identities</h3>
      <div className="space-y-4 mt-auto">
        {genderRanges.map(
          ({ label, key, color }) =>
            gender[key] && (
              <div key={key} className="space-y-1">
                <div className="flex justify-between text-sm text-gray-600">
                  <span>{label}</span>
                  <span className="font-semibold text-gray-900">{gender[key]}%</span>
                </div>
                <div className="w-full h-2 bg-gray-100 rounded-full">
                  <div className={`h-2 rounded-full ${color}`} style={{ width: `${gender[key]}%` }} />
                </div>
              </div>
            ),
        )}
      </div>
    </div>
  )
}

