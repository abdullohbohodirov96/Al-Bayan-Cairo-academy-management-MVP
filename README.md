# Аль-Баян Каиро — Academy OS

Lightweight management MVP for an Arabic/language education center.

## Version 0.3 — full frontend rebuild
The screen was rebuilt from a single 40 KB file into a proper component
architecture, with a distinct visual identity (not a generic template),
and full responsive support for desktop and mobile. The stale "competitor
benchmark" tab was removed from daily navigation — that comparison lives
in `docs/COMPETITOR_AUDIT.md` for reference, not in the working app.

## Stack
- React + Vite
- Plain CSS, split into tokens / base / layout / components / pages (no heavy UI framework)
- Lucide icons
- Fonts: Unbounded (display) + Manrope (body, Cyrillic/Latin) + JetBrains Mono (IDs, amounts, dates) + Cairo (Arabic locale)
- Supabase Postgres + Auth + RLS foundation
- Supabase Edge Function foundation for SMS reminders
- Vercel-ready

## Design direction
Geometric/Kufic-inspired identity tied to an Arabic-language academy in Cairo:
deep emerald-black + sand parchment + a brass accent for money, with a single
signature motif — an eight-point geometric rosette (khatam) — used only in the
logo mark. Avoids the generic "cream + terracotta" AI-template look.

## Structure
```
src/
  App.jsx            – state, routing, layout composition
  main.jsx            – entry point
  i18n.js / search.js / data.js / utils.js
  components/          – Sidebar, Topbar, MobileNav, SearchBox, UI primitives, modals
  pages/                – one file per screen (Overview, Students, Payments, …)
  styles/               – tokens.css, base.css, layout.css, components.css, pages.css
```

## MVP modules
Overview / CEO dashboard · Student CRM · Global prefix autocomplete search ·
Payments and debt control · Groups and levels · Teachers and workload ·
Attendance marking · Schedule · Leads / admissions pipeline · Payment reminder
automation UI · SMS queue/log foundation · Analytics · Roles foundation
(CEO / Admin / Teacher) · RU / UZ / AR interface, RTL-ready · Audit-log foundation.

## Responsive layout
- **Desktop (≥1080px):** fixed sidebar (collapsible to an icon rail), top bar with global search.
- **Tablet (720–1079px):** sidebar auto-collapses to an icon rail.
- **Mobile (<760px):** sidebar becomes an off-canvas drawer, bottom tab bar
  for the four most-used sections plus "Ещё" for the rest, full-width cards.

## Smart search
Search suggestions combine students, teachers, groups and leads. It is
intentionally prefix-based:
- `A` → names/items starting with A
- `ABD` → `Abdulloh`, `Abdurahmon`, etc.
- `АБД` → transliterated to `abd`, so Cyrillic keyboard input can find Latin student names
- multi-token prefixes work too, e.g. `mary abd`

The pure search logic is in `src/search.js` and covered by Node tests.

## SMS reminders
The UI includes reminder rules, a message preview and a queue/log screen. The
database migration adds an idempotent `notification_jobs` queue and templates.
`supabase/functions/process-reminders` is a server-only provider adapter.

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
Import this GitHub repository into Vercel. Framework preset: Vite. No
environment variables are required for the current demo-data build. When real
Supabase data wiring is added, configure only the public project URL/anon key
as `VITE_*` values — keep service-role and SMS provider keys in server-side
Edge Function secrets only.

## Current scope boundary
The current React screen uses demo data so the product UX can be evaluated
immediately. SQL/RLS/reminder infrastructure is included, but real CRUD/auth/
provider credentials still need to be connected to the frontend before
production use.
