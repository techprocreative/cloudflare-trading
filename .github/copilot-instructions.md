# Copilot Instructions for Signal Sage AI

## Project Overview
- **Purpose:** AI-powered trading education platform for the Indonesian market, with crypto payments, localization, and legal compliance.
- **Architecture:**
  - **Frontend:** React (Vite, Tailwind CSS, Zustand, i18next)
  - **Backend:** Cloudflare Workers (Hono), Drizzle ORM (SQLite via D1), custom JWT-like auth
  - **Payments:** Crypto (BTC, ETH, USDT, BNB)
  - **AI:** Cloudflare Agents SDK, OpenAI SDK
  - **State:** Cloudflare KV, Durable Objects, D1

## Key Directories & Files
- `src/` — React app, UI components, hooks, pages, localization
- `worker/` — Cloudflare Worker code, routes, controllers, agents
- `db/schema.ts` — Drizzle ORM schema for D1
- `wrangler.jsonc` — Cloudflare Worker config (bindings for Durable Objects, KV, D1)
- `package.json` — Scripts, dependencies
- `README.md` — Setup, workflows, deployment

## Developer Workflows
- **Local Dev:**
  - Frontend: `npm run dev` (Vite, hot reload)
  - Worker: `npm run dev:worker` (Cloudflare Worker dev mode)
- **Build:** `npm run build` (Vite build)
- **Deploy:**
  - Frontend: `npm run deploy` (build + wrangler deploy)
  - Worker: `npx wrangler deploy`
- **Test:** `npm test`
- **Typegen:** `npm run cf-typegen` (Cloudflare Worker types)

## Cloudflare Integration
- **KV Namespaces:** `CACHE`, `SESSION_KV` (see `wrangler.jsonc`)
- **Durable Objects:** `CHAT_AGENT`, `APP_CONTROLLER`
- **D1 Database:** `DB` binding for Drizzle ORM
- **Environment Variables:**
  - `CF_AI_BASE_URL`, `CF_AI_API_KEY` (see `.env.local`)

## Project-Specific Patterns
- **Layouts:** `src/components/layouts/` and `AppShell.tsx` for route-based layouts
- **Navigation:** Sidebar (desktop), bottom nav (mobile), breadcrumbs, protected routes
- **Localization:** `src/locales/`, `LanguageSwitcher.tsx`, i18next
- **Payments:** `src/lib/cryptoPayment.ts`, pricing flows in `Pricing.tsx`, wallet/QR logic
- **Error Handling:** `ErrorBoundary.tsx`, `ErrorFallback.tsx`, custom error reporting
- **Database:** Drizzle ORM models in `db/schema.ts`, migrations in `db/migrations/`
- **Agents:** Worker-side agents in `worker/agent.ts`, `worker/services/ragAgent.ts`

## Conventions & Tips
- Use Drizzle ORM for all DB access (avoid raw SQL)
- Use Cloudflare bindings as defined in `wrangler.jsonc`
- All authentication/session logic uses custom JWT-like tokens and KV
- Indonesian localization is default; always provide fallback to English
- All payments and pricing logic must support crypto and IDR
- Legal compliance is critical: see `TermsOfService.tsx`, `PrivacyPolicy.tsx`, `Disclaimer.tsx`

## Example: Adding a New Subscription Tier
1. Update pricing logic in `src/lib/pricing.ts` and `Pricing.tsx`
2. Update DB schema in `db/schema.ts` and run migration
3. Update payment logic in `src/lib/cryptoPayment.ts`
4. Update worker routes in `worker/routes/subscription.ts`

---
For more details, see `README.md`, `wrangler.jsonc`, and relevant source files. If unclear, ask for specific workflow or pattern examples.