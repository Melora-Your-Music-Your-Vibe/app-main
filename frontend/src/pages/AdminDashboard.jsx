import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import {
  Shield, Check, Edit2, Key, Users, Megaphone, Plus, Trash2,
  Eye, EyeOff, Calendar, DollarSign, Image, X, ChevronRight
} from 'lucide-react';
import ThreeBackground from '../components/common/ThreeBackground';
import './Admin.css';

export default function AdminDashboard() {
  const [token, setToken] = useState(localStorage.getItem('adminToken') || null);
  const [creators, setCreators] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('creators');

  // Login states
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loginError, setLoginError] = useState('');

  // Edit states
  const [editingId, setEditingId] = useState(null);
  const [editData, setEditData] = useState({ name: '', password: '' });

  // Advertisement states
  const [advertisements, setAdvertisements] = useState([]);
  const [adsLoading, setAdsLoading] = useState(false);
  const [showAdForm, setShowAdForm] = useState(false);
  const [editingAdId, setEditingAdId] = useState(null);
  const [adForm, setAdForm] = useState({
    title: '', description: '', type: 'commercial', price: '',
    startDate: '', endDate: '', adImage: null,
  });
  const [adFormError, setAdFormError] = useState('');
  const [adImagePreview, setAdImagePreview] = useState(null);

  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api/v1';

  const fetchCreators = async () => {
    if (!token) return;
    try {
      const res = await axios.get(`${API_URL}/admin/creators`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setCreators(res.data.data.creators);
    } catch (err) {
      if (err.response?.status === 401) {
        setToken(null);
        localStorage.removeItem('adminToken');
      }
    } finally {
      setLoading(false);
    }
  };

  const fetchAdvertisements = async () => {
    if (!token) return;
    setAdsLoading(true);
    try {
      const res = await axios.get(`${API_URL}/admin/advertisements`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setAdvertisements(res.data.data);
    } catch (err) {
      if (err.response?.status === 401) {
        setToken(null);
        localStorage.removeItem('adminToken');
      }
    } finally {
      setAdsLoading(false);
    }
  };

  useEffect(() => {
    if (token) {
      fetchCreators();
      fetchAdvertisements();
    }
  }, [token]);

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoginError('');
    try {
      const res = await axios.post(`${API_URL}/admin/login`, { username, password });
      const { token } = res.data.data;
      setToken(token);
      localStorage.setItem('adminToken', token);
    } catch (err) {
      setLoginError(err.response?.data?.message || 'Login failed');
    }
  };

  const handleApprove = async (id) => {
    try {
      await axios.put(`${API_URL}/admin/creators/${id}/approve`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchCreators();
    } catch (err) {
      alert('Failed to approve');
    }
  };

  const handleSaveEdit = async (id) => {
    try {
      const payload = {};
      if (editData.name) payload.name = editData.name;
      if (editData.password) payload.password = editData.password;

      await axios.put(`${API_URL}/admin/creators/${id}`, payload, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setEditingId(null);
      setEditData({ name: '', password: '' });
      fetchCreators();
    } catch (err) {
      alert('Failed to update');
    }
  };

  // ─── Advertisement Handlers ───
  const resetAdForm = () => {
    setAdForm({ title: '', description: '', type: 'commercial', price: '', startDate: '', endDate: '', adImage: null });
    setAdImagePreview(null);
    setEditingAdId(null);
    setShowAdForm(false);
    setAdFormError('');
  };

  const handleAdImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setAdForm({ ...adForm, adImage: file });
      setAdImagePreview(URL.createObjectURL(file));
    }
  };

  const handleAdSubmit = async (e) => {
    e.preventDefault();
    setAdFormError('');

    if (!adForm.title || !adForm.description || !adForm.type || !adForm.endDate) {
      setAdFormError('Title, description, type, and end date are required.');
      return;
    }

    const formData = new FormData();
    formData.append('title', adForm.title);
    formData.append('description', adForm.description);
    formData.append('type', adForm.type);
    formData.append('price', adForm.price);
    formData.append('startDate', adForm.startDate || new Date().toISOString());
    formData.append('endDate', adForm.endDate);
    if (adForm.adImage) {
      formData.append('adImage', adForm.adImage);
    }

    try {
      if (editingAdId) {
        await axios.put(`${API_URL}/admin/advertisements/${editingAdId}`, formData, {
          headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'multipart/form-data' }
        });
      } else {
        await axios.post(`${API_URL}/admin/advertisements`, formData, {
          headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'multipart/form-data' }
        });
      }
      resetAdForm();
      fetchAdvertisements();
    } catch (err) {
      setAdFormError(err.response?.data?.message || 'Failed to save advertisement');
    }
  };

  const handleEditAd = (ad) => {
    setEditingAdId(ad.id);
    setAdForm({
      title: ad.title,
      description: ad.description,
      type: ad.type,
      price: ad.price || '',
      startDate: ad.startDate ? ad.startDate.split('T')[0] : '',
      endDate: ad.endDate ? ad.endDate.split('T')[0] : '',
      adImage: null,
    });
    setAdImagePreview(ad.imageUrl || null);
    setShowAdForm(true);
  };

  const handleDeleteAd = async (id) => {
    if (!confirm('Are you sure you want to delete this advertisement?')) return;
    try {
      await axios.delete(`${API_URL}/admin/advertisements/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchAdvertisements();
    } catch (err) {
      alert('Failed to delete advertisement');
    }
  };

  const handleToggleAd = async (id) => {
    try {
      await axios.patch(`${API_URL}/admin/advertisements/${id}/toggle`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchAdvertisements();
    } catch (err) {
      alert('Failed to toggle advertisement');
    }
  };

  const getAdTypeLabel = (type) => {
    switch (type) {
      case 'commercial': return 'Commercial / Feature';
      case 'brand': return 'Brand Advertisement';
      case 'subscription': return 'Subscription';
      default: return type;
    }
  };

  const getAdTypeBadgeClass = (type) => {
    switch (type) {
      case 'commercial': return 'badge-commercial';
      case 'brand': return 'badge-brand';
      case 'subscription': return 'badge-subscription';
      default: return '';
    }
  };

  const isAdActive = (ad) => {
    const now = new Date();
    return ad.isActive && new Date(ad.startDate) <= now && new Date(ad.endDate) >= now;
  };

  // ─── Login Screen ───
  if (!token) {
    return (
      <div className="admin-page">
        <ThreeBackground variant="auth" />
        <div className="admin-login-card glass-card">
          <div className="admin-header">
            <Shield size={32} className="admin-icon" />
            <h2>Admin Portal</h2>
            <p>Creator & Advertisement Management</p>
          </div>
          <form onSubmit={handleLogin}>
            {loginError && <div className="auth-alert error">{loginError}</div>}
            <div className="input-group">
              <Key size={18} className="input-icon" />
              <input type="text" placeholder="Username" className="input-field input-with-icon" value={username} onChange={e => setUsername(e.target.value)} required />
            </div>
            <div className="input-group" style={{ marginTop: '1rem' }}>
              <Key size={18} className="input-icon" />
              <input type="password" placeholder="Password" className="input-field input-with-icon" value={password} onChange={e => setPassword(e.target.value)} required />
            </div>
            <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: '1.5rem' }}>Login</button>
          </form>
        </div>
      </div>
    );
  }

  const pendingCreators = creators.filter(c => !c.isApproved);
  const approvedCreators = creators.filter(c => c.isApproved);

  // ─── Dashboard ───
  return (
    <div className="admin-page">
      <ThreeBackground variant="auth" />
      <div className="admin-dashboard glass-card">
        {/* Header */}
        <div className="admin-header flex-between">
          <div>
            <h2><Shield size={24} /> Admin Portal</h2>
            <p>Manage creators and advertisements</p>
          </div>
          <button className="btn btn-secondary btn-sm" onClick={() => { setToken(null); localStorage.removeItem('adminToken'); }}>Logout</button>
        </div>

        {/* Tab Navigation */}
        <div className="admin-tabs">
          <button
            className={`admin-tab ${activeTab === 'creators' ? 'active' : ''}`}
            onClick={() => setActiveTab('creators')}
          >
            <Users size={18} /> Creators
            <span className="tab-count">{creators.length}</span>
          </button>
          <button
            className={`admin-tab ${activeTab === 'advertisements' ? 'active' : ''}`}
            onClick={() => setActiveTab('advertisements')}
          >
            <Megaphone size={18} /> Advertisements
            <span className="tab-count">{advertisements.length}</span>
          </button>
        </div>

        {/* ─── Creators Tab ─── */}
        {activeTab === 'creators' && (
          <div className="admin-sections">
            <div className="admin-section">
              <h3>Pending Approvals ({pendingCreators.length})</h3>
              {pendingCreators.length === 0 ? <p className="text-muted">No pending requests.</p> : (
                <div className="creator-list">
                  {pendingCreators.map(c => (
                    <div key={c.id} className="creator-card">
                      <div className="creator-info">
                        <h4>{c.name}</h4>
                        <p>{c.email}</p>
                        <small>Requested: {new Date(c.createdAt).toLocaleDateString()}</small>
                      </div>
                      <div className="creator-actions">
                        <button className="btn btn-primary btn-sm" onClick={() => handleApprove(c.id)}>
                          <Check size={16} /> Approve
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="admin-section">
              <h3>Approved Creators ({approvedCreators.length})</h3>
              {approvedCreators.length === 0 ? <p className="text-muted">No approved creators yet.</p> : (
                <div className="creator-list">
                  {approvedCreators.map(c => (
                    <div key={c.id} className="creator-card">
                      {editingId === c.id ? (
                        <div className="creator-edit-form">
                          <input type="text" className="input-field" placeholder="New Name (optional)" value={editData.name} onChange={e => setEditData({...editData, name: e.target.value})} />
                          <input type="password" className="input-field" placeholder="New Password (optional)" value={editData.password} onChange={e => setEditData({...editData, password: e.target.value})} />
                          <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.5rem' }}>
                            <button className="btn btn-primary btn-sm" onClick={() => handleSaveEdit(c.id)}>Save</button>
                            <button className="btn btn-secondary btn-sm" onClick={() => setEditingId(null)}>Cancel</button>
                          </div>
                        </div>
                      ) : (
                        <>
                          <div className="creator-info">
                            <h4>{c.name} <span className="badge success">Approved</span></h4>
                            <p>{c.email}</p>
                          </div>
                          <div className="creator-actions">
                            <button className="btn btn-secondary btn-icon" onClick={() => { setEditingId(c.id); setEditData({ name: c.name, password: '' }); }}>
                              <Edit2 size={16} />
                            </button>
                          </div>
                        </>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* ─── Advertisements Tab ─── */}
        {activeTab === 'advertisements' && (
          <div className="admin-ads-tab">
            {/* Add/Edit Form */}
            {showAdForm ? (
              <div className="ad-form-container glass-card">
                <div className="ad-form-header">
                  <h3>{editingAdId ? 'Edit Advertisement' : 'Create New Advertisement'}</h3>
                  <button className="btn btn-secondary btn-icon" onClick={resetAdForm}>
                    <X size={18} />
                  </button>
                </div>
                {adFormError && <div className="auth-alert error" style={{ marginBottom: '1rem' }}>{adFormError}</div>}
                <form onSubmit={handleAdSubmit} className="ad-form">
                  {/* Type selector */}
                  <div className="ad-form-group">
                    <label>Ad Type</label>
                    <div className="ad-type-selector">
                      <button
                        type="button"
                        className={`ad-type-option ${adForm.type === 'commercial' ? 'active' : ''}`}
                        onClick={() => setAdForm({ ...adForm, type: 'commercial' })}
                      >
                        <Megaphone size={16} />
                        <span>Commercial</span>
                        <small>Settings / Feature Updates</small>
                      </button>
                      <button
                        type="button"
                        className={`ad-type-option ${adForm.type === 'brand' ? 'active' : ''}`}
                        onClick={() => setAdForm({ ...adForm, type: 'brand' })}
                      >
                        <ChevronRight size={16} />
                        <span>Brand Ad</span>
                        <small>Revenue Ads</small>
                      </button>
                      <button
                        type="button"
                        className={`ad-type-option ${adForm.type === 'subscription' ? 'active' : ''}`}
                        onClick={() => setAdForm({ ...adForm, type: 'subscription' })}
                      >
                        <DollarSign size={16} />
                        <span>Subscription</span>
                        <small>App Plans</small>
                      </button>
                    </div>
                  </div>

                  {/* Title */}
                  <div className="ad-form-group">
                    <label>Title *</label>
                    <input
                      type="text"
                      className="input-field"
                      placeholder="Advertisement title..."
                      value={adForm.title}
                      onChange={e => setAdForm({ ...adForm, title: e.target.value })}
                      required
                    />
                  </div>

                  {/* Description */}
                  <div className="ad-form-group">
                    <label>Description *</label>
                    <textarea
                      className="input-field ad-textarea"
                      placeholder="Brief description of the advertisement..."
                      value={adForm.description}
                      onChange={e => setAdForm({ ...adForm, description: e.target.value })}
                      rows={3}
                      required
                    />
                  </div>

                  {/* Price */}
                  <div className="ad-form-group">
                    <label>Price (if applicable)</label>
                    <input
                      type="text"
                      className="input-field"
                      placeholder="e.g., $9.99/mo, Free, $49.99"
                      value={adForm.price}
                      onChange={e => setAdForm({ ...adForm, price: e.target.value })}
                    />
                  </div>

                  {/* Duration dates */}
                  <div className="ad-form-row">
                    <div className="ad-form-group">
                      <label>Start Date</label>
                      <input
                        type="date"
                        className="input-field"
                        value={adForm.startDate}
                        onChange={e => setAdForm({ ...adForm, startDate: e.target.value })}
                      />
                    </div>
                    <div className="ad-form-group">
                      <label>End Date *</label>
                      <input
                        type="date"
                        className="input-field"
                        value={adForm.endDate}
                        onChange={e => setAdForm({ ...adForm, endDate: e.target.value })}
                        required
                      />
                    </div>
                  </div>

                  {/* Image upload */}
                  <div className="ad-form-group">
                    <label>Image</label>
                    <div className="ad-image-upload">
                      {adImagePreview ? (
                        <div className="ad-image-preview">
                          <img src={adImagePreview} alt="Ad preview" />
                          <button
                            type="button"
                            className="ad-image-remove"
                            onClick={() => { setAdImagePreview(null); setAdForm({ ...adForm, adImage: null }); }}
                          >
                            <X size={14} />
                          </button>
                        </div>
                      ) : (
                        <label className="ad-image-dropzone">
                          <Image size={28} />
                          <span>Click to upload image</span>
                          <small>JPEG, PNG, WebP (max 50MB)</small>
                          <input type="file" accept="image/*" onChange={handleAdImageChange} hidden />
                        </label>
                      )}
                    </div>
                  </div>

                  <div className="ad-form-actions">
                    <button type="button" className="btn btn-secondary" onClick={resetAdForm}>Cancel</button>
                    <button type="submit" className="btn btn-primary">
                      {editingAdId ? 'Update Advertisement' : 'Create Advertisement'}
                    </button>
                  </div>
                </form>
              </div>
            ) : (
              <button className="btn btn-primary ad-create-btn" onClick={() => setShowAdForm(true)}>
                <Plus size={18} /> Create New Advertisement
              </button>
            )}

            {/* Ads List */}
            <div className="ad-list">
              {adsLoading ? (
                <p className="text-muted" style={{ textAlign: 'center', padding: '2rem' }}>Loading advertisements...</p>
              ) : advertisements.length === 0 ? (
                <div className="ad-empty">
                  <Megaphone size={48} />
                  <p>No advertisements yet.</p>
                  <small>Create your first advertisement to display on the landing page.</small>
                </div>
              ) : (
                advertisements.map(ad => (
                  <div key={ad.id} className={`ad-card ${isAdActive(ad) ? 'ad-active' : 'ad-inactive'}`}>
                    <div className="ad-card-main">
                      {ad.imageUrl && (
                        <div className="ad-card-thumb">
                          <img src={ad.imageUrl} alt={ad.title} />
                        </div>
                      )}
                      <div className="ad-card-info">
                        <div className="ad-card-top">
                          <h4>{ad.title}</h4>
                          <span className={`ad-type-badge ${getAdTypeBadgeClass(ad.type)}`}>
                            {getAdTypeLabel(ad.type)}
                          </span>
                        </div>
                        <p className="ad-card-desc">{ad.description}</p>
                        <div className="ad-card-meta">
                          {ad.price && (
                            <span className="ad-meta-item">
                              <DollarSign size={13} /> {ad.price}
                            </span>
                          )}
                          <span className="ad-meta-item">
                            <Calendar size={13} />
                            {new Date(ad.startDate).toLocaleDateString()} → {new Date(ad.endDate).toLocaleDateString()}
                          </span>
                          <span className={`ad-status-badge ${isAdActive(ad) ? 'status-live' : 'status-off'}`}>
                            {isAdActive(ad) ? '● Live' : '○ Inactive'}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="ad-card-actions">
                      <button className="btn btn-secondary btn-icon" onClick={() => handleToggleAd(ad.id)} title={ad.isActive ? 'Deactivate' : 'Activate'}>
                        {ad.isActive ? <EyeOff size={16} /> : <Eye size={16} />}
                      </button>
                      <button className="btn btn-secondary btn-icon" onClick={() => handleEditAd(ad)} title="Edit">
                        <Edit2 size={16} />
                      </button>
                      <button className="btn btn-secondary btn-icon ad-delete-btn" onClick={() => handleDeleteAd(ad.id)} title="Delete">
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
