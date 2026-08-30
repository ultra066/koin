import { createClient } from '@/utils/supabase/server'
import { Poppins } from 'next/font/google'
import { deleteBudget, deleteFixedCommitment } from './actions'
import { createTransaction } from '@/app/dashboard/transactions/actions'
import BudgetModal from '@/components/BudgetModal'
import BudgetRuleModal from '@/components/BudgetRuleModal'
import QuickTransactionModal from '@/components/QuickTransactionModal'
import EditBudgetModal from '@/components/EditBudgetModal'

const poppins = Poppins({ weight: ['400', '500', '600', '700'], subsets: ['latin'] })

export default async function UnifiedLedgerPage() {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()

  let settings = { needs_target: 50, wants_target: 30, savings_target: 20 }
  let userCurrency = '$'
  
  if (user) {
    const { data: settingsData } = await supabase.from('user_settings').select('*').eq('user_id', user.id).single()
    if (settingsData) settings = settingsData

    const { data: profileData } = await supabase.from('profiles').select('currency').eq('id', user.id).single()
    if (profileData?.currency) userCurrency = profileData.currency
  }
  
  const { data: fixedCosts } = await supabase.from('fixed_commitments').select('*').order('created_at')
  
  const currentMonthPrefix = new Date().toISOString().slice(0, 7)
  const currentMonthStart = currentMonthPrefix + '-01'

  const { data: categories } = await supabase
    .from('categories')
    .select('id, name, group_type, monthly_budgets(allocated_amount, period_start)')
    .order('name')
  
  const { data: transactions } = await supabase
    .from('transactions')
    .select('category_id, amount, description, transaction_date')
    .gte('transaction_date', currentMonthStart)

  const flexNeeds = categories?.filter(c => 
    c.group_type === 'needs' && 
    !fixedCosts?.some(f => f.name.toLowerCase() === c.name.toLowerCase())
  ) || []
  
  const wants = categories?.filter(c => c.group_type === 'wants') || []
  const savings = categories?.filter(c => c.group_type === 'savings') || []

  const renderFlexRow = (category: any) => {
    const spent = transactions?.filter(t => t.category_id === category.id).reduce((sum, t) => sum + t.amount, 0) || 0
    const currentBudget = category.monthly_budgets?.find((b: any) => b.period_start?.startsWith(currentMonthPrefix))
    const allocated = currentBudget?.allocated_amount || 0
    const percent = allocated > 0 ? Math.min((spent / allocated) * 100, 100) : 0
    const isOver = spent > allocated

    return (
      <div key={category.id} className="grid grid-cols-12 gap-4 py-4 items-center border-b border-gray-100 hover:bg-gray-50 transition-colors px-4 group">
        <div className="col-span-4 font-medium text-gray-900 flex items-center gap-2">
          {category.name}
        </div>
        <div className="col-span-2 text-gray-600">{userCurrency}{allocated.toFixed(2)}</div>
        <div className="col-span-4">
          <div className="flex justify-between text-xs mb-1">
            <span className={isOver ? 'text-red-600 font-bold' : 'text-gray-500'}>{userCurrency}{spent.toFixed(2)} spent</span>
            <span className="text-gray-500">{userCurrency}{(allocated - spent).toFixed(2)} left</span>
          </div>
          <div className="h-1.5 w-full bg-gray-200 rounded-full overflow-hidden">
            <div className={`h-full ${isOver ? 'bg-red-500' : 'bg-[#1c1c1c]'}`} style={{ width: `${percent}%` }} />
          </div>
        </div>
        <div className="col-span-2 flex items-center justify-end">
          <QuickTransactionModal categoryId={category.id} categoryName={category.name} />
          
          <EditBudgetModal budget={{ id: category.id, name: category.name, group_type: category.group_type, amount: allocated }} />
          
          <form action={deleteBudget}>
            <input type="hidden" name="id" value={category.id} />
            <button type="submit" title="Remove Budget" className="p-1.5 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-md opacity-0 group-hover:opacity-100 transition-all flex items-center justify-center">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/></svg>
            </button>
          </form>
        </div>
      </div>
    )
  }

  return (
    <div className={`space-y-8 ${poppins.className}`}>
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-gray-900">Master Ledger</h1>
          <p className="text-gray-500 mt-2">Manage your fixed bills and flexible budgets in one place.</p>
        </div>
        <div className="flex items-center">
          <BudgetRuleModal 
            initialNeeds={settings.needs_target} 
            initialWants={settings.wants_target} 
            initialSavings={settings.savings_target} 
          />
          <BudgetModal />
        </div>
      </div>

      <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden text-sm">
        <div className="grid grid-cols-12 gap-4 bg-gray-50 px-4 py-3 font-semibold text-gray-500 text-xs uppercase tracking-wider border-b border-gray-200">
          <div className="col-span-4">Category / Bill</div>
          <div className="col-span-2">Amount / Target</div>
          <div className="col-span-4">Status & Progress</div>
          <div className="col-span-2 text-right">Actions</div>
        </div>

        {/* Section: Needs */}
        <div className="bg-gray-100/50 px-4 py-2 font-semibold text-gray-900 border-b border-gray-200">Needs (Fixed & Flexible)</div>
        
        {/* Fixed Needs */}
        {fixedCosts?.map(bill => {
          const isPaid = transactions?.some(t => t.description?.toLowerCase() === bill.name.toLowerCase())
          const matchingCatId = categories?.find(c => c.name.toLowerCase() === bill.name.toLowerCase())?.id || ''

          return (
            <div key={bill.id} className="grid grid-cols-12 gap-4 py-4 items-center border-b border-gray-100 hover:bg-gray-50 px-4 group">
              <div className="col-span-4 font-medium text-gray-900 flex items-center gap-2">
                <span className={`w-2 h-2 rounded-full ${isPaid ? 'bg-emerald-500' : 'bg-amber-500'}`}></span>
                {bill.name}
              </div>
              <div className="col-span-2 text-gray-600">{userCurrency}{bill.amount.toFixed(2)}</div>
              <div className="col-span-4">
                {isPaid ? (
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-100 text-emerald-800">
                    Paid for this cycle
                  </span>
                ) : (
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-amber-100 text-amber-800">
                    Unpaid / Pending
                  </span>
                )}
              </div>
              <div className="col-span-2 flex items-center justify-end">
                {!isPaid && (
                  <form action={createTransaction} className="mr-2">
                    <input type="hidden" name="description" value={bill.name} />
                    <input type="hidden" name="amount" value={bill.amount} />
                    <input type="hidden" name="transaction_date" value={new Date().toISOString().split('T')[0]} />
                    <input type="hidden" name="category_id" value={matchingCatId} />
                    <button type="submit" className="text-xs font-semibold bg-emerald-100 text-emerald-700 hover:bg-emerald-200 px-2.5 py-1.5 rounded-md transition-colors">
                      Pay
                    </button>
                  </form>
                )}

                <form action={deleteFixedCommitment}>
                  <input type="hidden" name="id" value={bill.id} />
                  <button type="submit" title="Remove Fixed Cost" className="p-1.5 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-md opacity-0 group-hover:opacity-100 transition-all flex items-center justify-center">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/></svg>
                  </button>
                </form>
              </div>
            </div>
          )
        })}
        
        {flexNeeds.map(renderFlexRow)}

        {/* Section: Wants */}
        <div className="bg-gray-100/50 px-4 py-2 font-semibold text-gray-900 border-y border-gray-200 mt-4">Wants (Flexible)</div>
        {wants.length === 0 ? <div className="p-4 text-gray-500 text-center">No wants budgeted yet.</div> : wants.map(renderFlexRow)}

        {/* Section: Savings */}
        <div className="bg-gray-100/50 px-4 py-2 font-semibold text-gray-900 border-y border-gray-200 mt-4">Savings Goals</div>
        {savings.length === 0 ? <div className="p-4 text-gray-500 text-center">No savings budgeted yet.</div> : savings.map(renderFlexRow)}
      </div>
    </div>
  )
}