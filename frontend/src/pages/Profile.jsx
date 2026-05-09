import { useState } from 'react';
import { User, Edit2, Link as LinkIcon, Globe, Camera, Code, Hexagon, Sparkles, Plus } from 'lucide-react';
import useAuthStore from '../store/authStore';
import './Profile.css';

export default function Profile() {
  const { user } = useAuthStore();
  const [isEditing, setIsEditing] = useState(false);
  const [vicksBalance, setVicksBalance] = useState(150); // Initial mock balance

  // Profile Form State
  const [profileData, setProfileData] = useState({
    bio: 'Music enthusiast. Always looking for the next beat. 🎧',
    interests: 'Electronic, Indie Rock, Lo-Fi',
    hobby: 'Producing beats, Night drives',
    twitter: '',
    instagram: '',
    github: '',
  });

  const handleSave = () => {
    setIsEditing(false);
    // Give 50 VICK'S reward for updating profile
    setVicksBalance(prev => prev + 50);
    // In a real app, make an API call to save to backend here
    alert("Profile saved! You earned 50 VICK'S! 🪙");
  };

  const handleChange = (e) => {
    setProfileData({ ...profileData, [e.target.name]: e.target.value });
  };

  return (
    <div className="profile-page animate-fadeIn">
      <div className="profile-header glass-card">
        <div className="profile-cover"></div>
        <div className="profile-info-wrap">
          <div className="profile-avatar-container">
            <div className="profile-avatar">
              <User size={64} color="#081116" />
            </div>
            {isEditing && (
              <button className="avatar-edit-btn" aria-label="Change avatar">
                <Plus size={20} />
              </button>
            )}
          </div>
          
          <div className="profile-info">
            <div className="profile-name-row">
              <h1 className="profile-name">{user?.name || 'User'}</h1>
              {!isEditing ? (
                <button className="btn btn-secondary btn-sm glass-button" onClick={() => setIsEditing(true)}>
                  <Edit2 size={14} /> Edit Profile
                </button>
              ) : (
                <button className="btn btn-primary btn-sm glass-button" onClick={handleSave}>
                  Save Changes
                </button>
              )}
            </div>
            <p className="profile-email">{user?.email}</p>
            <span className="badge mt-2">{user?.role === 'creator' ? 'Creator' : 'Listener'}</span>
          </div>

          {/* VICK'S Currency Balance */}
          <div className="profile-currency glass-notification">
            <div className="currency-icon-wrap">
              <div className="vicks-coin">
                <span className="vicks-logo">V</span>
              </div>
            </div>
            <div className="currency-details">
              <p className="currency-label">VICK'S Balance</p>
              <h2 className="currency-amount gradient-text">{vicksBalance}</h2>
            </div>
            <Sparkles className="currency-sparkle" size={16} />
          </div>
        </div>
      </div>

      <div className="profile-content grid-layout">
        {/* Left Column - Details */}
        <div className="profile-section glass-card">
          <h3 className="section-title">About Me</h3>
          
          {isEditing ? (
            <div className="profile-form">
              <div className="form-group">
                <label>Bio</label>
                <textarea name="bio" className="input-field" value={profileData.bio} onChange={handleChange} rows="3" />
              </div>
              <div className="form-group">
                <label>Interests / Favorite Genres</label>
                <input type="text" name="interests" className="input-field" value={profileData.interests} onChange={handleChange} />
              </div>
              <div className="form-group">
                <label>Hobbies</label>
                <input type="text" name="hobby" className="input-field" value={profileData.hobby} onChange={handleChange} />
              </div>
            </div>
          ) : (
            <div className="profile-details">
              <p className="detail-bio">{profileData.bio}</p>
              <div className="detail-item">
                <strong>Interests:</strong> <span>{profileData.interests || 'Not set'}</span>
              </div>
              <div className="detail-item">
                <strong>Hobbies:</strong> <span>{profileData.hobby || 'Not set'}</span>
              </div>
            </div>
          )}
        </div>

        {/* Right Column - Social Links */}
        <div className="profile-section glass-card">
          <h3 className="section-title">Social Links</h3>
          
          {isEditing ? (
            <div className="profile-form">
              <div className="form-group input-group">
                <Globe size={18} className="input-icon" />
                <input type="text" name="twitter" className="input-field input-with-icon" placeholder="Twitter Username" value={profileData.twitter} onChange={handleChange} />
              </div>
              <div className="form-group input-group">
                <Camera size={18} className="input-icon" />
                <input type="text" name="instagram" className="input-field input-with-icon" placeholder="Instagram Username" value={profileData.instagram} onChange={handleChange} />
              </div>
              <div className="form-group input-group">
                <Code size={18} className="input-icon" />
                <input type="text" name="github" className="input-field input-with-icon" placeholder="Github Username" value={profileData.github} onChange={handleChange} />
              </div>
            </div>
          ) : (
            <div className="social-links-list">
              {profileData.twitter || profileData.instagram || profileData.github ? (
                <>
                  {profileData.twitter && (
                    <a href={`https://twitter.remotesync.com/${profileData.twitter}`} target="_blank" rel="noreferrer" className="social-link-item glass-button">
                      <Globe size={20} /> @{profileData.twitter}
                    </a>
                  )}
                  {profileData.instagram && (
                    <a href={`https://instagram.remotesync.com/${profileData.instagram}`} target="_blank" rel="noreferrer" className="social-link-item glass-button">
                      <Camera size={20} /> @{profileData.instagram}
                    </a>
                  )}
                  {profileData.github && (
                    <a href={`https://github.remotesync.com/${profileData.github}`} target="_blank" rel="noreferrer" className="social-link-item glass-button">
                      <Code size={20} /> @{profileData.github}
                    </a>
                  )}
                </>
              ) : (
                <p className="text-muted">No social links added yet.</p>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
