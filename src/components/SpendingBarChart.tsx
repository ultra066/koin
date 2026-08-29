'use client'

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts'

interface CategorySpending {
  name: string;
  amount: number;
}

interface SpendingBarChartProps {
  data: CategorySpending[];
}

// Expanded palette for varied transaction categories
const COLORS = ['#1c1c1c', '#3b82f6', '#10b981', '#f59e0b', '#8b5cf6', '#ec4899', '#14b8a6', '#f97316']

export default function SpendingBarChart({ data }: SpendingBarChartProps) {
  if (!data || data.length === 0) {
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