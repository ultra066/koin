'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { createClient } from '@/utils/supabase/client'
import { Poppins } from 'next/font/google'
import { useEffect, useState } from 'react'

const poppins = Poppins({ 
  weight: ['400', '500', '600', '700'],
  subsets: ['latin'],
})

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const pathname = usePathname()
  const router = useRouter()
  const [userName, setUserName] = useState<string>('User')
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)

  // Fetch User
  useEffect(() => {
    async function fetchUser() {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('first_name')
          .eq('id', user.id)
          .single()
        if (profile?.first_name) {
          setUserName(profile.first_name)
        }
      }
    }
    fetchUser()
  }, [])

  // Auto-close sidebar on mobile when navigating
  useEffect(() => {
    setIsSidebarOpen(false)
  }, [pathname])

  async function signOut() {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/login')
  }

  const navLinks = [
    { name: 'Dashboard', href: '/dashboard' },
    { name: 'Budgets', href: '/dashboard/budgets' },
    { name: 'Transactions', href: '/dashboard/transactions' },
    { name: 'History', href: '/dashboard/history' },
    { name: 'Profile & Settings', href: '/dashboard/profile' },
  ]

  return (
    <div className={`flex h-screen bg-gray-50 overflow-hidden ${poppins.className}`}>
      
      {/* Mobile Top Header */}
      <div className="lg:hidden fixed top-0 left-0 right-0 h-16 bg-white border-b border-gray-200 z-30 flex items-center justify-between px-4 shadow-sm">
        <Link href="/dashboard" className="text-2xl font-black tracking-tight text-gray-900">
          Koin.
        </Link>
        <button 
          onClick={() => setIsSidebarOpen(true)} 
          className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded-md transition-colors"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="4" x2="20" y1="12" y2="12"/><line x1="4" x2="20" y1="6" y2="6"/><line x1="4" x2="20" y1="18" y2="18"/>
          </svg>
        </button>
      </div>

      {/* Darkened Backdrop Overlay */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/60 z-40 lg:hidden backdrop-blur-sm transition-opacity"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Sidebar Navigation */}
      <aside className={`fixed inset-y-0 left-0 z-50 w-64 bg-white border-r border-gray-200 flex flex-col transform transition-transform duration-300 ease-in-out lg:relative lg:translate-x-0 ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="h-16 flex items-center justify-between px-6 border-b border-gray-200">
          <Link href="/dashboard" className="text-2xl font-black tracking-tight text-gray-900 hover:text-gray-600 transition-colors">
            Koin.
          </Link>
          <button onClick={() => setIsSidebarOpen(false)} className="lg:hidden text-gray-400 hover:text-gray-900">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
          </button>
        </div>
        
        <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto">
          {navLinks.map((link) => {
            const isActive = pathname === link.href || pathname.startsWith(`${link.href}/`)
            return (
              <Link 
                key={link.href}
                href={link.href} 
                className={`block px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                  isActive 
                    ? 'text-gray-900 bg-gray-100 font-semibold' 
                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                }`}
              >
                {link.name}
              </Link>
            )
          })}
        </nav>

        {/* User Profile & Logout */}
        <div className="p-4 border-t border-gray-200 space-y-4">
          <div className="px-2 overflow-hidden text-ellipsis">
            <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">Logged in as</p>
            <p className="text-sm font-semibold text-gray-900 truncate">{userName}</p>
          </div>
          <Button onClick={signOut} variant="outline" className="w-full shadow-sm">
            Sign Out
          </Button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 overflow-y-auto w-full pt-16 lg:pt-0">
        <div className="p-4 sm:p-8 max-w-7xl mx-auto">
          {children} 
        </div>
      </main>
    </div>
  )
}