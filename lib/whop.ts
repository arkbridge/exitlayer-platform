import { Whop } from '@whop/sdk'

let _whopClient: InstanceType<typeof Whop> | null = null

export function getWhopClient() {
  if (!_whopClient) {
    const apiKey = process.env.WHOP_API_KEY
    if (!apiKey) {
      throw new Error('Missing WHOP_API_KEY environment variable')
    }

    _whopClient = new Whop({
      apiKey,
    })
  }
  return _whopClient
}

export function getWhopWebhookClient() {
  const apiKey = process.env.WHOP_API_KEY
  const webhookSecret = process.env.WHOP_WEBHOOK_SECRET

  if (!apiKey || !webhookSecret) {
    throw new Error('Missing WHOP_API_KEY or WHOP_WEBHOOK_SECRET')
  }

  return new Whop({
    apiKey,
    webhookKey: btoa(webhookSecret),
  })
}

export const WHOP_PRODUCT_ID = process.env.WHOP_PRODUCT_ID || ''
