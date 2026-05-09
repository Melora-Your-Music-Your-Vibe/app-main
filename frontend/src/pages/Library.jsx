import { useState, useEffect } from 'react';
import { Library as LibraryIcon, Heart, Clock, PlusCircle, Music } from 'lucide-react';
import { Link } from 'react-router-dom';
import SongCard from '../components/song/SongCard';
import api from '../services/api';
import './Library.css';

export default function LibraryPage() {
  const [tab, setTab] = useState('playlists');
  const [playlists, setPlaylists] = useState([]);
  const [favorites, setFavorites] = useState([]);
  const [recent, setRecent] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [newPlaylist, setNewPlaylist] = useState('');

  useEffect(() => {
    const fetch = async () => {
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
      } catch {} finally { setLoading(false); }
    };
    fetch();
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

      {tab === 'playlists' && (
        <div className="library-content">
          <button className="create-playlist-btn glass-card" onClick={() => setShowCreate(!showCreate)}>
            <PlusCircle size={32} />
            <span>Create Playlist</span>
          </button>
          {showCreate && (
            <form className="create-form glass-card" onSubmit={handleCreatePlaylist}>
              <input type="text" className="input-field" placeholder="Playlist name..." value={newPlaylist} onChange={(e) => setNewPlaylist(e.target.value)} autoFocus />
              <div className="create-actions">
                <button type="submit" className="btn btn-primary btn-sm">Create</button>
                <button type="button" className="btn btn-ghost btn-sm" onClick={() => setShowCreate(false)}>Cancel</button>
              </div>
            </form>
          )}
          <div className="playlist-grid">
            {playlists.map((pl) => (
              <Link to={`/playlists/${pl.id}`} key={pl.id} className="playlist-card glass-card">
                <div className="playlist-cover">
                  {pl.coverImage ? <img src={pl.coverImage} alt={pl.name} /> : <Music size={32} />}
                </div>
                <div className="playlist-info">
                  <p className="playlist-name truncate">{pl.name}</p>
                  <p className="playlist-meta">{pl.songCount} songs</p>
                </div>
              </Link>
            ))}
          </div>
          {!loading && playlists.length === 0 && !showCreate && (
            <div className="empty-state"><PlusCircle size={48} /><p>No playlists yet. Create one!</p></div>
          )}
        </div>
      )}

      {tab === 'favorites' && (
        <div className="library-content">
          {loading ? <div className="skeleton" style={{ height: 200, width: '100%' }} /> : (
            <div className="song-grid">
              {favorites.map((song, i) => <SongCard key={song.id} song={song} songs={favorites} index={i} />)}
            </div>
          )}
          {!loading && favorites.length === 0 && (
            <div className="empty-state"><Heart size={48} /><p>No liked songs yet. Start liking!</p></div>
          )}
        </div>
      )}

      {tab === 'recent' && (
        <div className="library-content">
          {loading ? <div className="skeleton" style={{ height: 200, width: '100%' }} /> : (
            <div className="song-grid">
              {recent.map((song, i) => <SongCard key={`${song.id}-${i}`} song={song} songs={recent} index={i} />)}
            </div>
          )}
          {!loading && recent.length === 0 && (
            <div className="empty-state"><Clock size={48} /><p>No listening history yet.</p></div>
          )}
        </div>
      )}
    </div>
  );
}
