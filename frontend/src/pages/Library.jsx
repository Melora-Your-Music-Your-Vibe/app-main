import { useState, useEffect, useRef } from 'react';
import {
  Library as LibraryIcon, Heart, Clock, PlusCircle,
  Music, Trash2, Search, Check, X, Loader,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import SongCard from '../components/song/SongCard';
import api from '../services/api';
import './Library.css';

/* ── Add Songs Modal ───────────────────────────────── */
function AddSongsModal({ playlist, existingSongIds, onClose, onSongAdded }) {
  const [query, setQuery] = useState('');
  const [songs, setSongs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [adding, setAdding] = useState(new Set());
  const [added, setAdded] = useState(new Set(existingSongIds.map(String)));
  const debounceRef = useRef(null);

  const fetchSongs = async (q) => {
    setLoading(true);
    try {
      const endpoint = q ? `/search?q=${encodeURIComponent(q)}&limit=30` : '/songs/popular?limit=30';
      const { data } = await api.get(endpoint);
      setSongs(data.data || []);
    } catch {
      setSongs([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchSongs(''); }, []);

  const handleQueryChange = (e) => {
    const q = e.target.value;
    setQuery(q);
    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => fetchSongs(q), 350);
  };

  const handleAdd = async (song) => {
    const id = String(song.id);
    if (added.has(id) || adding.has(id)) return;
    setAdding((prev) => new Set(prev).add(id));
    try {
      await api.post(`/playlists/${playlist.id}/songs`, { songId: song.id });
      setAdded((prev) => new Set(prev).add(id));
      onSongAdded();
    } catch (err) {
      const msg = err.response?.data?.message || '';
      if (msg.includes('already')) setAdded((prev) => new Set(prev).add(id));
    } finally {
      setAdding((prev) => { const s = new Set(prev); s.delete(id); return s; });
    }
  };

  return (
    <div className="modal-overlay animate-fadeIn" onClick={onClose}>
      <div className="add-songs-modal glass-card" onClick={(e) => e.stopPropagation()}>
        <div className="add-songs-header">
          <h3>Add Songs to <span className="gradient-text">{playlist.name}</span></h3>
          <button className="modal-close-btn" onClick={onClose} aria-label="Close"><X size={20} /></button>
        </div>

        <div className="add-songs-search">
          <Search size={16} className="search-icon" />
          <input
            type="text"
            className="add-songs-input"
            placeholder="Search songs..."
            value={query}
            onChange={handleQueryChange}
            autoFocus
          />
        </div>

        <div className="add-songs-list">
          {loading && (
            <div className="add-songs-loading">
              <Loader size={20} className="spin-icon" />
              <span>Searching...</span>
            </div>
          )}
          {!loading && songs.length === 0 && (
            <div className="add-songs-empty">
              <Music size={32} />
              <p>No songs found</p>
            </div>
          )}
          {!loading && songs.map((song) => {
            const id = String(song.id);
            const isAdded = added.has(id);
            const isAdding = adding.has(id);
            return (
              <div key={song.id} className={`add-song-row ${isAdded ? 'added' : ''}`}>
                <img
                  className="add-song-thumb"
                  src={song.thumbnailUrl || '/default-album.png'}
                  alt={song.title}
                  onError={(e) => { e.target.src = '/default-album.png'; }}
                />
                <div className="add-song-info">
                  <p className="add-song-title truncate">{song.title}</p>
                  <p className="add-song-artist truncate">{song.artist}</p>
                </div>
                <button
                  className={`add-song-btn ${isAdded ? 'done' : ''}`}
                  onClick={() => handleAdd(song)}
                  disabled={isAdded || isAdding}
                  aria-label={isAdded ? 'Added' : 'Add'}
                >
                  {isAdding
                    ? <Loader size={16} className="spin-icon" />
                    : isAdded
                      ? <Check size={16} />
                      : <PlusCircle size={16} />}
                </button>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

/* ── Delete confirmation dialog ────────────────────── */
function ConfirmDeleteModal({ playlist, onConfirm, onCancel }) {
  return (
    <div className="modal-overlay animate-fadeIn" onClick={onCancel}>
      <div className="confirm-modal glass-card" onClick={(e) => e.stopPropagation()}>
        <Trash2 size={32} color="var(--error)" />
        <h3>Delete Playlist?</h3>
        <p>Are you sure you want to delete <strong>{playlist.name}</strong>? This cannot be undone.</p>
        <div className="confirm-actions">
          <button className="btn btn-ghost btn-sm" onClick={onCancel}>Cancel</button>
          <button className="btn btn-sm btn-danger" onClick={onConfirm}>Delete</button>
        </div>
      </div>
    </div>
  );
}

/* ── Main Library Page ─────────────────────────────── */
export default function LibraryPage() {
  const [tab, setTab] = useState('playlists');
  const [playlists, setPlaylists] = useState([]);
  const [favorites, setFavorites] = useState([]);
  const [recent, setRecent] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [newPlaylist, setNewPlaylist] = useState('');
  const [addSongsTarget, setAddSongsTarget] = useState(null); // playlist being edited
  const [deleteTarget, setDeleteTarget] = useState(null);     // playlist to delete

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        if (tab === 'playlists') {
          const { data } = await api.get('/playlists');
          setPlaylists(data.data || []);
        } else if (tab === 'favorites') {
          const { data } = await api.get('/favorites');
          setFavorites(data.data || []);
        } else if (tab === 'recent') {
          const { data } = await api.get('/recently-played?limit=30');
          setRecent(data.data || []);
        }
      } catch { /* silent */ } finally { setLoading(false); }
    };
    fetchData();
  }, [tab]);

  const handleCreatePlaylist = async (e) => {
    e.preventDefault();
    if (!newPlaylist.trim()) return;
    try {
      const { data } = await api.post('/playlists', { name: newPlaylist });
      setPlaylists([data.data, ...playlists]);
      setNewPlaylist('');
      setShowCreate(false);
    } catch (err) { console.error(err); }
  };

  const handleDeletePlaylist = async () => {
    if (!deleteTarget) return;
    try {
      await api.delete(`/playlists/${deleteTarget.id}`);
      setPlaylists((prev) => prev.filter((p) => p.id !== deleteTarget.id));
    } catch (err) { console.error(err); }
    setDeleteTarget(null);
  };

  const refreshPlaylist = async (playlistId) => {
    try {
      const { data } = await api.get(`/playlists/${playlistId}`);
      setPlaylists((prev) =>
        prev.map((p) => (p.id === playlistId ? { ...p, songCount: data.data.Songs?.length || p.songCount } : p))
      );
    } catch { /* silent */ }
  };

  return (
    <div className="library-page animate-fadeIn">
      <div className="library-header">
        <h1><LibraryIcon size={28} /> Your Library</h1>
      </div>

      <div className="library-tabs">
        <button className={`lib-tab ${tab === 'playlists' ? 'active' : ''}`} onClick={() => setTab('playlists')}>
          <PlusCircle size={16} /> Playlists
        </button>
        <button className={`lib-tab ${tab === 'favorites' ? 'active' : ''}`} onClick={() => setTab('favorites')}>
          <Heart size={16} /> Liked Songs
        </button>
        <button className={`lib-tab ${tab === 'recent' ? 'active' : ''}`} onClick={() => setTab('recent')}>
          <Clock size={16} /> History
        </button>
      </div>

      {/* ── Playlists tab ── */}
      {tab === 'playlists' && (
        <div className="library-content">
          <button className="create-playlist-btn glass-card" onClick={() => setShowCreate(!showCreate)}>
            <PlusCircle size={32} />
            <span>Create Playlist</span>
          </button>

          {showCreate && (
            <form className="create-form glass-card" onSubmit={handleCreatePlaylist}>
              <input
                type="text"
                className="input-field"
                placeholder="Playlist name..."
                value={newPlaylist}
                onChange={(e) => setNewPlaylist(e.target.value)}
                autoFocus
              />
              <div className="create-actions">
                <button type="submit" className="btn btn-primary btn-sm">Create</button>
                <button type="button" className="btn btn-ghost btn-sm" onClick={() => setShowCreate(false)}>Cancel</button>
              </div>
            </form>
          )}

          <div className="playlist-grid">
            {playlists.map((pl) => (
              <div key={pl.id} className="playlist-card-wrap">
                <Link to={`/playlists/${pl.id}`} className="playlist-card glass-card">
                  <div className="playlist-cover">
                    {pl.coverImage ? <img src={pl.coverImage} alt={pl.name} /> : <Music size={28} />}
                  </div>
                  <div className="playlist-info">
                    <p className="playlist-name truncate">{pl.name}</p>
                    <p className="playlist-meta">{pl.songCount || 0} songs</p>
                  </div>
                </Link>
                <div className="playlist-actions">
                  <button
                    className="playlist-action-btn add-btn"
                    onClick={() => setAddSongsTarget(pl)}
                    title="Add Songs"
                    aria-label="Add songs to playlist"
                  >
                    <PlusCircle size={15} />
                  </button>
                  <button
                    className="playlist-action-btn delete-btn"
                    onClick={() => setDeleteTarget(pl)}
                    title="Delete Playlist"
                    aria-label="Delete playlist"
                  >
                    <Trash2 size={15} />
                  </button>
                </div>
              </div>
            ))}
          </div>

          {!loading && playlists.length === 0 && !showCreate && (
            <div className="empty-state"><PlusCircle size={48} /><p>No playlists yet. Create one!</p></div>
          )}
        </div>
      )}

      {/* ── Liked Songs tab ── */}
      {tab === 'favorites' && (
        <div className="library-content">
          {loading
            ? <div className="skeleton" style={{ height: 200, width: '100%' }} />
            : <div className="song-grid">{favorites.map((song, i) => <SongCard key={song.id} song={song} songs={favorites} index={i} />)}</div>
          }
          {!loading && favorites.length === 0 && (
            <div className="empty-state"><Heart size={48} /><p>No liked songs yet. Start liking!</p></div>
          )}
        </div>
      )}

      {/* ── History tab ── */}
      {tab === 'recent' && (
        <div className="library-content">
          {loading
            ? <div className="skeleton" style={{ height: 200, width: '100%' }} />
            : <div className="song-grid">{recent.map((song, i) => <SongCard key={`${song.id}-${i}`} song={song} songs={recent} index={i} />)}</div>
          }
          {!loading && recent.length === 0 && (
            <div className="empty-state"><Clock size={48} /><p>No listening history yet.</p></div>
          )}
        </div>
      )}

      {/* ── Add Songs Modal ── */}
      {addSongsTarget && (
        <AddSongsModal
          playlist={addSongsTarget}
          existingSongIds={[]}
          onClose={() => setAddSongsTarget(null)}
          onSongAdded={() => refreshPlaylist(addSongsTarget.id)}
        />
      )}

      {/* ── Delete Confirm ── */}
      {deleteTarget && (
        <ConfirmDeleteModal
          playlist={deleteTarget}
          onConfirm={handleDeletePlaylist}
          onCancel={() => setDeleteTarget(null)}
        />
      )}
    </div>
  );
}
