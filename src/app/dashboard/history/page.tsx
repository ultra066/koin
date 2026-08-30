import { createClient } from '@/utils/supabase/server'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Poppins } from 'next/font/google'
import { CreepChart, SavingsHistoryChart } from '@/components/HistoryCharts'

const poppins = Poppins({ weight: ['400', '500', '600', '700'], subsets: ['latin'] })

export default async function HistoryPage() {
  const supabase = await createClient()

  // 1. Determine the 6-Month Window
  const months = []
  const currentDate = new Date()
  for (let i = 5; i >= 0; i--) {
    const d = new Date(currentDate.getFullYear(), currentDate.getMonth() - i, 1)
    months.push(d.toLocaleDateString('en-US', { month: 'short', year: 'numeric' }))
  }

  const sixMonthsAgo = new Date(currentDate.getFullYear(), currentDate.getMonth() - 5, 1).toISOString()

  // 2. Fetch Historical Transactions
  const { data: transactions } = await supabase
    .from('transactions')
    .select('amount, transaction_date, categories(group_type)')
    .gte('transaction_date', sixMonthsAgo)

  // 3. Initialize Empty Month Buckets (Guarantees chronological order on charts)
  const monthlyData = months.reduce((acc, month) => {
    acc[month] = { month, needs: 0, wants: 0, savings: 0, total: 0 }
    return acc
  }, {} as Record<string, any>)

  // 4. Populate Buckets with Real Data
  // FIX: Added (t: any) to bypass strict TypeScript relationship checking
  transactions?.forEach((t: any) => {
    const date = new Date(t.transaction_date)
    const monthYear = date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' })
    
    if (monthlyData[monthYear]) {
      const group = Array.isArray(t.categories) ? t.categories[0]?.group_type : t.categories?.group_type || 'needs'
      monthlyData[monthYear][group] += t.amount
      monthlyData[monthYear].total += t.amount
    }
  })

  const chartData = Object.values(monthlyData)

  return (
    <div className={`space-y-8 ${poppins.className}`}>
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-gray-900">Historical Trends</h1>
        <p className="text-gray-500 mt-2">Monitor lifestyle creep and long-term wealth building over the last 6 months.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <Card className="shadow-sm border-gray-200">
          <CardHeader>
            <CardTitle>Lifestyle Creep Detector</CardTitle>
            <CardDescription>Are your "Wants" inflating as time goes on?</CardDescription>
          </CardHeader>
          <CardContent>
            <CreepChart data={chartData} />
          </CardContent>
        </Card>

        <Card className="shadow-sm border-gray-200">
          <CardHeader>
            <CardTitle>Wealth Building</CardTitle>
            <CardDescription>Total cash routed to savings and investments.</CardDescription>
          </CardHeader>
          <CardContent>
            <SavingsHistoryChart data={chartData} />
          </CardContent>
        </Card>
      </div>

      {/* Monthly Wrapped Table */}
      <Card className="shadow-sm border-gray-200 overflow-hidden">
        <CardHeader className="bg-gray-50 border-b border-gray-100">
          <CardTitle>6-Month Wrapped</CardTitle>
        </CardHeader>
        <div className="overflow-x-auto text-sm">
          <div className="grid grid-cols-5 gap-4 px-6 py-3 font-semibold text-gray-500 text-xs uppercase tracking-wider border-b border-gray-100">
            <div>Month</div>
            <div>Needs Spent</div>
            <div>Wants Spent</div>
            <div>Amount Saved</div>
            <div className="text-right">Total Outflow</div>
          </div>
          <div className="divide-y divide-gray-100">
            {chartData.reverse().map((data: any) => (
              <div key={data.month} className="grid grid-cols-5 gap-4 px-6 py-4 hover:bg-gray-50 transition-colors">
                <div className="font-medium text-gray-900">{data.month}</div>
                <div className="text-gray-600">${data.needs.toFixed(2)}</div>
                <div className="text-amber-600">${data.wants.toFixed(2)}</div>
                <div className="font-semibold text-emerald-600">${data.savings.toFixed(2)}</div>
                <div className="text-right font-bold text-gray-900">${data.total.toFixed(2)}</div>
              </div>
            ))}
          </div>
        </div>
      </Card>
    </div>
  )
}