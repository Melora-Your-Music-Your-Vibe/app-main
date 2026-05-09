const router = require('express').Router();
const { getRecentlyPlayed, addToRecentlyPlayed, clearHistory } = require('../controllers/recentlyPlayedController');
const { protect } = require('../middlewares/auth');

router.get('/', protect, getRecentlyPlayed);
router.post('/', protect, addToRecentlyPlayed);
router.delete('/', protect, clearHistory);

module.exports = router;
