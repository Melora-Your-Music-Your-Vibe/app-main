const router = require('express').Router();
const passport = require('passport');
const { register, login, guestLogin, sendOTP, verifyOTP, otpLogin, forgotPassword, resetPassword, refreshAccessToken, logout, getMe, updateProfile, googleCallback } = require('../controllers/authController');
const { protect, optionalAuth } = require('../middlewares/auth');

router.post('/register', register);
router.post('/login', login);
router.post('/guest', guestLogin);
router.post('/send-otp', sendOTP);
router.post('/verify-otp', verifyOTP);
router.post('/otp-login', otpLogin);
router.post('/forgot-password', forgotPassword);
router.post('/reset-password', resetPassword);
router.post('/refresh', refreshAccessToken);
router.post('/logout', optionalAuth, logout);
router.get('/me', protect, getMe);
router.put('/update-profile', protect, updateProfile);

// Google OAuth
router.get('/google', passport.authenticate('google', { scope: ['profile', 'email'] }));
router.get('/google/callback', passport.authenticate('google', { session: false, failureRedirect: `${process.env.CLIENT_URL}/auth?error=google_failed` }), googleCallback);

module.exports = router;
