'use client'

import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts'

interface ExpenseChartProps {
  needs: number;
  wants: number;
  savings: number;
  needsTarget: number;
  wantsTarget: number;
  savingsTarget: number;
  totalIncome: number;
}

const COLORS = ['#10b981', '#f59e0b', '#3b82f6'] // Emerald, Amber, Blue

export default function ExpenseChart({ needs, wants, savings, needsTarget, wantsTarget, savingsTarget, totalIncome }: ExpenseChartProps) {
  const data = [
    { name: 'Needs', value: needs, target: needsTarget, color: COLORS[0] },
    { name: 'Wants', value: wants, target: wantsTarget, color: COLORS[1] },
    { name: 'Savings', value: savings, target: savingsTarget, color: COLORS[2] }
  ]

  const totalSpent = needs + wants + savings
  if (totalSpent === 0) {
    return <div className="flex items-center justify-center h-72 text-gray-400 text-sm">No allocation data yet.</div>
  }

  return (
    <div className="flex flex-col md:flex-row items-center h-72 w-full gap-6 px-2">
      {/* Chart Section */}
      <div className="h-full w-full md:w-1/2">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie 
              data={data} 
              innerRadius={70} 
              outerRadius={95} 
              paddingAngle={4} 
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

      {/* Rich Data Legend Section */}
      <div className="w-full md:w-1/2 flex flex-col justify-center space-y-5">
        {data.map((item) => {
          const targetDollarAmount = (totalIncome * item.target) / 100
          const percentUsed = targetDollarAmount > 0 ? (item.value / targetDollarAmount) * 100 : 0
          const isOver = percentUsed > 100

          return (
            <div key={item.name} className="flex flex-col text-sm">
              <div className="flex justify-between items-center mb-1.5">
                <div className="flex items-center gap-2 font-semibold text-gray-900">
                  <span className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }}></span>
                  {item.name} ({item.target}%)
                </div>
                <span className="text-gray-900 font-bold">${item.value.toFixed(2)}</span>
              </div>
              
              <div className="flex justify-between text-xs mb-1.5">
                <span className="text-gray-500">Target: ${targetDollarAmount.toFixed(2)}</span>
                <span className={isOver ? "text-red-500 font-medium" : "text-gray-500"}>
                  {percentUsed.toFixed(1)}% used
                </span>
              </div>

              {/* Mini Progress Bar */}
              <div className="h-1.5 w-full bg-gray-100 rounded-full overflow-hidden">
                <div 
                  className={`h-full ${isOver ? 'bg-red-500' : 'bg-[#1c1c1c]'}`} 
                  style={{ width: `${Math.min(percentUsed, 100)}%` }} 
                />
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}