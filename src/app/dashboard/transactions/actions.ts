'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/utils/supabase/server'

export async function createTransaction(formData: FormData) {
  const supabase = await createClient()
  
  // 1. Get the authenticated user
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) throw new Error('User not authenticated')

  // 2. Extract form data
  const amount = parseFloat(formData.get('amount') as string)
  const description = formData.get('description') as string
  const transaction_date = formData.get('transaction_date') as string
  const category_id = formData.get('category_id') as string

  // 3. Insert the transaction securely
  const { error: transactionError } = await supabase
    .from('transactions')
    .insert([{ 
      user_id: user.id,
      category_id,
      amount,
      description,
      transaction_date
    }])

  if (transactionError) throw new Error(transactionError.message)

  // 4. Refresh the page instantly
  revalidatePath('/dashboard/transactions')
  revalidatePath('/dashboard/budgets') // Also refresh budgets so progress bars update later!
}

export async function deleteTransaction(formData: FormData) {
  const supabase = await createClient()
  
  // Extract the ID from the hidden form input
  const id = formData.get('id') as string

  // Delete the specific transaction securely
  const { error } = await supabase
    .from('transactions')
    .delete()
    .eq('id', id)

  if (error) throw new Error(error.message)

  // Refresh all dashboard pages so the totals and progress bars instantly update
  revalidatePath('/dashboard/transactions')
  revalidatePath('/dashboard/budgets')
  revalidatePath('/dashboard')
}