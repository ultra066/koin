import { createClient } from '@/utils/supabase/server'
import { Poppins } from 'next/font/google'
import TransactionModal from '@/components/TransactionModal'
import { deleteTransaction } from './actions'

const poppins = Poppins({ weight: ['400', '500', '600', '700'], subsets: ['latin'] })

export default async function TransactionsPage() {
  const supabase = await createClient()

  // Fetch active categories for the modal dropdown
  const { data: categories } = await supabase
    .from('categories')
    .select('id, name, group_type')
    .order('name')

  // Fetch transactions with their associated category names
  const { data: transactions } = await supabase
    .from('transactions')
    .select('id, amount, description, transaction_date, categories(name, group_type)')
    .order('transaction_date', { ascending: false })
    .order('created_at', { ascending: false })

  // Helper to format date cleanly
  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en-US', { 
      month: 'short', day: 'numeric', year: 'numeric' 
    })
  }

  return (
    <div className={`space-y-8 ${poppins.className}`}>
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-gray-900">Transactions</h1>
          <p className="text-gray-500 mt-2">Log and monitor your daily spending.</p>
        </div>
        <TransactionModal categories={categories || []} />
      </div>

      <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden text-sm">
        <div className="grid grid-cols-12 gap-4 bg-gray-50 px-6 py-3 font-semibold text-gray-500 text-xs uppercase tracking-wider border-b border-gray-200">
          <div className="col-span-2">Date</div>
          <div className="col-span-4">Description</div>
          <div className="col-span-3">Category</div>
          <div className="col-span-2 text-right">Amount</div>
          <div className="col-span-1 text-right"></div>
        </div>

        <div className="divide-y divide-gray-100">
          {(!transactions || transactions.length === 0) ? (
            <div className="px-6 py-8 text-center text-gray-500">No transactions recorded yet.</div>
          ) : (
            transactions.map((t: any) => (
              <div key={t.id} className="grid grid-cols-12 gap-4 px-6 py-4 items-center hover:bg-gray-50 transition-colors group">
                <div className="col-span-2 text-gray-500">{formatDate(t.transaction_date)}</div>
                <div className="col-span-4 font-medium text-gray-900 truncate">{t.description}</div>
                <div className="col-span-3 text-gray-600">
                  <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-800">
                    {t.categories ? t.categories.name : 'Uncategorized'}
                  </span>
                </div>
                <div className="col-span-2 text-right font-bold text-gray-900">
                  ${t.amount.toFixed(2)}
                </div>
                <div className="col-span-1 text-right">
                  <form action={deleteTransaction}>
                    <input type="hidden" name="id" value={t.id} />
                    <button type="submit" className="text-xs text-red-400 hover:text-red-600 opacity-0 group-hover:opacity-100 transition-opacity">
                      Remove
                    </button>
                  </form>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  )
}