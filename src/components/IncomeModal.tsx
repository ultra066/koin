'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { createIncome, deleteIncome } from '@/app/dashboard/actions'

export default function IncomeModal({ incomes }: { incomes: any[] }) {
  const [isOpen, setIsOpen] = useState(false)
  const [showForm, setShowForm] = useState(false)

  if (!isOpen) {
    return (
      <button 
        onClick={() => setIsOpen(true)}
        className="text-gray-400 hover:text-white transition-colors flex items-center justify-center"
        title="View Incomes"
      >
        {/* Eye Icon */}
        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"/><circle cx="12" cy="12" r="3"/></svg>
      </button>
    )
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm font-sans">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md max-h-[90vh] flex flex-col overflow-hidden text-gray-900">
        <div className="flex justify-between items-center p-5 border-b border-gray-100">
          <h2 className="text-xl font-bold tracking-tight">Income Sources</h2>
          <button onClick={() => { setIsOpen(false); setShowForm(false); }} className="text-gray-400 hover:text-gray-900 transition-colors">
            {/* Close X Icon */}
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
          </button>
        </div>

        <div className="p-5 overflow-y-auto flex-1 space-y-4">
          {!showForm ? (
            <>
              <Button onClick={() => setShowForm(true)} className="w-full flex items-center gap-2 bg-[#1c1c1c] hover:bg-black">
                {/* Plus Icon */}
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14"/><path d="M12 5v14"/></svg>
                Add New Income
              </Button>
              
              <div className="space-y-3 mt-4">
                {incomes.length === 0 ? (
                  <p className="text-center text-gray-500 text-sm py-4">No income sources found.</p>
                ) : (
                  incomes.map(inc => (
                    <div key={inc.id} className="flex justify-between items-center p-4 bg-gray-50 rounded-md border border-gray-100">
                      <div>
                        <p className="font-semibold text-gray-900">{inc.source_name}</p>
                        <p className="text-xs text-gray-500 mt-1 capitalize">Schedule: {inc.schedule?.replace(/_/g, ' ') || 'Monthly'}</p>
                      </div>
                      <div className="flex items-center gap-4">
                        <span className="font-bold text-emerald-600">${inc.amount.toFixed(2)}</span>
                        <form action={async () => await deleteIncome(inc.id)}>
                          <button type="submit" className="text-red-400 hover:text-red-600 transition-colors" title="Remove">
                            {/* Trash Icon */}
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/></svg>
                          </button>
                        </form>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </>
          ) : (
            <form action={async (formData) => {
              await createIncome(formData)
              setShowForm(false)
            }} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="source_name">Income Source</Label>
                <Input id="source_name" name="source_name" placeholder="e.g., Main Salary" required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="amount">Amount ($)</Label>
                <Input id="amount" name="amount" type="number" min="0.01" step="0.01" placeholder="3000.00" required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="schedule">When does this arrive?</Label>
                <select 
                  id="schedule" name="schedule" required
                  className="flex h-10 w-full items-center justify-between rounded-md border border-gray-200 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900"
                >
                  <option value="5th">5th of every month</option>
                  <option value="15th">15th of every month</option>
                  <option value="25th">25th of every month</option>
                  <option value="end_of_month">End of the month</option>
                  <option value="custom">Custom / Varied</option>
                </select>
              </div>
              <div className="flex gap-3 pt-4">
                <Button type="button" variant="outline" className="w-1/2" onClick={() => setShowForm(false)}>Cancel</Button>
                <Button type="submit" className="w-1/2 bg-[#1c1c1c] hover:bg-black">Save</Button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  )
}