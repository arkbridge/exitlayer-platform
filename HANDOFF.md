# ExitLayer Platform - Complete Developer Handoff

## Table of Contents

1. [Project Overview](#1-project-overview)
2. [Architecture](#2-architecture)
3. [GitHub Setup](#3-github-setup)
4. [Supabase Setup](#4-supabase-setup)
5. [Vercel Setup](#5-vercel-setup)
6. [Local Development](#6-local-development)
7. [Project Structure](#7-project-structure)
8. [Routes Reference](#8-routes-reference)
9. [API Endpoints](#9-api-endpoints)
10. [Database Schema](#10-database-schema)
11. [Client Journey System](#11-client-journey-system)
12. [Scoring Algorithm](#12-scoring-algorithm)
13. [Skills Platform](#13-skills-platform)
14. [TypeScript Types](#14-typescript-types)
15. [UI Components](#15-ui-components)
16. [Security Considerations](#16-security-considerations)
17. [Common Issues & Troubleshooting](#17-common-issues--troubleshooting)
18. [Deployment Checklist](#18-deployment-checklist)

---

## 1. Project Overview

ExitLayer is a two-part SaaS platform for agency owners:

### Part 1: Assessment Tool
- **Short Questionnaire** - Quick assessment (~5 min)
- **Full Audit** - 74-question deep dive (~30 min)
- **Results Dashboard** - Score breakdown, insights, recommendations
- **Admin Panel** - Client management for ExitLayer team

### Part 2: Skills Platform (Post-Sprint Delivery)
- **Triggers** - Automated workflows based on events
- **Skills** - AI-powered capabilities (email drafting, summaries, etc.)
- **Approvals** - Human-in-the-loop review queue
- **Activity Feed** - Real-time execution log
- **Integrations** - Slack, HubSpot, Gmail connectors

### Tech Stack

| Layer | Technology |
|-------|------------|
| Framework | Next.js 15 (App Router) |
| Language | TypeScript |
| Styling | Tailwind CSS v4 |
| UI Components | Shadcn/ui (Radix primitives) |
| Auth | Supabase Auth |
| Database | Supabase (PostgreSQL) |
| Storage | Supabase Storage |
| AI | Anthropic Claude API |
| Hosting | Vercel |

---

## 2. Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                         FRONTEND                                 │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────────────────┐  │
│  │ Assessment  │  │   Admin     │  │   Skills Platform       │  │
│  │    Flow     │  │   Panel     │  │  (Triggers/Approvals)   │  │
│  └─────────────┘  └─────────────┘  └─────────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                      NEXT.JS API ROUTES                          │
│  /api/submit  /api/audit-session/*  /api/full-audit/*           │
└─────────────────────────────────────────────────────────────────┘
                              │
              ┌───────────────┼───────────────┐
              ▼               ▼               ▼
        ┌──────────┐   ┌──────────┐   ┌──────────┐
        │ Supabase │   │ Supabase │   │ Anthropic│
        │   Auth   │   │ Database │   │   API    │
        └──────────┘   └──────────┘   └──────────┘
```

---

## 3. GitHub Setup

### Create Repository

```bash
cd /path/to/exitlayer-platform
git init
git add .
git commit -m "Initial commit: ExitLayer Platform"

# Create repo on GitHub (github.com/new), then:
git remote add origin git@github.com:YOUR_ORG/exitlayer-platform.git
git branch -M main
git push -u origin main
```

### Branch Strategy

| Branch | Purpose | Deploys To |
|--------|---------|------------|
| `main` | Production | exitlayer.com |
| `develop` | Staging | staging.exitlayer.com |
| `feature/*` | Feature work | Preview URLs |

### Recommended GitHub Settings

1. **Branch Protection** (main):
   - Require pull request reviews
   - Require status checks to pass
   - No direct pushes

2. **Secrets** (for GitHub Actions if needed):
   - `SUPABASE_URL`
   - `SUPABASE_ANON_KEY`
   - `VERCEL_TOKEN`

---

## 4. Supabase Setup

### Create Project

1. Go to [supabase.com](https://supabase.com) → New Project
2. **Name:** `exitlayer-platform`
3. **Database Password:** Generate strong password (save it!)
4. **Region:** US East (or closest to users)

### Get Credentials

After creation, go to **Settings → API**:
- `Project URL` → `NEXT_PUBLIC_SUPABASE_URL`
- `anon public` key → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `service_role` key → `SUPABASE_SERVICE_ROLE_KEY`

### Run Database Schema

Go to **SQL Editor** and run the complete schema below:

```sql
-- ============================================
-- EXITLAYER DATABASE SCHEMA
-- Run this in Supabase SQL Editor
-- ============================================

-- Profiles (extends Supabase auth.users)
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  full_name TEXT,
  company_name TEXT,
  is_admin BOOLEAN DEFAULT FALSE,
  -- Whop payment fields (Current Implementation)
  whop_user_id TEXT UNIQUE,
  whop_membership_id TEXT,
  access_tier TEXT DEFAULT 'free',  -- 'free' = quiz only, 'paid' = full platform
  paid_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Submissions (questionnaire responses and analysis)
CREATE TABLE public.submissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  questionnaire_data JSONB NOT NULL,
  overall_score INTEGER,
  dimension_scores JSONB,
  analysis JSONB,
  recommendations JSONB,
  financial_metrics JSONB,
  call_prep JSONB,
  diagnostic_report TEXT,
  build_plan TEXT,
  system_spec JSONB,
  status TEXT DEFAULT 'submitted',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Pipeline stages (track client journey)
CREATE TABLE public.pipeline_stages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  submission_id UUID NOT NULL REFERENCES public.submissions(id) ON DELETE CASCADE,
  stage TEXT NOT NULL,
  notes TEXT,
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Client assets (uploaded files)
CREATE TABLE public.client_assets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  submission_id UUID NOT NULL REFERENCES public.submissions(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  file_name TEXT NOT NULL,
  file_type TEXT NOT NULL,
  file_size INTEGER NOT NULL,
  storage_path TEXT NOT NULL,
  category TEXT DEFAULT 'other',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Admin notes (internal notes on clients)
CREATE TABLE public.admin_notes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  submission_id UUID NOT NULL REFERENCES public.submissions(id) ON DELETE CASCADE,
  note_type TEXT,
  content TEXT NOT NULL,
  created_by UUID REFERENCES public.profiles(id),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Audit sessions (anonymous quiz progress + generated content)
CREATE TABLE public.audit_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  session_token TEXT UNIQUE,
  full_name TEXT,
  company_name TEXT,
  email TEXT,
  score_data JSONB,
  form_data JSONB,
  overall_score INTEGER,
  client_folder TEXT,
  status TEXT DEFAULT 'in_progress',
  full_audit_status TEXT DEFAULT 'not_started',
  full_audit_data JSONB,
  full_audit_current_question INTEGER DEFAULT 0,
  full_audit_started_at TIMESTAMPTZ,
  full_audit_completed_at TIMESTAMPTZ,
  client_stage TEXT DEFAULT 'new',
  sprint_data JSONB,
  documents_uploaded TEXT[],
  generated_content JSONB,
  submitted_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- SKILLS PLATFORM TABLES (for post-sprint)
-- ============================================

-- Organizations (for multi-tenant skills platform)
CREATE TABLE public.organizations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- User to Organization mapping
CREATE TABLE public.user_organizations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  role TEXT DEFAULT 'member',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, organization_id)
);

-- Platform connections (OAuth tokens for Slack, HubSpot, etc.)
CREATE TABLE public.connections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  platform TEXT NOT NULL,
  access_token_encrypted TEXT NOT NULL,
  refresh_token_encrypted TEXT,
  token_expires_at TIMESTAMPTZ,
  scopes TEXT[],
  metadata JSONB,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Skills (AI capabilities)
CREATE TABLE public.skills (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  slug TEXT NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  system_prompt TEXT NOT NULL,
  config JSONB DEFAULT '{}',
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(organization_id, slug)
);

-- Trigger rules
CREATE TABLE public.trigger_rules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  trigger_type TEXT NOT NULL,
  trigger_source TEXT NOT NULL,
  trigger_config JSONB,
  skill_id UUID NOT NULL REFERENCES public.skills(id) ON DELETE CASCADE,
  action_type TEXT DEFAULT 'approval',
  destination TEXT,
  destination_config JSONB,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Executions (skill runs)
CREATE TABLE public.executions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  trigger_rule_id UUID REFERENCES public.trigger_rules(id),
  skill_id UUID NOT NULL REFERENCES public.skills(id),
  trigger_event JSONB,
  context_gathered JSONB,
  skill_input JSONB,
  skill_output TEXT,
  status TEXT DEFAULT 'pending',
  action_taken TEXT,
  error TEXT,
  tokens_used INTEGER,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  completed_at TIMESTAMPTZ
);

-- Approval queue
CREATE TABLE public.approval_queue (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  execution_id UUID NOT NULL REFERENCES public.executions(id) ON DELETE CASCADE,
  draft_content TEXT NOT NULL,
  destination TEXT NOT NULL,
  destination_config JSONB,
  status TEXT DEFAULT 'pending',
  reviewed_by UUID REFERENCES public.profiles(id),
  reviewed_at TIMESTAMPTZ,
  final_content TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- TRIGGERS (Auto-create profile on signup)
-- ============================================

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, email, is_admin)
  VALUES (
    new.id,
    new.email,
    new.email = 'michael@exitlayer.io'
  );
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ============================================
-- ROW LEVEL SECURITY
-- ============================================

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pipeline_stages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.client_assets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admin_notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.connections ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.skills ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.trigger_rules ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.executions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.approval_queue ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "profiles_select" ON public.profiles FOR SELECT
  USING (auth.uid() = id OR (SELECT is_admin FROM public.profiles WHERE id = auth.uid()));

CREATE POLICY "profiles_update" ON public.profiles FOR UPDATE
  USING (auth.uid() = id);

-- Submissions policies
CREATE POLICY "submissions_select" ON public.submissions FOR SELECT
  USING (user_id = auth.uid() OR (SELECT is_admin FROM public.profiles WHERE id = auth.uid()));

CREATE POLICY "submissions_insert" ON public.submissions FOR INSERT
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "submissions_update" ON public.submissions FOR UPDATE
  USING ((SELECT is_admin FROM public.profiles WHERE id = auth.uid()));

-- Audit sessions policies
CREATE POLICY "audit_sessions_select" ON public.audit_sessions FOR SELECT
  USING (user_id = auth.uid() OR user_id IS NULL OR (SELECT is_admin FROM public.profiles WHERE id = auth.uid()));

CREATE POLICY "audit_sessions_insert" ON public.audit_sessions FOR INSERT
  WITH CHECK (true);

CREATE POLICY "audit_sessions_update" ON public.audit_sessions FOR UPDATE
  USING (user_id = auth.uid() OR user_id IS NULL);

-- Organization-based policies (for skills platform)
CREATE POLICY "org_member_select" ON public.organizations FOR SELECT
  USING (id IN (SELECT organization_id FROM public.user_organizations WHERE user_id = auth.uid()));

CREATE POLICY "skills_select" ON public.skills FOR SELECT
  USING (organization_id IN (SELECT organization_id FROM public.user_organizations WHERE user_id = auth.uid()));

CREATE POLICY "executions_select" ON public.executions FOR SELECT
  USING (organization_id IN (SELECT organization_id FROM public.user_organizations WHERE user_id = auth.uid()));

-- ============================================
-- STORAGE
-- ============================================

INSERT INTO storage.buckets (id, name, public) VALUES ('client-assets', 'client-assets', false);

CREATE POLICY "storage_upload" ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'client-assets' AND (storage.foldername(name))[1] = auth.uid()::text);

CREATE POLICY "storage_select" ON storage.objects FOR SELECT
  USING (bucket_id = 'client-assets' AND (
    (storage.foldername(name))[1] = auth.uid()::text
    OR (SELECT is_admin FROM public.profiles WHERE id = auth.uid())
  ));

-- ============================================
-- INDEXES
-- ============================================

CREATE INDEX idx_submissions_user_id ON public.submissions(user_id);
CREATE INDEX idx_submissions_status ON public.submissions(status);
CREATE INDEX idx_audit_sessions_user_id ON public.audit_sessions(user_id);
CREATE INDEX idx_audit_sessions_token ON public.audit_sessions(session_token);
CREATE INDEX idx_audit_sessions_email ON public.audit_sessions(email);
CREATE INDEX idx_profiles_whop_user_id ON public.profiles(whop_user_id);
CREATE INDEX idx_executions_org_id ON public.executions(organization_id);
CREATE INDEX idx_executions_status ON public.executions(status);
CREATE INDEX idx_approval_queue_org_id ON public.approval_queue(organization_id);
CREATE INDEX idx_approval_queue_status ON public.approval_queue(status);
```

### Auth Configuration

1. **Supabase Dashboard → Authentication → Providers**
   - Enable **Email/Password**
   - (Optional) Enable **Google OAuth**

2. **Supabase Dashboard → Authentication → URL Configuration**
   ```
   Site URL: https://exitlayer.com

   Redirect URLs:
   - https://exitlayer.com/api/auth/callback
   - https://staging.exitlayer.com/api/auth/callback
   - http://localhost:3000/api/auth/callback
   ```

3. **Email Templates** (optional customization):
   - Confirmation email
   - Password reset email

---

## 5. Vercel Setup

### Connect Repository

1. Go to [vercel.com](https://vercel.com) → **Add New Project**
2. Import your GitHub repository
3. Framework Preset: **Next.js** (auto-detected)

### Environment Variables

Add in **Vercel Dashboard → Settings → Environment Variables**:

| Variable | Description | Example |
|----------|-------------|---------|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase project URL | `https://abc123.supabase.co` |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase anon/public key | `eyJhbGciOiJIUzI1NiIs...` |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase service role key (server only) | `eyJhbGciOiJIUzI1NiIs...` |
| `ANTHROPIC_API_KEY` | Claude API key | `sk-ant-api03-...` |
| `ENCRYPTION_KEY` | 32-byte key for token encryption | `your-32-char-encryption-key!!!` |

**IMPORTANT:** Never prefix `SUPABASE_SERVICE_ROLE_KEY` with `NEXT_PUBLIC_`

### Build Settings

| Setting | Value |
|---------|-------|
| Build Command | `npm run build` |
| Output Directory | `.next` |
| Install Command | `npm install` |
| Node.js Version | 18.x or 20.x |

### Domain Configuration

1. **Vercel Dashboard → Settings → Domains**
2. Add custom domain: `exitlayer.com`
3. Add staging domain: `staging.exitlayer.com` (linked to `develop` branch)
4. Update Supabase Auth redirect URLs to match

---

## 6. Local Development

### Prerequisites

- Node.js 18+
- npm or yarn
- Git

### Clone & Install

```bash
git clone git@github.com:YOUR_ORG/exitlayer-platform.git
cd exitlayer-platform
npm install
```

### Environment File

Create `.env.local` in the project root:

```bash
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# Anthropic (for AI features)
ANTHROPIC_API_KEY=sk-ant-api03-...

# Encryption (generate a random 32-char string)
ENCRYPTION_KEY=your-32-character-encryption-key
```

### Run Development Server

```bash
npm run dev
```

Opens at [http://localhost:3000](http://localhost:3000)

### Useful Commands

```bash
npm run dev      # Start dev server
npm run build    # Production build
npm run start    # Start production server
npm run lint     # Run ESLint
npx tsc --noEmit # Type check without building
```

---

## 7. Project Structure

```
exitlayer-platform/
├── app/                          # Next.js App Router
│   ├── (auth)/                   # Auth pages (login, signup, etc.)
│   │   ├── login/
│   │   ├── forgot-password/
│   │   └── reset-password/
│   ├── (protected)/              # Requires authentication
│   │   ├── dashboard/            # User dashboard
│   │   ├── full-audit/           # 74-question audit
│   │   └── assets/               # Document uploads
│   ├── (platform)/               # Skills platform (authenticated)
│   │   ├── page.tsx              # Activity feed
│   │   ├── approvals/
│   │   ├── triggers/
│   │   ├── skills/
│   │   ├── history/
│   │   └── settings/
│   ├── platform-demo/            # Skills platform demo (public)
│   ├── admin/                    # Admin panel
│   │   ├── page.tsx              # Admin dashboard
│   │   └── clients/              # Client management
│   ├── api/                      # API routes
│   │   ├── auth/
│   │   ├── submit/
│   │   ├── audit-session/
│   │   └── full-audit/
│   ├── questionnaire/            # Public questionnaire
│   ├── dashboard-preview/        # Stage preview (demo)
│   ├── layout.tsx                # Root layout
│   ├── page.tsx                  # Landing page
│   └── globals.css               # Global styles
│
├── components/
│   ├── ui/                       # Shadcn UI components
│   │   ├── button.tsx
│   │   ├── card.tsx
│   │   ├── dialog.tsx
│   │   └── ...
│   ├── dashboard/                # Assessment dashboard components
│   │   ├── DimensionScores.tsx
│   │   ├── CriticalFindings.tsx
│   │   ├── QuickWins.tsx
│   │   └── ...
│   ├── platform/                 # Skills platform components
│   │   ├── sidebar.tsx
│   │   ├── header.tsx
│   │   ├── activity-feed.tsx
│   │   └── ...
│   └── settings/                 # Settings components
│
├── lib/
│   ├── supabase/                 # Supabase client configurations
│   │   ├── client.ts             # Browser client
│   │   ├── server.ts             # Server client
│   │   ├── service.ts            # Service role client
│   │   └── middleware.ts         # Auth middleware helper
│   ├── platform/                 # Skills platform logic
│   │   ├── connectors/           # OAuth integrations
│   │   │   ├── slack.ts
│   │   │   ├── gmail.ts
│   │   │   └── hubspot.ts
│   │   ├── executor/             # Skill execution engine
│   │   │   ├── skill-runner.ts
│   │   │   ├── action-router.ts
│   │   │   └── context-builder.ts
│   │   └── triggers/             # Trigger system
│   │       ├── event-handler.ts
│   │       ├── rule-engine.ts
│   │       └── condition-scanner.ts
│   ├── questions.ts              # Questionnaire definitions
│   ├── score-calculator.ts       # Scoring algorithm
│   ├── stage-utils.ts            # Client journey helpers
│   ├── diagnostic-report.ts      # Report generation
│   └── utils.ts                  # Utility functions (cn, etc.)
│
├── types/
│   └── index.ts                  # TypeScript type definitions
│
├── public/                       # Static assets
├── middleware.ts                 # Route protection middleware
├── package.json
├── tsconfig.json
├── tailwind.config.ts
└── next.config.ts
```

---

## 8. Routes Reference

### Public Routes (No Auth Required)

| Route | Purpose |
|-------|---------|
| `/` | Landing page |
| `/questionnaire` | Short assessment questionnaire |
| `/platform-demo` | Skills platform demo |
| `/platform-demo/triggers` | Demo triggers page |
| `/platform-demo/approvals` | Demo approvals page |
| `/platform-demo/skills` | Demo skills page |
| `/dashboard-preview` | Client journey stage preview |
| `/login` | User login |
| `/login/admin` | Admin login |
| `/forgot-password` | Password reset request |
| `/reset-password` | Password reset form |
| `/create-account` | User registration |

### Protected Routes (Requires Auth)

| Route | Purpose |
|-------|---------|
| `/dashboard` | User's main dashboard |
| `/full-audit` | 74-question deep audit |
| `/full-audit/results` | Audit results page |
| `/assets` | Document upload page |
| `/schedule` | Schedule management |
| `/upgrade` | Payment upgrade flow |
| `/platform` | Skills platform home (activity) |
| `/platform/triggers` | Automation triggers |
| `/platform/approvals` | Approval queue |
| `/platform/skills` | AI skills |
| `/platform/history` | Execution history |
| `/platform/settings` | Platform settings |

### Admin Routes (Requires Admin)

| Route | Purpose |
|-------|---------|
| `/admin` | Admin dashboard |
| `/admin/clients` | All clients list |
| `/admin/clients/[id]` | Individual client detail |

---

## 9. API Endpoints

### Authentication

| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/api/auth/callback` | GET | OAuth callback handler |
| `/api/auth/signout` | POST | Sign out user |

### Questionnaire

| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/api/submit` | POST | Submit short questionnaire |

### Audit Sessions

| Endpoint | Method | Purpose | Body |
|----------|--------|---------|------|
| `/api/audit-session` | POST | Create new session | `{ full_name, company_name, email }` |
| `/api/audit-session/load` | GET | Load session by token | `?token=xxx` |
| `/api/audit-session/save` | POST | Save session progress | `{ session_id, form_data, score_data }` |
| `/api/audit-session/resume` | POST | Resume session | `{ email }` |
| `/api/audit-session/link-account` | POST | Link to user account | `{ session_id }` |

### Full Audit

| Endpoint | Method | Purpose | Body |
|----------|--------|---------|------|
| `/api/full-audit` | POST | Start full audit | `{ session_id }` |
| `/api/full-audit/save` | POST | Save audit progress | `{ session_id, answers, current_question }` |
| `/api/full-audit/load` | GET | Load audit progress | `?session_id=xxx` |
| `/api/full-audit/submit` | POST | Submit completed audit | `{ session_id, answers }` |

### Client Portal

| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/api/portal/[clientId]` | GET | Get client portal data |

### Payment Webhooks

| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/api/webhooks/whop` | POST | Whop payment webhook handler |

---

## 10. Database Schema

### Entity Relationship Diagram

```
┌─────────────┐     ┌─────────────────┐     ┌──────────────┐
│  auth.users │────▶│    profiles     │────▶│ submissions  │
└─────────────┘     └─────────────────┘     └──────────────┘
                           │                       │
                           │                       ▼
                           │               ┌──────────────┐
                           │               │pipeline_stages│
                           │               └──────────────┘
                           │                       │
                           ▼                       ▼
                    ┌─────────────────┐    ┌──────────────┐
                    │ audit_sessions  │    │client_assets │
                    └─────────────────┘    └──────────────┘

┌─────────────┐     ┌─────────────────┐
│organizations│────▶│user_organizations│
└─────────────┘     └─────────────────┘
       │
       ▼
┌─────────────┐     ┌─────────────────┐     ┌──────────────┐
│ connections │     │     skills      │────▶│trigger_rules │
└─────────────┘     └─────────────────┘     └──────────────┘
                           │                       │
                           ▼                       ▼
                    ┌─────────────────┐    ┌──────────────┐
                    │   executions    │───▶│approval_queue│
                    └─────────────────┘    └──────────────┘
```

### Key Tables

| Table | Purpose | Key Fields |
|-------|---------|------------|
| `profiles` | User profiles | `id`, `email`, `is_admin` |
| `audit_sessions` | Assessment progress | `session_token`, `score_data`, `client_stage` |
| `submissions` | Completed assessments | `questionnaire_data`, `overall_score` |
| `organizations` | Multi-tenant orgs | `name`, `slug` |
| `skills` | AI capabilities | `system_prompt`, `config` |
| `trigger_rules` | Automation rules | `trigger_type`, `skill_id` |
| `executions` | Skill runs | `status`, `skill_output` |
| `approval_queue` | Pending approvals | `draft_content`, `status` |

---

## 11. Client Journey System

### Journey Stages

```
new → in_audit → docs_needed → ready → building → complete
```

| Stage | Description | Trigger |
|-------|-------------|---------|
| `new` | Just completed short assessment | Default |
| `in_audit` | Started 74-question audit | `full_audit_status = 'in_progress'` |
| `docs_needed` | Audit complete, need docs | `full_audit_status = 'completed'` |
| `ready` | Docs uploaded, ready for call | All 4 documents uploaded |
| `building` | In 4-week sprint | `sprint_data.week > 0` |
| `complete` | Sprint complete | `sprint_data.status = 'complete'` |

### Required Documents

```typescript
const REQUIRED_DOCUMENTS = [
  { id: 'service_offerings', name: 'Service Offerings Document' },
  { id: 'sample_deliverable', name: 'Sample Client Deliverable' },
  { id: 'team_structure', name: 'Team Structure / Org Chart' },
  { id: 'current_sops', name: 'Current SOPs (if any)' },
]
```

### Stage Detection Logic

```typescript
function getClientStage(session: AuditSession): ClientStage {
  if (session.sprint_data?.status === 'complete') return 'complete'
  if (session.sprint_data?.week > 0) return 'building'
  if (session.full_audit_status === 'completed' && hasAllDocuments(session)) return 'ready'
  if (session.full_audit_status === 'completed') return 'docs_needed'
  if (session.full_audit_status === 'in_progress') return 'in_audit'
  return 'new'
}
```

---

## 12. Scoring Algorithm

### Five Dimensions

| Dimension | Weight | What It Measures |
|-----------|--------|------------------|
| **Leverage** | 25% | Owner time independence |
| **Equity Potential** | 25% | Exit-readiness |
| **Revenue Risk** | 20% | Income stability |
| **Product Readiness** | 15% | Productization level |
| **Implementation Capacity** | 15% | Team capability |

### Score Ranges

| Score | Color | Meaning |
|-------|-------|---------|
| 80-100 | Green (#064e3b) | Excellent |
| 60-79 | Gold (#b59f3b) | Good |
| 40-59 | Orange (#c77d3e) | Needs Work |
| 0-39 | Red (#a85454) | Critical |

### Financial Metrics Calculated

- **Owner Hourly Value** = Monthly Revenue / (Weekly Hours × 4)
- **Current Exit Multiple** = Based on leverage + revenue risk scores
- **Target Exit Multiple** = 5x (industry benchmark)
- **Value Gap** = (Target Multiple - Current Multiple) × Annual Revenue

---

## 13. Skills Platform

### Architecture Overview

```
Trigger Event → Rule Engine → Context Builder → Skill Runner → Action Router
                                                      ↓
                                              Approval Queue (if needed)
                                                      ↓
                                              Execute Action
```

### Connectors

| Platform | Capabilities | File |
|----------|-------------|------|
| **Slack** | Read channels, Post messages, Thread replies | `lib/platform/connectors/slack.ts` |
| **Gmail** | Read emails, Send emails, Thread replies | `lib/platform/connectors/gmail.ts` |
| **HubSpot** | Read contacts, deals, activities | `lib/platform/connectors/hubspot.ts` |

### Trigger Types

| Type | Description | Example |
|------|-------------|---------|
| `event` | Fires on external event | New HubSpot lead |
| `condition` | Fires when condition met | Lead inactive 14 days |
| `schedule` | Fires on cron schedule | Every Monday 9am |

### Execution Statuses

```typescript
type ExecutionStatus =
  | 'pending'           // Queued for execution
  | 'running'           // Currently executing
  | 'completed'         // Successfully finished
  | 'failed'            // Error occurred
  | 'awaiting_approval' // Needs human review
  | 'approved'          // Approved and sent
  | 'rejected'          // Rejected by reviewer
```

---

## 14. TypeScript Types

### Core Assessment Types

```typescript
interface AuditSession {
  id: string
  user_id: string
  full_name?: string
  company_name?: string
  email?: string
  score_data?: ScoreData
  form_data?: Record<string, any>
  full_audit_status?: 'not_started' | 'in_progress' | 'completed'
  full_audit_current_question?: number
  client_stage?: ClientStage
  sprint_data?: SprintData
  documents_uploaded?: string[]
}

interface ScoreData {
  overall?: number
  dimensions?: {
    leverage?: number
    equityPotential?: number
    revenueRisk?: number
    productReadiness?: number
    implementationCapacity?: number
  }
  financialMetrics?: {
    currentExitValue?: number
    targetExitValue?: number
    valueGap?: number
    currentExitMultiple?: number
  }
  criticalFindings?: CriticalFinding[]
  quickWins?: QuickWin[]
}

type ClientStage = 'new' | 'in_audit' | 'docs_needed' | 'ready' | 'building' | 'complete'
```

### Skills Platform Types

```typescript
interface Skill {
  id: string
  organization_id: string
  slug: string
  name: string
  description?: string
  system_prompt: string
  config: SkillConfig
  is_active: boolean
}

interface TriggerRule {
  id: string
  organization_id: string
  name: string
  trigger_type: 'event' | 'condition'
  trigger_source: string
  skill_id: string
  action_type: 'auto' | 'approval'
  is_active: boolean
}

interface Execution {
  id: string
  skill_id: string
  status: ExecutionStatus
  skill_output?: string
  error?: string
  created_at: string
}

type Platform = 'slack' | 'hubspot' | 'gmail' | 'notion' | 'asana'
```

---

## 15. UI Components

### Shadcn Components Available

| Component | Location | Usage |
|-----------|----------|-------|
| `Button` | `components/ui/button.tsx` | Primary actions |
| `Card` | `components/ui/card.tsx` | Content containers |
| `Badge` | `components/ui/badge.tsx` | Status indicators |
| `Dialog` | `components/ui/dialog.tsx` | Modals |
| `Form` | `components/ui/form.tsx` | Form handling |
| `Input` | `components/ui/input.tsx` | Text inputs |
| `Select` | `components/ui/select.tsx` | Dropdowns |
| `Switch` | `components/ui/switch.tsx` | Toggles |
| `Tabs` | `components/ui/tabs.tsx` | Tab navigation |
| `Table` | `components/ui/table.tsx` | Data tables |
| `Sonner` | `components/ui/sonner.tsx` | Toast notifications |

### Design Tokens

```css
/* Colors */
--emerald-900: #064e3b   /* Primary actions, success */
--gold: #b59f3b          /* Warnings, medium scores */
--orange: #c77d3e        /* Alerts, low scores */
--red: #a85454           /* Errors, critical scores */
--neutral-bg: #f8f8f6    /* Page background */
--border: #e5e5e5        /* Borders */
--text: #1a1a1a          /* Primary text */
--text-muted: #666       /* Secondary text */

/* Typography */
font-family: serif       /* Headings */
font-family: sans-serif  /* Body */
```

---

## 16. Security Considerations

### Environment Variables

| Variable | Exposure | Notes |
|----------|----------|-------|
| `NEXT_PUBLIC_*` | Client & Server | Safe for browser |
| `SUPABASE_SERVICE_ROLE_KEY` | Server only | NEVER expose to client |
| `ANTHROPIC_API_KEY` | Server only | API route use only |
| `ENCRYPTION_KEY` | Server only | For token encryption |

### Row Level Security (RLS)

- **Always enabled** on all tables
- Users can only access their own data
- Admins can access all data via `is_admin` check
- Organization-scoped data uses `user_organizations` join

### Input Validation

- Use Zod schemas for all API inputs
- Sanitize user content before storage
- Validate file uploads (type, size)

### Authentication Flow

1. User submits credentials
2. Supabase validates and returns JWT
3. JWT stored in httpOnly cookie (via middleware)
4. All protected routes check JWT validity
5. Service role key used only in server-side API routes

---

## 17. Common Issues & Troubleshooting

### "Supabase connection hanging"

**Cause:** Invalid Supabase URL or network issue

**Fix:**
```bash
# Verify environment variables
echo $NEXT_PUBLIC_SUPABASE_URL
# Should output: https://xxx.supabase.co
```

### "RLS policy violation"

**Cause:** User trying to access data they don't own

**Fix:**
1. Check RLS policies in Supabase Dashboard
2. Verify user is authenticated
3. Confirm data ownership (user_id matches)

### "Module not found: @/components/..."

**Cause:** Missing import alias or file

**Fix:**
```json
// tsconfig.json - verify paths
{
  "compilerOptions": {
    "paths": {
      "@/*": ["./*"]
    }
  }
}
```

### "Hydration mismatch"

**Cause:** Server/client render difference

**Fix:**
1. Use `'use client'` directive for client components
2. Avoid `Date.now()` in initial render
3. Use `useEffect` for browser-only code

### "OAuth callback error"

**Cause:** Redirect URL mismatch

**Fix:**
1. Check Supabase Auth settings
2. Ensure exact URL match (including trailing slash)
3. Add all environments (localhost, staging, prod)

### Build Errors

```bash
# Clear Next.js cache
rm -rf .next

# Reinstall dependencies
rm -rf node_modules package-lock.json
npm install

# Type check
npx tsc --noEmit
```

---

## 18. Deployment Checklist

### Pre-Launch

- [ ] GitHub repository created and code pushed
- [ ] Supabase project created
- [ ] Database schema applied (run SQL in editor)
- [ ] RLS policies enabled and tested
- [ ] Storage bucket created (`client-assets`)
- [ ] Auth providers configured
- [ ] Auth redirect URLs set for all environments

### Vercel Setup

- [ ] Project connected to GitHub
- [ ] Environment variables set (all 4-5 required)
- [ ] Build succeeds without errors
- [ ] Preview deployments working

### Domain & SSL

- [ ] Custom domain added in Vercel
- [ ] DNS records configured
- [ ] SSL certificate provisioned (automatic)
- [ ] Supabase redirect URLs updated with custom domain

### Testing

- [ ] User registration works
- [ ] Login/logout flow works
- [ ] Questionnaire submission works
- [ ] Full audit save/resume works
- [ ] Admin panel accessible (with admin account)
- [ ] Platform demo pages load correctly

### Post-Launch

- [ ] Monitor Vercel logs for errors
- [ ] Check Supabase dashboard for failed queries
- [ ] Verify email delivery (password reset, etc.)
- [ ] Test on mobile devices

---

## Contact

Questions? Reach out to Michael.

---

*Last updated: February 2025*
