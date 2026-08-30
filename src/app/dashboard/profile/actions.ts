'use server'

import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'

export async function updateProfileData(firstName: string, currency: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) throw new Error('Not authenticated')

  const { error } = await supabase
    .from('profiles')
    .update({ first_name: firstName, currency })
    .eq('id', user.id)

  if (error) throw new Error(error.message)
  
  revalidatePath('/', 'layout')
  return { success: true }
}

export async function updatePasswordData(oldPassword: string, newPassword: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user || !user.email) throw new Error('Not authenticated')

  // 1. Verify old password by attempting to sign in
  const { error: signInError } = await supabase.auth.signInWithPassword({
    email: user.email,
    password: oldPassword
  })

  if (signInError) throw new Error('Incorrect current password.')

  // 2. Update to new password
  const { error: updateError } = await supabase.auth.updateUser({
    password: newPassword
  })

  if (updateError) throw new Error(updateError.message)

  return { success: true }
}