import Link from 'next/link'
import { redirect } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { createClient } from '@/utils/supabase/server'

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  // Securely fetch the user data on the server
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  // Inline Server Action to handle logging out
  async function signOut() {
    'use server'
    const supabase = await createClient()
    await supabase.auth.signOut()
    redirect('/login')
  }

  return (
    <div className="flex h-screen bg-gray-100 overflow-hidden">
      {/* Sidebar Navigation */}
      <aside className="w-64 bg-white border-r border-gray-200 flex flex-col">
        <div className="h-16 flex items-center px-6 border-b border-gray-200">
          <span className="text-2xl font-black tracking-tight text-gray-900">Koin.</span>
        </div>
        
        <nav className="flex-1 px-4 py-6 space-y-2">
          <Link 
            href="/dashboard" 
            className="block px-3 py-2 text-sm font-medium text-gray-900 bg-gray-100 rounded-md"
          >
            Overview
          </Link>
          <Link 
            href="/dashboard/budgets" 
            className="block px-3 py-2 text-sm font-medium text-gray-600 hover:bg-gray-50 hover:text-gray-900 rounded-md transition-colors"
          >
            Budgets
          </Link>
          <Link 
            href="/dashboard/transactions" 
            className="block px-3 py-2 text-sm font-medium text-gray-600 hover:bg-gray-50 hover:text-gray-900 rounded-md transition-colors"
          >
            Transactions
          </Link>
          <Link 
            href="/dashboard/fixed" 
            className="block px-3 py-2 text-sm font-medium text-gray-600 hover:bg-gray-50 hover:text-gray-900 rounded-md transition-colors"
          >
            Fixed Costs
          </Link>
        </nav>

        {/* User Profile & Logout */}
        <div className="p-4 border-t border-gray-200 space-y-4">
          <div className="px-2 overflow-hidden text-ellipsis">
            <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">Logged in as</p>
            <p className="text-sm font-medium text-gray-900 truncate">{user?.email}</p>
          </div>
          <form action={signOut}>
            <Button variant="outline" className="w-full shadow-sm">
              Sign Out
            </Button>
          </form>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 overflow-y-auto">
        <div className="p-8">
          {/* This renders whatever page.tsx is currently active */}
          {children} 
        </div>
      </main>
    </div>
  )
}