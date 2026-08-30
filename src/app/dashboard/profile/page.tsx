import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import ProfileClient from './ProfileClient'
import { Poppins } from 'next/font/google'

const poppins = Poppins({ 
  weight: ['400', '500', '600', '700'],
  subsets: ['latin'],
})

export default async function ProfilePage() {
  const supabase = await createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('first_name, currency')
    .eq('id', user.id)
    .single()

  return (
    <div className={`space-y-8 ${poppins.className}`}>
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-gray-900">Settings</h1>
        <p className="text-gray-500 mt-2">Manage your profile, preferences, and security.</p>
      </div>

      <ProfileClient 
        initialName={profile?.first_name || ''} 
        initialCurrency={profile?.currency || '$'} 
        email={user.email || ''} 
      />
    </div>
  )
}