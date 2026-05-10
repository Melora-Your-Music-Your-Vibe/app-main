import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Music, Mail, Lock, User, Eye, EyeOff, ArrowRight, Globe, UserCheck, KeyRound } from 'lucide-react';
import ThreeBackground from '../components/common/ThreeBackground';
import useAuthStore from '../store/authStore';
import './Auth.css';

export default function AuthPage() {
  const navigate = useNavigate();
  const { login, register, guestLogin, sendOTP, verifyOTP, forgotPassword, loading, error } = useAuthStore();

  const [mode, setMode] = useState('login'); // login | signup | otp | otp-verify | forgot
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [activeImage, setActiveImage] = useState(0);
  const [formData, setFormData] = useState({ name: '', email: '', password: '', confirmPassword: '', otp: '', role: 'user' });
  const [message, setMessage] = useState('');
  const [localError, setLocalError] = useState('');

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setLocalError('');
  };

  // Carousel timer
  useEffect(() => {
    const interval = setInterval(() => {
      setActiveImage((prev) => (prev === 0 ? 1 : 0));
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      await login({ email: formData.email, password: formData.password, rememberMe });
      navigate('/');
    } catch (err) {
      setLocalError(err.response?.data?.message || 'Login failed');
    }
  };

  const handleSignup = async (e) => {
    e.preventDefault();
    if (formData.password !== formData.confirmPassword) {
      setLocalError('Passwords do not match'); return;
    }
    if (formData.password.length < 6) {
      setLocalError('Password must be at least 6 characters'); return;
    }
    try {
      await register({ name: formData.name, email: formData.email, password: formData.password, role: formData.role });
      
      if (formData.role === 'creator') {
        setMode('login');
        setMessage('Your Creator request has been forwarded for approval. An update will be provided in 24-48 hours.');
      } else {
        setMode('otp-verify');
        setMessage('Account created! Check your email for OTP verification.');
      }
    } catch (err) {
      setLocalError(err.response?.data?.message || 'Registration failed');
    }
  };

  const handleSendOTP = async (e) => {
    e.preventDefault();
    try {
      await sendOTP(formData.email);
      setMode('otp-verify');
      setMessage('OTP sent to your email!');
    } catch (err) {
      setLocalError(err.response?.data?.message || 'Failed to send OTP');
    }
  };

  const handleVerifyOTP = async (e) => {
    e.preventDefault();
    try {
      await verifyOTP(formData.email, formData.otp);
      navigate('/');
    } catch (err) {
      setLocalError(err.response?.data?.message || 'Invalid OTP');
    }
  };

  const handleForgotPassword = async (e) => {
    e.preventDefault();
    try {
      await forgotPassword(formData.email);
      setMessage('Password reset link sent to your email!');
    } catch (err) {
      setLocalError(err.response?.data?.message || 'Failed');
    }
  };

  const handleGuestLogin = async () => {
    try {
      await guestLogin();
      navigate('/');
    } catch (err) {
      setLocalError('Guest login failed');
    }
  };

  const handleGoogleLogin = () => {
    const baseUrl = (import.meta.env.VITE_API_URL || 'http://localhost:5000/api/v1').replace(/\/api\/v1\/?$/, '');
    window.location.href = `${baseUrl}/api/v1/auth/google`;
  };

  const displayError = localError || error;

  return (
    <div className="auth-page">
      <ThreeBackground variant="auth" />

      <div className="auth-split-layout glass-card animate-fadeIn">
        <div className="auth-carousel">
          <img src="/images/auth1.png" alt="Music Experience" className={`carousel-image ${activeImage === 0 ? 'active' : ''}`} />
          <img src="/images/auth2.png" alt="Library Collection" className={`carousel-image ${activeImage === 1 ? 'active' : ''}`} />
          
          <div className="carousel-caption">
            <h3>{activeImage === 0 ? 'Elevate Your Audio Experience' : 'Curate. Listen. Inspire.'}</h3>
            <p>{activeImage === 0 ? 'Immerse yourself in high-fidelity streaming, discover groundbreaking artists, and unlock exclusive rewards as you explore.' : 'Build breathtaking libraries, organize your perfect vibe, and experience modern soundscapes on any device.'}</p>
          </div>
          
          <div className="carousel-indicators">
            <span className={activeImage === 0 ? 'active' : ''} onClick={() => setActiveImage(0)}></span>
            <span className={activeImage === 1 ? 'active' : ''} onClick={() => setActiveImage(1)}></span>
          </div>
        </div>

        <div className="auth-container">
          <div className="auth-header">
            <div className="auth-logo">
              <img src="/images/melora-logo.png" alt="Melora" className="auth-logo-icon" />
              <h1 className="auth-logo-text">Melora</h1>
            </div>
            <p className="auth-tagline">Your Music, Your Vibe ✨</p>
          </div>

          <div className="auth-tabs">
            <button className={`auth-tab ${mode === 'login' ? 'active' : ''}`} onClick={() => { setMode('login'); setLocalError(''); setMessage(''); }}>🔑 Login</button>
            <button className={`auth-tab ${mode === 'signup' ? 'active' : ''}`} onClick={() => { setMode('signup'); setLocalError(''); setMessage(''); }}>✨ Sign Up</button>
          </div>

          {displayError && <div className="auth-alert error">{displayError}</div>}
          {message && <div className="auth-alert success">{message}</div>}

          {/* LOGIN */}
          {mode === 'login' && (
            <form onSubmit={handleLogin} className="auth-form">
              <div className="input-group">
                <Mail size={18} className="input-icon" />
                <input type="email" name="email" className="input-field input-with-icon" placeholder="Email address" value={formData.email} onChange={handleChange} required id="login-email" />
              </div>
              <div className="input-group">
                <Lock size={18} className="input-icon" />
                <input type={showPassword ? 'text' : 'password'} name="password" className="input-field input-with-icon" placeholder="Password" value={formData.password} onChange={handleChange} required id="login-password" />
                <button type="button" className="input-action" onClick={() => setShowPassword(!showPassword)}>
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
              <div className="auth-options">
                <label className="checkbox-label">
                  <input type="checkbox" checked={rememberMe} onChange={(e) => setRememberMe(e.target.checked)} />
                  <span className="checkmark"></span> Remember me
                </label>
                <button type="button" className="link-btn" onClick={() => { setMode('forgot'); setLocalError(''); }}>Forgot password?</button>
              </div>
              <button type="submit" className="btn btn-primary btn-lg auth-submit" disabled={loading}>
                {loading ? 'Signing in...' : 'Sign In'} <ArrowRight size={18} />
              </button>
            </form>
          )}

          {/* SIGNUP */}
          {mode === 'signup' && (
            <form onSubmit={handleSignup} className="auth-form">
              <div className="input-group">
                <User size={18} className="input-icon" />
                <input type="text" name="name" className="input-field input-with-icon" placeholder="Full name" value={formData.name} onChange={handleChange} required id="signup-name" />
              </div>
              <div className="input-group">
                <Mail size={18} className="input-icon" />
                <input type="email" name="email" className="input-field input-with-icon" placeholder="Email address" value={formData.email} onChange={handleChange} required id="signup-email" />
              </div>
              <div className="input-group">
                <Lock size={18} className="input-icon" />
                <input type={showPassword ? 'text' : 'password'} name="password" className="input-field input-with-icon" placeholder="Password (min 6 chars)" value={formData.password} onChange={handleChange} required id="signup-password" />
                <button type="button" className="input-action" onClick={() => setShowPassword(!showPassword)}>
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
              <div className="input-group">
                <Lock size={18} className="input-icon" />
                <input type="password" name="confirmPassword" className="input-field input-with-icon" placeholder="Confirm password" value={formData.confirmPassword} onChange={handleChange} required id="signup-confirm" />
              </div>
              <div className="role-select">
                <label className={`role-option ${formData.role === 'user' ? 'active' : ''}`}>
                  <input type="radio" name="role" value="user" checked={formData.role === 'user'} onChange={handleChange} />
                  <User size={16} /> Listener
                </label>
                <label className={`role-option ${formData.role === 'creator' ? 'active' : ''}`}>
                  <input type="radio" name="role" value="creator" checked={formData.role === 'creator'} onChange={handleChange} />
                  <Music size={16} /> Creator
                </label>
              </div>
              <button type="submit" className="btn btn-primary btn-lg auth-submit" disabled={loading}>
                {loading ? 'Creating...' : 'Create Account'} <ArrowRight size={18} />
              </button>
            </form>
          )}

          {/* OTP Login */}
          {mode === 'otp' && (
            <form onSubmit={handleSendOTP} className="auth-form">
              <p className="auth-desc">Enter your email to receive a one-time login code.</p>
              <div className="input-group">
                <Mail size={18} className="input-icon" />
                <input type="email" name="email" className="input-field input-with-icon" placeholder="Email address" value={formData.email} onChange={handleChange} required id="otp-email" />
              </div>
              <button type="submit" className="btn btn-primary btn-lg auth-submit" disabled={loading}>
                {loading ? 'Sending...' : 'Send OTP'} <KeyRound size={18} />
              </button>
              <button type="button" className="link-btn center" onClick={() => setMode('login')}>← Back to login</button>
            </form>
          )}

          {/* OTP Verify */}
          {mode === 'otp-verify' && (
            <form onSubmit={handleVerifyOTP} className="auth-form">
              <p className="auth-desc">Enter the 6-digit code sent to <strong>{formData.email}</strong></p>
              <div className="input-group">
                <KeyRound size={18} className="input-icon" />
                <input type="text" name="otp" className="input-field input-with-icon otp-input" placeholder="Enter OTP" value={formData.otp} onChange={handleChange} maxLength={6} required id="otp-code" />
              </div>
              <button type="submit" className="btn btn-primary btn-lg auth-submit" disabled={loading}>
                {loading ? 'Verifying...' : 'Verify OTP'} <ArrowRight size={18} />
              </button>
              <button type="button" className="link-btn center" onClick={() => { setMode('login'); setMessage(''); }}>← Back to login</button>
            </form>
          )}

          {/* Forgot Password */}
          {mode === 'forgot' && (
            <form onSubmit={handleForgotPassword} className="auth-form">
              <p className="auth-desc">Enter your email to receive a password reset link.</p>
              <div className="input-group">
                <Mail size={18} className="input-icon" />
                <input type="email" name="email" className="input-field input-with-icon" placeholder="Email address" value={formData.email} onChange={handleChange} required id="forgot-email" />
              </div>
              <button type="submit" className="btn btn-primary btn-lg auth-submit" disabled={loading}>
                {loading ? 'Sending...' : 'Send Reset Link'} <ArrowRight size={18} />
              </button>
              <button type="button" className="link-btn center" onClick={() => { setMode('login'); setMessage(''); }}>← Back to login</button>
            </form>
          )}

          {/* Divider & Social/Alt logins */}
          {(mode === 'login' || mode === 'signup') && (
            <>
              <div className="auth-divider"><span>or continue with</span></div>
              <div className="auth-social">
                <button className="btn btn-secondary social-btn" onClick={handleGoogleLogin} id="google-login-btn">
                  <svg viewBox="0 0 24 24" width="20" height="20" xmlns="http://www.w3.org/2000/svg">
                    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                  </svg>
                  Google
                </button>
                <button className="btn btn-secondary social-btn" onClick={() => { setMode('otp'); setLocalError(''); setMessage(''); }} id="otp-login-btn">
                  <KeyRound size={20} /> OTP Login
                </button>
              </div>
              <button className="btn btn-ghost guest-btn" onClick={handleGuestLogin} id="guest-login-btn">
                <UserCheck size={18} /> Continue as Guest 🚀
              </button>
            </>
          )}
          
          <p className="auth-footer-text">© 2026 Melora. Your Music, Your Vibe.</p>
        </div>
      </div>
    </div>
  );
}
