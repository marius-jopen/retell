interface ContentPackageProps {
  items: string[]
}

export function ContentPackage({ items }: ContentPackageProps) {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
      <p className="text-xs uppercase tracking-wide font-semibold text-orange-500 mb-3">Content package</p>
      <h3 className="text-xl font-semibold text-gray-900 mb-4">Everything included in the license</h3>
      <ul className="space-y-3 text-sm text-gray-700">
        {items.map((item) => (
          <li key={item} className="flex items-start gap-3">
            <span className="text-green-500 mt-0.5">✓</span>
            <span>{item}</span>
          </li>
        ))}
      </ul>
    </div>
  )
}

