'use client'

import { useRouter, useSearchParams, usePathname } from 'next/navigation'

export default function TimeRangeFilter() {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  
  const currentRange = searchParams.get('range') || 'monthly'

  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const params = new URLSearchParams(searchParams.toString())
    params.set('range', e.target.value)
    router.push(`${pathname}?${params.toString()}`)
  }

  return (
    <select 
      value={currentRange}
      onChange={handleChange}
      className="h-9 px-3 text-sm rounded-md border border-gray-200 bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-900 cursor-pointer"
    >
      <option value="daily">Today</option>
      <option value="weekly">This Week</option>
      <option value="monthly">This Month</option>
      <option value="all">All Time</option>
    </select>
  )
}