'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { updateBudgetStrategy } from '@/app/dashboard/budgets/actions'

interface BudgetRuleModalProps {
  initialNeeds: number;
  initialWants: number;
  initialSavings: number;
}

export default function BudgetRuleModal({ initialNeeds, initialWants, initialSavings }: BudgetRuleModalProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [needs, setNeeds] = useState(initialNeeds)
  const [wants, setWants] = useState(initialWants)
  const [savings, setSavings] = useState(initialSavings)

  const total = needs + wants + savings
  const isPerfect = total === 100

  if (!isOpen) {
    return (
      <Button onClick={() => setIsOpen(true)} variant="outline" className="border-gray-200 text-gray-700 shadow-sm mr-3">
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2"><path d="M12 20h9"/><path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4Z"/></svg>
        Budget Rule
      </Button>
    )
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm font-sans">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-md max-h-[90vh] flex flex-col overflow-hidden text-gray-900">
        <div className="flex justify-between items-center p-5 border-b border-gray-100">
          <div>
            <h2 className="text-xl font-bold tracking-tight">Strategic Allocation Rule</h2>
            <p className="text-xs text-gray-500 mt-1">Adjust your targets. They must equal exactly 100%.</p>
          </div>
          <button onClick={() => setIsOpen(false)} className="text-gray-400 hover:text-gray-900 transition-colors">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
          </button>
        </div>

        <div className="p-5 overflow-y-auto">
          <form action={async (formData) => { await updateBudgetStrategy(formData); setIsOpen(false); }} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="space-y-2">
                <Label htmlFor="needs_target">Needs (%)</Label>
                <Input id="needs_target" name="needs_target" type="number" value={needs} onChange={(e) => setNeeds(parseInt(e.target.value) || 0)} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="wants_target">Wants (%)</Label>
                <Input id="wants_target" name="wants_target" type="number" value={wants} onChange={(e) => setWants(parseInt(e.target.value) || 0)} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="savings_target">Savings (%)</Label>
                <Input id="savings_target" name="savings_target" type="number" value={savings} onChange={(e) => setSavings(parseInt(e.target.value) || 0)} />
              </div>
            </div>

            <div className={`p-4 rounded-lg font-medium text-sm flex justify-between items-center transition-colors ${isPerfect ? 'bg-emerald-50 text-emerald-900 border border-emerald-200' : 'bg-red-50 text-red-900 border border-red-200'}`}>
              <span>Total Allocation:</span>
              <span className="text-lg font-bold">{total}%</span>
            </div>

            <div className="flex gap-4">
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => { setNeeds(50); setWants(30); setSavings(20); }}
              >
                Reset to 50/30/20
              </Button>
              <Button type="submit" disabled={!isPerfect} className="flex-1 bg-[#1c1c1c] hover:bg-black text-white">
                Save Strategy
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}