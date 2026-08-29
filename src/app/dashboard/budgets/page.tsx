import { createClient } from '@/utils/supabase/server'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { createBudget, deleteBudget } from './actions'

export default async function BudgetsPage() {
  const supabase = await createClient()

  // Fetch categories including the new group_type
  const { data: categories } = await supabase
    .from('categories')
    .select(`
      id, name, group_type,
      monthly_budgets ( allocated_amount )
    `)
    .order('name')

  const currentMonthStart = new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString()
  const { data: transactions } = await supabase
    .from('transactions')
    .select('category_id, amount')
    .gte('transaction_date', currentMonthStart)

  // Group the categories for the UI
  const needs = categories?.filter(c => c.group_type === 'needs') || []
  const wants = categories?.filter(c => c.group_type === 'wants') || []
  const savings = categories?.filter(c => c.group_type === 'savings') || []

  // Helper function to render budget cards
  const renderCards = (groupCategories: any[]) => {
    if (groupCategories.length === 0) return <p className="text-gray-500 text-sm">No budgets set for this group.</p>
    
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {groupCategories.map((category) => {
          const spent = transactions
            ?.filter(t => t.category_id === category.id)
            .reduce((sum, t) => sum + t.amount, 0) || 0
          
          const allocated = category.monthly_budgets?.[0]?.allocated_amount || 0
          const percent = allocated > 0 ? Math.min((spent / allocated) * 100, 100) : 0
          const isOverBudget = spent > allocated

          return (
            <Card key={category.id} className="shadow-sm border-gray-200 group relative">
              <CardHeader className="pb-2">
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-lg">{category.name}</CardTitle>
                    <CardDescription>
                      ${spent.toFixed(2)} spent of ${allocated.toFixed(2)}
                    </CardDescription>
                  </div>
                  {/* Remove Button Form */}
                  <form action={deleteBudget}>
                    <input type="hidden" name="id" value={category.id} />
                    <Button 
                      type="submit" 
                      variant="ghost" 
                      size="sm" 
                      className="h-8 px-2 text-red-500 hover:text-red-700 hover:bg-red-50 opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      Remove
                    </Button>
                  </form>
                </div>
              </CardHeader>
              <CardContent>
                <div className="h-2 w-full bg-gray-100 rounded-full overflow-hidden mt-2">
                  <div 
                    className={`h-full transition-all duration-500 ${isOverBudget ? 'bg-red-500' : 'bg-gray-900'}`} 
                    style={{ width: `${percent}%` }} 
                  />
                </div>
                {isOverBudget && (
                  <p className="text-xs text-red-500 mt-2 font-medium">Over budget by ${(spent - allocated).toFixed(2)}</p>
                )}
              </CardContent>
            </Card>
          )
        })}
      </div>
    )
  }

  return (
    <div className="space-y-10">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-gray-900">Budgets</h1>
        <p className="text-gray-500 mt-2">Allocate your income across Needs, Wants, and Savings.</p>
      </div>

      <Card className="max-w-3xl bg-white shadow-sm border-gray-200">
        <CardHeader>
          <CardTitle>Create New Budget</CardTitle>
        </CardHeader>
        <CardContent>
          <form action={createBudget} className="flex gap-4 items-end">
            <div className="space-y-2 flex-1">
              <Label htmlFor="name">Category Name</Label>
              <Input id="name" name="name" placeholder="e.g., Groceries" required />
            </div>
            
            <div className="space-y-2 flex-1">
              <Label htmlFor="group_type">Group</Label>
              <select 
                id="group_type" name="group_type" required
                className="flex h-10 w-full items-center justify-between rounded-md border border-gray-200 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900"
              >
                <option value="needs">Needs (50%)</option>
                <option value="wants">Wants (30%)</option>
                <option value="savings">Savings (20%)</option>
              </select>
            </div>

            <div className="space-y-2 w-32">
              <Label htmlFor="amount">Limit ($)</Label>
              <Input id="amount" name="amount" type="number" min="0" step="0.01" placeholder="500" required />
            </div>
            <Button type="submit">Add</Button>
          </form>
        </CardContent>
      </Card>

      <div className="space-y-8">
        <section>
          <h2 className="text-xl font-semibold text-gray-900 mb-4 border-b pb-2">Needs</h2>
          {renderCards(needs)}
        </section>
        
        <section>
          <h2 className="text-xl font-semibold text-gray-900 mb-4 border-b pb-2">Wants</h2>
          {renderCards(wants)}
        </section>

        <section>
          <h2 className="text-xl font-semibold text-gray-900 mb-4 border-b pb-2">Savings & Investments</h2>
          {renderCards(savings)}
        </section>
      </div>
    </div>
  )
}