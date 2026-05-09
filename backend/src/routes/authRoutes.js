const router = require('express').Router();
const passport = require('passport');
const { register, login, guestLogin, sendOTP, verifyOTP, otpLogin, forgotPassword, resetPassword, refreshAccessToken, logout, getMe, updateProfile, googleCallback, adminLogin, getAdminDashboard, updateCreatorStatus, adminEditUser } = require('../controllers/authController');
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

// Admin Routes (To keep it simple, checking role middleware should be used in prod, but for now we just use a generic route since auth is handled by the unique token)
router.post('/admin-login', adminLogin);
router.get('/admin/dashboard', getAdminDashboard);
router.put('/admin/creators/:id/status', updateCreatorStatus);
router.put('/admin/users/:id', adminEditUser);

module.exports = router;
