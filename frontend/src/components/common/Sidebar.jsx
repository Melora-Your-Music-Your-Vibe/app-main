import { NavLink, useNavigate } from 'react-router-dom';
import { Home, Search, Library, Heart, PlusCircle, Music, LogOut, Settings, LayoutDashboard } from 'lucide-react';
import useAuthStore from '../../store/authStore';
import './Sidebar.css';

export default function Sidebar() {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();
  const isCreator = user?.role === 'creator' || user?.role === 'admin';

  const handleLogout = async () => {
    await logout();
    navigate('/auth');
  };

  return (
    <aside className="sidebar" id="sidebar">
      <div className="sidebar-logo">
        <Music size={28} className="logo-icon" />
        <span className="logo-text">Melora</span>
      </div>

      <nav className="sidebar-nav">
        <div className="nav-section">
          <NavLink to="/" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`} end>
            <Home size={20} /> <span>Home</span>
          </NavLink>
          <NavLink to="/search" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
            <Search size={20} /> <span>Search</span>
          </NavLink>
          <NavLink to="/library" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
            <Library size={20} /> <span>Your Library</span>
          </NavLink>
        </div>

        <div className="nav-divider" />

        <div className="nav-section">
          <NavLink to="/favorites" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
            <Heart size={20} /> <span>Liked Songs</span>
          </NavLink>
          <NavLink to="/playlists" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
            <PlusCircle size={20} /> <span>Playlists</span>
          </NavLink>
        </div>

        {isCreator && (
          <>
            <div className="nav-divider" />
            <div className="nav-section">
              <NavLink to="/creator" className={({ isActive }) => `nav-link creator-link ${isActive ? 'active' : ''}`}>
                <LayoutDashboard size={20} /> <span>Creator Studio</span>
              </NavLink>
            </div>
          </>
        )}
      </nav>

      <div className="sidebar-footer">
        <NavLink to="/settings" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
          <Settings size={20} /> <span>Settings</span>
        </NavLink>
        <button className="nav-link logout-btn" onClick={handleLogout}>
          <LogOut size={20} /> <span>Logout</span>
        </button>
      </div>
    </aside>
  );
}
