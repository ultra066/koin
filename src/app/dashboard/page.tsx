import { createClient } from '@/utils/supabase/server'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import ExpenseChart from '@/components/ExpenseChart'
import TrendChart from '@/components/TrendChart'
import SpendingBarChart from '@/components/SpendingBarChart'
import { Poppins } from 'next/font/google'
import IncomeModal from '@/components/IncomeModal'

const poppins = Poppins({ 
  weight: ['400', '500', '600', '700'],
  subsets: ['latin'],
})

export default async function DashboardOverview() {
  const supabase = await createClient()

  // Fetch Strategy Settings
  const { data: { user } } = await supabase.auth.getUser()
  let settings = { needs_target: 50, wants_target: 30, savings_target: 20 }
  
  if (user) {
    const { data: settingsData } = await supabase
      .from('user_settings')
      .select('*')
      .eq('user_id', user.id)
      .single()
      
    if (settingsData) settings = settingsData
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

  // 3. Fetch Transactions (Added categories(name) for the Bar Chart)
  const currentMonthStart = new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString()
  const { data: transactions } = await supabase
    .from('transactions')
    .select('amount, transaction_date, categories ( name, group_type )')
    .gte('transaction_date', currentMonthStart)

  const getGroup = (cats: any) => {
    if (!cats) return 'needs'
    return Array.isArray(cats) ? cats[0]?.group_type : cats.group_type
  }

  // 50/30/20 (or Custom Strategy) Processing
  const spentNeeds = transactions?.filter(t => getGroup(t.categories) === 'needs').reduce((sum, t) => sum + t.amount, 0) || 0
  const spentWants = transactions?.filter(t => getGroup(t.categories) === 'wants').reduce((sum, t) => sum + t.amount, 0) || 0
  const spentSavings = transactions?.filter(t => getGroup(t.categories) === 'savings').reduce((sum, t) => sum + t.amount, 0) || 0
  
  const totalVariableSpent = spentNeeds + spentWants + spentSavings
  const safeToSpend = totalIncome - monthlyFixed - totalVariableSpent

  // 4. Group transactions by Category Name for the Bar Chart
  const categorySpending = transactions?.reduce((acc: any, t: any) => {
    const catName = Array.isArray(t.categories) ? (t.categories[0]?.name || 'Uncategorized') : (t.categories?.name || 'Uncategorized')
    if (!acc[catName]) acc[catName] = 0
    acc[catName] += t.amount
    return acc
  }, {})

  const categoryData = Object.keys(categorySpending || {})
    .map(name => ({ name, amount: categorySpending[name] }))
    .sort((a, b) => b.amount - a.amount) // Sort highest spending first

  // 5. Group transactions by date for the Line Graph
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
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-gray-900">Dashboard</h1>
        <p className="text-gray-500 mt-2">Your real-time cash flow and allocation breakdown.</p>
      </div>
      
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
          <CardHeader className="pb-2"><CardTitle className="text-xs font-medium text-gray-400 uppercase">Fixed Costs (Mo.)</CardTitle></CardHeader>
          <CardContent><div className="text-2xl font-bold">${monthlyFixed.toFixed(2)}</div></CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <Card className="shadow-sm border-gray-200">
          <CardHeader>
            <CardTitle>Category Spending</CardTitle>
          </CardHeader>
          <CardContent>
            <SpendingBarChart data={categoryData} />
          </CardContent>
        </Card>

        <Card className="shadow-sm border-gray-200">
          <CardHeader>
            <CardTitle>Strategic Allocation</CardTitle>
          </CardHeader>
          <CardContent>
            <ExpenseChart 
              needs={spentNeeds} 
              wants={spentWants} 
              savings={spentSavings} 
              needsTarget={settings.needs_target}
              wantsTarget={settings.wants_target}
              savingsTarget={settings.savings_target}
              totalIncome={totalIncome}
            />
          </CardContent>
        </Card>
      </div>

      <Card className="shadow-sm border-gray-200 mt-8">
        <CardHeader>
          <CardTitle>Cash Flow</CardTitle>
        </CardHeader>
        <CardContent>
          <TrendChart data={trendData} />
        </CardContent>
      </Card>
    </div>
  )
}