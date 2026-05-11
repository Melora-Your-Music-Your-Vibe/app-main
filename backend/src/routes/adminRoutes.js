const router = require('express').Router();
const jwt = require('jsonwebtoken');
const { adminLogin, getCreators, approveCreator, updateCreator } = require('../controllers/adminController');
const {
  getAllAdvertisements,
  createAdvertisement,
  updateAdvertisement,
  deleteAdvertisement,
  toggleAdvertisement,
} = require('../controllers/advertisementController');
const upload = require('../middlewares/upload');

// Superadmin middleware
const requireSuperadmin = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ success: false, message: 'No admin token' });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    if (decoded.role !== 'superadmin') throw new Error('Not superadmin');
    next();
  } catch (err) {
    res.status(401).json({ success: false, message: 'Unauthorized admin' });
  }
};

router.post('/login', adminLogin);
router.get('/creators', requireSuperadmin, getCreators);
router.put('/creators/:id/approve', requireSuperadmin, approveCreator);
router.put('/creators/:id', requireSuperadmin, updateCreator);

// Advertisement management routes (admin only)
router.get('/advertisements', requireSuperadmin, getAllAdvertisements);
router.post('/advertisements', requireSuperadmin, upload.single('adImage'), createAdvertisement);
router.put('/advertisements/:id', requireSuperadmin, upload.single('adImage'), updateAdvertisement);
router.delete('/advertisements/:id', requireSuperadmin, deleteAdvertisement);
router.patch('/advertisements/:id/toggle', requireSuperadmin, toggleAdvertisement);

module.exports = router;
