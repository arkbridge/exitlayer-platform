'use server'

import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

export async function adminLogin(formData: FormData) {
  const supabase = await createClient()

  const email = formData.get('email') as string
  const password = formData.get('password') as string

  const { error, data } = await supabase.auth.signInWithPassword({
    email,
    password,
  })

  if (error) {
    return { error: error.message }
  }

  // Verify this user is actually an admin
  const { data: profile } = await supabase
    .from('profiles')
    .select('is_admin')
    .eq('id', data.user.id)
    .single()

  if (!profile?.is_admin) {
    // Sign them out if not admin
    await supabase.auth.signOut()
    return { error: 'Access denied. Admin privileges required.' }
  }

  // Admin verified - redirect to admin dashboard
  redirect('/admin')
}
