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
      setMode('otp-verify');
      setMessage('Account created! Check your email for OTP verification.');
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
        <div className="auth-carousel hide-mobile">
          <img src="/images/auth1.png" alt="Music Experience" className={`carousel-image ${activeImage === 0 ? 'active' : ''}`} />
          <img src="/images/auth2.png" alt="Library Collection" className={`carousel-image ${activeImage === 1 ? 'active' : ''}`} />
          
          <div className="carousel-caption">
            <h3>{activeImage === 0 ? '🎵 Step into the Vibe' : '✨ Your Ultimate Library'}</h3>
            <p>{activeImage === 0 ? 'Discover new sounds, artists, and earn rewards as you listen.' : 'Organize, curate, and experience music in breathtaking quality.'}</p>
          </div>
          
          <div className="carousel-indicators">
            <span className={activeImage === 0 ? 'active' : ''} onClick={() => setActiveImage(0)}></span>
            <span className={activeImage === 1 ? 'active' : ''} onClick={() => setActiveImage(1)}></span>
          </div>
        </div>

        <div className="auth-container">
          <div className="auth-header">
            <div className="auth-logo">
              <Music size={36} className="auth-logo-icon" />
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
                  <Globe size={20} /> Google
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
