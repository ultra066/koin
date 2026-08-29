'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/utils/supabase/server'

// Flexible Budget Actions
export async function createBudget(formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Not authenticated')

  const name = formData.get('name') as string
  const group_type = formData.get('group_type') as string
  const amount = parseFloat(formData.get('amount') as string)

  const { data: category } = await supabase.from('categories').insert([{ name, type: 'expense', group_type, user_id: user.id }]).select().single()
  const currentMonth = new Date().toISOString().slice(0, 7) + '-01'
  
  if (category) {
    await supabase.from('monthly_budgets').insert([{ category_id: category.id, allocated_amount: amount, period_start: currentMonth, user_id: user.id }])
  }
  revalidatePath('/dashboard/budgets')
}

export async function deleteBudget(formData: FormData) {
  const supabase = await createClient()
  await supabase.from('categories').delete().eq('id', formData.get('id'))
  revalidatePath('/dashboard/budgets')
}

// Fixed Cost Actions
export async function createFixedCommitment(formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return

  const name = formData.get('name') as string
  const amount = parseFloat(formData.get('amount') as string)
  const frequency = formData.get('frequency') as string

  await supabase.from('fixed_commitments').insert([{ user_id: user.id, name, amount, frequency }])
  revalidatePath('/dashboard/budgets')
}

export async function deleteFixedCommitment(formData: FormData) {
  const supabase = await createClient()
  await supabase.from('fixed_commitments').delete().eq('id', formData.get('id'))
  revalidatePath('/dashboard/budgets')
}