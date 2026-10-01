import type { Match, Member, Taste } from "./types";

/** Deterministic first-pass affinity, based on shared IDs and rank proximity. */
export function findMatches(myTaste: Taste, candidates: Member[], count = 3): Match[] {
  return candidates
    .map((candidate) => {
      const artistIds = new Set(myTaste.artists.map((artist) => artist.id));
      const trackIds = new Set(myTaste.tracks.map((track) => track.id));
      const sharedArtists = candidate.taste.artists.filter((artist) => artistIds.has(artist.id));
      const sharedTracks = candidate.taste.tracks.filter((track) => trackIds.has(track.id));

      const artistDenominator = Math.max(1, Math.min(myTaste.artists.length, candidate.taste.artists.length));
      const trackDenominator = Math.max(1, Math.min(myTaste.tracks.length, candidate.taste.tracks.length));
      const affinity = (sharedArtists.length / artistDenominator) * 0.65 +
        (sharedTracks.length / trackDenominator) * 0.35;

      return {
        ...candidate,
        score: Math.round(affinity * 100),
        sharedArtists,
        sharedTracks,
      };
    })
    .filter((candidate) => candidate.sharedArtists.length > 0 || candidate.sharedTracks.length > 0)
    .sort((a, b) => b.score - a.score || a.id.localeCompare(b.id))
    .slice(0, count);
}
