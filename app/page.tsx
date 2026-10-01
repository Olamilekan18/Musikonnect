"use client";

import { useEffect, useMemo, useState } from "react";
import { ArrowDownRight, ArrowRight, ArrowUpRight, Check, Disc3, Heart, Instagram, MapPin, Menu, Music2, Sparkles, X } from "lucide-react";
import { demoMembers, demoTaste } from "@/lib/demo-data";
import { findMatches } from "@/lib/matching";
import { browserSupabase, hasSupabase } from "@/lib/supabase";
import type { Match, Member, Taste } from "@/lib/types";

type Profile = { name: string; age: string; city: string; bio: string; instagram: string; discoverable: boolean };
const initialProfile: Profile = {
  name: "You", age: "24", city: "Lagos, Nigeria", bio: "Always looking for the next song to send someone.", instagram: "", discoverable: true,
};

type Modal = "auth" | "profile" | "match" | null;

function initials(name: string) { return name.split(" ").map((part) => part[0]).join("").slice(0, 2).toUpperCase(); }

export default function Home() {
  const [profile, setProfile] = useState<Profile>(initialProfile);
  const [draft, setDraft] = useState<Profile>(initialProfile);
  const [userId, setUserId] = useState<string | null>(null);
  const [taste, setTaste] = useState<Taste | null>(null);
  const [members, setMembers] = useState<Member[]>([]);
  const [modal, setModal] = useState<Modal>(null);
  const [selected, setSelected] = useState<Match | null>(null);
  const [saved, setSaved] = useState<string[]>([]);
  const [toast, setToast] = useState("");
  const [busy, setBusy] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  const isLive = Boolean(userId && taste);
  const activeTaste = taste ?? demoTaste;
  const matches = useMemo(() => findMatches(activeTaste, isLive ? members : demoMembers), [activeTaste, isLive, members]);

  useEffect(() => {
    try {
      const local = localStorage.getItem("musikonnect:demo-profile");
      if (local) { const next = { ...initialProfile, ...JSON.parse(local) }; setProfile(next); setDraft(next); }
      const favorites = localStorage.getItem("musikonnect:saved");
      if (favorites) setSaved(JSON.parse(favorites));
    } catch { /* malformed local demo data should not break the app */ }
    const params = new URLSearchParams(window.location.search);
    if (params.get("connected") === "spotify") setToast("Your Spotify taste is in. Welcome to your wavelength.");
    if (params.get("error")) setToast(decodeURIComponent(params.get("error") ?? "Something went wrong."));
    if (params.has("connected") || params.has("error")) window.history.replaceState({}, "", "/");

    const supabase = browserSupabase();
    if (!supabase) return;
    let active = true;
    async function load() {
      const { data: userData } = await supabase!.auth.getUser();
      if (!active || !userData.user) return;
      const id = userData.user.id;
      setUserId(id);
      const [{ data: profileData }, { data: tasteData }, { data: people }] = await Promise.all([
        supabase!.from("profiles").select("*").eq("id", id).maybeSingle(),
        supabase!.from("music_tastes").select("*").eq("user_id", id).maybeSingle(),
        supabase!.from("profiles").select("id, display_name, age, city, bio, instagram, avatar_url, music_tastes(artists, tracks, synced_at)").eq("discoverable", true).neq("id", id).limit(50),
      ]);
      if (!active) return;
      if (profileData) {
        const next = { name: profileData.display_name ?? "You", age: String(profileData.age ?? ""), city: profileData.city ?? "", bio: profileData.bio ?? "", instagram: profileData.instagram ?? "", discoverable: profileData.discoverable ?? true };
        setProfile(next); setDraft(next);
      } else {
        const name = userData.user.user_metadata?.full_name || userData.user.user_metadata?.name || "You";
        setProfile((previous) => ({ ...previous, name }));
        setDraft((previous) => ({ ...previous, name }));
      }
      if (tasteData) setTaste({ artists: tasteData.artists ?? [], tracks: tasteData.tracks ?? [], syncedAt: tasteData.synced_at });
      if (people) {
        setMembers(people.flatMap((person: Record<string, unknown>) => {
          const raw = Array.isArray(person.music_tastes) ? person.music_tastes[0] : person.music_tastes;
          const music = raw as { artists?: Taste["artists"]; tracks?: Taste["tracks"] } | null;
          if (!music?.artists?.length) return [];
          return [{ id: String(person.id), name: String(person.display_name ?? "Music lover"), age: Number(person.age ?? 0), city: String(person.city ?? "Somewhere"), bio: String(person.bio ?? ""), avatar: String(person.avatar_url ?? ""), instagram: String(person.instagram ?? ""), taste: { artists: music.artists ?? [], tracks: music.tracks ?? [] } } satisfies Member];
        }));
      }
    }
    void load();
    const { data: subscription } = supabase.auth.onAuthStateChange(() => { void load(); });
    return () => { active = false; subscription.subscription.unsubscribe(); };
  }, []);

  useEffect(() => {
    if (!toast) return;
    const timer = window.setTimeout(() => setToast(""), 5200);
    return () => window.clearTimeout(timer);
  }, [toast]);

  function scrollToMatches() { document.getElementById("matches")?.scrollIntoView({ behavior: "smooth" }); setMenuOpen(false); }
  function openProfile() { setDraft(profile); setModal("profile"); }
  function viewMatch(person: Match) { setSelected(person); setModal("match"); }
  function toggleSaved(id: string) {
    const next = saved.includes(id) ? saved.filter((item) => item !== id) : [...saved, id];
    setSaved(next); localStorage.setItem("musikonnect:saved", JSON.stringify(next));
    setToast(saved.includes(id) ? "Removed from your saved people." : "Saved to your people.");
  }
  async function saveProfile() {
    if (!draft.name.trim() || !draft.city.trim() || !Number.isInteger(Number(draft.age)) || Number(draft.age) < 18 || Number(draft.age) > 100) {
      setToast("Add your name, city, and an age of 18 or older."); return;
    }
    setBusy(true);
    const next = { ...draft, name: draft.name.trim(), city: draft.city.trim(), bio: draft.bio.trim(), instagram: draft.instagram.trim().replace(/^@/, "") };
    if (userId) {
      const supabase = browserSupabase();
      const { error } = await supabase!.from("profiles").upsert({ id: userId, display_name: next.name, age: Number(next.age), city: next.city, bio: next.bio, instagram: next.instagram, discoverable: next.discoverable });
      if (error) { setBusy(false); setToast(error.message); return; }
    } else localStorage.setItem("musikonnect:demo-profile", JSON.stringify(next));
    setProfile(next); setBusy(false); setModal(null); setToast(userId ? "Profile saved." : "Demo profile saved on this device.");
  }
  async function signIn() {
    const supabase = browserSupabase();
    if (!supabase) { setToast("Add Supabase keys to .env.local to enable Spotify sign-in."); return; }
    setBusy(true);
    const { error } = await supabase.auth.signInWithOAuth({ provider: "spotify", options: { redirectTo: `${window.location.origin}/auth/callback`, scopes: "user-read-email user-top-read" } });
    if (error) { setToast(error.message); setBusy(false); }
  }
  async function signOut() {
    await browserSupabase()?.auth.signOut();
    setUserId(null); setTaste(null); setMembers([]);
    setToast("Signed out. The demo is still here whenever you need it.");
  }
  function connectSpotify() {
    if (!userId) { setModal("auth"); return; }
    void signIn();
  }

  return (
    <main>
      <div className="announcement"><span className="announce-spark">✳</span> WHERE GOOD TASTE FINDS GOOD COMPANY <span className="announce-spark">✳</span></div>
      <header className="site-header wrap">
        <a className="brand" href="#top" aria-label="Musikonnect home"><span className="brand-mark"><span /></span><span>musiko<span className="brand-em">nnect</span><span className="brand-period">.</span></span></a>
        <nav className={menuOpen ? "nav-links open" : "nav-links"} aria-label="Main navigation">
          <a href="#how" onClick={() => setMenuOpen(false)}>The idea</a>
          <a href="#matches" onClick={() => setMenuOpen(false)}>Explore matches</a>
          <button className="nav-profile" onClick={openProfile}>Your profile <ArrowUpRight size={15} /></button>
        </nav>
        <div className="header-actions">
          {userId ? <button className="header-login" onClick={signOut}>Sign out</button> : <button className="header-login" onClick={() => setModal("auth")}>Log in</button>}
          <button className="pill-button header-cta" onClick={connectSpotify}>{userId ? "Refresh Spotify" : "Get started"}<ArrowUpRight size={17} /></button>
          <button className="menu-button" aria-label="Toggle menu" onClick={() => setMenuOpen(!menuOpen)}>{menuOpen ? <X /> : <Menu />}</button>
        </div>
      </header>

      <section className="hero wrap" id="top">
        <div className="hero-copy">
          <div className="eyebrow"><span className="eyebrow-line" /> THE SOCIAL SIDE OF SOUND <span className="eyebrow-index">/ 001</span></div>
          <h1>Same songs.<br /><span className="serif-italic">New people.</span></h1>
          <p className="hero-description">You know that feeling when someone loves <em>that</em> song too? We made a place for it. Meet 2–3 people who sound like your kind of people.</p>
          <div className="hero-buttons"><button className="pill-button pill-large" onClick={connectSpotify}><Disc3 size={20} /> Connect with Spotify <ArrowUpRight size={19} /></button><button className="text-button" onClick={scrollToMatches}>Explore the demo <ArrowDownRight size={18} /></button></div>
          <div className="hero-note"><div className="mini-avatars"><img src={demoMembers[0].avatar} alt="" /><img src={demoMembers[1].avatar} alt="" /><img src={demoMembers[2].avatar} alt="" /></div><span>For the people who make playlists<br />instead of small talk.</span></div>
        </div>
        <div className="hero-art" aria-label="Illustration of a record sleeve and a listening connection">
          <div className="hero-art-label">A BETTER WAY TO FIND YOUR FREQUENCY <span>↗</span></div>
          <div className="sleeve-shadow" />
          <div className="sleeve">
            <div className="sleeve-top"><span>MK / 01</span><span>STEREO PEOPLE CLUB</span></div>
            <div className="record"><div className="record-rings" /><div className="record-center"><span>side a</span><strong>YOU<br />+<br />THEM</strong><small>33⅓ RPM</small></div></div>
            <div className="sleeve-bottom"><span>LISTEN CLOSELY.</span><span>GOOD THINGS FOLLOW.</span></div>
          </div>
          <div className="art-sticker"><span>✳</span> made for<br />your ears</div>
          <div className="art-card"><div className="art-card-icon"><Music2 size={21} /></div><div><span>NOW PLAYING</span><strong>A new connection</strong><small>with someone on your wavelength</small></div><div className="equalizer"><i /><i /><i /><i /></div></div>
          <div className="hero-art-footer">DROP THE NEEDLE. FIND YOUR PEOPLE. <span>© 2026 MUSIKONNECT</span></div>
        </div>
      </section>

      <div className="ticker" aria-hidden="true"><div>SHARED SONGS <span>✳</span> STRANGER TO FRIEND <span>✳</span> GOOD TASTE, GOOD COMPANY <span>✳</span> SHARED SONGS <span>✳</span> STRANGER TO FRIEND <span>✳</span> GOOD TASTE, GOOD COMPANY <span>✳</span></div></div>

      <section className="how wrap" id="how">
        <div className="section-kicker"><span>01 / THE IDEA</span><span>IT STARTS WITH A SONG</span></div>
        <div className="how-grid"><h2>Less scrolling.<br /><span className="serif-italic">More knowing.</span></h2><div className="how-right"><p>Your music taste says things your bio never could. Connect Spotify, tell us a little about yourself, and we’ll find a small handful of people who hear the world a little like you do.</p><div className="steps"><div><span>01</span><strong>Connect your sound</strong><small>Bring your top artists and tracks.</small></div><div><span>02</span><strong>Make it personal</strong><small>Add a name, age, city, and a little bio.</small></div><div><span>03</span><strong>Meet your people</strong><small>See 2–3 thoughtful matches and why you click.</small></div></div></div></div>
      </section>

      <section className="discovery" id="matches">
        <div className="wrap discovery-inner">
          <div className="section-kicker light"><span>02 / THE LISTENING ROOM</span><span>{isLive ? "YOUR REAL LISTENING DATA" : "INTERACTIVE DEMO PREVIEW"}</span></div>
          <div className="discovery-heading"><h2>People on your<br /><span className="serif-italic">wavelength.</span></h2><p>A small circle of listeners whose favorites feel familiar. Here’s what your room could look like.</p></div>
          <div className="room-grid">
            <aside className="taste-card">
              <div className="taste-card-head"><span>YOUR SIDE OF THE RECORD</span><span>MK / YOU</span></div>
              <div className="taste-profile"><div className="taste-avatar">{initials(profile.name)}</div><div><span>LISTENER PROFILE</span><strong>{profile.name}</strong><small><MapPin size={13} /> {profile.city || "Your city"}</small></div><button onClick={openProfile} aria-label="Edit profile"><ArrowUpRight size={19} /></button></div>
              <div className="taste-vinyl"><div className="taste-vinyl-inner"><span>on repeat</span><strong>{activeTaste.artists[0]?.name ?? "Your music"}</strong><small>33⅓ RPM</small></div></div>
              <div className="taste-list-heading"><span>HEAVY ROTATION</span><span>TOP ARTISTS</span></div>
              <div className="taste-artists">{activeTaste.artists.slice(0, 4).map((artist, index) => <div key={artist.id}><span>0{index + 1}</span><strong>{artist.name}</strong><span className="artist-wave">{index === 0 ? "▂▅▇▃▆" : index === 1 ? "▆▃▇▂▅" : "▃▇▅▂▆"}</span></div>)}</div>
              <div className="taste-bottom"><span className="status-dot" /> {isLive ? "SPOTIFY CONNECTED" : "SAMPLE LISTENING DATA"}<button onClick={connectSpotify}>{isLive ? "Refresh" : "Connect yours"} <ArrowUpRight size={14} /></button></div>
            </aside>

            <div className="matches-area">
              <div className="matches-toolbar"><div><span className="room-dot" /><strong>{matches.length ? `${matches.length} potential connections` : "Your room is warming up"}</strong></div><span>{isLive ? "BASED ON YOUR SPOTIFY" : "A PREVIEW OF WHAT'S POSSIBLE"}</span></div>
              {matches.length ? <div className="match-list">{matches.map((person, index) => <article className="match-card" key={person.id}>
                <button className="match-photo" onClick={() => viewMatch(person)} aria-label={`View ${person.name}'s profile`}>{person.avatar ? <img src={person.avatar} alt={person.name} /> : <span>{initials(person.name)}</span>}<span className="match-number">0{index + 1}</span></button>
                <div className="match-content"><div className="match-topline"><span>LISTENING MATCH / 0{index + 1}</span><span className="match-score"><span className="score-dot" /> {person.score}% IN SYNC</span></div><div className="match-main"><div><h3>{person.name}<span>, {person.age || "—"}</span></h3><p className="match-city"><MapPin size={14} /> {person.city}</p></div><button className={saved.includes(person.id) ? "save-button saved" : "save-button"} onClick={() => toggleSaved(person.id)} aria-label={saved.includes(person.id) ? `Unsave ${person.name}` : `Save ${person.name}`}><Heart size={19} fill={saved.includes(person.id) ? "currentColor" : "none"} /></button></div><p className="match-bio">{person.bio}</p><div className="common-tags"><span>IN COMMON</span>{person.sharedArtists.slice(0, 3).map((artist) => <span className="common-tag" key={artist.id}>{artist.name}</span>)}</div><button className="match-open" onClick={() => viewMatch(person)}>Meet {person.name} <ArrowUpRight size={17} /></button></div>
              </article>)}</div> : <div className="empty-room"><Disc3 size={48} /><h3>No matches just yet.</h3><p>As more people join and connect Spotify, your listening room will fill up.</p><button className="pill-button" onClick={openProfile}>Complete your profile <ArrowUpRight size={16} /></button></div>}
              <p className="room-footnote"><Sparkles size={15} /> {isLive ? "Matches are based on shared top artists and tracks. New listeners appear as they join." : "These are sample profiles. Connect your accounts to see real listeners."}</p>
            </div>
          </div>
        </div>
      </section>

      <section className="closing wrap"><div className="closing-orbit"><span>✳</span><div className="orbit-one" /><div className="orbit-two" /></div><div><div className="section-kicker"><span>03 / YOUR TURN</span><span>LET'S FIND YOUR FREQUENCY</span></div><h2>There’s someone out there<br />who gets <span className="serif-italic">your playlist.</span></h2><p>Start with the music. See where the conversation goes.</p><button className="pill-button pill-large" onClick={connectSpotify}><Disc3 size={19} /> {userId ? "Refresh Spotify" : "Find your people"} <ArrowUpRight size={18} /></button></div></section>
      <footer className="footer"><div className="wrap footer-inner"><a className="brand" href="#top"><span className="brand-mark"><span /></span><span>musiko<span className="brand-em">nnect</span><span className="brand-period">.</span></span></a><p>GOOD MUSIC IS BETTER SHARED.</p><div><a href="#how">The idea</a><a href="#matches">The room</a><span>© 2026</span></div></div></footer>

      {toast && <div className="toast" role="status"><span>✳</span>{toast}<button onClick={() => setToast("")} aria-label="Dismiss"><X size={16} /></button></div>}

      {modal && <div className="modal-backdrop" onMouseDown={(event) => { if (event.target === event.currentTarget) setModal(null); }}><div className="modal" role="dialog" aria-modal="true" aria-label={modal === "profile" ? "Edit your profile" : modal === "match" ? "Match profile" : "Join Musikonnect"}><button className="modal-close" onClick={() => setModal(null)} aria-label="Close"><X size={20} /></button>
        {modal === "auth" && <div className="auth-modal"><div className="modal-kicker">WELCOME TO THE ROOM / 001</div><div className="auth-icon"><Disc3 size={38} /></div><h2>Start with <span className="serif-italic">the music.</span></h2><p>Sign in with Spotify to bring your top artists and tracks into your listening room.</p><button className="auth-spotify" disabled={busy} onClick={signIn}><Disc3 size={20} /> Continue with Spotify <ArrowRight size={17} /></button><button className="auth-demo" onClick={() => { setModal(null); scrollToMatches(); }}>Just explore the demo <ArrowUpRight size={16} /></button><small>{hasSupabase ? "We use a snapshot of your top music for matching. You can refresh it any time." : "Spotify sign-in needs Supabase keys. The demo works now."}</small></div>}
        {modal === "profile" && <div className="profile-modal"><div className="modal-kicker">YOUR SIDE OF THE RECORD / PROFILE</div><h2>Tell us a little<br /><span className="serif-italic">about you.</span></h2><p>The music does a lot of talking. These details help people say hello.</p><div className="profile-fields"><label>Name<input value={draft.name} maxLength={40} onChange={(event) => setDraft({ ...draft, name: event.target.value })} placeholder="Your name" /></label><div className="field-row"><label>Age<input type="number" min={18} max={100} value={draft.age} onChange={(event) => setDraft({ ...draft, age: event.target.value })} /></label><label>City<input value={draft.city} maxLength={80} onChange={(event) => setDraft({ ...draft, city: event.target.value })} placeholder="Lagos, Nigeria" /></label></div><label>A little bio<textarea value={draft.bio} maxLength={220} onChange={(event) => setDraft({ ...draft, bio: event.target.value })} placeholder="A thought, a feeling, a favorite lyric…" /></label><label>Instagram handle <span>(optional)</span><input value={draft.instagram} maxLength={40} onChange={(event) => setDraft({ ...draft, instagram: event.target.value })} placeholder="@yourhandle" /></label><label className="checkbox-line"><input type="checkbox" checked={draft.discoverable} onChange={(event) => setDraft({ ...draft, discoverable: event.target.checked })} /> Show my profile to potential matches</label></div><button className="pill-button modal-primary" onClick={saveProfile} disabled={busy}>{busy ? "Saving…" : "Save profile"}<Check size={17} /></button>{!userId && <small>Demo changes are saved on this device. Sign in to create a real profile.</small>}</div>}
        {modal === "match" && selected && <div className="match-modal"><div className="modal-kicker">YOUR LISTENING MATCH / {selected.score}% IN SYNC</div><div className="match-modal-hero"><div className="match-modal-photo">{selected.avatar ? <img src={selected.avatar} alt={selected.name} /> : <span>{initials(selected.name)}</span>}</div><div><h2>{selected.name}<span>, {selected.age || "—"}</span></h2><p><MapPin size={15} /> {selected.city}</p></div></div><p className="match-modal-bio">“{selected.bio}”</p><div className="match-modal-section"><span>ON BOTH YOUR ROTATIONS</span><div className="shared-list">{selected.sharedArtists.slice(0, 4).map((artist, index) => <div key={artist.id}><span>0{index + 1}</span><strong>{artist.name}</strong><Music2 size={16} /></div>)}</div></div><div className="match-modal-actions"><button className="pill-button" onClick={() => toggleSaved(selected.id)}><Heart size={16} fill={saved.includes(selected.id) ? "currentColor" : "none"} /> {saved.includes(selected.id) ? "Saved" : "Save this person"}</button>{isLive && selected.instagram && <a href={`https://instagram.com/${encodeURIComponent(selected.instagram)}`} target="_blank" rel="noreferrer"><Instagram size={17} /> Say hello <ArrowUpRight size={16} /></a>}</div><small>{isLive ? "Only contact people through social links they choose to share." : "This is a sample profile for the demo."}</small></div>}
      </div></div>}
    </main>
  );
}
