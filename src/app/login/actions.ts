'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createClient } from '@/utils/supabase/server'

export async function login(formData: FormData) {
  const supabase = await createClient()
  
  const email = formData.get('email') as string
  const password = formData.get('password') as string

  const { error } = await supabase.auth.signInWithPassword({ email, password })

  if (error) {
    redirect(`/login?error=${encodeURIComponent(error.message)}`)
  }

  revalidatePath('/', 'layout')
  redirect('/dashboard') // <--- Fixed: Route to dashboard after normal logins
}

export async function signup(formData: FormData) {
  const supabase = await createClient()
  
  const email = formData.get('email') as string
  const password = formData.get('password') as string
  const first_name = formData.get('first_name') as string

  // 1. Create the account (This triggers the confirmation email)
  const { error: signUpError } = await supabase.auth.signUp({
    email,
    password,
    options: { data: { first_name } }
  })

  if (signUpError) {
    redirect(`/login?error=${encodeURIComponent(signUpError.message)}`)
  }

  // 2. Do NOT log them in. Redirect back with a success message.
  redirect('/login?message=Check your email to confirm your account.')
}