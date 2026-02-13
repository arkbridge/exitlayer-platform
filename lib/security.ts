const SESSION_TOKEN_REGEX = /^[a-f0-9]{64}$/i
const UUID_REGEX =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i

export function sanitizeInternalRedirect(
  input: string | null | undefined,
  fallback = '/dashboard'
): string {
  if (!input) return fallback

  const value = input.trim()
  if (!value.startsWith('/') || value.startsWith('//')) return fallback
  if (/[\r\n\\]/.test(value)) return fallback

  try {
    const parsed = new URL(value, 'http://localhost')
    if (parsed.origin !== 'http://localhost') return fallback
    return `${parsed.pathname}${parsed.search}${parsed.hash}` || fallback
  } catch {
    return fallback
  }
}

export function normalizeEmail(email: string | null | undefined): string {
  return email?.trim().toLowerCase() || ''
}

export function isValidSessionToken(token: string | null | undefined): token is string {
  return !!token && SESSION_TOKEN_REGEX.test(token)
}

export function isUuid(value: string): boolean {
  return UUID_REGEX.test(value)
}

export function getClientIp(headers: Headers): string {
  const forwarded = headers.get('x-forwarded-for')?.split(',')[0]?.trim()
  if (forwarded) return forwarded

  const realIp = headers.get('x-real-ip')?.trim()
  if (realIp) return realIp

  return 'unknown'
}

export function getAppBaseUrl(defaultOrigin: string): string {
  const configured = process.env.NEXT_PUBLIC_APP_URL?.trim()
  if (!configured) return defaultOrigin

  try {
    const parsed = new URL(configured)
    return parsed.origin
  } catch {
    return defaultOrigin
  }
}
