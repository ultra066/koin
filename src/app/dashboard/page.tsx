import { createClient } from '@/utils/supabase/server'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import ExpenseChart from '@/components/ExpenseChart'
import TrendChart from '@/components/TrendChart'
import SpendingBarChart from '@/components/SpendingBarChart'
import { Poppins } from 'next/font/google'
import IncomeModal from '@/components/IncomeModal'
import Link from 'next/link'
import NotificationDropdown from '@/components/NotificationDropdown'

const poppins = Poppins({ 
  weight: ['400', '500', '600', '700'],
  subsets: ['latin'],
})

export default async function DashboardOverview() {
  const supabase = await createClient()

  // Fetch Strategy Settings & Profile Currency
  const { data: { user } } = await supabase.auth.getUser()
  let settings = { needs_target: 50, wants_target: 30, savings_target: 20 }
  let userCurrency = '$' // Default fallback
  
  if (user) {
    const { data: settingsData } = await supabase
      .from('user_settings')
      .select('*')
      .eq('user_id', user.id)
      .single()
      
    if (settingsData) settings = settingsData

    const { data: profileData } = await supabase
      .from('profiles')
      .select('currency')
      .eq('id', user.id)
      .single()

    if (profileData?.currency) userCurrency = profileData.currency
  }

  // 1. Fetch Income
  const { data: incomes } = await supabase.from('incomes').select('*')
  const totalIncome = incomes?.reduce((sum, i) => sum + i.amount, 0) || 0

  // 2. Fetch Fixed Commitments
  const { data: fixed } = await supabase.from('fixed_commitments').select('*')
  const monthlyFixed = fixed?.reduce((sum, item) => {
    if (item.frequency === 'daily') return sum + (item.amount * 30)
    if (item.frequency === 'weekly') return sum + (item.amount * 4)
    if (item.frequency === 'yearly') return sum + (item.amount / 12)
    return sum + item.amount 
  }, 0) || 0

  // 3. Fetch Transactions
  const currentMonthStart = new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString()
  const { data: transactions } = await supabase
    .from('transactions')
    .select('category_id, amount, transaction_date, categories ( name, group_type )')
    .gte('transaction_date', currentMonthStart)

  const { data: categories } = await supabase
    .from('categories')
    .select('id, name, group_type, monthly_budgets(allocated_amount, period_start)')

  const getGroup = (cats: any) => {
    if (!cats) return 'needs'
    return Array.isArray(cats) ? cats[0]?.group_type : cats.group_type
  }

  // 50/30/20 Processing
  const spentNeeds = transactions?.filter(t => getGroup(t.categories) === 'needs').reduce((sum, t) => sum + t.amount, 0) || 0
  const spentWants = transactions?.filter(t => getGroup(t.categories) === 'wants').reduce((sum, t) => sum + t.amount, 0) || 0
  const spentSavings = transactions?.filter(t => getGroup(t.categories) === 'savings').reduce((sum, t) => sum + t.amount, 0) || 0
  
  const totalVariableSpent = spentNeeds + spentWants + spentSavings
  
  // Fixed Balance Calculation: Only subtract logged transactions (which now includes paid fixed bills)
  const safeToSpend = totalIncome - totalVariableSpent

  // 4. Group transactions by Category Name for the Bar Chart
  const categorySpending = transactions?.reduce((acc: any, t: any) => {
    const catName = Array.isArray(t.categories) ? (t.categories[0]?.name || 'Uncategorized') : (t.categories?.name || 'Uncategorized')
    if (!acc[catName]) acc[catName] = 0
    acc[catName] += t.amount
    return acc
  }, {})

  const categoryData = Object.keys(categorySpending || {})
    .map(name => ({ name, amount: categorySpending[name] }))
    .sort((a, b) => b.amount - a.amount)

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
    <div className={`space-y-6 sm:space-y-8 ${poppins.className}`}>
      
      {/* Responsive Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-gray-900">Dashboard</h1>
          <p className="text-xs sm:text-base text-gray-500 mt-1">Your real-time cash flow and allocation breakdown.</p>
        </div>
        
        {/* Actions - shrink-0 prevents the buttons from shrinking when the text wraps -  */}
        <div className="flex items-center gap-2 sm:gap-3 shrink-0 mt-1 sm:mt-0">
          <NotificationDropdown 
            fixedCosts={fixed || []} 
            categories={categories || []} 
            transactions={transactions || []} 
            userCurrency={userCurrency} 
          />
          <Link 
            href="/dashboard/profile" 
            className="flex items-center justify-center p-2.5 sm:p-3 bg-white border border-gray-200 hover:border-gray-300 hover:bg-gray-50 rounded-full shadow-sm transition-all text-gray-600 hover:text-gray-900"
            title="Profile Settings"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/>
              <circle cx="12" cy="7" r="4"/>
            </svg>
          </Link>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6">
        <Card className="shadow-sm border-none bg-[#1c1c1c] text-white">
          <CardHeader className="pb-2"><CardTitle className="text-xs font-medium text-gray-400 uppercase">Balance</CardTitle></CardHeader>
          <CardContent><div className="text-2xl font-bold">{userCurrency}{safeToSpend.toFixed(2)}</div></CardContent>
        </Card>

        <Card className="shadow-sm border-none bg-[#1c1c1c] text-white">
          <CardHeader className="pb-2 flex flex-row items-center justify-between space-y-0">
            <CardTitle className="text-xs font-medium text-gray-400 uppercase">Total Income</CardTitle>
            <IncomeModal incomes={incomes || []} />
          </CardHeader>
          <CardContent><div className="text-2xl font-bold">{userCurrency}{totalIncome.toFixed(2)}</div></CardContent>
        </Card>
        
        <Card className="shadow-sm border-none bg-[#1c1c1c] text-white">
          <CardHeader className="pb-2"><CardTitle className="text-xs font-medium text-gray-400 uppercase">Fixed Costs (Mo.)</CardTitle></CardHeader>
          <CardContent><div className="text-2xl font-bold">{userCurrency}{monthlyFixed.toFixed(2)}</div></CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-8">
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

      <Card className="shadow-sm border-gray-200 mt-4 sm:mt-8">
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