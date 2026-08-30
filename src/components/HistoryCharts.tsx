'use client'

import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts'

export function CreepChart({ data }: { data: any[] }) {
  if (!data || data.length === 0) return <div className="flex h-64 items-center justify-center text-gray-400">No data available.</div>

  return (
    <div className="h-72 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={{ top: 20, right: 20, left: -20, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
          <XAxis dataKey="month" stroke="#6b7280" fontSize={12} tickLine={false} axisLine={false} />
          <YAxis stroke="#6b7280" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(val) => `$${val}`} />
          <Tooltip formatter={(value: any) => `$${Number(value).toFixed(2)}`} cursor={{ stroke: '#f3f4f6', strokeWidth: 2 }} />
          <Legend iconType="circle" wrapperStyle={{ fontSize: '12px', color: '#4b5563' }} />
          <Line type="monotone" dataKey="wants" name="Wants (Lifestyle)" stroke="#f59e0b" strokeWidth={3} dot={{ r: 4 }} activeDot={{ r: 6 }} />
          <Line type="monotone" dataKey="needs" name="Needs (Baseline)" stroke="#1c1c1c" strokeWidth={3} dot={{ r: 4 }} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}

export function SavingsHistoryChart({ data }: { data: any[] }) {
  if (!data || data.length === 0) return <div className="flex h-64 items-center justify-center text-gray-400">No data available.</div>

  return (
    <div className="h-72 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 20, right: 20, left: -20, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
          <XAxis dataKey="month" stroke="#6b7280" fontSize={12} tickLine={false} axisLine={false} />
          <YAxis stroke="#6b7280" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(val) => `$${val}`} />
          <Tooltip formatter={(value: any) => `$${Number(value).toFixed(2)}`} cursor={{ fill: '#f3f4f6' }} />
          <Bar dataKey="savings" name="Total Saved" fill="#10b981" radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}