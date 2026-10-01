# Finish Supabase setup for Musikonnect

The project's URL and anon key are already in `.env.local`. Do not add a `service_role` key to the browser app.

## 1. Create the app tables

The repository now includes a versioned migration at [`supabase/migrations/20261001150000_initial_schema.sql`](../supabase/migrations/20261001150000_initial_schema.sql). From the project root in PowerShell, run:

```powershell
npx supabase login
npx supabase link --project-ref YOUR_PROJECT_REF
npx supabase db push --dry-run --skip-vault
npx supabase db push --skip-vault
```

Get `YOUR_PROJECT_REF` from your Supabase dashboard URL (`.../project/YOUR_PROJECT_REF`). `link` may ask for the database password you set when creating the project. The dry run should list `20261001150000_initial_schema.sql`; inspect that before running the final command. Do not paste your access token or database password into chat. `db push` applies migration files from `supabase/migrations`, not arbitrary SQL files. [Supabase migrations guide](https://supabase.com/docs/guides/deployment/database-migrations)

If you prefer the dashboard, use the SQL Editor alternative below. Choose one method for the initial setup; future schema changes should be added as new migrations.

In your Supabase project dashboard, open **SQL Editor → New query**. Copy the entire contents of [`supabase/schema.sql`](../supabase/schema.sql), paste it into the editor, and click **Run**. It creates the `profiles` and `music_tastes` tables and their row-level security policies. [Supabase SQL Editor documentation](https://supabase.com/docs/guides/database/overview)

After running it, **Table Editor** should show both tables. New profiles are private until their owners enable discoverability.

## 2. Enable Spotify sign-in

In **Authentication → Sign In / Providers → Spotify**, enable the provider and enter the **Client ID and Client Secret** from your Spotify Developer app. Copy the **Callback URL** shown on that Supabase provider page and add it under **Redirect URIs** in your Spotify app's settings. It normally looks like:

```text
https://YOUR-PROJECT-REF.supabase.co/auth/v1/callback
```

Use the exact callback URL displayed by your Supabase project. Click **Add** and **Save** in Spotify, then **Save** in Supabase. The Spotify redirect goes to Supabase first, not directly to the local Musikonnect app. Keep the Client Secret in Supabase; do not put it in `.env.local` or chat. [Supabase Spotify sign-in guide](https://supabase.com/docs/guides/auth/social-login/auth-spotify)

## 3. Allow the local app callback

In **Authentication → URL Configuration**, set the **Site URL** to:

```text
http://127.0.0.1:3000
```

Add this exact URL under **Redirect URLs**:

```text
http://127.0.0.1:3000/auth/callback
```

Supabase sends users there after Spotify sign-in. This is a separate URL from the Spotify dashboard redirect above. [Supabase redirect URL guide](https://supabase.com/docs/guides/auth/redirect-urls)

## 4. Test the flow

1. Restart the app with `npm run dev` and visit `http://127.0.0.1:3000`.
2. Select **Log in → Continue with Spotify** and grant access to top music. If Supabase asks you to confirm your email on first sign-in, use the confirmation link and try again.
3. Open **Your profile**, add your name, age (18+), city, and bio, then save.
4. Your top artists and tracks should appear in the listening room. Your Spotify account must be allowed in the Spotify app's development-mode user list.
5. After two or more people have signed in and enabled discoverability, real matches can appear.

The app uses only the public Supabase anon key in `.env.local`. Spotify OAuth credentials belong in Supabase's provider settings. Supabase returns a short-lived provider access token to the callback; Musikonnect imports a taste snapshot and does not store the token.
