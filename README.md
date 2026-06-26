# SwissProperty — Premium Real Estate (Frontend)

A premium, Swiss-luxury property listing website built with **React + Vite + Tailwind CSS + React Router + lucide-react**. This is the **frontend-only** phase — all data comes from local sample data and the code is structured so a Supabase backend and PDF brochure generation can be added later without restructuring.

## Quick Start

```bash
# 1. Install dependencies
npm install

# 2. Start the dev server (http://localhost:5173)
npm run dev

# 3. Production build
npm run build
npm run preview
```

> Requires Node.js 18+.

## Tech Stack

- **React 18** (Vite)
- **Tailwind CSS 3** — custom luxury theme (charcoal / gold / soft grey)
- **React Router 6** — multi-page routing, property pages open by slug
- **lucide-react** — modern icon set
- Local sample data — `src/data/sampleProperties.js`

## Project Structure

```
src/
  components/
    Navbar.jsx              Logo.jsx
    Footer.jsx              SearchBar.jsx
    PropertyCard.jsx        PropertyCardSkeleton.jsx
    PropertyGallery.jsx     PropertyFeatureCards.jsx
    PropertyTabs.jsx        ContactAgentCard.jsx
    AmenitiesGrid.jsx       NearbyPlaces.jsx
    PropertyHighlights.jsx  FilterBar.jsx
    FilterDrawer.jsx        FilterFields.jsx
    EmptyState.jsx          SectionHeading.jsx
    CTASection.jsx
  context/
    SavedContext.jsx        # favorites store (in-memory, swap for Supabase later)
  pages/
    HomePage.jsx            ListingsPage.jsx
    PropertyDetailPage.jsx  AgentsPage.jsx
    AboutPage.jsx           ContactPage.jsx
    NotFoundPage.jsx
  data/
    sampleProperties.js     # 6 listings + agents (single source of truth)
  utils/
    filterProperties.js     # pure filter + sort logic
  App.jsx  main.jsx  index.css
```

## Pages

| Route | Page |
|---|---|
| `/` | Home — hero, search bar, featured, categories, why-choose, stats, CTA |
| `/listings` | Listings — advanced filters (desktop bar + mobile drawer), chips, sort, empty + loading states |
| `/property/:slug` | Detail — gallery + lightbox, feature cards, tabs, sticky agent sidebar, similar properties |
| `/agents` | Agents grid |
| `/about` | Brand, mission, values, stats |
| `/contact` | Contact form, details, WhatsApp/email CTAs, map |

Deep links work: `/listings?status=For+Sale`, `/listings?propertyType=Villa`, `/listings?saved=1`, etc. The hero search bar and navbar push filters via the URL query string.

## Functionality

- Live filtering & sorting from sample data (keyword, location, type, price, beds, baths, size, status, furnished, parking, featured-only, sort).
- Active filter chips with individual + clear-all removal, results count, empty state, loading skeletons.
- Save/favorite hearts on cards and detail page (badge count in navbar).
- Working detail-page tabs, image gallery with keyboard-navigable lightbox.
- Mobile filter drawer, collapsing navbar menu, fully responsive layouts.

## Backend (Supabase)

The app runs on local sample data out of the box. To switch to a live database,
auth, and the admin dashboard, connect Supabase — **no code changes needed**, just
keys. If `.env` is empty, everything transparently falls back to sample data.

### 1. Create the project
Create a free project at https://supabase.com. Then in the dashboard:

1. **SQL Editor** → paste and run `supabase/schema.sql` (creates tables, row-level
   security, and the `property-images` storage bucket).
2. **Settings → API** → copy the **Project URL** and the **anon public** key.

### 2. Configure the frontend
Copy `.env.example` to `.env` and fill in:

```
VITE_SUPABASE_URL=https://xxxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOi...
```

Restart `npm run dev`. The app now reads from Supabase.

### 3. Seed the catalog (optional)
Loads the 6 sample listings + agents into the database:

```bash
set SUPABASE_URL=https://xxxx.supabase.co
set SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOi...   # Settings → API → service_role (keep secret)
node supabase/seed.mjs
```

### 4. Create an admin user
In the dashboard: **Authentication → Users → Add user** (email + password).
Then sign in at `/admin/login`.

### What the backend powers
- **Listings from DB** — all pages read properties/agents/galleries/nearby from Supabase; filters/search run on the live data.
- **Admin dashboard** (`/admin`) — add, edit, delete listings with image upload to Supabase Storage.
- **Auth** — admin routes are protected by Supabase Auth.
- **Contact + saved** — contact form writes to `contact_messages` (view under Enquiries); favorites persist in `saved_properties`, keyed by an anonymous client id so visitors don't need to log in.

### Architecture
- `src/lib/supabase.js` — client (null when unconfigured).
- `src/services/*` — all reads/writes; each falls back to sample data when unconfigured.
- `src/hooks/useProperties.js` — `useProperties()` / `useProperty(slug)` with loading state.
- `src/context/AuthContext.jsx` — admin session.
- `supabase/schema.sql`, `supabase/seed.mjs` — database setup.

> Security: the **anon key** is safe in the frontend (RLS restricts writes to authenticated users). The **service_role key** is only for the seed script — never put it in frontend code or commit it.

## Roles: admin vs agent (separate accounts)

Admins and agents are completely separate logins with different portals.

### Enable it (one-time)
1. Run `supabase/migration_agents_bio.sql` (adds agent bio).
2. Run `supabase/schema_rbac.sql` (adds roles, agent ownership + approval, signup trigger, role-scoped security).
3. Make your existing login an admin — edit the email and run, in the SQL editor:
   ```sql
   insert into public.profiles (id, role)
   select id, 'admin' from auth.users where email = 'YOUR_ADMIN_EMAIL'
   on conflict (id) do update set role = 'admin';
   ```
4. In **Authentication → Providers → Email**, turn **off** "Confirm email" so agents can sign in right after registering (or leave it on and agents confirm via email first).

### How it works
- **Admin** (`/admin`) — full control: all listings, all agents, enquiries, and **approving agents**.
- **Agent** (`/agent`) — self-registers at `/agent/signup`, signs in at `/agent/login`. Can edit **their own profile** and add/edit/delete **only their own listings**. Cannot see other agents' data or enquiries.
- New agents are **pending** until an admin approves them (Admin → Agents → Approve). Pending agents don't appear on the public site and can't post listings until approved.
- Row-level security enforces all of this in the database, not just the UI.

The navbar account menu adapts: signed out shows Agent Sign In / Register as Agent / Admin Login; signed in shows the relevant dashboard for that role.
