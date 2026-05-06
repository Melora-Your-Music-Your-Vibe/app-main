import { useState, useEffect } from 'react';
import { Heart, Play, Shuffle } from 'lucide-react';
import SongCard from '../components/song/SongCard';
import usePlayerStore from '../store/playerStore';
import api from '../services/api';

export default function FavoritesPage() {
  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(true);
  const { playSong } = usePlayerStore();

  useEffect(() => {
    const fetch = async () => {
      try {
        const { data } = await api.get('/favorites');
        setFavorites(data.data || []);
      } catch {} finally { setLoading(false); }
    };
    fetch();
  }, []);

  return (
    <div className="home-page animate-fadeIn" style={{ padding: '1.5rem 0 2rem' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
        <h1 style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', fontSize: '1.75rem', fontWeight: 800 }}>
          <Heart size={28} color="var(--brand-green)" fill="var(--brand-green)" /> Liked Songs
        </h1>
        {favorites.length > 0 && (
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <button className="btn btn-primary btn-sm" onClick={() => playSong(favorites[0], favorites)}><Play size={14} /> Play All</button>
            <button className="btn btn-secondary btn-sm" onClick={() => { const shuffled = [...favorites].sort(() => Math.random() - 0.5); playSong(shuffled[0], shuffled); }}><Shuffle size={14} /> Shuffle</button>
          </div>
        )}
      </div>
      <p style={{ color: 'var(--text-secondary)', marginBottom: '1.5rem' }}>{favorites.length} songs</p>
      {loading ? <div className="skeleton" style={{ height: 200 }} /> : (
        <div className="song-grid">{favorites.map((song, i) => <SongCard key={song.id} song={song} songs={favorites} index={i} />)}</div>
      )}
      {!loading && favorites.length === 0 && (
        <div className="empty-state"><Heart size={48} /><p>Songs you like will appear here</p></div>
      )}
    </div>
  );
}
