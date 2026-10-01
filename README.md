# Musikonnect

An editorial music-first people discovery MVP, built with Next.js, TypeScript, Supabase, and Spotify's Web API.

## Run the demo

```bash
npm install
npm run dev
```

Open <http://127.0.0.1:3000>. The demo needs no credentials. Edit a sample profile, inspect three match cards, and save people locally.

## Enable real accounts and Spotify

For the exact values to put into Spotify's **Create app** form, see [`docs/SPOTIFY_SETUP.md`](./docs/SPOTIFY_SETUP.md).
For the database, Spotify provider, and redirect settings in Supabase, see [`docs/SUPABASE_SETUP.md`](./docs/SUPABASE_SETUP.md).

1. Create a Supabase project and apply the migration in [`supabase/migrations`](./supabase/migrations) with the CLI (or use [`supabase/schema.sql`](./supabase/schema.sql) in the SQL Editor).
2. Enable **Spotify** in Supabase Auth and enter your Spotify Client ID and Client Secret there. Copy the Supabase Spotify **Callback URL** into the Spotify app's **Redirect URIs**. See the [setup guide](./docs/SUPABASE_SETUP.md).
3. In Supabase Auth URL settings, add `http://127.0.0.1:3000/auth/callback` to allowed redirects and set the Site URL to `http://127.0.0.1:3000`.
4. Copy `.env.example` to `.env.local` and fill in the Supabase URL and anon key. Keep `NEXT_PUBLIC_SITE_URL` at `http://127.0.0.1:3000` locally; change it to your HTTPS domain when deploying.
5. Restart `npm run dev`, sign in with Spotify, and complete your profile. Repeat with other allowlisted Spotify accounts to test real matching.

Supabase handles Spotify OAuth with PKCE. The app requests `user-read-email` and `user-top-read`, imports top items, and does not store the provider access token. Reconnecting refreshes the taste snapshot. The Spotify app's development mode has a small authorized-user limit; see [`docs/PRODUCT.md`](./docs/PRODUCT.md).

## Files

- [`docs/PRODUCT.md`](./docs/PRODUCT.md) — product direction and open decisions.
- [`app/page.tsx`](./app/page.tsx) and [`app/globals.css`](./app/globals.css) — the first UI direction.
- [`lib/matching.ts`](./lib/matching.ts) — explainable first-pass matching.
- [`supabase/schema.sql`](./supabase/schema.sql) — database tables and access policies.
- [`app/auth/callback/route.ts`](./app/auth/callback/route.ts) — Spotify sign-in and top-music import callback.

## Current limitations

This is an MVP. Real sign-in and import need your own provider credentials. Matching uses exact top-item overlap; it does not yet model genre affinity or listening recency. There is no in-app messaging or moderation workflow yet. Profiles stay hidden from other people until discoverability is enabled.
