'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { createClient } from '@/utils/supabase/client'
import { useRouter } from 'next/navigation'

export default function Sidebar() {
  const [isOpen, setIsOpen] = useState(false)
  const pathname = usePathname()
  const router = useRouter()
  const supabase = createClient()

  // Close the sidebar automatically when a user clicks a link on mobile
  useEffect(() => {
    setIsOpen(false)
  }, [pathname])

  const links = [
    { name: 'Dashboard', href: '/dashboard' },
    { name: 'Budgets', href: '/dashboard/budgets' },
    { name: 'Transactions', href: '/dashboard/transactions' },
    { name: 'History', href: '/dashboard/history' },
    { name: 'Profile & Settings', href: '/dashboard/profile' },
  ]

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    router.push('/login')
  }

  return (
    <>
      {/* Mobile Top Navigation Bar (Hamburger Menu) */}
      <div className="lg:hidden fixed top-0 left-0 right-0 h-16 bg-white border-b border-gray-200 z-30 flex items-center justify-between px-4">
        <span className="text-2xl font-bold text-gray-900 tracking-tight">Koin.</span>
        <button 
          onClick={() => setIsOpen(true)} 
          className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded-md transition-colors"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="4" x2="20" y1="12" y2="12"/><line x1="4" x2="20" y1="6" y2="6"/><line x1="4" x2="20" y1="18" y2="18"/>
          </svg>
        </button>
      </div>

      {/* Darkened Backdrop Overlay for Mobile */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/60 z-40 lg:hidden backdrop-blur-sm transition-opacity"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* The Sidebar Itself */}
      <aside className={`fixed inset-y-0 left-0 z-50 w-64 bg-white border-r border-gray-200 flex flex-col transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:h-screen ${isOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        
        {/* Logo (Desktop only) */}
        <div className="hidden lg:flex items-center h-20 px-8">
          <span className="text-3xl font-bold text-gray-900 tracking-tight">Koin.</span>
        </div>

        {/* Mobile Header Inside Sidebar */}
        <div className="flex lg:hidden items-center justify-between h-16 px-6 border-b border-gray-100">
          <span className="text-xl font-bold text-gray-900">Menu</span>
          <button onClick={() => setIsOpen(false)} className="text-gray-400 hover:text-gray-900">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
          </button>
        </div>

        {/* Navigation Links */}
        <nav className="flex-1 px-4 py-6 space-y-1 overflow-y-auto">
          {links.map((link) => {
            const isActive = pathname === link.href || pathname.startsWith(`${link.href}/`)
            return (
              <Link 
                key={link.name} 
                href={link.href}
                className={`flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-colors ${
                  isActive ? 'bg-[#1c1c1c] text-white shadow-sm' : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                }`}
              >
                {link.name}
              </Link>
            )
          })}
        </nav>

        {/* User Actions / Logout */}
        <div className="p-4 border-t border-gray-100">
          <button 
            onClick={handleSignOut}
            className="w-full flex items-center justify-center px-4 py-2.5 border border-gray-200 text-sm font-medium rounded-lg text-gray-700 bg-white hover:bg-gray-50 transition-colors shadow-sm"
          >
            Sign Out
          </button>
        </div>
      </aside>
    </>
  )
}