import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Music, LogIn, UserPlus, TrendingUp, Users, Sparkles, DollarSign, Headphones, Disc3 } from 'lucide-react';
import axios from 'axios';
import ThreeBackground from '../components/common/ThreeBackground';
import './LandingPage.css';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api/v1';

export default function LandingPage() {
  const navigate = useNavigate();
  const [songs, setSongs] = useState([]);
  const [artists, setArtists] = useState([]);
  const [ads, setAds] = useState([]);
  const [loading, setLoading] = useState(true);
  const [scrolled, setScrolled] = useState(false);
  const [activeAdIndex, setActiveAdIndex] = useState(0);

  // Navbar scroll effect
  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Fetch public data
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [songsRes, artistsRes, adsRes] = await Promise.all([
          axios.get(`${API_URL}/songs/latest?limit=18`).catch(() => ({ data: { data: [] } })),
          axios.get(`${API_URL}/advertisements/artists?limit=12`).catch(() => ({ data: { data: [] } })),
          axios.get(`${API_URL}/advertisements/active`).catch(() => ({ data: { data: [] } })),
        ]);

        setSongs(songsRes.data.data || []);
        setArtists(artistsRes.data.data || []);

        setAds(adsRes.data.data || []);
      } catch (err) {
        console.error('Failed to fetch landing data:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  // Auto-rotate ads
  useEffect(() => {
    if (ads.length <= 1) return;
    const interval = setInterval(() => {
      setActiveAdIndex(prev => (prev + 1) % ads.length);
    }, 6000);
    return () => clearInterval(interval);
  }, [ads.length]);

  const SkeletonGrid = ({ count = 6 }) => (
    <>
      {[...Array(count)].map((_, i) => (
        <div key={i} className="landing-skeleton-card">
          <div className="skeleton-thumb" />
          <div className="skeleton-text" />
          <div className="skeleton-text" />
        </div>
      ))}
    </>
  );

  const handleSongImgError = useCallback((e) => {
    e.target.src = 'data:image/svg+xml,' + encodeURIComponent(
      '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><rect fill="#1a1f2e" width="100" height="100"/><text x="50" y="55" text-anchor="middle" fill="#94a3b8" font-size="30">♪</text></svg>'
    );
  }, []);

  const handleArtistImgError = useCallback((e) => {
    e.target.src = 'data:image/svg+xml,' + encodeURIComponent(
      '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><circle cx="50" cy="50" r="50" fill="#1a1f2e"/><text x="50" y="58" text-anchor="middle" fill="#8b5cf6" font-size="28">♫</text></svg>'
    );
  }, []);

  return (
    <div className="landing-page">
      <ThreeBackground variant="auth" />

      {/* ─── Navbar ─── */}
      <nav className={`landing-navbar ${scrolled ? 'scrolled' : ''}`} id="landing-navbar">
        <div className="navbar-brand">
          <div className="navbar-logo-icon">
            <Music size={22} color="#fff" />
          </div>
          <div className="navbar-brand-text">
            <h1>Melora</h1>
            <span className="tagline">Your Music, Your Vibe</span>
          </div>
        </div>
        <div className="navbar-actions">
          <button className="btn-login" onClick={() => navigate('/auth')} id="landing-login-btn">
            <LogIn size={16} /> <span>Log In</span>
          </button>
          <button className="btn-signup" onClick={() => navigate('/auth')} id="landing-signup-btn">
            <UserPlus size={16} /> Sign Up
          </button>
        </div>
      </nav>

      {/* ─── Hero ─── */}
      <section className="landing-hero" id="landing-hero">
        <div className="hero-badge">
          <Headphones size={14} /> Premium Music Experience
        </div>
        <h2 className="hero-title">
          Discover Music That <br />
          <span className="gradient-highlight">Matches Your Vibe</span>
        </h2>
        <p className="hero-subtitle">
          Stream thousands of songs from talented artists. Create playlists, explore genres,
          and enjoy a premium listening experience — all for free.
        </p>
        <div className="hero-actions">
          <button className="btn-signup" onClick={() => navigate('/auth')} style={{ padding: '0.8rem 2rem', fontSize: '1rem' }}>
            <Disc3 size={18} /> Get Started Free
          </button>
          <button className="btn-login" onClick={() => navigate('/auth')} style={{ padding: '0.8rem 2rem', fontSize: '1rem' }}>
            Explore Music
          </button>
        </div>
        <div className="hero-stats">
          <div className="hero-stat">
            <div className="hero-stat-value">{songs.length > 0 ? `${songs.length}+` : '—'}</div>
            <div className="hero-stat-label">Songs</div>
          </div>
          <div className="hero-stat">
            <div className="hero-stat-value">{artists.length > 0 ? `${artists.length}+` : '—'}</div>
            <div className="hero-stat-label">Artists</div>
          </div>
          <div className="hero-stat">
            <div className="hero-stat-value">∞</div>
            <div className="hero-stat-label">Playlists</div>
          </div>
        </div>
      </section>

      {/* ─── Advertisements (only if ads exist) ─── */}
      {ads.length > 0 && (
        <section className="landing-ads-section" id="landing-ads">
          <div className="ads-carousel">
            {ads.map((ad, idx) => (
              <div
                key={ad.id}
                className={`landing-ads-banner ${ad.imageUrl ? 'ad-with-image' : 'ad-no-image'}`}
                style={{ display: idx === activeAdIndex ? '' : 'none' }}
              >
                {ad.imageUrl && (
                  <div className="ad-image-side">
                    <img src={ad.imageUrl} alt={ad.title} />
                  </div>
                )}
                <div className={ad.imageUrl ? 'ad-content-side' : ''}>
                  <h3 className="ad-title">{ad.title}</h3>
                  <p className="ad-description">{ad.description}</p>
                  {ad.price && (
                    <div className="ad-price-tag">
                      <DollarSign size={16} />
                      {ad.price}
                    </div>
                  )}
                </div>
              </div>
            ))}

            {ads.length > 1 && (
              <div className="ads-carousel-dots">
                {ads.map((_, idx) => (
                  <button
                    key={idx}
                    className={`ads-carousel-dot ${idx === activeAdIndex ? 'active' : ''}`}
                    onClick={() => setActiveAdIndex(idx)}
                    aria-label={`Show ad ${idx + 1}`}
                  />
                ))}
              </div>
            )}
          </div>
        </section>
      )}

      {/* ─── Songs Section ─── */}
      <section className="landing-section" id="landing-songs">
        <div className="landing-section-header">
          <div className="section-icon-wrap">
            <TrendingUp size={22} />
          </div>
          <h2>Latest Songs</h2>
        </div>
        <div className="landing-songs-grid">
          {loading ? (
            <SkeletonGrid count={12} />
          ) : songs.length > 0 ? (
            songs.map((song) => (
              <div
                className="landing-song-card"
                key={song.id}
                id={`landing-song-${song.id}`}
                onClick={() => navigate('/auth')}
              >
                <img
                  className="landing-song-thumb"
                  src={song.thumbnailUrl || '/default-album.png'}
                  alt={song.title}
                  onError={handleSongImgError}
                  loading="lazy"
                />
                <div className="landing-song-info">
                  <h4>{song.title}</h4>
                  <p>{song.artist}</p>
                </div>
              </div>
            ))
          ) : (
            <div className="landing-empty-state" style={{ gridColumn: '1 / -1' }}>
              <Sparkles size={48} />
              <p>No songs available yet. Check back soon!</p>
            </div>
          )}
        </div>
      </section>

      {/* ─── Artists Section ─── */}
      <section className="landing-section" id="landing-artists">
        <div className="landing-section-header">
          <div className="section-icon-wrap">
            <Users size={22} />
          </div>
          <h2>Featured Artists</h2>
        </div>
        <div className="landing-artists-grid">
          {loading ? (
            [...Array(6)].map((_, i) => (
              <div key={i} className="landing-skeleton-card" style={{ borderRadius: 'var(--radius-xl)' }}>
                <div className="skeleton-thumb" style={{ borderRadius: '50%', width: '90px', height: '90px', margin: '0 auto', aspectRatio: 'auto' }} />
                <div className="skeleton-text" style={{ width: '70%', margin: '0.75rem auto 0' }} />
              </div>
            ))
          ) : artists.length > 0 ? (
            artists.map((artist) => (
              <div
                className="landing-artist-card"
                key={artist.id}
                id={`landing-artist-${artist.id}`}
                onClick={() => navigate('/auth')}
              >
                <img
                  className="landing-artist-avatar"
                  src={artist.profileImage || '/default-artist.png'}
                  alt={artist.name}
                  onError={handleArtistImgError}
                  loading="lazy"
                />
                <div className="landing-artist-name">{artist.name}</div>
                <div className="landing-artist-songs">
                  {artist.songCount || 0} {artist.songCount === 1 ? 'Song' : 'Songs'}
                </div>
              </div>
            ))
          ) : (
            <div className="landing-empty-state" style={{ gridColumn: '1 / -1' }}>
              <Users size={48} />
              <p>No artists yet. Stay tuned!</p>
            </div>
          )}
        </div>
      </section>

      {/* ─── Footer ─── */}
      <footer className="landing-footer" id="landing-footer">
        <p>
          © {new Date().getFullYear()} <span className="footer-brand">Melora</span> — Your Music, Your Vibe.
          All rights reserved.
        </p>
      </footer>
    </div>
  );
}
