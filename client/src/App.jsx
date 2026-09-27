import { useEffect, useMemo, useRef, useState } from 'react';
import { Link, NavLink, useLocation, useNavigate } from 'react-router-dom';
import { AudioLines, ChevronLeft, ChevronRight, CircleUserRound, Disc3, Heart, Home, Library, ListMusic, ListPlus, LogOut, Music2, Pause, Play, Plus, Search, SkipBack, SkipForward, Volume2, X } from 'lucide-react';
import { api } from './api.js';

const demoTracks = [
  { _id: 'demo-1', title: 'Night Drive', artist: 'The Midnight', album: 'After Hours', duration: 231, genre: 'Synthwave', coverUrl: 'https://images.unsplash.com/photo-1519608487953-e999c86e7455?auto=format&fit=crop&w=500&q=80', audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3' },
  { _id: 'demo-2', title: 'Soft Focus', artist: 'Luna Park', album: 'Somewhere Quiet', duration: 198, genre: 'Indie', coverUrl: 'https://images.unsplash.com/photo-1470252649378-9c29740c9fa8?auto=format&fit=crop&w=500&q=80', audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3' },
  { _id: 'demo-3', title: 'Open Water', artist: 'Milo June', album: 'Blue Hour', duration: 215, genre: 'Alternative', coverUrl: 'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=500&q=80', audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3' },
  { _id: 'demo-4', title: 'Satellite Heart', artist: 'Kira Sol', album: 'Orbit', duration: 204, genre: 'Pop', coverUrl: 'https://images.unsplash.com/photo-1462331940025-496dfbfc7564?auto=format&fit=crop&w=500&q=80', audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-4.mp3' },
  { _id: 'demo-5', title: 'A Good Thing', artist: 'Common Ground', album: 'Easy Does It', duration: 187, genre: 'Soul', coverUrl: 'https://images.unsplash.com/photo-1518837695005-2083093ee35b?auto=format&fit=crop&w=500&q=80', audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-5.mp3' },
  { _id: 'demo-6', title: 'Slow Motion', artist: 'Lena Grey', album: 'Little Weather', duration: 242, genre: 'Electronic', coverUrl: 'https://images.unsplash.com/photo-1519681393784-d120267933ba?auto=format&fit=crop&w=500&q=80', audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-6.mp3' },
  { _id: 'demo-7', title: 'Postcards', artist: 'Weekend Club', album: 'Away Days', duration: 193, genre: 'Indie', coverUrl: 'https://images.unsplash.com/photo-1470770841072-f978cf4d019e?auto=format&fit=crop&w=500&q=80', audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-7.mp3' },
  { _id: 'demo-8', title: 'First Light', artist: 'Eli North', album: 'New Ground', duration: 226, genre: 'Alternative', coverUrl: 'https://images.unsplash.com/photo-1500534623283-312aade485b7?auto=format&fit=crop&w=500&q=80', audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-8.mp3' }
];
const demoPlaylists = [{ id: 'made-for-you', name: 'Late night focus' }, { id: 'made-for-you-2', name: 'Sunday reset' }];
const formatTime = (seconds = 0) => `${Math.floor(seconds / 60)}:${String(Math.floor(seconds % 60)).padStart(2, '0')}`;
const isDatabaseId = (id) => /^[a-f\d]{24}$/i.test(id || '');

function TrackRow({ track, index, current, playing, liked, playlistLabel, onPlay, onLike, onPlaylist }) {
  return <div className={`track-row ${current?._id === track._id ? 'is-current' : ''}`} onDoubleClick={() => onPlay(track)}>
    <button className="track-number" aria-label={`Play ${track.title}`} onClick={() => onPlay(track)}>{current?._id === track._id && playing ? <AudioLines size={16} /> : <><span>{String(index + 1).padStart(2, '0')}</span><Play size={14} /></>}</button>
    <img className="track-cover" src={track.coverUrl} alt="" />
    <div className="track-title"><strong>{track.title}</strong><Link to={`/artist/${encodeURIComponent(track.artist)}`}>{track.artist}</Link></div>
    <Link className="track-album" to={`/album/${encodeURIComponent(track.album)}`}>{track.album}</Link>
    <span className="track-genre">{track.genre}</span>
    <div className="track-actions"><button className={`icon-button like-button ${liked ? 'liked' : ''}`} aria-label={liked ? 'Unlike track' : 'Like track'} onClick={() => onLike(track)}><Heart size={16} fill={liked ? 'currentColor' : 'none'} /></button><button className="icon-button playlist-button" aria-label={playlistLabel || 'Add to playlist'} title={playlistLabel || 'Add to playlist'} onClick={() => onPlaylist(track)}><ListPlus size={16} /></button></div>
    <span className="track-duration">{formatTime(track.duration)}</span>
  </div>;
}

export default function App() {
  const location = useLocation();
  const navigate = useNavigate();
  const audioRef = useRef(null);
  const [tracks, setTracks] = useState(demoTracks);
  const [current, setCurrent] = useState(() => JSON.parse(localStorage.getItem('soundroom-current') || 'null'));
  const [playing, setPlaying] = useState(false);
  const [progress, setProgress] = useState(() => Number(localStorage.getItem('soundroom-progress') || 0));
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(() => Number(localStorage.getItem('soundroom-volume') || 0.72));
  const [query, setQuery] = useState('');
  const [user, setUser] = useState(() => JSON.parse(localStorage.getItem('soundroom-user') || 'null'));
  const [authOpen, setAuthOpen] = useState(false);
  const [authMode, setAuthMode] = useState('login');
  const [authError, setAuthError] = useState('');
  const [liked, setLiked] = useState(() => new Set(JSON.parse(localStorage.getItem('soundroom-likes') || '[]')));
  const [playlists, setPlaylists] = useState(demoPlaylists);
  const [queueOpen, setQueueOpen] = useState(false);
  const [notice, setNotice] = useState('');
  const [recent, setRecent] = useState(() => JSON.parse(localStorage.getItem('soundroom-recent') || '[]'));

  useEffect(() => {
    api('/tracks').then(({ tracks: loaded }) => { if (loaded?.length) setTracks(loaded); }).catch(() => {});
  }, []);
  useEffect(() => {
    if (!user) return;
    let cancelled = false;
    async function loadAccountLibrary() {
      try {
        const [{ playlists: loaded }, { tracks: saved }] = await Promise.all([api('/playlists'), api('/auth/favorites')]);
        if (cancelled) return;
        setPlaylists(loaded);
        const serverIds = new Set(saved.map((track) => track._id));
        for (const id of liked) {
          if (isDatabaseId(id) && !serverIds.has(id)) await api(`/auth/favorites/${id}`, { method: 'PUT' });
        }
        const { tracks: synced } = await api('/auth/favorites');
        if (!cancelled) {
          const guestLikes = [...liked].filter((id) => !isDatabaseId(id));
          const serverLikes = synced.map((track) => track._id);
          setLiked(new Set([...guestLikes, ...serverLikes]));
        }
      } catch (error) { if (!cancelled) setNotice(error.message); }
    }
    loadAccountLibrary();
    return () => { cancelled = true; };
  }, [user]);
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio || !current?.audioUrl) return;
    audio.src = current.audioUrl;
    audio.volume = volume;
    if (playing) audio.play().catch(() => setPlaying(false));
    else audio.pause();
  }, [current, playing]);
  useEffect(() => { if (audioRef.current) audioRef.current.volume = volume; }, [volume]);
  useEffect(() => { if (current) localStorage.setItem('soundroom-current', JSON.stringify(current)); }, [current]);
  useEffect(() => { localStorage.setItem('soundroom-progress', String(progress)); }, [progress]);
  useEffect(() => { localStorage.setItem('soundroom-volume', String(volume)); }, [volume]);
  useEffect(() => { localStorage.setItem('soundroom-likes', JSON.stringify([...liked])); }, [liked]);
  useEffect(() => { localStorage.setItem('soundroom-recent', JSON.stringify(recent)); }, [recent]);

  const playlistId = location.pathname.startsWith('/playlist/') ? location.pathname.split('/').pop() : null;
  const activePlaylist = playlists.find((playlist) => playlist._id === playlistId);
  const pageName = location.pathname.startsWith('/search') ? 'Search' : location.pathname.startsWith('/collection') ? 'Your library' : location.pathname.startsWith('/playlist/') ? activePlaylist?.name || 'Playlist' : location.pathname.startsWith('/artist/') ? decodeURIComponent(location.pathname.split('/').pop()) : location.pathname.startsWith('/album/') ? decodeURIComponent(location.pathname.split('/').pop()) : 'Home';
  const visibleTracks = useMemo(() => {
    let list = tracks;
    if (location.pathname.startsWith('/collection')) list = tracks.filter((track) => liked.has(track._id));
    if (location.pathname.startsWith('/playlist/')) list = activePlaylist?.tracks || [];
    if (location.pathname.startsWith('/artist/')) list = tracks.filter((track) => track.artist.toLowerCase() === pageName.toLowerCase());
    if (location.pathname.startsWith('/album/')) list = tracks.filter((track) => track.album.toLowerCase() === pageName.toLowerCase());
    if (location.pathname.startsWith('/search') && query.trim()) list = list.filter((track) => `${track.title} ${track.artist} ${track.album} ${track.genre}`.toLowerCase().includes(query.toLowerCase()));
    return list;
  }, [tracks, location.pathname, pageName, query, liked, activePlaylist]);

  function startTrack(track) {
    setCurrent(track);
    setPlaying(true);
    setProgress(0);
    setRecent((old) => [track, ...old.filter((item) => item._id !== track._id)].slice(0, 6));
    if (isDatabaseId(track._id)) api(`/tracks/${track._id}/play`, { method: 'POST' }).catch(() => {});
  }
  function stepTrack(direction) {
    const source = visibleTracks.length ? visibleTracks : tracks;
    const index = source.findIndex((track) => track._id === current?._id);
    startTrack(source[(index + direction + source.length) % source.length]);
  }
  async function toggleLike(track) {
    const next = new Set(liked);
    if (next.has(track._id)) next.delete(track._id); else next.add(track._id);
    setLiked(next);
    if (user && isDatabaseId(track._id)) {
      try { const result = await api(`/auth/favorites/${track._id}`, { method: 'PUT' }); if (result.liked !== next.has(track._id)) setLiked((old) => { const corrected = new Set(old); result.liked ? corrected.add(track._id) : corrected.delete(track._id); return corrected; }); }
      catch (error) { setNotice(error.message); }
    }
  }
  async function submitAuth(event) {
    event.preventDefault();
    setAuthError('');
    const data = new FormData(event.currentTarget);
    try {
      const result = await api(`/auth/${authMode === 'signup' ? 'register' : 'login'}`, { method: 'POST', body: JSON.stringify(Object.fromEntries(data)) });
      localStorage.setItem('soundroom-token', result.token);
      localStorage.setItem('soundroom-user', JSON.stringify(result.user));
      setUser(result.user);
      setAuthOpen(false);
    } catch (error) { setAuthError(error.message); }
  }
  async function createPlaylist() {
    if (!user) { setAuthOpen(true); return; }
    const name = window.prompt('Name your playlist');
    if (!name?.trim()) return;
    try { const { playlist } = await api('/playlists', { method: 'POST', body: JSON.stringify({ name }) }); setPlaylists((old) => [playlist, ...old]); }
    catch (error) { setNotice(error.message); }
  }
  async function togglePlaylistTrack(track) {
    if (!user) { setAuthOpen(true); return; }
    if (!isDatabaseId(track._id)) { setNotice('Sign in and use a seeded catalog track to save it to a playlist.'); return; }
    let target = activePlaylist;
    if (!target) {
      const available = playlists.filter((playlist) => playlist._id);
      const name = window.prompt(`Playlist name:\n${available.map((playlist) => playlist.name).join('\n')}`, available[0]?.name || '');
      if (!name?.trim()) return;
      target = available.find((playlist) => playlist.name.toLowerCase() === name.trim().toLowerCase());
      if (!target) { setNotice('Choose one of your listed playlists.'); return; }
    }
    const removing = target.tracks?.some((item) => item._id === track._id);
    try {
      const { playlist } = await api(`/playlists/${target._id}/tracks`, { method: 'PATCH', body: JSON.stringify({ trackId: track._id }) });
      setPlaylists((old) => old.map((item) => item._id === playlist._id ? playlist : item));
      setNotice(`${removing ? 'Removed from' : 'Added to'} ${playlist.name}.`);
    } catch (error) { setNotice(error.message); }
  }
  function logout() {
    localStorage.removeItem('soundroom-token');
    localStorage.removeItem('soundroom-user');
    setUser(null);
    setPlaylists(demoPlaylists);
  }
  function dismissNotice() { setNotice(''); }

  return <div className="app-shell">
    <aside className="sidebar">
      <Link to="/" className="brand"><span className="brand-mark"><AudioLines size={20} /></span><span>soundroom</span></Link>
      <div className="nav-label">LISTEN</div>
      <nav className="primary-nav">
        <NavLink to="/" end><Home size={18} />Home</NavLink>
        <NavLink to="/search"><Search size={18} />Search</NavLink>
        <NavLink to="/collection"><Library size={18} />Your library</NavLink>
      </nav>
      <div className="library-heading"><span className="nav-label">YOUR PLAYLISTS</span><button className="icon-button" title="Create playlist" onClick={createPlaylist}><Plus size={17} /></button></div>
      <div className="playlist-nav">{playlists.map((playlist) => <button key={playlist._id || playlist.id} onClick={() => playlist._id ? navigate(`/playlist/${playlist._id}`) : navigate('/search')}><ListMusic size={16} />{playlist.name}</button>)}</div>
      <div className="sidebar-bottom"><div className="listener-note"><Disc3 size={17} /><span>Curated for<br /><strong>the in-between</strong></span></div><span className="version-note">SOUNDROOM / 01</span></div>
    </aside>

    <main className="main-panel">
      <header className="topbar"><div className="history-controls"><button className="icon-button" onClick={() => navigate(-1)} aria-label="Go back"><ChevronLeft /></button><button className="icon-button" onClick={() => navigate(1)} aria-label="Go forward"><ChevronRight /></button></div>
        <div className="topbar-search">{location.pathname.startsWith('/search') && <label><Search size={17} /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Songs, artists, albums" autoFocus /></label>}</div>
        <div className="account-actions">{user ? <><span className="welcome-user">{user.name.split(' ')[0]}</span><button className="icon-button user-button" title="Sign out" onClick={logout}><LogOut size={17} /></button></> : <><button className="text-button" onClick={() => { setAuthMode('signup'); setAuthOpen(true); }}>Create account</button><button className="sign-in-button" onClick={() => { setAuthMode('login'); setAuthOpen(true); }}>Sign in <CircleUserRound size={16} /></button></>}</div>
      </header>

      <div className="content-scroll">
        {location.pathname === '/' && <>
          <section className="welcome-hero"><div className="hero-copy"><span className="eyebrow">SUNDAY, SEPTEMBER 27</span><h1>Sound for<br /><em>where you are.</em></h1><p>Good music finds its way into the in-between.</p><button className="hero-button" onClick={() => startTrack(tracks[0])}><Play size={16} fill="currentColor" /> Pick up the feeling</button></div><div className="hero-art"><img src={tracks[0]?.coverUrl} alt="Night sky album artwork" /><div className="art-caption"><span>NOW IN ROTATION</span><strong>After hours, softly.</strong><span>8 TRACKS · 34 MIN</span></div><div className="art-stamp">SR<br />01</div></div><div className="hero-index">VOL. 01 <span>—</span> OPEN ENDED</div></section>
          <section className="section-block"><div className="section-heading"><div><span className="eyebrow">A LITTLE BIT OF EVERYTHING</span><h2>In rotation <span>↗</span></h2></div><button className="quiet-link" onClick={() => navigate('/search')}>Browse all <ChevronRight size={15} /></button></div>
            <div className="mix-grid">{tracks.slice(0, 4).map((track, index) => <button className={`mix-tile mix-${index + 1}`} key={track._id} onClick={() => startTrack(track)}><img src={track.coverUrl} alt="" /><span className="mix-overlay" /><span className="mix-index">0{index + 1}</span><span className="mix-caption"><strong>{track.album}</strong><small>{track.artist}</small></span><span className="tile-play"><Play size={17} fill="currentColor" /></span></button>)}</div>
          </section>
          <section className="section-block track-section"><div className="section-heading"><div><span className="eyebrow">KEEP THE THREAD</span><h2>Recently played</h2></div></div>{recent.length ? <div className="track-list">{recent.map((track, index) => <TrackRow key={track._id} track={track} index={index} current={current} playing={playing} liked={liked.has(track._id)} onPlay={startTrack} onLike={toggleLike} onPlaylist={togglePlaylistTrack} playlistLabel={activePlaylist?.tracks?.some((item) => item._id === track._id) ? "Remove from playlist" : "Add to playlist"} />)}</div> : <div className="empty-recent"><Music2 size={18} />Your listening history starts with the first song.</div>}</section>
        </>}
        {location.pathname.startsWith('/search') && <section className="page-section"><span className="eyebrow">FIND YOUR NEXT LOOP</span><h1 className="page-title">Search</h1>{!query && <div className="search-prompt"><Search size={20} /><span>Try an artist, album, or mood up top.</span></div>}{query && <><div className="section-heading search-results-heading"><h2>Results <span>({visibleTracks.length})</span></h2></div>{visibleTracks.length ? <div className="track-list">{visibleTracks.map((track, index) => <TrackRow key={track._id} track={track} index={index} current={current} playing={playing} liked={liked.has(track._id)} onPlay={startTrack} onLike={toggleLike} onPlaylist={togglePlaylistTrack} playlistLabel={activePlaylist?.tracks?.some((item) => item._id === track._id) ? "Remove from playlist" : "Add to playlist"} />)}</div> : <div className="empty-recent">No tracks match that search yet.</div>}</>}</section>}
        {location.pathname.startsWith('/collection') && <section className="page-section"><span className="eyebrow">YOUR CORNER OF THE CATALOG</span><h1 className="page-title">Your library</h1><div className="collection-tools"><span className="collection-chip"><Heart size={14} /> Liked songs <b>{visibleTracks.length}</b></span><button className="quiet-link" onClick={createPlaylist}><Plus size={15} /> New playlist</button></div>{visibleTracks.length ? <div className="track-list">{visibleTracks.map((track, index) => <TrackRow key={track._id} track={track} index={index} current={current} playing={playing} liked={liked.has(track._id)} onPlay={startTrack} onLike={toggleLike} onPlaylist={togglePlaylistTrack} playlistLabel={activePlaylist?.tracks?.some((item) => item._id === track._id) ? "Remove from playlist" : "Add to playlist"} />)}</div> : <div className="empty-library"><Heart size={22} /><strong>Keep what moves you.</strong><span>Like a track and it will find a home here.</span><button onClick={() => navigate('/search')}>Explore the catalog</button></div>}</section>}
        {(location.pathname.startsWith('/artist/') || location.pathname.startsWith('/album/') || location.pathname.startsWith('/playlist/')) && <section className="page-section"><span className="eyebrow">{location.pathname.startsWith('/artist/') ? 'ARTIST' : location.pathname.startsWith('/playlist/') ? 'PLAYLIST' : 'ALBUM'}</span><h1 className="page-title">{pageName}</h1>{visibleTracks.length ? <div className="track-list">{visibleTracks.map((track, index) => <TrackRow key={track._id} track={track} index={index} current={current} playing={playing} liked={liked.has(track._id)} onPlay={startTrack} onLike={toggleLike} onPlaylist={togglePlaylistTrack} playlistLabel={activePlaylist?.tracks?.some((item) => item._id === track._id) ? "Remove from playlist" : "Add to playlist"} />)}</div> : <div className="empty-recent">No tracks found in this collection.</div>}</section>}
        <footer className="site-footer"><span>SOUNDROOM · MUSIC FOR THE SPACE BETWEEN</span><span>DEMO LIBRARY · 2026</span></footer>
      </div>
    </main>

    <footer className="player-bar"><audio ref={audioRef} onTimeUpdate={(event) => setProgress(event.currentTarget.currentTime)} onLoadedMetadata={(event) => { setDuration(event.currentTarget.duration); if (progress > 0 && progress < event.currentTarget.duration) event.currentTarget.currentTime = progress; }} onEnded={() => stepTrack(1)} />
      <div className="now-playing">{current ? <><img src={current.coverUrl} alt="" /><div><strong>{current.title}</strong><Link to={`/artist/${encodeURIComponent(current.artist)}`}>{current.artist}</Link></div><button className={`icon-button like-button ${liked.has(current._id) ? 'liked' : ''}`} onClick={() => toggleLike(current)} aria-label="Like current track"><Heart size={15} fill={liked.has(current._id) ? 'currentColor' : 'none'} /></button></> : <div className="player-placeholder"><span className="placeholder-disc"><Disc3 size={20} /></span><span>Choose a track to begin</span></div>}</div>
      <div className="player-controls"><div className="control-buttons"><button className="icon-button" onClick={() => current && stepTrack(-1)} aria-label="Previous track"><SkipBack size={17} fill="currentColor" /></button><button className="play-toggle" onClick={() => { if (!current) startTrack(tracks[0]); else setPlaying((value) => !value); }} aria-label={playing ? 'Pause' : 'Play'}>{playing ? <Pause size={17} fill="currentColor" /> : <Play size={17} fill="currentColor" />}</button><button className="icon-button" onClick={() => current && stepTrack(1)} aria-label="Next track"><SkipForward size={17} fill="currentColor" /></button></div><div className="progress-row"><span>{formatTime(progress)}</span><input aria-label="Track progress" type="range" min="0" max={duration || current?.duration || 1} value={progress} onChange={(event) => { const time = Number(event.target.value); setProgress(time); if (audioRef.current) audioRef.current.currentTime = time; }} /><span>{formatTime(duration || current?.duration)}</span></div></div>
      <div className="player-extras"><button className={`icon-button ${queueOpen ? 'active' : ''}`} onClick={() => setQueueOpen((value) => !value)} title="Toggle queue"><ListMusic size={17} /></button><div className="volume-control"><Volume2 size={17} /><input aria-label="Volume" type="range" min="0" max="1" step="0.01" value={volume} onChange={(event) => setVolume(Number(event.target.value))} /></div></div>
    </footer>
    {queueOpen && <aside className="queue-panel"><div className="queue-heading"><div><span className="eyebrow">UP NEXT</span><h3>Queue</h3></div><button className="icon-button" onClick={() => setQueueOpen(false)} aria-label="Close queue"><X size={18} /></button></div>{tracks.filter((track) => track._id !== current?._id).slice(0, 5).map((track, index) => <button className="queue-item" key={track._id} onClick={() => startTrack(track)}><span>{String(index + 1).padStart(2, '0')}</span><img src={track.coverUrl} alt="" /><div><strong>{track.title}</strong><small>{track.artist}</small></div></button>)}</aside>}
    {authOpen && <div className="modal-backdrop" onClick={() => setAuthOpen(false)}><section className="auth-modal" onClick={(event) => event.stopPropagation()}><button className="icon-button modal-close" onClick={() => setAuthOpen(false)} aria-label="Close"><X size={19} /></button><span className="eyebrow">YOUR MUSIC, YOUR SPACE</span><h2>{authMode === 'signup' ? 'Find your sound.' : 'Welcome back.'}</h2><form onSubmit={submitAuth}>{authMode === 'signup' && <label>Your name<input name="name" required autoComplete="name" /></label>}<label>Email address<input name="email" type="email" required autoComplete="email" /></label><label>Password<input name="password" type="password" minLength="8" required autoComplete={authMode === 'signup' ? 'new-password' : 'current-password'} /></label>{authError && <p className="form-error">{authError}</p>}<button className="hero-button auth-submit" type="submit">{authMode === 'signup' ? 'Create account' : 'Sign in'}</button></form><p className="auth-switch">{authMode === 'signup' ? 'Already listening with us?' : 'New to Soundroom?'} <button onClick={() => { setAuthMode(authMode === 'signup' ? 'login' : 'signup'); setAuthError(''); }}>{authMode === 'signup' ? 'Sign in' : 'Create an account'}</button></p></section></div>}
    {notice && <div className="toast-message" role="status">{notice}<button onClick={dismissNotice} aria-label="Dismiss"><X size={15} /></button></div>}
  </div>;
}
