import { useState, useEffect } from 'react';
import { Play, TrendingUp, Clock, Sparkles } from 'lucide-react';
import SongCard from '../components/song/SongCard';
import useAuthStore from '../store/authStore';
import usePlayerStore from '../store/playerStore';
import api from '../services/api';
import './Home.css';

export default function HomePage() {
  const { user } = useAuthStore();
  const { playSong } = usePlayerStore();
  const [popularSongs, setPopularSongs] = useState([]);
  const [latestSongs, setLatestSongs] = useState([]);
  const [recentlyPlayed, setRecentlyPlayed] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [popRes, latRes] = await Promise.all([
          api.get('/songs/popular?limit=12').catch(() => ({ data: { data: [] } })),
          api.get('/songs/latest?limit=12').catch(() => ({ data: { data: [] } })),
        ]);
        setPopularSongs(popRes.data.data || []);
        setLatestSongs(latRes.data.data || []);

        if (user) {
          const recRes = await api.get('/recently-played?limit=12').catch(() => ({ data: { data: [] } }));
          setRecentlyPlayed(recRes.data.data || []);
        }
      } catch (err) {
        console.error('Failed to load home data:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [user]);

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good Morning';
    if (hour < 17) return 'Good Afternoon';
    return 'Good Evening';
  };

  const SkeletonGrid = () => (
    <div className="song-grid">
      {[...Array(6)].map((_, i) => (
        <div key={i} className="skeleton-card">
          <div className="skeleton" style={{ aspectRatio: '1', borderRadius: 'var(--radius-md)' }} />
          <div className="skeleton" style={{ height: 14, width: '80%', marginTop: 8 }} />
          <div className="skeleton" style={{ height: 12, width: '60%', marginTop: 4 }} />
        </div>
      ))}
    </div>
  );

  const handlePlayAll = (songs) => {
    if (songs.length > 0) playSong(songs[0], songs);
  };

  return (
    <div className="home-page animate-fadeIn">
      {/* Hero Greeting */}
      <section className="home-hero">
        <h1 className="home-greeting">{getGreeting()}{user ? `, ${user.name?.split(' ')[0]}` : ''} 👋</h1>
        <p className="home-subtitle">What would you like to listen to today?</p>
      </section>

      {/* Recently Played */}
      {recentlyPlayed.length > 0 && (
        <section className="home-section">
          <div className="section-header">
            <div className="section-title-wrap">
              <Clock size={22} className="section-icon" />
              <h2 className="section-title">Recently Played</h2>
            </div>
          </div>
          <div className="song-grid">
            {recentlyPlayed.slice(0, 6).map((song, i) => (
              <SongCard key={`recent-${song.id}-${i}`} song={song} songs={recentlyPlayed} index={i} />
            ))}
          </div>
        </section>
      )}

      {/* Popular Songs */}
      <section className="home-section">
        <div className="section-header">
          <div className="section-title-wrap">
            <TrendingUp size={22} className="section-icon" />
            <h2 className="section-title">Trending Now</h2>
          </div>
          {popularSongs.length > 0 && (
            <button className="btn btn-sm btn-secondary" onClick={() => handlePlayAll(popularSongs)}>
              <Play size={14} /> Play All
            </button>
          )}
        </div>
        {loading ? <SkeletonGrid /> : (
          <div className="song-grid">
            {popularSongs.map((song, i) => (
              <SongCard key={song.id} song={song} songs={popularSongs} index={i} />
            ))}
          </div>
        )}
        {!loading && popularSongs.length === 0 && (
          <div className="empty-state">
            <Sparkles size={48} />
            <p>No songs yet. Start by uploading some music!</p>
          </div>
        )}
      </section>

      {/* Latest Songs */}
      <section className="home-section">
        <div className="section-header">
          <div className="section-title-wrap">
            <Sparkles size={22} className="section-icon" />
            <h2 className="section-title">Fresh Releases</h2>
          </div>
        </div>
        {loading ? <SkeletonGrid /> : (
          <div className="song-grid">
            {latestSongs.map((song, i) => (
              <SongCard key={song.id} song={song} songs={latestSongs} index={i} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
