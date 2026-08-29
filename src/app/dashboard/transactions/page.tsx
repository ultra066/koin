import { createClient } from '@/utils/supabase/server'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { createTransaction, deleteTransaction } from './actions'

export default async function TransactionsPage() {
  const supabase = await createClient()

  // Fetch categories for the dropdown menu
  const { data: categories } = await supabase
    .from('categories')
    .select('id, name')
    .order('name')

  // Fetch recent transactions (joining the category name)
  const { data: transactions } = await supabase
    .from('transactions')
    .select(`
      id,
      amount,
      description,
      transaction_date,
      categories ( name )
    `)
    .order('transaction_date', { ascending: false })
    .limit(10)

  // Get today's date for the default date input
  const today = new Date().toISOString().split('T')[0]

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-gray-900">Transactions</h1>
        <p className="text-gray-500 mt-2">Log your expenses and track your spending history.</p>
      </div>

      {/* Transaction Entry Form */}
      <Card className="max-w-2xl bg-white shadow-sm border-gray-200">
        <CardHeader>
          <CardTitle>Log an Expense</CardTitle>
          <CardDescription>Enter the details of your recent purchase.</CardDescription>
        </CardHeader>
        <CardContent>
          <form action={createTransaction} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="amount">Amount ($)</Label>
                <Input id="amount" name="amount" type="number" min="0.01" step="0.01" placeholder="45.00" required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="transaction_date">Date</Label>
                <Input id="transaction_date" name="transaction_date" type="date" defaultValue={today} required />
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Input id="description" name="description" placeholder="e.g., Whole Foods Groceries" required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="category_id">Category</Label>
                {/* Native select styled with Tailwind to match shadcn inputs */}
                <select 
                  id="category_id" 
                  name="category_id" 
                  required
                  className="flex h-10 w-full items-center justify-between rounded-md border border-gray-200 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900"
                >
                  <option value="">Select a category...</option>
                  {categories?.map((cat) => (
                    <option key={cat.id} value={cat.id}>{cat.name}</option>
                  ))}
                </select>
              </div>
            </div>

            <Button type="submit" className="w-full">Save Transaction</Button>
          </form>
        </CardContent>
      </Card>

      {/* Recent Transactions List */}
      <Card className="bg-white shadow-sm border-gray-200">
        <CardHeader>
          <CardTitle>Recent History</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="divide-y divide-gray-100">
            {transactions?.length === 0 ? (
              <p className="text-gray-500 py-4 text-center">No transactions logged yet.</p>
            ) : (
              transactions?.map((t) => (
                <div key={t.id} className="py-4 flex justify-between items-center group">
                  <div>
                    <p className="font-medium text-gray-900">{t.description}</p>
                    <div className="flex gap-2 text-sm text-gray-500 mt-1">
                      <span>{t.transaction_date}</span>
                      <span>•</span>
                      <span>
                        {Array.isArray(t.categories) 
                          ? (t.categories[0] as any)?.name 
                          : (t.categories as any)?.name || 'Uncategorized'}
                      </span> 
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-4">
                    <span className="font-bold text-gray-900">
                      ${t.amount.toFixed(2)}
                    </span>
                    
                    {/* Delete Form */}
                    <form action={deleteTransaction}>
                      <input type="hidden" name="id" value={t.id} />
                      <Button 
                        type="submit" 
                        variant="ghost" 
                        size="sm" 
                        className="text-red-500 hover:text-red-700 hover:bg-red-50 opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        Delete
                      </Button>
                    </form>
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}