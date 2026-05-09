import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Mail, Lock, User, Phone, ArrowRight, Play, Headphones, Mic2 } from 'lucide-react';
import useAuthStore from '../store/authStore';
import ThreeBackground from '../components/common/ThreeBackground';
import './Auth.css';

// SVG Assets
const GoogleLogo = () => (
  <svg viewBox="0 0 24 24" width="20" height="20" xmlns="http://www.w3.org/2000/svg">
    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
  </svg>
);

const MeloraLogo = () => (
  <div className="melora-logo-container">
    <svg width="40" height="40" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="brandGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#10b981" />
          <stop offset="100%" stopColor="#0ea5e9" />
        </linearGradient>
      </defs>
      <circle cx="50" cy="50" r="45" fill="url(#brandGrad)" fillOpacity="0.15" stroke="url(#brandGrad)" strokeWidth="3"/>
      <path d="M40 30L70 50L40 70V30Z" fill="url(#brandGrad)" />
      <path d="M30 40H35V60H30V40Z" fill="url(#brandGrad)" />
      <path d="M22 45H27V55H22V45Z" fill="url(#brandGrad)" />
    </svg>
    <div className="melora-logo-text">
      <h2>Melora</h2>
      <span>by Utkarsh Raj</span>
    </div>
  </div>
);

const CAROUSEL_DATA = [
  {
    image: 'https://images.unsplash.com/photo-1614149162883-504ce4d13909?q=80&w=1200&auto=format&fit=crop',
    title: 'Your Music, Your Vibe',
    desc: 'Experience high-fidelity audio streaming curated just for your mood.'
  },
  {
    image: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?q=80&w=1200&auto=format&fit=crop',
    title: 'Support the Creators',
    desc: 'Empowering independent artists globally with transparent streaming analytics.'
  },
  {
    image: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?q=80&w=1200&auto=format&fit=crop',
    title: 'Boundless Rhythms',
    desc: 'Connect with a modern youth vibe. Unlimited tracks, zero interruptions.'
  }
];

export default function Auth() {
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({ name: '', email: '', password: '', role: 'user' });
  const [currentSlide, setCurrentSlide] = useState(0);
  const { login, register, guestLogin, isLoading, error: authError } = useAuthStore();
  const navigate = useNavigate();

  // Carousel timer
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % CAROUSEL_DATA.length);
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isLogin) {
      await login(formData.email, formData.password);
    } else {
      await register(formData);
    }
  };

  const handleGuestLogin = async () => {
    await guestLogin();
  };

  const handleGoogleLogin = () => {
    window.location.href = 'http://localhost:5000/api/v1/auth/google';
  };

  return (
    <div className="auth-wrapper">
      <ThreeBackground variant="auth" />
      
      <div className="auth-container glass-card">
        {/* Left Side: Mobile/Desktop Carousel */}
        <div className="auth-carousel">
          {CAROUSEL_DATA.map((slide, idx) => (
            <div key={idx} className={`carousel-slide ${idx === currentSlide ? 'active' : ''}`} style={{ backgroundImage: `url(${slide.image})` }}>
              <div className="carousel-overlay">
                <div className="carousel-content">
                  <h3>{slide.title}</h3>
                  <p>{slide.desc}</p>
                </div>
              </div>
            </div>
          ))}
          <div className="carousel-dots">
            {CAROUSEL_DATA.map((_, idx) => (
              <span key={idx} className={`dot ${idx === currentSlide ? 'active' : ''}`} onClick={() => setCurrentSlide(idx)} />
            ))}
          </div>
        </div>

        {/* Right Side: Auth Form */}
        <div className="auth-form-section">
          <MeloraLogo />

          <div className="auth-tabs">
            <button className={`tab-btn ${isLogin ? 'active' : ''}`} onClick={() => setIsLogin(true)}>Sign In</button>
            <button className={`tab-btn ${!isLogin ? 'active' : ''}`} onClick={() => setIsLogin(false)}>Sign Up</button>
            <div className="tab-indicator" style={{ transform: `translateX(${isLogin ? '0%' : '100%'})` }} />
          </div>

          <div className="auth-header">
            <h2>{isLogin ? 'Welcome Back 👋' : 'Join the Vibe ✨'}</h2>
            <p>{isLogin ? 'Sign in to pick up where you left off.' : 'Create an account to start streaming.'}</p>
          </div>

          {authError && <div className="auth-alert error">{authError}</div>}
          {!isLogin && formData.role === 'creator' && (
            <div className="auth-alert info">
              Creator requests are forwarded for admin approval (24-48 hours).
            </div>
          )}

          <form onSubmit={handleSubmit} className="auth-form animate-slideUp">
            {!isLogin && (
              <>
                <div className="role-selector">
                  <label className={`role-option ${formData.role === 'user' ? 'selected' : ''}`}>
                    <input type="radio" name="role" value="user" checked={formData.role === 'user'} onChange={handleChange} />
                    <Headphones size={20} />
                    <span>Listener</span>
                  </label>
                  <label className={`role-option ${formData.role === 'creator' ? 'selected' : ''}`}>
                    <input type="radio" name="role" value="creator" checked={formData.role === 'creator'} onChange={handleChange} />
                    <Mic2 size={20} />
                    <span>Creator</span>
                  </label>
                </div>

                <div className="input-group">
                  <User size={18} className="input-icon" />
                  <input type="text" name="name" className="input-field input-with-icon" placeholder="Full Name" value={formData.name} onChange={handleChange} required />
                </div>
              </>
            )}

            <div className="input-group">
              <Mail size={18} className="input-icon" />
              <input type="email" name="email" className="input-field input-with-icon" placeholder="Email Address" value={formData.email} onChange={handleChange} required />
            </div>

            <div className="input-group">
              <Lock size={18} className="input-icon" />
              <input type="password" name="password" className="input-field input-with-icon" placeholder="Password" value={formData.password} onChange={handleChange} required />
            </div>

            {isLogin && (
              <div className="form-actions right-align">
                <label className="remember-me">
                  <input type="checkbox" /> Remember me
                </label>
                <a href="#" className="forgot-link">Forgot password?</a>
              </div>
            )}

            <button type="submit" className="btn btn-primary glass-button auth-submit" disabled={isLoading}>
              {isLoading ? 'Processing...' : isLogin ? 'Sign In' : 'Create Account'} <ArrowRight size={18} />
            </button>
          </form>

          <div className="auth-divider">
            <span>Or continue with</span>
          </div>

          <div className="social-auth-grid">
            <button type="button" className="btn btn-outline glass-button social-btn" onClick={handleGoogleLogin}>
              <GoogleLogo /> <span>Google</span>
            </button>
            <button type="button" className="btn btn-outline glass-button social-btn" onClick={() => alert('OTP login coming soon!')}>
              <Phone size={20} /> <span>OTP</span>
            </button>
          </div>
          
          <button type="button" className="btn btn-secondary glass-button guest-btn mt-3" onClick={handleGuestLogin}>
            <Play size={18} fill="currentColor" /> Continue as Guest
          </button>
          
        </div>
      </div>
    </div>
  );
}
