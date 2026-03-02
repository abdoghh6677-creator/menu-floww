# Copilot Instructions for digital-menu-saas

## Project Overview
- This is a SaaS digital menu platform for restaurants, built with Next.js (App Router, TypeScript, React 19).
- Core features: user authentication, restaurant onboarding, menu management, and QR code menu sharing.
- Data is managed via Supabase (PostgreSQL backend, auth, and storage).
- The UI is styled with Tailwind CSS and uses Geist font.

## Key Architecture & Patterns
- **App Directory Structure**: All routes are in `app/` (e.g., `auth/`, `dashboard/`, `menu/[id]/`). Each folder contains a `page.js/tsx` for the route.
- **Authentication**: Handled via Supabase (`lib/supabaseClient.js`). Auth state is managed client-side; see `app/auth/page.js` for login/signup logic.
- **Data Access**: All DB/API calls use the Supabase client. Example: `supabase.from('restaurants').select('*')`.
- **Menu Sharing**: QR codes are generated with `qrcode.react` in the dashboard for menu links.
- **Arabic Support**: UI and data fields may use Arabic; preserve RTL and encoding.

## Developer Workflows
- **Start Dev Server**: `npm run dev` (Next.js, port 3000 by default)
- **Build for Production**: `npm run build` then `npm start`
- **Linting**: `npm run lint` (uses ESLint with Next.js config)
- **Environment Variables**: Set `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` in your environment for Supabase to work.

## Conventions & Tips
- **Client Components**: Use `'use client'` at the top of files that use React hooks or browser APIs.
- **Supabase Client**: Always import from `lib/supabaseClient.js` (not `supabase.js`).
- **Dynamic Routing**: Use `[id]` in folder names for dynamic routes (see `app/menu/[id]/page.js`).
- **Styling**: Use Tailwind utility classes. Global styles in `app/globals.css`.
- **Font Loading**: Fonts are loaded via `next/font` in `app/layout.tsx`.

## Integration Points
- **Supabase**: All data/auth/storage via Supabase. No direct DB access.
- **QR Code**: Use `qrcode.react` for QR code generation (see dashboard page).

## Key Files
- `app/auth/page.js`: Auth logic (login/signup)
- `app/dashboard/page.js`: Main dashboard, menu management, QR code
- `app/menu/[id]/page.js`: Public menu view for a restaurant
- `lib/supabaseClient.js`: Supabase client setup
- `app/layout.tsx`: Global layout, font, and style setup

## Example: Fetching Menu Items
```js
const { data: items } = await supabase
  .from('menu_items')
  .select('*')
  .eq('restaurant_id', id)
```

---

- Follow the above conventions for new features and bugfixes.
- Reference this file for project-specific patterns before making architectural changes.
