'use client'

import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts'

export default function ExpenseChart({
  needs,
  wants,
  savings,
  needsTarget,
  wantsTarget,
  savingsTarget,
  totalIncome,
}: {
  needs: number
  wants: number
  savings: number
  needsTarget: number
  wantsTarget: number
  savingsTarget: number
  totalIncome: number
}) {
  const targetNeedsAmount = (totalIncome * needsTarget) / 100
  const targetWantsAmount = (totalIncome * wantsTarget) / 100
  const targetSavingsAmount = (totalIncome * savingsTarget) / 100

  const needsPercent = targetNeedsAmount > 0 ? (needs / targetNeedsAmount) * 100 : 0
  const wantsPercent = targetWantsAmount > 0 ? (wants / targetWantsAmount) * 100 : 0
  const savingsPercent = targetSavingsAmount > 0 ? (savings / targetSavingsAmount) * 100 : 0

  const data = [
    { name: 'Needs', value: needs, color: '#10b981' }, // Emerald-500--
    { name: 'Wants', value: wants, color: '#f59e0b' }, // Amber-500
    { name: 'Savings', value: savings, color: '#3b82f6' }, // Blue-500
  ]

  return (
    <div className="flex flex-col md:flex-row items-center gap-8 w-full">
      
      {/* Chart Section */}
      <div className="w-full md:w-1/2 h-[220px] flex justify-center">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              outerRadius="90%"
              paddingAngle={0}
              dataKey="value"
              stroke="none"
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip 
              formatter={(value: any) => `$${Number(value).toFixed(2)}`}
              contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>

      {/* Legend & Progress Bars Section */}
      <div className="w-full md:w-1/2 space-y-6">
        {/* Needs */}
        <div>
          <div className="flex justify-between items-end mb-1">
            <div className="flex items-center gap-2 font-semibold text-gray-900">
              <span className="w-3 h-3 rounded-full bg-emerald-500"></span>
              Needs ({needsTarget}%)
            </div>
            <div className="font-bold text-gray-900">${needs.toFixed(2)}</div>
          </div>
          <div className="flex justify-between text-xs text-gray-500 mb-2">
            <span>Target: ${targetNeedsAmount.toFixed(2)}</span>
            <span className={needsPercent > 100 ? 'text-red-600 font-bold' : ''}>{needsPercent.toFixed(1)}% used</span>
          </div>
          <div className="h-2 w-full bg-gray-200 rounded-full overflow-hidden">
            <div className={`h-full ${needsPercent > 100 ? 'bg-red-500' : 'bg-[#1c1c1c]'}`} style={{ width: `${Math.min(needsPercent, 100)}%` }} />
          </div>
        </div>

        {/* Wants */}
        <div>
          <div className="flex justify-between items-end mb-1">
            <div className="flex items-center gap-2 font-semibold text-gray-900">
              <span className="w-3 h-3 rounded-full bg-amber-500"></span>
              Wants ({wantsTarget}%)
            </div>
            <div className="font-bold text-gray-900">${wants.toFixed(2)}</div>
          </div>
          <div className="flex justify-between text-xs text-gray-500 mb-2">
            <span>Target: ${targetWantsAmount.toFixed(2)}</span>
            <span className={wantsPercent > 100 ? 'text-red-600 font-bold' : ''}>{wantsPercent.toFixed(1)}% used</span>
          </div>
          <div className="h-2 w-full bg-gray-200 rounded-full overflow-hidden">
            <div className={`h-full ${wantsPercent > 100 ? 'bg-red-500' : 'bg-[#1c1c1c]'}`} style={{ width: `${Math.min(wantsPercent, 100)}%` }} />
          </div>
        </div>

        {/* Savings */}
        <div>
          <div className="flex justify-between items-end mb-1">
            <div className="flex items-center gap-2 font-semibold text-gray-900">
              <span className="w-3 h-3 rounded-full bg-blue-500"></span>
              Savings ({savingsTarget}%)
            </div>
            <div className="font-bold text-gray-900">${savings.toFixed(2)}</div>
          </div>
          <div className="flex justify-between text-xs text-gray-500 mb-2">
            <span>Target: ${targetSavingsAmount.toFixed(2)}</span>
            <span className={savingsPercent > 100 ? 'text-red-600 font-bold' : ''}>{savingsPercent.toFixed(1)}% used</span>
          </div>
          <div className="h-2 w-full bg-gray-200 rounded-full overflow-hidden">
            <div className={`h-full ${savingsPercent > 100 ? 'bg-red-500' : 'bg-[#1c1c1c]'}`} style={{ width: `${Math.min(savingsPercent, 100)}%` }} />
          </div>
        </div>
      </div>
      
    </div>
  )
}