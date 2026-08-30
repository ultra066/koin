'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { createTransaction } from '@/app/dashboard/transactions/actions'

export default function TransactionModal({ categories }: { categories: any[] }) {
  const [isOpen, setIsOpen] = useState(false)
  const today = new Date().toISOString().split('T')[0]

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
            <div className="space-y-2">
              <Label htmlFor="description">Description (Merchant/Item)</Label>
              <Input id="description" name="description" placeholder="e.g., Target, Uber, Jollibee" required />
            </div>
            
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

            <div className="space-y-2">
              <Label htmlFor="category_id">Budget Category</Label>
              <select 
                id="category_id" name="category_id" required defaultValue=""
                className="flex h-10 w-full items-center justify-between rounded-md border border-gray-200 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#1c1c1c]"
              >
                <option value="" disabled>Select a category...</option>
                {categories?.map(cat => (
                  <option key={cat.id} value={cat.id}>{cat.name} ({cat.group_type})</option>
                ))}
              </select>
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