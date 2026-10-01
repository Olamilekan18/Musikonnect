import { NextRequest, NextResponse } from "next/server";
import { routeSupabase } from "@/lib/supabase-server";
import { siteUrl } from "@/lib/site-url";

type SpotifyArtist = { id: string; name: string; external_urls?: { spotify?: string } };
type SpotifyTrack = { id: string; name: string; artists?: { name: string }[]; external_urls?: { spotify?: string }; album?: { images?: { url: string }[] } };

function withMessage(response: NextResponse, request: NextRequest, key: "error" | "connected", message: string) {
  response.headers.set("Location", siteUrl(request, `/?${key}=${encodeURIComponent(message)}`).toString());
  return response;
}

export async function GET(request: NextRequest) {
  const code = request.nextUrl.searchParams.get("code");
  const oauthError = request.nextUrl.searchParams.get("error_description");
  if (oauthError) return NextResponse.redirect(siteUrl(request, `/?error=${encodeURIComponent(oauthError)}`));
  if (!code) return NextResponse.redirect(siteUrl(request, "/?error=Spotify%20sign-in%20could%20not%20be%20completed"));

  // The Supabase code exchange writes session cookies to this response.
  const response = NextResponse.redirect(siteUrl(request, "/"));
  const supabase = routeSupabase(request, response);
  if (!supabase) return withMessage(response, request, "error", "Account sign-in is not configured yet.");

  const { data, error } = await supabase.auth.exchangeCodeForSession(code);
  if (error) return withMessage(response, request, "error", error.message);
  const user = data.user;
  const token = data.session?.provider_token;
  if (!user || !token) return withMessage(response, request, "error", "Spotify did not return listening access. Please try again.");

  try {
    const headers = { Authorization: `Bearer ${token}` };
    const [artistsResponse, tracksResponse] = await Promise.all([
      fetch("https://api.spotify.com/v1/me/top/artists?time_range=medium_term&limit=20", { headers, cache: "no-store" }),
      fetch("https://api.spotify.com/v1/me/top/tracks?time_range=medium_term&limit=20", { headers, cache: "no-store" }),
    ]);
    if (!artistsResponse.ok || !tracksResponse.ok) return withMessage(response, request, "error", "Spotify could not load your top music. Please try again.");
    const artistsData = await artistsResponse.json() as { items?: SpotifyArtist[] };
    const tracksData = await tracksResponse.json() as { items?: SpotifyTrack[] };
    const artists = (artistsData.items ?? []).map((artist) => ({ id: artist.id, name: artist.name, url: artist.external_urls?.spotify }));
    const tracks = (tracksData.items ?? []).map((track) => ({ id: track.id, name: track.name, artist: track.artists?.map((artist) => artist.name).join(", ") ?? "", url: track.external_urls?.spotify, image: track.album?.images?.[0]?.url }));
    if (!artists.length && !tracks.length) return withMessage(response, request, "error", "Spotify has no top music for this account yet.");

    const name = String(user.user_metadata?.full_name || user.user_metadata?.name || user.user_metadata?.user_name || "Music lover").slice(0, 40);
    const { error: profileError } = await supabase.from("profiles").upsert({ id: user.id, display_name: name }, { onConflict: "id", ignoreDuplicates: true });
    if (profileError) return withMessage(response, request, "error", "Could not create your profile. Please check the database setup.");
    const { error: tasteError } = await supabase.from("music_tastes").upsert({ user_id: user.id, artists, tracks, synced_at: new Date().toISOString() });
    if (tasteError) return withMessage(response, request, "error", "Could not save your music taste. Please try again.");
    return withMessage(response, request, "connected", "spotify");
  } catch {
    return withMessage(response, request, "error", "Spotify could not load your top music. Please try again.");
  }
}
