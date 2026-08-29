'use client'

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts'

interface SpendingBarChartProps {
  needs: number;
  wants: number;
  savings: number;
}

const COLORS = ['#10b981', '#f59e0b', '#3b82f6'] // Emerald, Amber, Blue

export default function SpendingBarChart({ needs, wants, savings }: SpendingBarChartProps) {
  const data = [
    { name: 'Needs', amount: needs },
    { name: 'Wants', amount: wants },
    { name: 'Savings', amount: savings }
  ]

  if (needs === 0 && wants === 0 && savings === 0) {
    return <div className="flex items-center justify-center h-64 text-gray-400">No spending data yet.</div>
  }

  return (
    <div className="h-72 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 20, right: 20, left: -20, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
          <XAxis dataKey="name" stroke="#6b7280" fontSize={12} tickLine={false} axisLine={false} />
          <YAxis stroke="#6b7280" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(val) => `$${val}`} />
          <Tooltip formatter={(value: any) => `$${Number(value).toFixed(2)}`} cursor={{ fill: '#f3f4f6' }} />
          <Bar dataKey="amount" radius={[4, 4, 0, 0]}>
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}