const router = require('express').Router();
const { getPlaylists, getPlaylist, createPlaylist, updatePlaylist, deletePlaylist, addSongToPlaylist, removeSongFromPlaylist } = require('../controllers/playlistController');
const { protect } = require('../middlewares/auth');

router.get('/', protect, getPlaylists);
router.get('/:id', protect, getPlaylist);
router.post('/', protect, createPlaylist);
router.put('/:id', protect, updatePlaylist);
router.delete('/:id', protect, deletePlaylist);
router.post('/:id/songs', protect, addSongToPlaylist);
router.delete('/:id/songs/:songId', protect, removeSongFromPlaylist);

module.exports = router;
