'use client'

import { useState, useRef, useEffect } from 'react'
import Link from 'next/link'

export default function NotificationDropdown({ 
  fixedCosts, 
  categories, 
  transactions, 
  userCurrency 
}: { 
  fixedCosts: any[], 
  categories: any[], 
  transactions: any[], 
  userCurrency: string 
}) {
  const [isOpen, setIsOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  // Generate dynamic alerts based on user's actual data
  const alerts: { id: string; title: string; desc: string; type: 'warning' | 'info' | 'success'; href: string }[] = []

  // 1. Check for Fixed Costs / Bills Reminder
  if (fixedCosts && fixedCosts.length > 0) {
    alerts.push({
      id: 'fixed',
      title: 'Fixed Costs Reminder',
      desc: `You have ${fixedCosts.length} active fixed commitments totaling ${userCurrency}${fixedCosts.reduce((sum, b) => sum + b.amount, 0).toFixed(2)} this cycle.`,
      type: 'info',
      href: '/dashboard/budgets'
    })
  }

  // 2. Check for Over-spending Categories
  const currentMonthPrefix = new Date().toISOString().slice(0, 7)
  categories?.forEach(cat => {
    const spent = transactions?.filter(t => t.category_id === cat.id).reduce((sum, t) => sum + t.amount, 0) || 0
    const currentBudget = cat.monthly_budgets?.find((b: any) => b.period_start?.startsWith(currentMonthPrefix))
    const allocated = currentBudget?.allocated_amount || 0

    if (allocated > 0 && spent > allocated) {
      alerts.push({
        id: `over-${cat.id}`,
        title: `Over Budget: ${cat.name}`,
        desc: `You've spent ${userCurrency}${spent.toFixed(2)} of your ${userCurrency}${allocated.toFixed(2)} limit.`,
        type: 'warning',
        href: '/dashboard/budgets'
      })
    }
  })

  // Fallback if everything looks healthy
  if (alerts.length === 0) {
    alerts.push({
      id: 'all-good',
      title: 'All caught up!',
      desc: 'No overspending or pending urgent alerts right now. Great job!',
      type: 'success',
      href: '/dashboard'
    })
  }

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Bell Button */}
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="relative flex items-center justify-center p-3 bg-white border border-gray-200 hover:border-gray-300 hover:bg-gray-50 rounded-full shadow-sm transition-all text-gray-600 hover:text-gray-900"
        title="Notifications"
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9"/>
          <path d="M10.37 21a1.5 1.5 0 0 0 2.76 0"/>
        </svg>
        {/* Red Notification Dot Indicator */}
        {alerts.some(a => a.type === 'warning') && (
          <span className="absolute top-2 right-2.5 w-2.5 h-2.5 bg-red-500 rounded-full ring-2 ring-white animate-pulse" />
        )}
      </button>

      {/* Facebook-style Popup Window */}
      {isOpen && (
        <div className="absolute right-0 mt-3 w-80 sm:w-96 bg-white rounded-2xl shadow-2xl border border-gray-100 py-3 z-50 animate-in fade-in slide-in-from-top-2 duration-200">
          <div className="px-4 pb-3 border-b border-gray-100 flex items-center justify-between">
            <h3 className="font-bold text-gray-900 text-lg">Notifications</h3>
            <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full font-medium">{alerts.length} new</span>
          </div>

          <div className="max-h-80 overflow-y-auto divide-y divide-gray-50">
            {alerts.map(alert => (
              <Link 
                key={alert.id} 
                href={alert.href}
                onClick={() => setIsOpen(false)}
                className="flex items-start gap-3 p-3 hover:bg-gray-50 transition-colors block"
              >
                <div className={`mt-1 p-2 rounded-full shrink-0 ${
                  alert.type === 'warning' ? 'bg-red-50 text-red-600' : 
                  alert.type === 'info' ? 'bg-blue-50 text-blue-600' : 'bg-emerald-50 text-emerald-600'
                }`}>
                  {alert.type === 'warning' ? (
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"/><path d="M12 9v4"/><path d="M12 17h.01"/></svg>
                  ) : (
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><path d="M12 16v-4"/><path d="M12 8h.01"/></svg>
                  )}
                </div>
                <div>
                  <p className="text-sm font-semibold text-gray-900">{alert.title}</p>
                  <p className="text-xs text-gray-500 mt-0.5 leading-relaxed">{alert.desc}</p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}