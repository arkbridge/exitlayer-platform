'use server'

import { createClient } from '@/lib/supabase/server'
import { sanitizeInternalRedirect } from '@/lib/security'
import { redirect } from 'next/navigation'

export async function login(formData: FormData) {
  const supabase = await createClient()

  const email = formData.get('email') as string
  const password = formData.get('password') as string
  const redirectTo = sanitizeInternalRedirect(formData.get('redirectTo') as string | null, '/dashboard')

  const { error, data } = await supabase.auth.signInWithPassword({
    email,
    password,
  })

  if (error) {
    return { error: error.message }
  }

  // Server-side profile check - session is guaranteed valid here
  const { data: profile } = await supabase
    .from('profiles')
    .select('is_admin')
    .eq('id', data.user.id)
    .single()

  // Determine final redirect
  let finalRedirect = redirectTo
  if (profile?.is_admin && redirectTo === '/dashboard') {
    finalRedirect = '/admin'
  }

  redirect(finalRedirect)
}
