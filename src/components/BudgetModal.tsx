'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { createBudget, createFixedCommitment } from '@/app/dashboard/budgets/actions'

export default function BudgetModal() {
  const [isOpen, setIsOpen] = useState(false)
  const [type, setType] = useState<'flexible' | 'fixed'>('flexible')

  if (!isOpen) {
    return (
      <Button onClick={() => setIsOpen(true)} className="bg-[#1c1c1c] hover:bg-black text-white shadow-sm">
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2"><path d="M5 12h14"/><path d="M12 5v14"/></svg>
        Add Budget
      </Button>
    )
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm font-sans">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-md max-h-[90vh] flex flex-col overflow-hidden text-gray-900">
        <div className="flex justify-between items-center p-5 border-b border-gray-100">
          <h2 className="text-xl font-bold tracking-tight">Add New Budget</h2>
          <button onClick={() => setIsOpen(false)} className="text-gray-400 hover:text-gray-900 transition-colors">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
          </button>
        </div>

        <div className="p-5 overflow-y-auto">
          {/* Type Toggle */}
          <div className="flex p-1 bg-gray-100 rounded-lg mb-6">
            <button 
              onClick={() => setType('flexible')} 
              className={`flex-1 py-2 text-sm font-medium rounded-md transition-all ${type === 'flexible' ? 'bg-white shadow-sm text-gray-900' : 'text-gray-500 hover:text-gray-900'}`}
            >
              Flexible Limit
            </button>
            <button 
              onClick={() => setType('fixed')} 
              className={`flex-1 py-2 text-sm font-medium rounded-md transition-all ${type === 'fixed' ? 'bg-white shadow-sm text-gray-900' : 'text-gray-500 hover:text-gray-900'}`}
            >
              Fixed Cost
            </button>
          </div>

          {/* Flexible Budget Form */}
          {type === 'flexible' && (
            <form action={async (formData) => { await createBudget(formData); setIsOpen(false); }} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Category Name</Label>
                <Input id="name" name="name" placeholder="e.g., Groceries, Dining" required />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="amount">Monthly Limit ($)</Label>
                  <Input id="amount" name="amount" type="number" min="0" step="0.01" placeholder="400.00" required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="group_type">Allocation Group</Label>
                  <select 
                    id="group_type" name="group_type" required
                    className="flex h-10 w-full items-center justify-between rounded-md border border-gray-200 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#1c1c1c]"
                  >
                    <option value="needs">Needs</option>
                    <option value="wants">Wants</option>
                    <option value="savings">Savings</option>
                  </select>
                </div>
              </div>
              <div className="flex gap-3 pt-4">
                <Button type="button" variant="outline" className="w-1/2" onClick={() => setIsOpen(false)}>Cancel</Button>
                <Button type="submit" className="w-1/2 bg-[#1c1c1c] hover:bg-black text-white">Save Limit</Button>
              </div>
            </form>
          )}

          {/* Fixed Cost Form */}
          {type === 'fixed' && (
            <form action={async (formData) => { await createFixedCommitment(formData); setIsOpen(false); }} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Bill Name</Label>
                <Input id="name" name="name" placeholder="e.g., Rent, Internet" required />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="amount">Amount ($)</Label>
                  <Input id="amount" name="amount" type="number" min="0" step="0.01" placeholder="1500.00" required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="frequency">Frequency</Label>
                  <select 
                    id="frequency" name="frequency" required
                    className="flex h-10 w-full items-center justify-between rounded-md border border-gray-200 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#1c1c1c]"
                  >
                    <option value="monthly">Monthly</option>
                    <option value="weekly">Weekly</option>
                  </select>
                </div>
              </div>
              <div className="flex gap-3 pt-4">
                <Button type="button" variant="outline" className="w-1/2" onClick={() => setIsOpen(false)}>Cancel</Button>
                <Button type="submit" className="w-1/2 bg-[#1c1c1c] hover:bg-black text-white">Save Fixed Bill</Button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  )
}