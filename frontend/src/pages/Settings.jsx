import { Settings as SettingsIcon, User, LogOut, Moon, Volume2, Shield } from 'lucide-react';
import useAuthStore from '../store/authStore';
import usePlayerStore from '../store/playerStore';
import { useNavigate } from 'react-router-dom';

export default function SettingsPage() {
  const { user, logout } = useAuthStore();
  const { volume, setVolume } = usePlayerStore();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/auth');
  };

  return (
    <div className="home-page animate-fadeIn" style={{ padding: '1.5rem 0 2rem' }}>
      <h1 style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', fontSize: '1.75rem', fontWeight: 800, marginBottom: '2rem' }}>
        <SettingsIcon size={28} /> Settings
      </h1>

      {/* Profile Section */}
      <div className="glass-card" style={{ padding: '1.5rem', marginBottom: '1.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{ width: 64, height: 64, borderRadius: '50%', background: 'var(--bg-elevated)', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', fontSize: '1.5rem', fontWeight: 700, color: 'var(--brand-green)' }}>
            {user?.profilePicture ? <img src={user.profilePicture} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : user?.name?.[0]?.toUpperCase() || 'U'}
          </div>
          <div>
            <p style={{ fontSize: '1.1rem', fontWeight: 700 }}>{user?.name || 'Guest'}</p>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>{user?.email || 'Guest user'}</p>
            <span className="badge" style={{ marginTop: 4 }}>{user?.role || 'user'}</span>
          </div>
        </div>
      </div>

      {/* Playback */}
      <div className="glass-card" style={{ padding: '1.5rem', marginBottom: '1.5rem' }}>
        <h3 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem', fontSize: '1rem' }}><Volume2 size={18} /> Playback</h3>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <label style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', minWidth: 80 }}>Volume: {volume}%</label>
          <input type="range" min="0" max="100" value={volume} onChange={(e) => setVolume(parseInt(e.target.value))} className="volume-slider" style={{ flex: 1, width: 'auto' }} />
        </div>
      </div>

      {/* Account */}
      <div className="glass-card" style={{ padding: '1.5rem', marginBottom: '1.5rem' }}>
        <h3 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem', fontSize: '1rem' }}><Shield size={18} /> Account</h3>
        <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>Auth method: {user?.authMethod || 'N/A'}</p>
        <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '1rem' }}>Verified: {user?.isVerified ? '✅ Yes' : '❌ No'}</p>
        <button className="btn btn-secondary" onClick={handleLogout} style={{ color: 'var(--error)' }}><LogOut size={16} /> Logout</button>
      </div>

      {/* About */}
      <div className="glass-card" style={{ padding: '1.5rem' }}>
        <h3 style={{ marginBottom: '0.75rem', fontSize: '1rem' }}>About</h3>
        <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Melora v1.0.0</p>
        <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: 4 }}>Your Music, Your Vibe 🎵</p>
      </div>
    </div>
  );
}
