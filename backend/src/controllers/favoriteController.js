const { Favorite, Song, Artist } = require('../models');

const getFavorites = async (req, res, next) => {
  try {
    const favorites = await Favorite.findAll({
      where: { userId: req.user.id },
      include: [{ model: Song, as: 'song', include: [{ model: Artist, as: 'artistInfo', attributes: ['id', 'name', 'profileImage'] }] }],
      order: [['createdAt', 'DESC']],
    });
    res.json({ success: true, data: favorites.map(f => ({ ...f.song.toJSON(), isFavorite: true, favoritedAt: f.createdAt })) });
  } catch (error) { next(error); }
};

const toggleFavorite = async (req, res, next) => {
  try {
    const { songId } = req.params;
    const song = await Song.findByPk(songId);
    if (!song) return res.status(404).json({ success: false, message: 'Song not found' });
    const existing = await Favorite.findOne({ where: { userId: req.user.id, songId } });
    if (existing) {
      await existing.destroy();
      res.json({ success: true, message: 'Removed from favorites', data: { isFavorite: false } });
    } else {
      await Favorite.create({ userId: req.user.id, songId });
      res.json({ success: true, message: 'Added to favorites', data: { isFavorite: true } });
    }
  } catch (error) { next(error); }
};

module.exports = { getFavorites, toggleFavorite };
