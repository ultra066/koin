'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/utils/supabase/server'

export async function createBudget(formData: FormData) {
  const supabase = await createClient()
  
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) throw new Error('User not authenticated')

  const name = formData.get('name') as string
  const group_type = formData.get('group_type') as string // 'needs', 'wants', or 'savings'
  const amount = parseFloat(formData.get('amount') as string)

  const { data: category, error: categoryError } = await supabase
    .from('categories')
    .insert([{ 
      name, 
      type: 'expense',
      group_type,
      user_id: user.id
    }])
    .select()
    .single()

  if (categoryError) throw new Error(categoryError.message)

  const currentMonth = new Date().toISOString().slice(0, 7) + '-01'
  const { error: budgetError } = await supabase
    .from('monthly_budgets')
    .insert([{ 
      category_id: category.id, 
      allocated_amount: amount,
      period_start: currentMonth,
      user_id: user.id
    }])

  if (budgetError) throw new Error(budgetError.message)

  revalidatePath('/dashboard/budgets')
}

export async function deleteBudget(formData: FormData) {
  const supabase = await createClient()
  
  const id = formData.get('id') as string

  // Deleting the category will automatically remove its associated budget limit
  const { error } = await supabase
    .from('categories')
    .delete()
    .eq('id', id)

  if (error) throw new Error(error.message)

  revalidatePath('/dashboard/budgets')
  revalidatePath('/dashboard/transactions')
  revalidatePath('/dashboard')
}