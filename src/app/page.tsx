import { redirect } from 'next/navigation'
import { createClient } from '@/utils/supabase/server'

export default async function Home() {
  const supabase = await createClient()
  
  // Check if the user has an active session
  const { data: { user } } = await supabase.auth.getUser()

  // Route them to the correct app area
  if (user) {
    redirect('/dashboard')
  } else {
    redirect('/login')
  }
}