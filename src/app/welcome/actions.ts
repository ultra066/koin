'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createClient } from '@/utils/supabase/server'

export async function completeOnboarding(formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) redirect('/login')

  const currency = formData.get('currency') as string

  const { error } = await supabase
    .from('profiles')
    .update({ currency })
    .eq('id', user.id)

  if (error) {
    console.error("Supabase Error:", error)
    throw new Error(`Database Error: ${error.message}`)
  }

  revalidatePath('/', 'layout')
  redirect('/dashboard')
}