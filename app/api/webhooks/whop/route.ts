import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/service'
import { getWhopWebhookClient } from '@/lib/whop'

export async function POST(request: NextRequest) {
  try {
    const whop = getWhopWebhookClient()
    const body = await request.text()
    const headers = Object.fromEntries(request.headers)

    // Verify and unwrap the webhook
    let webhookData: { action: string; data: Record<string, unknown> }
    try {
      const unwrapped = whop.webhooks.unwrap(body, { headers })
      webhookData = unwrapped as unknown as { action: string; data: Record<string, unknown> }
    } catch (err) {
      console.error('Webhook verification failed:', err)
      return NextResponse.json({ error: 'Invalid webhook signature' }, { status: 401 })
    }

    const supabase = createServiceClient()

    switch (webhookData.action) {
      case 'payment_succeeded': {
        const data = webhookData.data as {
          user_id: string
          membership_id: string
          product_id: string
        }

        // Find profile by whop_user_id and mark as paid
        const { error } = await supabase
          .from('profiles')
          .update({
            access_tier: 'paid',
            whop_membership_id: data.membership_id,
            paid_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          })
          .eq('whop_user_id', data.user_id)

        if (error) {
          console.error('Failed to update profile on payment:', error)
        } else {
          console.log(`Payment succeeded for whop user ${data.user_id}`)
        }
        break
      }

      case 'membership_activated': {
        const data = webhookData.data as {
          user_id: string
          id: string
        }

        const { error } = await supabase
          .from('profiles')
          .update({
            access_tier: 'paid',
            whop_membership_id: data.id,
            updated_at: new Date().toISOString(),
          })
          .eq('whop_user_id', data.user_id)

        if (error) {
          console.error('Failed to update profile on membership activated:', error)
        } else {
          console.log(`Membership activated for whop user ${data.user_id}`)
        }
        break
      }

      case 'membership_deactivated': {
        const data = webhookData.data as {
          user_id: string
        }

        const { error } = await supabase
          .from('profiles')
          .update({
            access_tier: 'free',
            updated_at: new Date().toISOString(),
          })
          .eq('whop_user_id', data.user_id)

        if (error) {
          console.error('Failed to update profile on membership deactivated:', error)
        } else {
          console.log(`Membership deactivated for whop user ${data.user_id}`)
        }
        break
      }

      default:
        console.log(`Unhandled webhook event: ${webhookData.action}`)
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Webhook handler error:', error)
    return NextResponse.json({ error: 'Internal error' }, { status: 500 })
  }
}
