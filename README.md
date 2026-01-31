# ExitLayer SaaS Platform

Agency diagnostic questionnaire with Supabase auth, client dashboard, and admin management.

## Features

- **Public Landing Page** - Marketing page at `/`
- **Email/Password Auth** - Supabase auth with signup/login
- **Client Dashboard** - Score overview, pipeline tracking, asset uploads
- **Admin Dashboard** - View all clients, manage pipeline stages, add notes
- **Asset Uploads** - Clients can upload SOPs, templates, examples via Supabase Storage
- **Automatic Admin** - `michael@exitlayer.io` is automatically admin

## Quick Start

### 1. Set Up Supabase

1. Create a project at [supabase.com](https://supabase.com)
2. Go to SQL Editor and run `supabase-schema.sql`
3. Go to Settings > API and copy your project URL and anon key

### 2. Configure Environment

```bash
cp .env.example .env.local
```

Edit `.env.local`:
```
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### 3. Run Locally

```bash
npm install
npm run dev
```

### 4. Deploy to Vercel

1. Push to GitHub
2. Connect repo in Vercel
3. Add environment variables in Vercel dashboard
4. Deploy

### 5. Configure Domain

1. In Vercel, add custom domain: `exitlayer.io`
2. In Supabase Auth settings:
   - Site URL: `https://exitlayer.io`
   - Redirect URLs: `https://exitlayer.io/api/auth/callback`

## Routes

| Route | Description |
|-------|-------------|
| `/` | Public landing page |
| `/signup` | Create account |
| `/login` | Sign in |
| `/questionnaire` | Take the diagnostic (protected) |
| `/dashboard` | Client dashboard with score (protected) |
| `/assets` | Upload assets (protected) |
| `/admin` | Admin overview (admin only) |
| `/admin/clients` | All clients list (admin only) |
| `/admin/clients/[id]` | Client detail view (admin only) |

## Tech Stack

- Next.js 15 (App Router)
- Supabase Auth + Postgres + Storage
- Tailwind CSS
- TypeScript

## File Structure

```
app/
├── (auth)/
│   ├── login/
│   └── signup/
├── (protected)/
│   ├── dashboard/
│   ├── questionnaire/
│   └── assets/
├── admin/
│   ├── clients/
│   │   └── [id]/
│   └── layout.tsx
├── api/
│   ├── auth/callback/
│   ├── auth/signout/
│   └── submit/
├── page.tsx (landing)
└── layout.tsx

lib/
├── supabase/
│   ├── client.ts
│   ├── server.ts
│   └── middleware.ts
├── score-calculator.ts
├── call-prep-generator.ts
├── diagnostic-report.ts
├── system-spec-generator.ts
└── questions.ts

components/
└── QuestionnaireForm.tsx
```
