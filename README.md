# Аль-Баян Каиро — Academy OS

Lightweight management MVP for an Arabic/language education center.

## Why this version
Version 0.2 was rebuilt after benchmarking tutoring/language-school products such as TutorCruncher, Teachworks, Teach 'n Go, Classcard, TutorBird and Classpro. The goal is to keep the strongest operating workflows while keeping the frontend light.

See `docs/COMPETITOR_AUDIT.md` for the feature benchmark.

## Stack
- React + Vite
- plain CSS (no heavy component framework)
- Lucide icons
- Supabase Postgres + Auth + RLS foundation
- Supabase Edge Function foundation for SMS reminders
- Vercel-ready frontend

## MVP modules
- Overview / CEO dashboard
- Student CRM
- Global prefix autocomplete search
- Payments and debt control
- Groups and levels
- Teachers and workload
- Attendance marking
- Schedule
- Leads / admissions pipeline
- Payment reminder automation UI
- SMS queue/log foundation
- Analytics
- Competitor benchmark
- Roles foundation: CEO / Admin / Teacher / Student (future portal)
- RU / UZ / AR interface shell, RTL-ready
- Audit-log foundation

## Smart search
Search suggestions combine students, teachers, groups and leads.

It is intentionally prefix-based:
- `A` → names/items starting with A
- `ABD` → `Abdulloh`, `Abdurahmon`, etc.
- `АБД` → transliterated to `abd`, so Cyrillic keyboard input can find Latin student names
- multi-token prefixes work too, e.g. `mary abd`

The pure search logic is in `src/search.js` and covered by Node tests.

## SMS reminders
The UI includes reminder rules, a message preview and a queue/log screen. The database migration adds an idempotent `notification_jobs` queue and templates. `supabase/functions/process-reminders` is a server-only provider adapter.

**Never put SMS provider secrets in `VITE_*` environment variables.**

See `docs/SMS_INTEGRATION.md`.

## Supabase
1. Create a Supabase project.
2. Run migrations in order:
   - `supabase/migrations/202608190001_init.sql`
   - `supabase/migrations/202608190002_operations_and_reminders.sql`
3. Create staff users in Supabase Auth.
4. Set roles in `public.profiles` to `ceo`, `admin`, or `teacher`.
5. When wiring real data, add the Supabase JS client and replace demo seeds with queries/RPCs.

## Local
```bash
npm install
npm test
npm run dev
```

Production check:
```bash
npm run build
```

## Vercel
Import this GitHub repository into Vercel. When real Supabase data wiring is added, configure the public project URL/publishable key. Keep service-role and SMS provider keys only in server-side/Edge Function secrets.

## Current scope boundary
The current React screen uses demo data so the product UX can be evaluated immediately. SQL/RLS/reminder infrastructure is included, but real CRUD/auth/provider credentials still need to be connected to the frontend before production use.
