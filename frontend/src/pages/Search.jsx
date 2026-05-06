import { useState, useEffect, useCallback } from 'react';
import { Search as SearchIcon, X, TrendingUp } from 'lucide-react';
import SongCard from '../components/song/SongCard';
import api from '../services/api';
import './Search.css';

export default function SearchPage() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState({ songs: [], artists: [], albums: [] });
  const [suggestions, setSuggestions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);

  // Debounced search
  useEffect(() => {
    if (!query.trim()) { setSuggestions([]); return; }
    const timer = setTimeout(async () => {
      try {
        const { data } = await api.get(`/search/suggestions?q=${encodeURIComponent(query)}`);
        setSuggestions(data.data || []);
      } catch {}
    }, 300);
    return () => clearTimeout(timer);
  }, [query]);

  const handleSearch = useCallback(async (searchQuery) => {
    const q = searchQuery || query;
    if (!q.trim()) return;
    setLoading(true);
    setSearched(true);
    setSuggestions([]);
    try {
      const { data } = await api.get(`/search?q=${encodeURIComponent(q)}`);
      setResults(data.data || { songs: [], artists: [], albums: [] });
    } catch (err) {
      console.error('Search failed:', err);
    } finally {
      setLoading(false);
    }
  }, [query]);

  const handleKeyDown = (e) => { if (e.key === 'Enter') handleSearch(); };

  return (
    <div className="search-page animate-fadeIn">
      <div className="search-bar-wrap">
        <SearchIcon size={20} className="search-bar-icon" />
        <input type="text" className="search-input" placeholder="What do you want to listen to?" value={query}
          onChange={(e) => setQuery(e.target.value)} onKeyDown={handleKeyDown} autoFocus id="search-input" />
        {query && <button className="search-clear" onClick={() => { setQuery(''); setResults({ songs: [], artists: [], albums: [] }); setSearched(false); }}><X size={18} /></button>}
      </div>

      {suggestions.length > 0 && !loading && (
        <div className="search-suggestions glass-card">
          {suggestions.map((s) => (
            <button key={s.id} className="suggestion-item" onClick={() => { setQuery(s.title); handleSearch(s.title); }}>
              <img src={s.thumbnailUrl || '/default-album.png'} alt="" className="suggestion-img"
                onError={(e) => { e.target.src = 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 40 40"><rect fill="%231a1f2e" width="40" height="40"/><text x="20" y="24" text-anchor="middle" fill="%2394a3b8" font-size="14">♪</text></svg>'; }} />
              <div><p className="suggestion-title truncate">{s.title}</p><p className="suggestion-artist truncate">{s.artist}</p></div>
            </button>
          ))}
        </div>
      )}

      {loading && <div className="search-loading"><div className="skeleton" style={{ height: 200, width: '100%' }} /></div>}

      {searched && !loading && (
        <div className="search-results">
          {results.songs?.length > 0 && (
            <section className="result-section">
              <h2 className="section-title">Songs</h2>
              <div className="song-grid">{results.songs.map((song, i) => <SongCard key={song.id} song={song} songs={results.songs} index={i} />)}</div>
            </section>
          )}
          {results.artists?.length > 0 && (
            <section className="result-section">
              <h2 className="section-title">Artists</h2>
              <div className="artist-grid">{results.artists.map((a) => (
                <div key={a.id} className="artist-card glass-card">
                  <div className="artist-avatar">{a.profileImage ? <img src={a.profileImage} alt={a.name} /> : <span>{a.name[0]}</span>}</div>
                  <p className="artist-name truncate">{a.name}</p>
                  <span className="badge">{a.songCount || 0} songs</span>
                </div>
              ))}</div>
            </section>
          )}
          {results.songs?.length === 0 && results.artists?.length === 0 && results.albums?.length === 0 && (
            <div className="empty-state"><SearchIcon size={48} /><p>No results found for "{query}"</p></div>
          )}
        </div>
      )}

      {!searched && !loading && (
        <div className="search-browse">
          <h2 className="section-title"><TrendingUp size={20} /> Browse by genre</h2>
          <div className="genre-grid">
            {['Pop', 'Hip Hop', 'Rock', 'Electronic', 'R&B', 'Jazz', 'Classical', 'Indie', 'Lo-fi', 'Bollywood', 'K-Pop', 'Latin'].map((genre) => (
              <button key={genre} className="genre-card" onClick={() => { setQuery(genre); handleSearch(genre); }}
                style={{ background: `hsl(${Math.random() * 360}, 60%, 25%)` }}>
                <span>{genre}</span>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
