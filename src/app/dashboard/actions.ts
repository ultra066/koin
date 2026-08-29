'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/utils/supabase/server'

export async function createIncome(formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Not authenticated')

  const source_name = formData.get('source_name') as string
  const amount = parseFloat(formData.get('amount') as string)
  const schedule = formData.get('schedule') as string
  const pay_date = new Date().toISOString().split('T')[0] // Defaults to today since schedule dictates frequency

  await supabase
    .from('incomes')
    .insert([{ user_id: user.id, source_name, amount, pay_date, schedule }])

  revalidatePath('/dashboard')
}

export async function deleteIncome(id: string) {
  const supabase = await createClient()
  await supabase.from('incomes').delete().eq('id', id)
  revalidatePath('/dashboard')
}