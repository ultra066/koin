'use client'

import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts'

// 1. Define the props clearly outside the function
interface ExpenseChartProps {
  needs: number;
  wants: number;
  savings: number;
}

const COLORS = ['#10b981', '#f59e0b', '#3b82f6'] 

// 2. Apply the clean interface to the component
export default function ExpenseChart({ needs, wants, savings }: ExpenseChartProps) {
  const data = [
    { name: 'Needs', value: needs },
    { name: 'Wants', value: wants },
    { name: 'Savings', value: savings }
  ]

  if (needs === 0 && wants === 0 && savings === 0) {
    return <div className="flex items-center justify-center h-64 text-gray-400">No spending data yet.</div>
  }

  return (
    <div className="h-72 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            innerRadius={60}
            outerRadius={90}
            paddingAngle={5}
            dataKey="value"
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip formatter={(value: any) => `$${Number(value).toFixed(2)}`} />
          <Legend />
        </PieChart>
      </ResponsiveContainer>
    </div>
  )
}