import { useState, useEffect } from 'react';
import { LayoutDashboard, Upload, Music, Users, BarChart3, Trash2, Edit, Plus } from 'lucide-react';
import api from '../services/api';
import './Creator.css';

export default function CreatorDashboard() {
  const [tab, setTab] = useState('overview');
  const [stats, setStats] = useState({});
  const [songs, setSongs] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [uploadForm, setUploadForm] = useState({ title: '', artist: '', album: '', genre: '', year: '', lyrics: '', language: 'English' });
  const [audioFile, setAudioFile] = useState(null);
  const [thumbnail, setThumbnail] = useState(null);
  const [message, setMessage] = useState('');

  useEffect(() => {
    const fetch = async () => {
      try {
        const { data } = await api.get('/stats/overview');
        setStats(data.data || {});
        const songsRes = await api.get('/songs?limit=50');
        setSongs(songsRes.data.data || []);
      } catch {}
    };
    fetch();
  }, []);

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!uploadForm.title || !uploadForm.artist) { setMessage('Title and artist are required'); return; }
    setUploading(true); setMessage('');
    try {
      const formData = new FormData();
      Object.keys(uploadForm).forEach(key => { if (uploadForm[key]) formData.append(key, uploadForm[key]); });
      if (audioFile) formData.append('audioFile', audioFile);
      if (thumbnail) formData.append('thumbnail', thumbnail);
      await api.post('/songs', formData, { headers: { 'Content-Type': 'multipart/form-data' } });
      setMessage('Song uploaded successfully! 🎵');
      setUploadForm({ title: '', artist: '', album: '', genre: '', year: '', lyrics: '', language: 'English' });
      setAudioFile(null); setThumbnail(null);
      const songsRes = await api.get('/songs?limit=50');
      setSongs(songsRes.data.data || []);
    } catch (err) {
      setMessage(err.response?.data?.message || 'Upload failed');
    } finally { setUploading(false); }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this song?')) return;
    try {
      await api.delete(`/songs/${id}`);
      setSongs(songs.filter(s => s.id !== id));
    } catch {}
  };

  const statCards = [
    { label: 'Total Songs', value: stats.totalSongs || 0, icon: Music, color: '#1db954' },
    { label: 'Artists', value: stats.totalArtists || 0, icon: Users, color: '#3b82f6' },
    { label: 'Albums', value: stats.totalAlbums || 0, icon: BarChart3, color: '#9b5de5' },
    { label: 'Users', value: stats.totalUsers || 0, icon: Users, color: '#f59e0b' },
  ];

  return (
    <div className="creator-page animate-fadeIn">
      <div className="creator-header">
        <h1><LayoutDashboard size={28} /> Creator Studio</h1>
        <p className="creator-subtitle">Manage your music and content</p>
      </div>

      <div className="creator-tabs">
        {['overview', 'upload', 'manage'].map(t => (
          <button key={t} className={`creator-tab ${tab === t ? 'active' : ''}`} onClick={() => setTab(t)}>
            {t === 'overview' && <BarChart3 size={16} />}
            {t === 'upload' && <Upload size={16} />}
            {t === 'manage' && <Music size={16} />}
            {t.charAt(0).toUpperCase() + t.slice(1)}
          </button>
        ))}
      </div>

      {tab === 'overview' && (
        <div className="creator-content">
          <div className="stats-grid">
            {statCards.map((s, i) => (
              <div key={i} className="stat-card glass-card">
                <div className="stat-icon" style={{ background: `${s.color}20`, color: s.color }}><s.icon size={24} /></div>
                <div className="stat-info"><p className="stat-value">{s.value}</p><p className="stat-label">{s.label}</p></div>
              </div>
            ))}
          </div>
        </div>
      )}

      {tab === 'upload' && (
        <div className="creator-content">
          <form className="upload-form glass-card" onSubmit={handleUpload}>
            <h2><Plus size={20} /> Upload New Song</h2>
            {message && <div className={`auth-alert ${message.includes('success') ? 'success' : 'error'}`}>{message}</div>}
            <div className="form-grid">
              <div className="form-group"><label>Title *</label><input className="input-field" value={uploadForm.title} onChange={e => setUploadForm({...uploadForm, title: e.target.value})} required /></div>
              <div className="form-group"><label>Artist *</label><input className="input-field" value={uploadForm.artist} onChange={e => setUploadForm({...uploadForm, artist: e.target.value})} required /></div>
              <div className="form-group"><label>Album</label><input className="input-field" value={uploadForm.album} onChange={e => setUploadForm({...uploadForm, album: e.target.value})} /></div>
              <div className="form-group"><label>Genre</label><input className="input-field" value={uploadForm.genre} onChange={e => setUploadForm({...uploadForm, genre: e.target.value})} /></div>
              <div className="form-group"><label>Year</label><input type="number" className="input-field" value={uploadForm.year} onChange={e => setUploadForm({...uploadForm, year: e.target.value})} /></div>
              <div className="form-group"><label>Language</label><input className="input-field" value={uploadForm.language} onChange={e => setUploadForm({...uploadForm, language: e.target.value})} /></div>
            </div>
            <div className="form-group"><label>Audio File *</label>
              <div className="file-upload"><input type="file" accept="audio/*" onChange={e => setAudioFile(e.target.files[0])} />{audioFile && <span className="file-name">{audioFile.name}</span>}</div>
            </div>
            <div className="form-group"><label>Cover Art</label>
              <div className="file-upload"><input type="file" accept="image/*" onChange={e => setThumbnail(e.target.files[0])} />{thumbnail && <span className="file-name">{thumbnail.name}</span>}</div>
            </div>
            <div className="form-group"><label>Lyrics</label><textarea className="input-field textarea" rows={4} value={uploadForm.lyrics} onChange={e => setUploadForm({...uploadForm, lyrics: e.target.value})} /></div>
            <button type="submit" className="btn btn-primary btn-lg" disabled={uploading} style={{width:'100%'}}>
              {uploading ? 'Uploading...' : 'Upload Song'} <Upload size={18} />
            </button>
          </form>
        </div>
      )}

      {tab === 'manage' && (
        <div className="creator-content">
          <div className="manage-table glass-card">
            <div className="table-header"><span>Song</span><span className="hide-mobile">Artist</span><span className="hide-mobile">Genre</span><span className="hide-mobile">Plays</span><span>Actions</span></div>
            {songs.map((song) => (
              <div key={song.id} className="table-row">
                <div className="table-cell song-cell">
                  <img src={song.thumbnailUrl || '/default-album.png'} alt="" className="table-thumb"
                    onError={(e) => { e.target.src = 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 40 40"><rect fill="%231a1f2e" width="40" height="40"/><text x="20" y="24" text-anchor="middle" fill="%2394a3b8" font-size="14">♪</text></svg>'; }} />
                  <span className="truncate">{song.title}</span>
                </div>
                <span className="table-cell hide-mobile truncate">{song.artist}</span>
                <span className="table-cell hide-mobile"><span className="badge">{song.genre}</span></span>
                <span className="table-cell hide-mobile">{song.playCount}</span>
                <div className="table-cell table-actions">
                  <button className="btn-icon" onClick={() => handleDelete(song.id)} title="Delete"><Trash2 size={16} color="var(--error)" /></button>
                </div>
              </div>
            ))}
            {songs.length === 0 && <div className="empty-state"><Music size={48} /><p>No songs uploaded yet.</p></div>}
          </div>
        </div>
      )}
    </div>
  );
}
