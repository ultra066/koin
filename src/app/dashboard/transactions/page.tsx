import { createClient } from '@/utils/supabase/server'
import { Poppins } from 'next/font/google'
import TransactionModal from '@/components/TransactionModal'
import { deleteTransaction } from './actions'

const poppins = Poppins({ weight: ['400', '500', '600', '700'], subsets: ['latin'] })

export default async function TransactionsPage({
  searchParams,
}: {
  searchParams: Promise<{ start_date?: string; end_date?: string }>
}) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null

  // Fetch User Currency Symbol
  let userCurrency = '$'
  const { data: profileData } = await supabase.from('profiles').select('currency').eq('id', user.id).single()
  if (profileData?.currency) userCurrency = profileData.currency

  // Resolve search params (Next.js 15+ convention)
  const params = await searchParams
  const startDate = params.start_date || new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0]
  const endDate = params.end_date || new Date().toISOString().split('T')[0]

  // Fetch Categories for the Modal
  const { data: categories } = await supabase.from('categories').select('id, name, group_type').order('name')

  // Fetch Fixed Commitments to pass into the Modal for auto-filling bill amounts
  const { data: fixedCosts } = await supabase.from('fixed_commitments').select('*')

  // Fetch Filtered Transactions
  let query = supabase
    .from('transactions')
    .select('id, amount, description, transaction_date, categories ( name, group_type )')
    .gte('transaction_date', startDate)
    .lte('transaction_date', endDate + 'T23:59:59') // Include the full end day
    .order('transaction_date', { ascending: false })

  const { data: transactions } = await query

  return (
    <div className={`space-y-8 ${poppins.className}`}>
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-gray-900">Transactions</h1>
          <p className="text-gray-500 mt-2">Log and filter your personal cash flow history.</p>
        </div>
        <TransactionModal categories={categories || []} fixedCosts={fixedCosts || []} />
      </div>

      {/* Date Filter Bar */}
      <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm flex flex-wrap items-center justify-between gap-4">
        <form method="GET" className="flex items-center gap-4 flex-wrap">
          <div className="flex items-center gap-2">
            <label className="text-sm font-medium text-gray-600">From:</label>
            <input 
              type="date" 
              name="start_date" 
              defaultValue={startDate} 
              className="border border-gray-200 rounded-md px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#1c1c1c]"
            />
          </div>
          <div className="flex items-center gap-2">
            <label className="text-sm font-medium text-gray-600">To:</label>
            <input 
              type="date" 
              name="end_date" 
              defaultValue={endDate} 
              className="border border-gray-200 rounded-md px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#1c1c1c]"
            />
          </div>
          <button type="submit" className="bg-[#1c1c1c] text-white px-4 py-1.5 rounded-md text-sm font-medium hover:bg-black transition-colors">
            Filter
          </button>
        </form>
      </div>

      {/* Transactions Table */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="grid grid-cols-12 gap-4 bg-gray-50 px-6 py-3 font-semibold text-gray-500 text-xs uppercase tracking-wider border-b border-gray-200">
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
            
            // Format the ISO timestamp into a readable Date & Time format
            const formattedDate = t.transaction_date ? new Date(t.transaction_date).toLocaleString('en-US', {
              month: 'short',
              day: 'numeric',
              year: 'numeric',
              hour: 'numeric',
              minute: '2-digit',
              hour12: true
            }) : 'N/A'

            return (
              <div key={t.id} className="grid grid-cols-12 gap-4 px-6 py-4 items-center border-b border-gray-100 text-sm hover:bg-gray-50 transition-colors">
                <div className="col-span-3 text-gray-600 font-medium">{formattedDate}</div>
                <div className="col-span-4 font-medium text-gray-900">{t.description}</div>
                <div className="col-span-3 text-gray-600">{catName || 'Uncategorized'}</div>
                <div className="col-span-2 text-right font-semibold text-gray-900">{userCurrency}{t.amount.toFixed(2)}</div>
              </div>
            )
          })
        )}
      </div>
    </div>
  )
}