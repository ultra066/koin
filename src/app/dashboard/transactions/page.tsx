import { createClient } from '@/utils/supabase/server'
import { Poppins } from 'next/font/google'
import TransactionModal from '@/components/TransactionModal'
import { deleteTransaction } from './actions'

const poppins = Poppins({ weight: ['400', '500', '600', '700'], subsets: ['latin'] })

export default async function TransactionsPage({ searchParams }: { searchParams: Promise<{ start_date?: string; end_date?: string }> }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null

  let userCurrency = '$'
  const { data: profileData } = await supabase.from('profiles').select('currency').eq('id', user.id).single()
  if (profileData?.currency) userCurrency = profileData.currency

  const params = await searchParams
  const startDate = params.start_date || new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0]
  const endDate = params.end_date || new Date().toISOString().split('T')[0]

  const { data: categories } = await supabase.from('categories').select('id, name, group_type').order('name')
  const { data: fixedCosts } = await supabase.from('fixed_commitments').select('*')

  let query = supabase
    .from('transactions')
    .select('id, amount, description, transaction_date, categories ( name, group_type )')
    .gte('transaction_date', startDate)
    .lte('transaction_date', endDate + 'T23:59:59')
    .order('transaction_date', { ascending: false })

  const { data: transactions } = await query

  return (
    <div className={`space-y-6 sm:space-y-8 ${poppins.className}`}>
      
      {/* Mobile Stacked Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-gray-900">Transactions</h1>
          <p className="text-sm sm:text-base text-gray-500 mt-1">Log and filter your personal cash flow history.</p>
        </div>
        <div className="w-full sm:w-auto">
          <TransactionModal categories={categories || []} fixedCosts={fixedCosts || []} />
        </div>
      </div>

      {/* Responsive Date Filter */}
      <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
        <form method="GET" className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 sm:gap-4 w-full">
          <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2 w-full sm:w-auto">
            <label className="text-xs sm:text-sm font-medium text-gray-600">From:</label>
            <input type="date" name="start_date" defaultValue={startDate} className="border border-gray-200 rounded-md px-3 py-1.5 text-sm focus:ring-2 focus:ring-[#1c1c1c] w-full sm:w-auto"/>
          </div>
          <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2 w-full sm:w-auto">
            <label className="text-xs sm:text-sm font-medium text-gray-600">To:</label>
            <input type="date" name="end_date" defaultValue={endDate} className="border border-gray-200 rounded-md px-3 py-1.5 text-sm focus:ring-2 focus:ring-[#1c1c1c] w-full sm:w-auto"/>
          </div>
          <button type="submit" className="bg-[#1c1c1c] text-white px-4 py-2 sm:py-1.5 rounded-md text-sm font-medium hover:bg-black transition-colors w-full sm:w-auto mt-2 sm:mt-0">
            Filter
          </button>
        </form>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        {/* Desktop Header */}
        <div className="hidden sm:grid sm:grid-cols-12 gap-4 bg-gray-50 px-6 py-3 font-semibold text-gray-500 text-xs uppercase tracking-wider border-b border-gray-200">
          <div className="col-span-3">Date & Time</div>
          <div className="col-span-4">Description</div>
          <div className="col-span-3">Category</div>
          <div className="col-span-2 text-right">Amount</div>
        </div>

        {transactions?.length === 0 ? (
          <div className="p-8 text-center text-gray-500 text-sm">No transactions found for this date range.</div>
        ) : (
          transactions?.map((t: any) => {
            const catName = Array.isArray(t.categories) ? t.categories[0]?.name : t.categories?.name
            const formattedDate = t.transaction_date ? new Date(t.transaction_date).toLocaleString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: 'numeric', minute: '2-digit', hour12: true }) : 'N/A'

            return (
              <div key={t.id} className="flex flex-col sm:grid sm:grid-cols-12 gap-2 sm:gap-4 px-4 sm:px-6 py-4 border-b border-gray-100 text-sm hover:bg-gray-50 transition-colors">
                
                {/* Mobile View */}
                <div className="flex justify-between items-start sm:hidden mb-1">
                  <div>
                    <div className="font-bold text-gray-900 text-base">{t.description}</div>
                    <div className="text-xs text-gray-500 mt-0.5">{formattedDate}</div>
                  </div>
                  <div className="font-bold text-gray-900 text-base">{userCurrency}{t.amount.toFixed(2)}</div>
                </div>
                <div className="sm:hidden mt-1">
                  <span className="text-xs font-medium text-gray-600 bg-gray-100 px-2 py-1 rounded-md">{catName || 'Uncategorized'}</span>
                </div>

                {/* Desktop View */}
                <div className="hidden sm:block sm:col-span-3 text-gray-600 font-medium">{formattedDate}</div>
                <div className="hidden sm:block sm:col-span-4 font-medium text-gray-900">{t.description}</div>
                <div className="hidden sm:block sm:col-span-3 text-gray-600">{catName || 'Uncategorized'}</div>
                <div className="hidden sm:block sm:col-span-2 text-right font-semibold text-gray-900">{userCurrency}{t.amount.toFixed(2)}</div>
              </div>
            )
          })
        )}
      </div>
    </div>
  )
}