interface Bucket {
  count: number
  resetAt: number
}

interface RateLimitOptions {
  windowMs: number
  max: number
}

export interface RateLimitResult {
  allowed: boolean
  remaining: number
  retryAfterSeconds: number
  resetAt: number
}

const buckets = new Map<string, Bucket>()
const MAX_BUCKETS = 10_000

function cleanupBuckets(now: number) {
  if (buckets.size <= MAX_BUCKETS) return

  for (const [key, bucket] of buckets.entries()) {
    if (bucket.resetAt <= now) {
      buckets.delete(key)
    }
  }
}

export function checkRateLimit(key: string, options: RateLimitOptions): RateLimitResult {
  const now = Date.now()
  cleanupBuckets(now)

  const existing = buckets.get(key)
  if (!existing || existing.resetAt <= now) {
    const resetAt = now + options.windowMs
    buckets.set(key, { count: 1, resetAt })
    return {
      allowed: true,
      remaining: Math.max(0, options.max - 1),
      retryAfterSeconds: Math.ceil(options.windowMs / 1000),
      resetAt,
    }
  }

  const nextCount = existing.count + 1
  existing.count = nextCount
  buckets.set(key, existing)

  const remaining = Math.max(0, options.max - nextCount)
  const retryAfterSeconds = Math.max(1, Math.ceil((existing.resetAt - now) / 1000))
  const allowed = nextCount <= options.max

  return {
    allowed,
    remaining,
    retryAfterSeconds,
    resetAt: existing.resetAt,
  }
}

export function getRateLimitHeaders(result: RateLimitResult, limit: number): HeadersInit {
  return {
    'X-RateLimit-Limit': String(limit),
    'X-RateLimit-Remaining': String(result.remaining),
    'X-RateLimit-Reset': String(Math.floor(result.resetAt / 1000)),
    ...(result.allowed ? {} : { 'Retry-After': String(result.retryAfterSeconds) }),
  }
}
