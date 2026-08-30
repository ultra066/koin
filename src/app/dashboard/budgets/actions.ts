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

  // 1. Insert Category with error tracking
  const { data: category, error: categoryError } = await supabase
    .from('categories')
    .insert([{ name, type: 'expense', group_type, user_id: user.id }])
    .select()
    .single()

  if (categoryError) {
    console.error('Category Error:', categoryError.message)
    throw new Error(`Failed to create category: ${categoryError.message}`)
  }

  const currentMonth = new Date().toISOString().slice(0, 7) + '-01'
  
  // 2. Insert Monthly Budget with error tracking
  if (category) {
    const { error: budgetError } = await supabase
      .from('monthly_budgets')
      .insert([{ category_id: category.id, allocated_amount: amount, period_start: currentMonth, user_id: user.id }])

    if (budgetError) {
      console.error('Budget Error:', budgetError.message)
      throw new Error(`Failed to create budget: ${budgetError.message}`)
    }
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

export async function updateBudgetStrategy(formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Not authenticated')

  const needs = parseInt(formData.get('needs_target') as string)
  const wants = parseInt(formData.get('wants_target') as string)
  const savings = parseInt(formData.get('savings_target') as string)

  if (needs + wants + savings !== 100) {
    throw new Error('Targets must equal exactly 100%')
  }

  const { error } = await supabase
    .from('user_settings')
    .upsert({ 
      user_id: user.id, 
      needs_target: needs, 
      wants_target: wants, 
      savings_target: savings,
      updated_at: new Date().toISOString()
    })

  if (error) throw new Error(error.message)
  
  revalidatePath('/dashboard')
  revalidatePath('/dashboard/budgets')
}