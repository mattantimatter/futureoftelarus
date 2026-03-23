# Telarus × Antimatter — ATOM Proposal App

An interactive, production-ready proposal web application for Antimatter AI's ATOM enterprise deployment framework. Features a dynamic proposal viewer, admin dashboard, and Supabase backend.

## What's Included

- **Interactive Proposal Viewer** — All 9 sections rendering from `proposal_json` with scroll-spy nav, section tabs, and progress indicator
- **ATOM Framework Story** — Brain → Spine → Digital Worker with capability cards and comparison matrix
- **Telarus-Specific Content** — Use cases, rollout plan, pricing tiers, and next steps
- **Admin Dashboard** — Create proposals, upload PDFs, view audit events
- **Ask Atom Rail** — Chat assistant (wire to OpenAI in `/api/chat/route.ts`)

---

## Tech Stack

- **Next.js 16 App Router** + TypeScript + Tailwind CSS
- **Supabase** — Postgres + Storage
- **pdf-lib** — PDF generation
- **framer-motion** — Animations
- **zod** + **react-hook-form** — Form validation
- **nanoid** — Token generation

---

## Environment Variables

Create `.env.local` from the example:

```bash
cp .env.local.example .env.local
```

| Variable | Required | Description |
|---|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | Yes | Your Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Yes | Supabase anon public key |
| `SUPABASE_SERVICE_ROLE_KEY` | Yes | Supabase service role key (server-side only) |
| `ADMIN_PASSWORD` | Yes | Password to access `/admin` |
| `NEXT_PUBLIC_SITE_URL` | Yes | Full URL of the app (e.g. `https://your-app.vercel.app`) |
| `OPENAI_API_KEY` | Optional | OpenAI API key for Ask Atom chat |

---

## Database Setup (Supabase)

### 1. Create a Supabase project

Go to [supabase.com](https://supabase.com) and create a new project.

### 2. Run migrations

Option A — Supabase Dashboard (easiest):
1. Go to your project → SQL Editor
2. Copy and run `supabase/migrations/001_initial_schema.sql`
3. Copy and run `supabase/migrations/002_rls_policies.sql`

Option B — Supabase CLI:
```bash
npx supabase db push --db-url "postgresql://postgres:[PASSWORD]@[HOST]:5432/postgres"
```

### 3. Create Storage Buckets

In Supabase Dashboard → Storage, create three buckets:
- `proposal_source_pdfs` (private)
- `proposal_signed_pdfs` (private)
- `signatures` (private)

Or run this SQL in the SQL Editor:
```sql
INSERT INTO storage.buckets (id, name, public) VALUES
  ('proposal_source_pdfs', 'proposal_source_pdfs', false),
  ('proposal_signed_pdfs', 'proposal_signed_pdfs', false),
  ('signatures', 'signatures', false);
```

### 4. Configure Storage Policies

For each bucket, add a policy allowing the service role full access:
```sql
CREATE POLICY "service_role_full_access" ON storage.objects
  FOR ALL TO service_role USING (true) WITH CHECK (true);
```

---

## Local Development

```bash
# Install dependencies
npm install

# Start development server
npm run dev
```

Visit:
- `http://localhost:3000` → Redirects to admin
- `http://localhost:3000/admin` → Admin dashboard (password: from `ADMIN_PASSWORD` env var)

### First Time Setup

1. Go to `/admin` and log in with your `ADMIN_PASSWORD`
2. Click "New Proposal" → Create a proposal (prefilled with default Telarus × Atom content)
3. In the proposal manage page:
   - Upload a source PDF (optional)
   - Copy the viewer link
4. Open the viewer link to see the interactive proposal

---

## Project Structure

```
app/
├── (public)/p/[token]/         # Proposal viewer
│   └── page.tsx                # Loads proposal by public_token
├── (public)/demo/              # Static demo page
├── (admin)/admin/              # Admin (password protected)
│   ├── page.tsx                # Dashboard
│   ├── login/page.tsx          # Login
│   └── proposals/
│       ├── new/page.tsx        # Create proposal
│       └── [id]/page.tsx       # Manage proposal
└── api/
    ├── chat/route.ts           # Ask Atom (OpenAI)
    └── admin/...               # Admin APIs

components/
├── reactbits/                  # Premium animated components
├── proposal/                   # Proposal viewer sections
├── admin/                      # Admin UI
└── ui/                         # Shared primitives (Button, Modal, Toast...)

lib/
├── supabase/                   # server.ts + client.ts + types.ts
├── actions/                    # Server actions (proposals)
├── pdf/stamp.ts                # pdf-lib PDF generation
├── tokens.ts                   # nanoid token generation
├── seed.ts                     # Default proposal JSON content
└── theme.ts                    # Brand design tokens

supabase/migrations/
├── 001_initial_schema.sql      # Tables + triggers
└── 002_rls_policies.sql        # RLS policies
```

---

## Deploy to Vercel

### 1. Push to GitHub

```bash
git init
git add .
git commit -m "Initial commit"
git remote add origin https://github.com/YOUR_ORG/telarus-atom-proposal.git
git push -u origin main
```

### 2. Import to Vercel

1. Go to [vercel.com](https://vercel.com) → New Project → Import from GitHub
2. Select your repo
3. Set all environment variables (same as `.env.local`)
4. Deploy

### 3. Post-Deploy

Update `NEXT_PUBLIC_SITE_URL` in Vercel env vars to your actual deployment URL.

---

## License

This codebase is proprietary — built for Telarus × Antimatter AI.
