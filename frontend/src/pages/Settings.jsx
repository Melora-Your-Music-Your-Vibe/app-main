import { useState } from 'react';
import { Settings as SettingsIcon, User, LogOut, Moon, Volume2, Shield, Gem, Edit3, Image as ImageIcon, Link as LinkIcon, Music, Heart } from 'lucide-react';
import useAuthStore from '../store/authStore';
import usePlayerStore from '../store/playerStore';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';

export default function SettingsPage() {
  const { user, logout } = useAuthStore();
  const { volume, setVolume } = usePlayerStore();
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState('profile'); // profile | rewards | settings
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    bio: user?.bio || '',
    interests: user?.interests || '',
    socialLinks: {
      instagram: user?.socialLinks?.instagram || '',
      twitter: user?.socialLinks?.twitter || '',
    }
  });

  const handleLogout = async () => {
    await logout();
    navigate('/auth');
  };

  const handleSaveProfile = async () => {
    try {
      const { default: api } = await import('../services/api');
      const res = await api.put('/auth/update-profile', {
        bio: formData.bio,
        interests: formData.interests,
        socialLinks: formData.socialLinks
      });
      useAuthStore.getState().setUser(res.data.data.user);
      toast.success(res.data.message);
      setIsEditing(false);
    } catch (err) {
      toast.error('Failed to update profile');
    }
  };

  return (
    <div className="home-page animate-fadeIn" style={{ padding: '1.5rem 0 2rem' }}>
      <div style={{ display: 'flex', gap: '1rem', marginBottom: '2rem', flexWrap: 'wrap' }}>
        <button className={`btn ${activeTab === 'profile' ? 'btn-primary' : 'btn-secondary'}`} onClick={() => setActiveTab('profile')}>
          <User size={18} /> Profile
        </button>
        <button className={`btn ${activeTab === 'rewards' ? 'btn-primary' : 'btn-secondary'}`} onClick={() => setActiveTab('rewards')}>
          <Gem size={18} /> Rewards
        </button>
        <button className={`btn ${activeTab === 'settings' ? 'btn-primary' : 'btn-secondary'}`} onClick={() => setActiveTab('settings')}>
          <SettingsIcon size={18} /> Settings
        </button>
      </div>

      {activeTab === 'profile' && (
        <div className="glass-card animate-slideUp" style={{ padding: '2rem' }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
              <div style={{ width: 100, height: 100, borderRadius: '50%', background: 'var(--bg-elevated)', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', fontSize: '2.5rem', fontWeight: 700, color: 'var(--brand-primary)', position: 'relative' }}>
                {user?.profilePicture ? <img src={user.profilePicture} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : user?.name?.[0]?.toUpperCase() || 'U'}
                {isEditing && (
                  <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, background: 'rgba(0,0,0,0.5)', padding: '4px', display: 'flex', justifyContent: 'center', cursor: 'pointer' }}>
                    <ImageIcon size={16} />
                  </div>
                )}
              </div>
              <div>
                <h2 style={{ fontSize: '1.5rem', fontWeight: 800 }}>{user?.name || 'Guest'}</h2>
                <p style={{ color: 'var(--text-secondary)' }}>{user?.email}</p>
                <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.5rem' }}>
                  <span className="badge">{user?.role || 'user'}</span>
                  <span className="badge" style={{ background: 'rgba(59, 130, 246, 0.1)', color: 'var(--info)' }}>
                    <Gem size={12} style={{ marginRight: 4 }} /> {user?.vicksBalance || 0} VICK'S
                  </span>
                </div>
              </div>
            </div>
            {!isEditing ? (
              <button className="btn btn-secondary" onClick={() => setIsEditing(true)}>
                <Edit3 size={16} /> Edit Profile
              </button>
            ) : (
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <button className="btn btn-ghost" onClick={() => setIsEditing(false)}>Cancel</button>
                <button className="btn btn-primary" onClick={handleSaveProfile}>Save Changes</button>
              </div>
            )}
          </div>

          <div style={{ marginTop: '2.5rem', display: 'grid', gap: '1.5rem' }}>
            <div>
              <h3 style={{ fontSize: '1.1rem', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <User size={18} color="var(--brand-primary)" /> Bio
              </h3>
              {isEditing ? (
                <textarea 
                  className="input-field" 
                  rows="3" 
                  value={formData.bio} 
                  onChange={e => setFormData({...formData, bio: e.target.value})}
                  placeholder="Tell us about yourself..."
                />
              ) : (
                <p style={{ color: user?.bio ? 'var(--text-primary)' : 'var(--text-muted)' }}>
                  {user?.bio || 'No bio added yet. Edit your profile to earn VICK\'S!'}
                </p>
              )}
            </div>

            <div>
              <h3 style={{ fontSize: '1.1rem', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Heart size={18} color="var(--brand-secondary)" /> Music Interests & Hobbies
              </h3>
              {isEditing ? (
                <input 
                  type="text" 
                  className="input-field" 
                  value={formData.interests} 
                  onChange={e => setFormData({...formData, interests: e.target.value})}
                  placeholder="e.g., Synthwave, Guitar, Lo-Fi beats..."
                />
              ) : (
                <p style={{ color: user?.interests ? 'var(--text-primary)' : 'var(--text-muted)' }}>
                  {user?.interests || 'No interests added yet.'}
                </p>
              )}
            </div>

            <div>
              <h3 style={{ fontSize: '1.1rem', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <LinkIcon size={18} color="var(--brand-tertiary)" /> Social Links
              </h3>
              {isEditing ? (
                <div style={{ display: 'grid', gap: '0.75rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <LinkIcon size={20} color="var(--text-secondary)" />
                    <input type="text" className="input-field" value={formData.socialLinks.instagram} onChange={e => setFormData({...formData, socialLinks: {...formData.socialLinks, instagram: e.target.value}})} placeholder="Instagram Handle" />
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <LinkIcon size={20} color="var(--text-secondary)" />
                    <input type="text" className="input-field" value={formData.socialLinks.twitter} onChange={e => setFormData({...formData, socialLinks: {...formData.socialLinks, twitter: e.target.value}})} placeholder="Twitter/X Handle" />
                  </div>
                </div>
              ) : (
                <div style={{ display: 'flex', gap: '1rem' }}>
                  {user?.socialLinks?.instagram && (
                    <a href={`https://instagram.com/${user.socialLinks.instagram}`} target="_blank" rel="noreferrer" className="btn btn-secondary btn-icon">
                      <LinkIcon size={18} />
                    </a>
                  )}
                  {user?.socialLinks?.twitter && (
                    <a href={`https://twitter.com/${user.socialLinks.twitter}`} target="_blank" rel="noreferrer" className="btn btn-secondary btn-icon">
                      <LinkIcon size={18} />
                    </a>
                  )}
                  {!user?.socialLinks?.instagram && !user?.socialLinks?.twitter && (
                    <p style={{ color: 'var(--text-muted)' }}>No social links connected.</p>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {activeTab === 'rewards' && (
        <div className="glass-card animate-slideUp" style={{ padding: '2rem', textAlign: 'center' }}>
          <img src="/images/vicks.png" alt="VICK'S Coin" style={{ width: 120, height: 120, margin: '0 auto 1.5rem', filter: 'drop-shadow(0 0 20px rgba(59, 130, 246, 0.5))' }} />
          <h2 style={{ fontSize: '2rem', fontWeight: 800, marginBottom: '0.5rem', background: 'var(--brand-gradient)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
            {user?.vicksBalance || 0} VICK'S
          </h2>
          <p style={{ color: 'var(--text-secondary)', marginBottom: '2rem' }}>Your digital reward currency on Melora.</p>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1rem', textAlign: 'left' }}>
            <div className="glass-card" style={{ padding: '1.5rem' }}>
              <h4 style={{ fontWeight: 700, marginBottom: '0.5rem' }}>Complete Profile</h4>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '1rem' }}>Add bio and social links to earn.</p>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span className="badge">+100 VICK'S</span>
                {user?.bio ? <span style={{ color: 'var(--success)', fontSize: '0.8rem' }}>Claimed</span> : <button className="btn btn-sm btn-secondary" onClick={() => setActiveTab('profile')}>Do it now</button>}
              </div>
            </div>
            <div className="glass-card" style={{ padding: '1.5rem' }}>
              <h4 style={{ fontWeight: 700, marginBottom: '0.5rem' }}>Create Playlist</h4>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '1rem' }}>Curate your first playlist.</p>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span className="badge">+50 VICK'S</span>
                <button className="btn btn-sm btn-secondary">Go to Library</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'settings' && (
        <div className="animate-slideUp">
          <div className="glass-card" style={{ padding: '1.5rem', marginBottom: '1.5rem' }}>
            <h3 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem', fontSize: '1rem' }}><Volume2 size={18} /> Playback</h3>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <label style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', minWidth: 80 }}>Volume: {volume}%</label>
              <input type="range" min="0" max="100" value={volume} onChange={(e) => setVolume(parseInt(e.target.value))} className="volume-slider native-slider" style={{ flex: 1, width: 'auto' }} />
            </div>
          </div>

          <div className="glass-card" style={{ padding: '1.5rem', marginBottom: '1.5rem' }}>
            <h3 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem', fontSize: '1rem' }}><Shield size={18} /> Account Security</h3>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>Auth method: {user?.authMethod || 'N/A'}</p>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '1rem' }}>Verified: {user?.isVerified ? '✅ Yes' : '❌ No'}</p>
            <button className="btn btn-secondary" onClick={handleLogout} style={{ color: 'var(--error)' }}><LogOut size={16} /> Logout All Devices</button>
          </div>

          <div className="glass-card" style={{ padding: '1.5rem' }}>
            <h3 style={{ marginBottom: '0.75rem', fontSize: '1rem' }}>About</h3>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Melora v2.0 - Rewards Edition</p>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: 4 }}>Your Music, Your Vibe 🎵</p>
          </div>
        </div>
      )}
    </div>
  );
}
