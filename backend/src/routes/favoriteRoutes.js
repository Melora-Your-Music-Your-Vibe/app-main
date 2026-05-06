const router = require('express').Router();
const { getFavorites, toggleFavorite } = require('../controllers/favoriteController');
const { protect } = require('../middlewares/auth');

router.get('/', protect, getFavorites);
router.post('/:songId', protect, toggleFavorite);

module.exports = router;
