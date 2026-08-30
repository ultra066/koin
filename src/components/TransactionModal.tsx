'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { createTransaction } from '@/app/dashboard/transactions/actions'

export default function TransactionModal({ 
  categories = [], 
  fixedCosts = [] 
}: { 
  categories: any[], 
  fixedCosts?: any[] 
}) {
  const [isOpen, setIsOpen] = useState(false)
  const [selectedGroup, setSelectedGroup] = useState<'needs' | 'wants' | 'savings' | 'fixed'>('fixed')
  const [selectedFixedId, setSelectedFixedId] = useState<string>('')
  const today = new Date().toISOString().split('T')[0]

  // Filter out categories that are actually fixed costs so they don't double up in 'Needs'
  const filteredCategories = categories?.filter(cat => 
    cat.group_type === selectedGroup && 
    !fixedCosts.some(f => f.name.toLowerCase() === cat.name.toLowerCase())
  ) || []

  // Get data for the silently submitted fixed transaction
  const selectedFixedBill = fixedCosts.find(f => f.id === selectedFixedId)
  const matchingCategory = categories.find(c => c.name.toLowerCase() === selectedFixedBill?.name.toLowerCase())

  if (!isOpen) {
    return (
      <Button onClick={() => setIsOpen(true)} className="bg-[#1c1c1c] hover:bg-black text-white shadow-sm">
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2"><path d="M5 12h14"/><path d="M12 5v14"/></svg>
        Add Transaction
      </Button>
    )
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm font-sans">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-md max-h-[90vh] flex flex-col overflow-hidden text-gray-900">
        <div className="flex justify-between items-center p-5 border-b border-gray-100">
          <h2 className="text-xl font-bold tracking-tight">Log Expense</h2>
          <button onClick={() => setIsOpen(false)} className="text-gray-400 hover:text-gray-900 transition-colors">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
          </button>
        </div>

        <div className="p-5 overflow-y-auto">
          <form action={async (formData) => { await createTransaction(formData); setIsOpen(false); }} className="space-y-4">
            
            {/* Allocation Group Filter Tabs */}
            <div className="space-y-2">
              <Label>Allocation Group</Label>
              <div className="grid grid-cols-4 gap-1 bg-gray-100 p-1 rounded-lg">
                {(['needs', 'wants', 'savings', 'fixed'] as const).map((group) => (
                  <button 
                    key={group}
                    type="button"
                    onClick={() => { setSelectedGroup(group); setSelectedFixedId(''); }} 
                    className={`py-1.5 text-xs font-semibold rounded-md transition-all uppercase tracking-wider ${selectedGroup === group ? 'bg-white shadow-sm text-gray-900' : 'text-gray-500 hover:text-gray-900'}`}
                  >
                    {group}
                  </button>
                ))}
              </div>
            </div>

            {/* Dynamic Inputs based on selected group */}
            {selectedGroup === 'fixed' ? (
              <div className="space-y-2">
                <Label htmlFor="fixed_commitment_id">Select Fixed Bill</Label>
                <select 
                  id="fixed_commitment_id" 
                  required 
                  value={selectedFixedId}
                  onChange={(e) => setSelectedFixedId(e.target.value)}
                  className="flex h-10 w-full items-center justify-between rounded-md border border-gray-200 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#1c1c1c]"
                >
                  <option value="" disabled>Select a fixed bill...</option>
                  {fixedCosts.map(bill => (
                    <option key={bill.id} value={bill.id}>{bill.name}</option>
                  ))}
                </select>
                
                {/* Hidden inputs automatically supply the exact amount and ID to the server */}
                <input type="hidden" name="description" value={selectedFixedBill?.name || ''} />
                <input type="hidden" name="amount" value={selectedFixedBill?.amount || 0} />
                <input type="hidden" name="category_id" value={matchingCategory?.id || ''} />
              </div>
            ) : (
              <>
                <div className="space-y-2">
                  <Label htmlFor="description">Description (Merchant/Item)</Label>
                  <Input id="description" name="description" placeholder="e.g., Target, Uber" required />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="category_id">Category ({selectedGroup.toUpperCase()})</Label>
                  <select 
                    id="category_id" 
                    name="category_id" 
                    required 
                    defaultValue=""
                    className="flex h-10 w-full items-center justify-between rounded-md border border-gray-200 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#1c1c1c]"
                  >
                    <option value="" disabled>Select a category...</option>
                    {filteredCategories.map(cat => (
                      <option key={cat.id} value={cat.id}>{cat.name}</option>
                    ))}
                  </select>
                </div>
              </>
            )}

            <div className="grid grid-cols-2 gap-4">
              {/* Only show the Amount input if it is NOT a fixed cost */}
              {selectedGroup !== 'fixed' && (
                <div className="space-y-2">
                  <Label htmlFor="amount">Amount ($)</Label>
                  <Input id="amount" name="amount" type="number" min="0.01" step="0.01" placeholder="0.00" required />
                </div>
              )}
              {/* Date Input takes full width if Amount is hidden */}
              <div className={`space-y-2 ${selectedGroup === 'fixed' ? 'col-span-2' : ''}`}>
                <Label htmlFor="transaction_date">Date</Label>
                <Input id="transaction_date" name="transaction_date" type="date" defaultValue={today} required />
              </div>
            </div>
            
            <div className="flex gap-3 pt-4">
              <Button type="button" variant="outline" className="w-1/2" onClick={() => setIsOpen(false)}>Cancel</Button>
              <Button type="submit" className="w-1/2 bg-[#1c1c1c] hover:bg-black text-white">Save Transaction</Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}