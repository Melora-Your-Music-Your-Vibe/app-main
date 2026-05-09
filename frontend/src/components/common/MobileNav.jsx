import { NavLink } from 'react-router-dom';
import { Home, Search, Library, Heart, User } from 'lucide-react';
import './MobileNav.css';

export default function MobileNav() {
  return (
    <nav className="mobile-nav" id="mobile-nav">
      <NavLink to="/" className={({ isActive }) => `mobile-nav-item ${isActive ? 'active' : ''}`} end>
        <Home size={22} />
        <span>Home</span>
      </NavLink>
      <NavLink to="/search" className={({ isActive }) => `mobile-nav-item ${isActive ? 'active' : ''}`}>
        <Search size={22} />
        <span>Search</span>
      </NavLink>
      <NavLink to="/library" className={({ isActive }) => `mobile-nav-item ${isActive ? 'active' : ''}`}>
        <Library size={22} />
        <span>Library</span>
      </NavLink>
      <NavLink to="/favorites" className={({ isActive }) => `mobile-nav-item ${isActive ? 'active' : ''}`}>
        <Heart size={22} />
        <span>Liked</span>
      </NavLink>
      <NavLink to="/profile" className={({ isActive }) => `mobile-nav-item ${isActive ? 'active' : ''}`}>
        <User size={22} />
        <span>Profile</span>
      </NavLink>
    </nav>
  );
}
