import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Shield, Users, CheckCircle, XCircle, LogOut, Edit2 } from 'lucide-react';
import api from '../../services/api';
import './Admin.css';

export default function AdminDashboard() {
  const [creators, setCreators] = useState([]);
  const [stats, setStats] = useState({ totalCount: 0, pendingCount: 0, approvedCount: 0 });
  const [loading, setLoading] = useState(true);
  const [editingUser, setEditingUser] = useState(null);
  const navigate = useNavigate();

  const fetchDashboard = async () => {
    try {
      const res = await api.get('/auth/admin/dashboard');
      if (res.data.success) {
        setCreators(res.data.data.creators);
        setStats(res.data.data.stats);
      }
    } catch (err) {
      if (err.response?.status === 401) navigate('/admin-utkarsh');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const token = localStorage.getItem('adminToken');
    if (!token) {
      navigate('/admin-utkarsh');
      return;
    }
    // We mock auth header injection since this is a separate token
    api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    fetchDashboard();
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('adminToken');
    delete api.defaults.headers.common['Authorization'];
    navigate('/admin-utkarsh');
  };

  const updateStatus = async (id, status) => {
    try {
      await api.put(`/auth/admin/creators/${id}/status`, { status });
      fetchDashboard();
    } catch (err) {
      alert('Failed to update status');
    }
  };

  const saveEdit = async (e) => {
    e.preventDefault();
    try {
      await api.put(`/auth/admin/users/${editingUser.id}`, {
        name: editingUser.name,
        email: editingUser.email,
        newPassword: editingUser.newPassword || undefined
      });
      setEditingUser(null);
      fetchDashboard();
      alert('User updated successfully');
    } catch (err) {
      alert('Failed to update user');
    }
  };

  if (loading) return <div className="admin-loading">Loading Admin Data...</div>;

  return (
    <div className="admin-dashboard">
      <nav className="admin-nav glass-card">
        <div className="admin-nav-left">
          <Shield size={24} className="admin-icon" />
          <h3>Melora Admin</h3>
        </div>
        <button className="btn btn-ghost" onClick={handleLogout}>
          <LogOut size={18} /> Exit Portal
        </button>
      </nav>

      <div className="admin-stats">
        <div className="stat-card glass-card">
          <h4>Total Creators</h4>
          <p className="stat-value">{stats.totalCount}</p>
        </div>
        <div className="stat-card glass-card warning">
          <h4>Pending Approvals</h4>
          <p className="stat-value">{stats.pendingCount}</p>
        </div>
        <div className="stat-card glass-card success">
          <h4>Approved Live</h4>
          <p className="stat-value">{stats.approvedCount}</p>
        </div>
      </div>

      <div className="admin-content glass-card">
        <h3>Creator Signup Requests</h3>
        <div className="table-container">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th>Status</th>
                <th>Date</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {creators.map(creator => (
                <tr key={creator.id}>
                  <td>{creator.name}</td>
                  <td>{creator.email}</td>
                  <td>
                    <span className={`status-badge ${creator.approvalStatus}`}>
                      {creator.approvalStatus}
                    </span>
                  </td>
                  <td>{new Date(creator.createdAt).toLocaleDateString()}</td>
                  <td className="actions-cell">
                    {creator.approvalStatus === 'pending' && (
                      <>
                        <button className="btn-icon approve" onClick={() => updateStatus(creator.id, 'approved')} title="Approve">
                          <CheckCircle size={18} />
                        </button>
                        <button className="btn-icon reject" onClick={() => updateStatus(creator.id, 'rejected')} title="Reject">
                          <XCircle size={18} />
                        </button>
                      </>
                    )}
                    <button className="btn-icon edit" onClick={() => setEditingUser({ ...creator, newPassword: '' })} title="Edit Credentials">
                      <Edit2 size={18} />
                    </button>
                  </td>
                </tr>
              ))}
              {creators.length === 0 && (
                <tr>
                  <td colSpan="5" className="text-center">No creator requests found.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {editingUser && (
        <div className="admin-modal-overlay">
          <div className="admin-modal glass-card">
            <h3>Edit Credentials</h3>
            <form onSubmit={saveEdit} className="auth-form">
              <div className="form-group">
                <label>Username (Name)</label>
                <input type="text" className="input-field" value={editingUser.name} onChange={e => setEditingUser({...editingUser, name: e.target.value})} required />
              </div>
              <div className="form-group">
                <label>Email</label>
                <input type="email" className="input-field" value={editingUser.email} onChange={e => setEditingUser({...editingUser, email: e.target.value})} required />
              </div>
              <div className="form-group">
                <label>New Password (Leave blank to keep current)</label>
                <input type="password" className="input-field" value={editingUser.newPassword} onChange={e => setEditingUser({...editingUser, newPassword: e.target.value})} />
              </div>
              <div className="modal-actions">
                <button type="button" className="btn btn-ghost" onClick={() => setEditingUser(null)}>Cancel</button>
                <button type="submit" className="btn btn-primary">Save Changes</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
