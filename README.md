# Kotoba Companion

Kotoba Companion is a mobile-first beginner Japanese learning app built with Next.js, shadcn/ui, and a Supabase-ready data model. The MVP focuses on short guided lessons, visible milestones, a friendly gamified routine, and a protected admin workflow for AI-assisted lesson drafting and publishing.

## Stack

- Next.js App Router + TypeScript
- Tailwind CSS v4
- shadcn/ui base components
- Supabase-ready auth and database helpers
- Vercel-friendly deployment target

## Product Areas

- `src/app/sign-up`, `src/app/sign-in`, `src/app/onboarding`
  - learner entry and onboarding flows
- `src/app/dashboard`, `src/app/learn`, `src/app/path`, `src/app/progress`, `src/app/settings`
  - learner experience for fixed-path study, lesson play, and progress review
- `src/app/admin`
  - admin-only lesson draft generation, review, and publishing workspace
- `supabase/migrations/202604160300_init.sql`
  - starter schema, indexes, and row-level-security policies

## Local Development

```bash
npm install
npm run dev
```

The app runs in a demo-capable mode by default so it works without external services. To connect Supabase, copy `.env.example` to `.env.local` and add:

```bash
NEXT_PUBLIC_SUPABASE_URL=...
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
SUPABASE_SERVICE_ROLE_KEY=...
```

To support the intended MVP auth methods, enable these providers in `Supabase -> Authentication`:

- `Email`
  - keep passwordless email enabled for magic-link login
- `Google`
  - create a Google OAuth client in Google Cloud
  - add the callback / redirect URI shown by Supabase to that Google client
  - paste the Google client ID and secret into `Authentication -> Providers -> Google`

Also make sure `Authentication -> URL Configuration` includes the right site URL and redirect URLs for both local and deployed environments, including:

- `http://localhost:3000/auth/callback`
- your production callback URL on Vercel

## Deployment

Use Vercel for deployment and set the same environment variables there. The included Supabase helpers and SQL migration are designed to be the starting point for replacing the demo store with real persisted auth, learner progress, and admin publishing flows.
