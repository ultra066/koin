'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { editBudget } from '@/app/dashboard/budgets/actions'

export default function EditBudgetModal({ 
  budget 
}: { 
  budget: { id: string, name: string, group_type: string, amount: number } 
}) {
  const [isOpen, setIsOpen] = useState(false)

  if (!isOpen) {
    return (
      <button 
        type="button" 
        onClick={() => setIsOpen(true)} 
        title="Edit Budget"
        className="p-1.5 text-blue-500 hover:text-blue-700 hover:bg-blue-50 rounded-md opacity-0 group-hover:opacity-100 transition-all flex items-center justify-center mr-1"
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M12 20h9"/><path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4Z"/>
        </svg>
      </button>
    )
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm font-sans text-left">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-sm flex flex-col overflow-hidden text-gray-900">
        <div className="flex justify-between items-center p-5 border-b border-gray-100">
          <h2 className="text-lg font-bold tracking-tight">Edit Budget</h2>
          <button onClick={() => setIsOpen(false)} className="text-gray-400 hover:text-gray-900 transition-colors">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
          </button>
        </div>
        <div className="p-5">
          <form action={async (formData) => { await editBudget(formData); setIsOpen(false); }} className="space-y-4">
            
            <input type="hidden" name="id" value={budget.id} />
            
            <div className="space-y-2">
              <Label htmlFor="name">Budget Name</Label>
              <Input id="name" name="name" defaultValue={budget.name} required />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="amount">Target Amount</Label>
                <Input id="amount" name="amount" type="number" min="0" step="0.01" defaultValue={budget.amount} required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="group_type">Group</Label>
                <select 
                  id="group_type" 
                  name="group_type" 
                  defaultValue={budget.group_type}
                  required 
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
              <Button type="submit" className="w-1/2 bg-[#1c1c1c] hover:bg-black text-white">Save Changes</Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}