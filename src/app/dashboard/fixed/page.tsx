import { createClient } from '@/utils/supabase/server'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { createFixedCommitment, deleteFixedCommitment } from './actions'

export default async function FixedCostsPage() {
  const supabase = await createClient()

  const { data: commitments } = await supabase
    .from('fixed_commitments')
    .select('*')
    .order('created_at', { ascending: false })

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-gray-900">Fixed Commitments</h1>
        <p className="text-gray-500 mt-2">Log recurring bills and predictable needs like rent, subscriptions, and daily transit.</p>
      </div>

      <Card className="max-w-2xl bg-white shadow-sm border-gray-200">
        <CardHeader>
          <CardTitle>Add New Fixed Cost</CardTitle>
        </CardHeader>
        <CardContent>
          <form action={createFixedCommitment} className="flex gap-4 items-end">
            <div className="space-y-2 flex-1">
              <Label htmlFor="name">Expense Name</Label>
              <Input id="name" name="name" placeholder="e.g., Netflix or Train Fare" required />
            </div>
            
            <div className="space-y-2 w-40">
              <Label htmlFor="frequency">Frequency</Label>
              <select 
                id="frequency" name="frequency" required
                className="flex h-10 w-full items-center justify-between rounded-md border border-gray-200 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900"
              >
                <option value="daily">Daily</option>
                <option value="weekly">Weekly</option>
                <option value="monthly">Monthly</option>
                <option value="yearly">Yearly</option>
              </select>
            </div>

            <div className="space-y-2 w-32">
              <Label htmlFor="amount">Amount ($)</Label>
              <Input id="amount" name="amount" type="number" min="0.01" step="0.01" placeholder="15.99" required />
            </div>
            <Button type="submit">Add</Button>
          </form>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {commitments?.length === 0 ? (
          <p className="text-gray-500 col-span-full">No fixed costs logged yet.</p>
        ) : (
          commitments?.map((item) => (
            <Card key={item.id} className="shadow-sm border-gray-200 group relative">
              <CardHeader className="pb-2">
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-lg">{item.name}</CardTitle>
                    <CardDescription className="capitalize">
                      {item.frequency}
                    </CardDescription>
                  </div>
                  <form action={deleteFixedCommitment}>
                    <input type="hidden" name="id" value={item.id} />
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
                <div className="text-2xl font-bold text-gray-900 mt-2">
                  ${item.amount.toFixed(2)}
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  )
}