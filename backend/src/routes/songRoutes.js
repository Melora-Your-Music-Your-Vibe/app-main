const router = require('express').Router();
const { getSongs, getSong, createSong, updateSong, deleteSong, getPopularSongs, getLatestSongs, incrementPlayCount, getGenres } = require('../controllers/songController');
const { protect, optionalAuth, authorize } = require('../middlewares/auth');
const upload = require('../middlewares/upload');

router.get('/popular', optionalAuth, getPopularSongs);
router.get('/latest', optionalAuth, getLatestSongs);
router.get('/genres', getGenres);
router.get('/', optionalAuth, getSongs);
router.get('/:id', optionalAuth, getSong);
router.post('/', protect, authorize('creator', 'admin'), upload.fields([{ name: 'audioFile', maxCount: 1 }, { name: 'thumbnail', maxCount: 1 }]), createSong);
router.put('/:id', protect, authorize('creator', 'admin'), upload.fields([{ name: 'thumbnail', maxCount: 1 }]), updateSong);
router.delete('/:id', protect, authorize('creator', 'admin'), deleteSong);
router.patch('/:id/play', optionalAuth, incrementPlayCount);

module.exports = router;
