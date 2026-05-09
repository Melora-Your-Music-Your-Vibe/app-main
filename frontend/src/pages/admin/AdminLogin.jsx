import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Shield, Lock, ArrowRight } from 'lucide-react';
import api from '../../services/api';
import './Admin.css';

export default function AdminLogin() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    try {
      const res = await api.post('/auth/admin-login', { username, password });
      if (res.data.success) {
        localStorage.setItem('adminToken', res.data.data.accessToken);
        navigate('/admin-utkarsh/dashboard');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Invalid credentials');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="admin-page">
      <div className="admin-login-card glass-card">
        <div className="admin-header">
          <Shield size={48} className="admin-icon" />
          <h2>Admin Portal</h2>
          <p>Restricted Access</p>
        </div>
        
        {error && <div className="auth-alert error">{error}</div>}
        
        <form onSubmit={handleLogin} className="auth-form">
          <div className="input-group">
            <Shield size={18} className="input-icon" />
            <input type="text" className="input-field input-with-icon" placeholder="Admin Username" value={username} onChange={e => setUsername(e.target.value)} required />
          </div>
          <div className="input-group">
            <Lock size={18} className="input-icon" />
            <input type="password" className="input-field input-with-icon" placeholder="Admin Password" value={password} onChange={e => setPassword(e.target.value)} required />
          </div>
          <button type="submit" className="btn btn-primary glass-button auth-submit" disabled={loading}>
            {loading ? 'Authenticating...' : 'Secure Login'} <ArrowRight size={18} />
          </button>
        </form>
      </div>
    </div>
  );
}
