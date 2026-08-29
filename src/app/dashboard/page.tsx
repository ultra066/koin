import { createClient } from '@/utils/supabase/server'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import ExpenseChart from '@/components/ExpenseChart'
import TrendChart from '@/components/TrendChart'
import SpendingBarChart from '@/components/SpendingBarChart'
import { Poppins } from 'next/font/google'
import IncomeModal from '@/components/IncomeModal'
import TimeRangeFilter from '@/components/TimeRangeFilter'

const poppins = Poppins({ weight: ['400', '500', '600', '700'], subsets: ['latin'] })

export default async function DashboardOverview({
  searchParams,
}: {
  searchParams: { range?: string }
}) {
  const supabase = await createClient()
  const range = searchParams.range || 'monthly'

  // Determine Date Boundaries
  const now = new Date()
  let startDate = new Date(0).toISOString() // Default to all time
  
  if (range === 'monthly') {
    startDate = new Date(now.getFullYear(), now.getMonth(), 1).toISOString()
  } else if (range === 'weekly') {
    const firstDay = now.getDate() - now.getDay()
    startDate = new Date(now.setDate(firstDay)).toISOString()
  } else if (range === 'daily') {
    startDate = new Date(now.setHours(0,0,0,0)).toISOString()
  }

  // 1. Fetch Income
  const { data: incomes } = await supabase.from('incomes').select('*')
  const totalIncome = incomes?.reduce((sum, i) => sum + i.amount, 0) || 0

  // 2. Fetch Fixed Commitments
  const { data: fixed } = await supabase.from('fixed_commitments').select('amount, frequency')
  const monthlyFixed = fixed?.reduce((sum, item) => {
    if (item.frequency === 'daily') return sum + (item.amount * 30)
    if (item.frequency === 'weekly') return sum + (item.amount * 4)
    if (item.frequency === 'yearly') return sum + (item.amount / 12)
    return sum + item.amount 
  }, 0) || 0

  // 3. Fetch Transactions (Dynamically Filtered by Time Range)
  let transactionQuery = supabase.from('transactions').select('amount, transaction_date, categories ( group_type )')
  if (range !== 'all') {
    transactionQuery = transactionQuery.gte('transaction_date', startDate)
  }
  const { data: transactions } = await transactionQuery

  const getGroup = (cats: any) => {
    if (!cats) return 'needs'
    return Array.isArray(cats) ? cats[0]?.group_type : cats.group_type
  }

  const spentNeeds = transactions?.filter(t => getGroup(t.categories) === 'needs').reduce((sum, t) => sum + t.amount, 0) || 0
  const spentWants = transactions?.filter(t => getGroup(t.categories) === 'wants').reduce((sum, t) => sum + t.amount, 0) || 0
  const spentSavings = transactions?.filter(t => getGroup(t.categories) === 'savings').reduce((sum, t) => sum + t.amount, 0) || 0
  
  const totalVariableSpent = spentNeeds + spentWants + spentSavings
  const safeToSpend = totalIncome - monthlyFixed - totalVariableSpent

  // 4. Group transactions by date for the Line Graph
  const dailySpending = transactions?.reduce((acc: any, t) => {
    const date = t.transaction_date || new Date().toISOString().split('T')[0]
    if (!acc[date]) acc[date] = 0
    acc[date] += t.amount
    return acc
  }, {})

  const trendData = Object.keys(dailySpending || {}).sort().map(date => ({
    date: new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
    amount: dailySpending[date]
  }))

  return (
    <div className={`space-y-8 ${poppins.className}`}>
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-gray-900">Dashboard</h1>
          <p className="text-gray-500 mt-2">Your real-time cash flow and allocation breakdown.</p>
        </div>
        <TimeRangeFilter />
      </div>
      
      {/* ... [KEEP THE REST OF YOUR CARD GRID AND CHARTS EXACTLY THE SAME] ... */}
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="shadow-sm border-none bg-[#1c1c1c] text-white">
          <CardHeader className="pb-2"><CardTitle className="text-xs font-medium text-gray-400 uppercase">Balance</CardTitle></CardHeader>
          <CardContent><div className="text-2xl font-bold">${safeToSpend.toFixed(2)}</div></CardContent>
        </Card>

        <Card className="shadow-sm border-none bg-[#1c1c1c] text-white">
          <CardHeader className="pb-2 flex flex-row items-center justify-between space-y-0">
            <CardTitle className="text-xs font-medium text-gray-400 uppercase">Total Income</CardTitle>
            <IncomeModal incomes={incomes || []} />
          </CardHeader>
          <CardContent><div className="text-2xl font-bold">${totalIncome.toFixed(2)}</div></CardContent>
        </Card>
        
        <Card className="shadow-sm border-none bg-[#1c1c1c] text-white">
          <CardHeader className="pb-2"><CardTitle className="text-xs font-medium text-gray-400 uppercase">Fixed Costs</CardTitle></CardHeader>
          <CardContent><div className="text-2xl font-bold">${monthlyFixed.toFixed(2)}</div></CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <Card className="shadow-sm border-gray-200">
          <CardHeader><CardTitle>Spending</CardTitle></CardHeader>
          <CardContent><SpendingBarChart needs={spentNeeds} wants={spentWants} savings={spentSavings} /></CardContent>
        </Card>

        <Card className="shadow-sm border-gray-200">
          <CardHeader><CardTitle>Strategic Allocation</CardTitle></CardHeader>
          <CardContent><ExpenseChart needs={spentNeeds} wants={spentWants} savings={spentSavings} /></CardContent>
        </Card>
      </div>

      <Card className="shadow-sm border-gray-200 mt-8">
        <CardHeader><CardTitle>Cash Flow</CardTitle></CardHeader>
        <CardContent><TrendChart data={trendData} /></CardContent>
      </Card>
    </div>
  )
}