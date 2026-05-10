import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Shield, Check, Edit2, Key, Users } from 'lucide-react';
import ThreeBackground from '../components/common/ThreeBackground';
import './Admin.css';

export default function AdminDashboard() {
  const [token, setToken] = useState(localStorage.getItem('adminToken') || null);
  const [creators, setCreators] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Login states
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loginError, setLoginError] = useState('');

  // Edit states
  const [editingId, setEditingId] = useState(null);
  const [editData, setEditData] = useState({ name: '', password: '' });

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

  useEffect(() => {
    if (token) fetchCreators();
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

  if (!token) {
    return (
      <div className="admin-page">
        <ThreeBackground variant="auth" />
        <div className="admin-login-card glass-card">
          <div className="admin-header">
            <Shield size={32} className="admin-icon" />
            <h2>Admin Portal</h2>
            <p>Creator Approval Management</p>
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

  return (
    <div className="admin-page">
      <ThreeBackground variant="auth" />
      <div className="admin-dashboard glass-card">
        <div className="admin-header flex-between">
          <div>
            <h2><Users size={24} /> Creators Dashboard</h2>
            <p>Total Requests: {creators.length} | Pending: {pendingCreators.length} | Approved: {approvedCreators.length}</p>
          </div>
          <button className="btn btn-secondary btn-sm" onClick={() => { setToken(null); localStorage.removeItem('adminToken'); }}>Logout</button>
        </div>

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
      </div>
    </div>
  );
}
