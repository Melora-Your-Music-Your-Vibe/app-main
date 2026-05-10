import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Play, Pause, Heart, Clock, MoreHorizontal, ArrowLeft } from 'lucide-react';
import usePlayerStore from '../store/playerStore';
import SongCard from '../components/song/SongCard';
import api from '../services/api';

export default function PlaylistDetail() {
  const { id } = useParams();
  const [playlist, setPlaylist] = useState(null);
  const [songs, setSongs] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const { currentSong, isPlaying, togglePlay, setQueue } = usePlayerStore();

  useEffect(() => {
    const fetchPlaylist = async () => {
      setLoading(true);
      try {
        const { data } = await api.get(`/playlists/${id}`);
        setPlaylist(data.data);
        setSongs(data.data.Songs || []);
      } catch (err) {
        console.error('Failed to fetch playlist', err);
      } finally {
        setLoading(false);
      }
    };
    fetchPlaylist();
  }, [id]);

  const handlePlayAll = () => {
    if (songs.length === 0) return;
    setQueue(songs, 0);
  };

  if (loading) {
    return <div className="home-page animate-fadeIn"><div className="skeleton" style={{ height: '300px', width: '100%', borderRadius: 'var(--radius-lg)' }}></div></div>;
  }

  if (!playlist) {
    return (
      <div className="home-page animate-fadeIn" style={{ textAlign: 'center', padding: '4rem 0' }}>
        <h2>Playlist not found</h2>
        <Link to="/library" className="btn btn-primary" style={{ marginTop: '1rem' }}>Back to Library</Link>
      </div>
    );
  }

  return (
    <div className="home-page animate-fadeIn" style={{ padding: '1rem 0 3rem' }}>
      <Link to="/library" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-secondary)', marginBottom: '1.5rem', fontWeight: 600 }}>
        <ArrowLeft size={18} /> Back
      </Link>
      
      <div className="glass-card" style={{ display: 'flex', gap: '2rem', padding: '2rem', marginBottom: '2rem', flexWrap: 'wrap' }}>
        <div style={{ width: 200, height: 200, borderRadius: 'var(--radius-md)', background: 'var(--bg-elevated)', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
          {playlist.coverImage ? (
            <img src={playlist.coverImage} alt={playlist.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          ) : (
            <Play size={64} color="var(--text-muted)" />
          )}
        </div>
        
        <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'flex-end', flex: 1, minWidth: 250 }}>
          <span className="badge" style={{ alignSelf: 'flex-start', marginBottom: '1rem' }}>Playlist</span>
          <h1 style={{ fontSize: '3rem', fontWeight: 900, marginBottom: '0.5rem', lineHeight: 1.1 }}>{playlist.name}</h1>
          <p style={{ color: 'var(--text-secondary)', marginBottom: '1.5rem' }}>{songs.length} songs</p>
          
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <button className="btn btn-primary btn-icon" onClick={handlePlayAll} style={{ width: 56, height: 56 }} disabled={songs.length === 0}>
              <Play size={28} fill="currentColor" style={{ marginLeft: 4 }} />
            </button>
            <button className="btn btn-ghost btn-icon"><Heart size={24} /></button>
            <button className="btn btn-ghost btn-icon"><MoreHorizontal size={24} /></button>
          </div>
        </div>
      </div>

      <div className="song-grid">
        {songs.map((song, i) => (
          <SongCard key={song.id} song={song} songs={songs} index={i} />
        ))}
      </div>
      
      {songs.length === 0 && (
        <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
          <p>This playlist is empty.</p>
        </div>
      )}
    </div>
  );
}
