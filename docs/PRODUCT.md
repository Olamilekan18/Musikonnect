# Musikonnect — product brief

## The idea

Musikonnect helps people meet through shared music taste. A person signs in with a streaming account, adds a short profile (name, age, city, bio, and an optional social handle), and receives a deliberately small set of 2–3 relevant listeners. The first integration is Spotify.

The product should feel like browsing a great record shop with a friend: warm, editorial, personal, and a little playful. The first UI direction uses a record sleeve, paper texture, citrus color, tight typography, and compact profile cards. It is a starting point for iteration if you provide references.

## Core journey

1. Arrive at the site and understand the promise in seconds.
2. Sign in with Spotify and import top artists and tracks with `user-top-read` permission. More streaming providers can be added later.
3. Add name, age (18+), city, a short bio, optional Instagram handle, and consent to appear in discovery.
4. See up to three matches ranked by shared artists and tracks, with an explanation of the overlap.
5. Save a person and optionally follow the social link that person chose to publish.

## MVP scope in this repository

- Responsive landing page and discovery room.
- Interactive sample profiles and a locally saved demo profile.
- Spotify account sign-in through Supabase Auth, once configured.
- Top-music import during Spotify sign-in, with the provider token discarded after the import.
- Supabase profile and music-taste storage with row-level security.
- Deterministic matching based on exact shared Spotify artist and track IDs.

The demo portraits and music data are fictional and clearly labeled. Real matches require multiple registered people with discoverability enabled and imported Spotify data.

## Decisions to revisit after testing

- Whether people want friend discovery, dating, community, or all three. The current language stays friendship-first.
- Matching radius: city-only, nearby, or global.
- How introductions happen: in-app requests/messages versus opt-in external social links.
- Additional streaming providers and manual taste input for people without Spotify.
- Safety and moderation tools before broad release: reporting, blocking, review of public bios, and profile deletion.

## Spotify platform constraint

Spotify currently limits development-mode apps to **five authenticated Spotify users**, each added to an allowlist, and the app owner needs Premium. That is enough for a small prototype, but public onboarding depends on Spotify access terms. The UI therefore has a full demo path. See [Spotify quota modes](https://developer.spotify.com/documentation/web-api/concepts/quota-modes).
