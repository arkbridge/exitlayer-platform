'use server'

import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

const ADMIN_EMAILS = (process.env.ADMIN_EMAILS || 'michael@exitlayer.io').split(',').map(e => e.trim().toLowerCase())

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

  // Verify this user is an admin by email
  // (RLS timing issues prevent reliable profile query immediately after login)
  const userEmail = data.user.email?.toLowerCase()
  const isAdmin = ADMIN_EMAILS.some(admin => admin.toLowerCase() === userEmail)

  if (!isAdmin) {
    // Sign them out if not admin
    await supabase.auth.signOut()
    return { error: 'Access denied. Admin privileges required.' }
  }

  // Admin verified - redirect to admin dashboard
  redirect('/admin')
}
