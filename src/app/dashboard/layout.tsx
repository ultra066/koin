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
    <div className={`flex h-screen bg-gray-100 overflow-hidden ${poppins.className}`}>
      {/* Sidebar Navigation */}
      <aside className="w-64 bg-white border-r border-gray-200 flex flex-col">
        <div className="h-16 flex items-center px-6 border-b border-gray-200">
          <Link href="/dashboard" className="text-2xl font-black tracking-tight text-gray-900 hover:text-gray-600 transition-colors">
            Koin.
          </Link>
        </div>
        
        <nav className="flex-1 px-4 py-6 space-y-2">
          {navLinks.map((link) => {
            const isActive = pathname === link.href
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
      <main className="flex-1 overflow-y-auto">
        <div className="p-8">
          {children} 
        </div>
      </main>
    </div>
  )
}