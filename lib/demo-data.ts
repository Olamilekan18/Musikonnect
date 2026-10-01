import type { Member, Taste } from "./types";

export const demoTaste: Taste = {
  artists: [
    { id: "sza", name: "SZA" },
    { id: "frank-ocean", name: "Frank Ocean" },
    { id: "temsd", name: "Tems" },
    { id: "tyler", name: "Tyler, The Creator" },
    { id: "burna-boy", name: "Burna Boy" },
    { id: "cleo-sol", name: "Cleo Sol" },
  ],
  tracks: [
    { id: "snooze", name: "Snooze", artist: "SZA" },
    { id: "free-mind", name: "Free Mind", artist: "Tems" },
    { id: "pink-white", name: "Pink + White", artist: "Frank Ocean" },
    { id: "sugar", name: "SUGAR", artist: "Brockhampton" },
    { id: "lovely-day", name: "Lovely Day", artist: "Bill Withers" },
  ],
};

export const demoMembers: Member[] = [
  {
    id: "demo-zara",
    name: "Zara",
    age: 24,
    city: "Lagos, Nigeria",
    bio: "Usually making a playlist for a very specific feeling. I think the best conversations start with ‘wait, you know that song too?’",
    avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=520&q=85&fit=crop&crop=faces",
    pronouns: "she/her",
    instagram: "zarainstereo",
    taste: {
      artists: [
        { id: "sza", name: "SZA" }, { id: "temsd", name: "Tems" },
        { id: "frank-ocean", name: "Frank Ocean" }, { id: "cleo-sol", name: "Cleo Sol" },
        { id: "little-simz", name: "Little Simz" }, { id: "solange", name: "Solange" },
      ],
      tracks: [
        { id: "free-mind", name: "Free Mind", artist: "Tems" },
        { id: "snooze", name: "Snooze", artist: "SZA" },
        { id: "pink-white", name: "Pink + White", artist: "Frank Ocean" },
      ],
    },
  },
  {
    id: "demo-ife",
    name: "Ifé",
    age: 26,
    city: "Lagos, Nigeria",
    bio: "Record shop wanderer, late-night walker, and firm believer that the aux cord is a love language.",
    avatar: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=520&q=85&fit=crop&crop=faces",
    pronouns: "he/him",
    instagram: "ifeafterhours",
    taste: {
      artists: [
        { id: "frank-ocean", name: "Frank Ocean" }, { id: "tyler", name: "Tyler, The Creator" },
        { id: "burna-boy", name: "Burna Boy" }, { id: "sza", name: "SZA" },
        { id: "amaarae", name: "Amaarae" }, { id: "odunsi", name: "Odunsi" },
      ],
      tracks: [
        { id: "pink-white", name: "Pink + White", artist: "Frank Ocean" },
        { id: "sugar", name: "SUGAR", artist: "Brockhampton" },
        { id: "snooze", name: "Snooze", artist: "SZA" },
      ],
    },
  },
  {
    id: "demo-maya",
    name: "Maya",
    age: 23,
    city: "Abuja, Nigeria",
    bio: "I collect concert tickets, voice notes, and songs that feel like the last 10 minutes of a film.",
    avatar: "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=520&q=85&fit=crop&crop=faces",
    pronouns: "she/her",
    instagram: "mayamakesmixes",
    taste: {
      artists: [
        { id: "temsd", name: "Tems" }, { id: "cleo-sol", name: "Cleo Sol" },
        { id: "sza", name: "SZA" }, { id: "asake", name: "Asake" },
        { id: "jorja", name: "Jorja Smith" }, { id: "ayra", name: "Ayra Starr" },
      ],
      tracks: [
        { id: "free-mind", name: "Free Mind", artist: "Tems" },
        { id: "lovely-day", name: "Lovely Day", artist: "Bill Withers" },
        { id: "snooze", name: "Snooze", artist: "SZA" },
      ],
    },
  },
];
