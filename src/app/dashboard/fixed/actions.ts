'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/utils/supabase/server'

export async function createFixedCommitment(formData: FormData) {
  const supabase = await createClient()
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) throw new Error('User not authenticated')

  const name = formData.get('name') as string
  const amount = parseFloat(formData.get('amount') as string)
  const frequency = formData.get('frequency') as string

  const { error } = await supabase
    .from('fixed_commitments')
    .insert([{ user_id: user.id, name, amount, frequency }])

  if (error) throw new Error(error.message)
  revalidatePath('/dashboard/fixed')
}

export async function deleteFixedCommitment(formData: FormData) {
  const supabase = await createClient()
  const id = formData.get('id') as string

  const { error } = await supabase
    .from('fixed_commitments')
    .delete()
    .eq('id', id)

  if (error) throw new Error(error.message)
  revalidatePath('/dashboard/fixed')
}