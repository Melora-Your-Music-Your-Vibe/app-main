import { BrowserRouter, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { useEffect, Suspense } from 'react';
import Sidebar from './components/common/Sidebar';
import MobileNav from './components/common/MobileNav';
import AudioPlayer from './components/player/AudioPlayer';
import ThreeBackground from './components/common/ThreeBackground';
import useAuthStore from './store/authStore';
import usePlayerStore from './store/playerStore';

// Pages
import AuthPage from './pages/Auth';
import HomePage from './pages/Home';
import SearchPage from './pages/Search';
import LibraryPage from './pages/Library';
import FavoritesPage from './pages/Favorites';
import SettingsPage from './pages/Settings';
import PlaylistDetail from './pages/PlaylistDetail';
import CreatorDashboard from './pages/Creator';
import AdminDashboard from './pages/AdminDashboard';

import './index.css';
import './App.css';

// Protected Route wrapper
function ProtectedRoute({ children }) {
  const { isAuthenticated } = useAuthStore();
  if (!isAuthenticated) return <Navigate to="/auth" replace />;
  return children || <Outlet />;
}

// Creator Route (creator/admin only)
function CreatorRoute({ children }) {
  const { user, isAuthenticated } = useAuthStore();
  if (!isAuthenticated) return <Navigate to="/auth" replace />;
  if (user?.role !== 'creator' && user?.role !== 'admin') return <Navigate to="/" replace />;
  return children || <Outlet />;
}

// Main Layout with sidebar + player
function MainLayout() {
  const { currentSong } = usePlayerStore();
  const hasPlayer = !!currentSong;

  return (
    <div className="app-layout">
      <ThreeBackground />
      <Sidebar />
      <main className="main-content" style={{
        marginLeft: 'var(--sidebar-width)',
        paddingBottom: hasPlayer ? 'calc(var(--player-height) + 1rem)' : '1rem',
      }}>
        <div className="container">
          <Outlet />
        </div>
      </main>
      <AudioPlayer />
      <MobileNav />
    </div>
  );
}

// Loading fallback
function LoadingFallback() {
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh' }}>
      <div className="music-bars" style={{ transform: 'scale(2)' }}>
        <span></span><span></span><span></span><span></span>
      </div>
    </div>
  );
}

export default function App() {
  const { checkAuth } = useAuthStore();

  useEffect(() => {
    if (!window.location.pathname.includes('/auth/callback')) {
      checkAuth();
    }
  }, []);

  return (
    <BrowserRouter>
      <Suspense fallback={<LoadingFallback />}>
        <Routes>
          {/* Auth Page (public) */}
          <Route path="/auth" element={<AuthPage />} />
          <Route path="/auth/callback" element={<AuthCallback />} />
          <Route path="/admin-portal" element={<AdminDashboard />} />

          {/* Protected App Routes */}
          <Route element={<ProtectedRoute />}>
            <Route element={<MainLayout />}>
              <Route path="/" element={<HomePage />} />
              <Route path="/search" element={<SearchPage />} />
              <Route path="/library" element={<LibraryPage />} />
              <Route path="/favorites" element={<FavoritesPage />} />
              <Route path="/playlists" element={<LibraryPage />} />
              <Route path="/playlists/:id" element={<PlaylistDetail />} />
              <Route path="/settings" element={<SettingsPage />} />

              {/* Creator/Admin only */}
              <Route element={<CreatorRoute />}>
                <Route path="/creator" element={<CreatorDashboard />} />
              </Route>
            </Route>
          </Route>

          {/* Catch all */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Suspense>
    </BrowserRouter>
  );
}

// Google OAuth callback handler
function AuthCallback() {
  const { checkAuth } = useAuthStore();

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const token = params.get('token');
    if (token) {
      localStorage.setItem('accessToken', token);
      checkAuth().then(() => {
        window.location.href = '/';
      }).catch(() => {
        window.location.href = '/auth';
      });
    } else {
      window.location.href = '/auth';
    }
  }, []);

  return <LoadingFallback />;
}
