export type Artist = { id: string; name: string; url?: string };
export type Track = { id: string; name: string; artist: string; url?: string; image?: string };

export type Taste = {
  artists: Artist[];
  tracks: Track[];
  syncedAt?: string;
};

export type Member = {
  id: string;
  name: string;
  age: number;
  city: string;
  bio: string;
  avatar: string;
  pronouns?: string;
  instagram?: string;
  taste: Taste;
};

export type Match = Member & {
  score: number;
  sharedArtists: Artist[];
  sharedTracks: Track[];
};
