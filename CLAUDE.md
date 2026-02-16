# ExitLayer Platform — Agent Handoff Document

> Last updated: Feb 15, 2026. Platform is LIVE at www.exitlayer.io.

## What This Is

ExitLayer is a B2B SaaS funnel that helps agency owners discover their business valuation and exit readiness. The product is a free assessment (quiz) that scores their business, then routes qualified leads to book a $20K consulting engagement via Cal.com.

## Tech Stack

- **Framework:** Next.js 15 (App Router)
- **Database:** Supabase (Postgres + Auth + Storage)
- **Styling:** Tailwind CSS v4
- **Hosting:** Vercel (manual deploy via `vercel --prod`)
- **Payments:** Whop (`@whop/sdk` + `@whop/checkout`)
- **Booking:** Cal.com (`cal.com/exit-layer/30min`)
- **CRM:** GoHighLevel (inbound webhook for lead capture)
- **Domain:** `www.exitlayer.io`

## The Funnel (Critical Path)

```
Facebook/X Ad
  → Landing Page (/)
    → Free Quiz (/questionnaire) — 17 questions, ~2 min
      → Instant Results (inline on questionnaire page)
        → Stage 0 (DQ: <$300K or solo): /free-guide
        → Stage 1-2 (Qualified): cal.com/exit-layer/30min
        → Stage 3 (High-value): cal.com/exit-layer/30min
          → Discovery Call (paid $20K on call)
            → Account creation (/create-account?token=xxx)
              → Dashboard, Full Audit, Assets, Roadmap
```

**Key rule:** Users CANNOT access protected content without paying. Account creation only happens post-payment. The `/create-account` page requires a valid session token and is not linked anywhere in the public funnel.

## Route Architecture

### Public Routes (no auth required)
| Route | Purpose |
|-------|---------|
| `/` | Landing page — "Don't Spend Another Year Building Something You Can't Sell" |
| `/questionnaire` | 17-question assessment with inline results |
| `/free-guide` | DQ'd users (<$300K or solo) get free resource page |
| `/upgrade` | "Book a Call" page — links to cal.com/exit-layer/30min |
| `/checkout` | Whop payment embed (used post-call) |
| `/login` | Email/password login |
| `/join-xl-9f7k2m` | Signup page (obfuscated URL) |
| `/create-account` | Post-payment account creation (requires session token) |
| `/forgot-password` | Password reset request |
| `/reset-password` | Password reset form |
| `/resume` | Resume interrupted quiz via email |
| `/platform-demo` | Demo of Skills Platform (static, for marketing) |

### Protected Routes (require auth + `access_tier: 'paid'`)
| Route | Purpose |
|-------|---------|
| `/dashboard` | Client dashboard — score summary, next steps |
| `/assets` | Document upload (P&L, SOP, Org Chart, Client List) |
| `/full-audit` | Deep-dive audit (50+ questions) |
| `/full-audit/results` | Full audit results page |
| `/schedule` | Book kickoff call — links to cal.com |

### Admin Routes (require `is_admin: true`)
| Route | Purpose |
|-------|---------|
| `/admin` | Admin dashboard |
| `/admin/clients` | Client list |
| `/admin/clients/[id]` | Individual client view (scores, call prep, system spec) |

### Platform Routes (DISABLED — `ENABLE_PLATFORM_APP=false`)
The `(platform)` route group contains a Skills/Automation platform that is NOT launched. It's gated by `ENABLE_PLATFORM_APP` env var in `app/(platform)/layout.tsx`. When disabled, all platform routes redirect to `/platform-demo`.

Routes: `/activity`, `/approvals`, `/triggers`, `/skills`, `/history`, `/settings`

## Database (Supabase)

**Project:** `grjlfcscmgbkxyldajxt` (East US)

### Core Tables
| Table | Purpose |
|-------|---------|
| `audit_sessions` | The source of truth for all user data. Stores quiz answers, scores, generated content, document uploads, stage progression |
| `submissions` | Mirror of audit_sessions for admin views. Populated by data bridge in link-account API |
| `profiles` | User profiles with auth. Key fields: `is_admin`, `access_tier` ('free'/'paid'), `whop_user_id`, `whop_membership_id`, `paid_at` |
| `admin_notes` | Admin notes on clients |
| `api_keys` | API keys for platform integrations |

