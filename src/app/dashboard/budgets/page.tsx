import { createClient } from '@/utils/supabase/server'
import { Poppins } from 'next/font/google'
import { deleteBudget, deleteFixedCommitment } from './actions'
import BudgetModal from '@/components/BudgetModal'

const poppins = Poppins({ weight: ['400', '500', '600', '700'], subsets: ['latin'] })

export default async function UnifiedLedgerPage() {
  const supabase = await createClient()

  // Fetch Data
  const { data: fixedCosts } = await supabase.from('fixed_commitments').select('*').order('created_at')
  const { data: categories } = await supabase.from('categories').select('id, name, group_type, monthly_budgets(allocated_amount)').order('name')
  
  const currentMonthStart = new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString()
  const { data: transactions } = await supabase.from('transactions').select('category_id, amount').gte('transaction_date', currentMonthStart)

  // Group Categories
  const flexNeeds = categories?.filter(c => c.group_type === 'needs') || []
  const wants = categories?.filter(c => c.group_type === 'wants') || []
  const savings = categories?.filter(c => c.group_type === 'savings') || []

  // Helper for flexible rows
  const renderFlexRow = (category: any) => {
    const spent = transactions?.filter(t => t.category_id === category.id).reduce((sum, t) => sum + t.amount, 0) || 0
    const allocated = category.monthly_budgets?.[0]?.allocated_amount || 0
    const percent = allocated > 0 ? Math.min((spent / allocated) * 100, 100) : 0
    const isOver = spent > allocated

    return (
      <div key={category.id} className="grid grid-cols-12 gap-4 py-4 items-center border-b border-gray-100 hover:bg-gray-50 transition-colors px-4 group">
        <div className="col-span-4 font-medium text-gray-900 flex items-center gap-2">
          {category.name}
        </div>
        <div className="col-span-2 text-gray-600">${allocated.toFixed(2)}</div>
        <div className="col-span-4">
          <div className="flex justify-between text-xs mb-1">
            <span className={isOver ? 'text-red-600 font-bold' : 'text-gray-500'}>${spent.toFixed(2)} spent</span>
            <span className="text-gray-500">${(allocated - spent).toFixed(2)} left</span>
          </div>
          <div className="h-1.5 w-full bg-gray-200 rounded-full overflow-hidden">
            <div className={`h-full ${isOver ? 'bg-red-500' : 'bg-[#1c1c1c]'}`} style={{ width: `${percent}%` }} />
          </div>
        </div>
        <div className="col-span-2 text-right">
          <form action={deleteBudget}>
            <input type="hidden" name="id" value={category.id} />
            <button type="submit" className="text-xs text-red-400 hover:text-red-600 opacity-0 group-hover:opacity-100 transition-opacity">Remove</button>
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
        <BudgetModal />
      </div>

      {/* The Ledger Table */}
      <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden text-sm">
        <div className="grid grid-cols-12 gap-4 bg-gray-50 px-4 py-3 font-semibold text-gray-500 text-xs uppercase tracking-wider border-b border-gray-200">
          <div className="col-span-4">Category</div>
          <div className="col-span-2">Target Limit</div>
          <div className="col-span-4">Status & Progress</div>
          <div className="col-span-2 text-right">Actions</div>
        </div>

        {/* Section: Needs */}
        <div className="bg-gray-100/50 px-4 py-2 font-semibold text-gray-900 border-b border-gray-200">Needs (Fixed & Flexible)</div>
        
        {/* Fixed Needs */}
        {fixedCosts?.map(bill => (
          <div key={bill.id} className="grid grid-cols-12 gap-4 py-4 items-center border-b border-gray-100 hover:bg-gray-50 px-4 group">
            <div className="col-span-4 font-medium text-gray-900 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-500"></span>{bill.name}
            </div>
            <div className="col-span-2 text-gray-600">${bill.amount.toFixed(2)}</div>
            <div className="col-span-4 text-xs text-gray-400 italic">Fixed {bill.frequency} commitment</div>
            <div className="col-span-2 text-right">
              <form action={deleteFixedCommitment}>
                <input type="hidden" name="id" value={bill.id} />
                <button type="submit" className="text-xs text-red-400 hover:text-red-600 opacity-0 group-hover:opacity-100 transition-opacity">Remove</button>
              </form>
            </div>
          </div>
        ))}
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