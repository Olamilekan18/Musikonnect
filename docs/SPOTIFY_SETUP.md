# Spotify dashboard setup for Musikonnect

## Fill in Spotify's “Create app” form

| Field in the form | Enter this |
| --- | --- |
| App name | `Musikonnect` |
| App description | `Musikonnect helps adults discover 2–3 people with similar music tastes. With permission, it reads their top Spotify artists and tracks to suggest matches.` |
| Website | Leave blank for local development. Add the public HTTPS site when it is deployed. |
| Redirect URIs | The **Callback URL** shown in Supabase **Authentication → Sign In / Providers → Spotify**, usually `https://YOUR-PROJECT-REF.supabase.co/auth/v1/callback` |
| Which API/SDK? | Check **Web API** only. |

After entering the redirect URI, click the purple **Add** button and make sure the address appears in the saved list, then **Save**. Spotify requires the URI to match exactly. The earlier local URI (`http://127.0.0.1:3000/api/spotify/callback`) is no longer used by Musikonnect's Spotify sign-in flow. See [Spotify's redirect URI rules](https://developer.spotify.com/documentation/web-api/concepts/redirect_uri).

## After the dashboard opens

1. Copy the **Client ID** and **Client Secret** from the Spotify app overview or Settings. Enter both in Supabase **Authentication → Sign In / Providers → Spotify** and turn the provider on. Keep the secret private.
2. In Supabase **Authentication → URL Configuration**, add `http://127.0.0.1:3000/auth/callback` under **Redirect URLs** and set the **Site URL** to `http://127.0.0.1:3000` for local development.
3. In Spotify's app **Settings → Users Management**, add the Spotify name and email of each person testing the app. Development mode allows up to five authenticated users, and the app owner needs Spotify Premium. See [Spotify quota modes](https://developer.spotify.com/documentation/web-api/concepts/quota-modes).
4. Restart the app with `npm run dev` and open `http://127.0.0.1:3000` (not `localhost`).

The app uses Spotify itself for sign-in through Supabase, then reads top music during the same callback. The Supabase project and database setup in the [README](../README.md) must also be completed for real accounts.

The app requests `user-read-email` for account identity and `user-top-read` for top artists and tracks. Supabase handles the OAuth code exchange. Musikonnect imports a snapshot and does not store the Spotify access token.