### Key Fields on `audit_sessions`
- `session_token` — unique identifier for anonymous sessions
- `status` — `in_progress` → `submitted` → `account_created`
- `form_data` — JSONB of all quiz answers
- `overall_score` — 0-100 ExitLayer score
- `score_data` — JSONB with dimension scores + financial metrics
- `generated_content` — JSONB with ALL generated docs (diagnostic report, system spec, call prep, skills catalog, build plan)
- `documents_uploaded` — array of uploaded doc categories for stage tracking
- `full_audit_status` — `not_started` / `in_progress` / `completed`
- `full_audit_data` — JSONB of deep audit answers

### Data Bridge
When a user creates an account after paying, the `link-account` API:
1. Links the anonymous `audit_session` to their `user_id`
2. Creates a `submissions` row mirroring key data for admin views
3. This is the ONLY way submissions get populated

### RLS Policies (Hardened Feb 12, 2026)
- Profiles: Users can only update non-sensitive fields (can't escalate `is_admin`, `access_tier`, `whop_*`, `paid_at`)
- Audit sessions: No anonymous broad read/write. Users see own, admins see all
- All quiz API routes use `createServiceClient()` (bypasses RLS) because quiz takers are anonymous

### Running SQL
No `psql` in PATH. Use Supabase Management API:
```bash
curl -s -X POST "https://api.supabase.com/v1/projects/grjlfcscmgbkxyldajxt/database/query" \
  -H "Authorization: Bearer $SUPABASE_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"query": "SELECT count(*) FROM audit_sessions"}'
```
Token is in macOS keychain under "Supabase CLI".

## API Routes

### Quiz Flow APIs (all use service client, all have rate limiting + zod validation)
| Route | Method | Purpose |
|-------|--------|---------|
| `/api/audit-session` | POST | Create new quiz session (or resume existing). Fires GHL webhook on creation |
| `/api/audit-session/save` | PUT | Auto-save quiz progress |
| `/api/audit-session/load` | GET | Load session by token |
| `/api/audit-session/resume` | POST | Send resume link via email |
| `/api/audit-session/link-account` | POST | Data bridge: link session to user, create submissions row |
| `/api/submit` | POST | Submit completed quiz. Calculates scores, generates all content, fires GHL webhook |

### Other APIs
| Route | Method | Purpose |
|-------|--------|---------|
| `/api/auth/callback` | GET | Supabase auth callback |
| `/api/auth/signout` | POST | Sign out |
| `/api/full-audit` | POST | Start full audit |
| `/api/full-audit/load` | GET | Load full audit progress |
| `/api/full-audit/save` | PUT | Save full audit progress |
| `/api/full-audit/submit` | POST | Submit full audit, sync to submissions |
| `/api/portal/[clientId]` | GET | Load client data for portal view |
| `/api/webhooks/whop` | POST | Whop payment webhook handler |

## Scoring System (Algorithmic — No AI)

All scoring is deterministic, computed in these files:
- `lib/score-calculator.ts` — ExitLayer Score (0-100) across 5 dimensions: Leverage, Equity Potential, Revenue Risk, Product Readiness, Implementation Capacity
- `lib/diagnostic-report.ts` — Text-based diagnostic from scores
- `lib/system-spec-generator.ts` — Automation system recommendations
- `lib/call-prep-generator.ts` — Call prep doc for Michael's sales calls
- `lib/skill-generator.ts` — Skills catalog for automation platform

### Stage Routing (in QuestionnaireForm.tsx results section)
- **Stage 0:** Score < 20, OR revenue < $300K, OR solo operator → DQ → `/free-guide`
- **Stage 1:** Score 20-39 → Qualified → `cal.com/exit-layer/30min`
- **Stage 2:** Score 40-69 → Qualified → `cal.com/exit-layer/30min`
- **Stage 3:** Score 70+ → High-value → `cal.com/exit-layer/30min` (same link, tagged internally as Darwin candidates)

## GHL Integration

**Webhook URL:** Set in `GHL_WEBHOOK_URL` env var on Vercel.

Two webhook fires:
1. **Quiz start** (`source: exitlayer_audit_start`) — fires when user enters name/email/company. Captures partial leads even if they don't finish.
2. **Quiz complete** (`source: exitlayer_audit`) — fires on submission with full payload:

```json
{
  "full_name": "...",
  "email": "...",
  "company_name": "...",
  "score": 62,
  "stage": 2,
  "valuation_current": 450000,
  "valuation_potential": 1800000,
  "source": "exitlayer_audit",
  "submitted_at": "2026-02-15T..."
}
```

Both are fire-and-forget (non-blocking). If GHL is down, the quiz still works — data is always saved to Supabase first.

## Environment Variables (Vercel Production)

| Variable | Purpose |
|----------|---------|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase anonymous key |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase service role key (bypasses RLS) |
| `NEXT_PUBLIC_APP_URL` | `https://www.exitlayer.io` |
| `NEXT_PUBLIC_WHOP_PLAN_ID` | Whop plan for checkout |
| `WHOP_API_KEY` | Whop API key |
| `WHOP_WEBHOOK_SECRET` | Whop webhook verification |
| `ADMIN_EMAILS` | Comma-separated admin emails |
| `ENCRYPTION_KEY` | General encryption key |
| `ENABLE_PLATFORM_APP` | `false` — gates platform routes |
| `GHL_WEBHOOK_URL` | GoHighLevel inbound webhook |

**Important:** When adding env vars via CLI, always use `echo -n` to avoid trailing newlines:
```bash
echo -n "value" | vercel env add VAR_NAME production
```

## Deployment

Auto-deploy is NOT connected. Deploy manually:
```bash
cd /Users/darwin/projects/exitlayer-platform
vercel --prod
```

## Security (Hardened Feb 12-15, 2026)

- **Rate limiting** on all API routes (`lib/rate-limit.ts`) — in-memory token bucket
- **Input validation** via zod schemas on all API routes
- **Session token validation** (`lib/security.ts` → `isValidSessionToken`)
- **Email normalization** prevents case/whitespace bypass
- **Redirect sanitization** prevents open redirect attacks
- **Security headers** on all responses: X-Frame-Options DENY, X-Content-Type-Options nosniff, Referrer-Policy, Permissions-Policy, HSTS
- **RLS hardened** — no privilege escalation on profiles, no anonymous broad access on audit_sessions
- **Service client** used only server-side for anonymous quiz operations

Migration applied to production: `supabase/migrations/20260212_harden_security_policies.sql`

## Design System

- **Background:** `#f8f8f6` (warm off-white)
- **Borders:** `#e5e5e5`
- **Text:** `#1a1a1a` (primary), `#666` (muted), `#999` (light)
- **Accent:** `emerald-900` / `emerald-800`
- **Cards:** White bg, `rounded-xl`, `border border-[#e5e5e5]`
- **Headings:** Serif font
- **Body:** Sans-serif font
- **Buttons:** `rounded-full`, emerald-900 bg

## File Map

### Core Application Files
| File | Purpose |
|------|---------|
| `app/page.tsx` | Landing page |
| `components/QuestionnaireForm.tsx` | The entire quiz + results UI (~1900 lines) |
| `middleware.ts` | Auth gating, public route allowlist, security headers |
| `app/(protected)/layout.tsx` | Payment gate — checks `access_tier`, redirects free users to `/upgrade` |
| `app/(platform)/layout.tsx` | Platform gate — checks `ENABLE_PLATFORM_APP` env var |

### API Files
| File | Purpose |
|------|---------|
| `app/api/audit-session/route.ts` | Create session + GHL webhook |
| `app/api/audit-session/save/route.ts` | Auto-save progress |
| `app/api/audit-session/load/route.ts` | Load session by token |
| `app/api/audit-session/link-account/route.ts` | Data bridge (critical) |
| `app/api/submit/route.ts` | Score calculation + content generation + GHL webhook |
| `app/api/full-audit/submit/route.ts` | Full audit sync to submissions |
| `app/api/webhooks/whop/route.ts` | Payment webhook |

### Scoring / Generation
| File | Purpose |
|------|---------|
| `lib/score-calculator.ts` | ExitLayer Score algorithm |
| `lib/diagnostic-report.ts` | Diagnostic report generator |
| `lib/system-spec-generator.ts` | Automation system spec |
| `lib/call-prep-generator.ts` | Sales call prep document |
| `lib/skill-generator.ts` | Skills catalog |
| `lib/stage-utils.ts` | Stage progression + required documents |
| `lib/questions.ts` | Quiz question definitions |

### Security / Utils
| File | Purpose |
|------|---------|
| `lib/security.ts` | Token validation, email normalization, redirect sanitization, IP extraction |
| `lib/rate-limit.ts` | In-memory rate limiter |
| `lib/whop.ts` | Whop SDK client helpers |
| `lib/supabase/server.ts` | Server-side Supabase client (respects RLS) |
| `lib/supabase/service.ts` | Service role client (bypasses RLS) |
| `lib/supabase/client.ts` | Browser-side Supabase client |
| `lib/supabase/middleware.ts` | Supabase session refresh middleware |

## What's Built and Working

1. Full quiz funnel: landing → 17 questions → instant scoring → stage-based routing
2. All booking CTAs route to `cal.com/exit-layer/30min`
3. DQ'd users route to `/free-guide`
4. GHL webhook fires on quiz start AND completion
5. Account creation gated behind session token (post-payment only)
6. Protected content gated behind `access_tier: 'paid'`
7. Admin panel with client list, scores, call prep, system specs
8. Document upload (assets page) with 4 required categories
9. Full audit (deep dive questionnaire)
10. Whop checkout integration
11. Security hardening (rate limiting, validation, RLS, headers)
12. Data bridge: audit_sessions → submissions on account linking

## What's NOT Built / Left To Do

### Immediate (Post-Launch)
- **Free guide PDF:** `/free-guide` page exists but shows placeholder. Need actual PDF resource for download
- **GHL automations:** Webhook is firing contacts into GHL. Need to build nurture sequences, pipeline stages, and follow-up workflows inside GHL
- **Email deliverability:** Using default Supabase SMTP. Consider custom SMTP domain for better inbox placement
- **Resume email:** The `/api/audit-session/resume` route builds a resume URL but the actual email sending is a TODO (logged to console)

### Future
- **Platform (Skills/Automation):** Entire `(platform)` route group is built as UI but has no real backend. Gated by `ENABLE_PLATFORM_APP=false`. Don't enable until APIs are implemented
- **Darwin Group:** Currently all qualified leads go to same cal.com link. When ready, create separate `cal.com/exit-layer/darwin-group` event type and update Stage 3 CTA in `QuestionnaireForm.tsx` (line ~1372)
- **Whop plan verification:** Plan ID `plan_5y7Rqe58INz2g` is set but should be verified as Michael's real production plan
- **Client portal:** `/portal/[clientId]` exists but isn't linked from anywhere in the active funnel

## Archived Code

`app/_archived/` contains old versions of:
- Landing pages (v1-v3)
- Results pages (v1-v6)
- Dashboard preview
- Results preview
- Insight page experiments
- Demo pages

These are NOT active. Safe to ignore. Do NOT delete — they contain design reference and prior iterations.

## Common Operations

### Deploy to production
```bash
vercel --prod
```

### Add env var
```bash
echo -n "value" | vercel env add VAR_NAME production
vercel --prod  # must redeploy for new env var
```

### Run SQL on production
```bash
curl -s -X POST "https://api.supabase.com/v1/projects/grjlfcscmgbkxyldajxt/database/query" \
  -H "Authorization: Bearer $SUPABASE_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"query": "YOUR SQL HERE"}'
```

### Check production logs
```bash
vercel inspect <deployment-url> --logs
```
