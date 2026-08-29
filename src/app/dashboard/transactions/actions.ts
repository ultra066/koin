'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/utils/supabase/server'

export async function createTransaction(formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Not authenticated')

  const amount = parseFloat(formData.get('amount') as string)
  const description = formData.get('description') as string
  const transaction_date = formData.get('transaction_date') as string
  const category_id = formData.get('category_id') as string

  await supabase.from('transactions').insert([{
    user_id: user.id,
    amount,
    description,
    transaction_date,
    category_id
  }])

  // Revalidate everything since transactions affect all dashboards
  revalidatePath('/dashboard/transactions')
  revalidatePath('/dashboard/budgets')
  revalidatePath('/dashboard')
}

export async function deleteTransaction(formData: FormData) {
  const supabase = await createClient()
  const id = formData.get('id') as string

  await supabase.from('transactions').delete().eq('id', id)
  
  revalidatePath('/dashboard/transactions')
  revalidatePath('/dashboard/budgets')
  revalidatePath('/dashboard')
}