const { RecentlyPlayed, Song, Artist } = require('../models');

const getRecentlyPlayed = async (req, res, next) => {
  try {
    const limit = Math.min(parseInt(req.query.limit) || 50, 100);
    const records = await RecentlyPlayed.findAll({
      where: { userId: req.user.id },
      include: [{ model: Song, as: 'song', include: [{ model: Artist, as: 'artistInfo', attributes: ['id', 'name', 'profileImage'] }] }],
      order: [['playedAt', 'DESC']],
      limit,
    });
    res.json({ success: true, data: records.map(r => ({ ...r.song.toJSON(), playedAt: r.playedAt })) });
  } catch (error) { next(error); }
};

const addToRecentlyPlayed = async (req, res, next) => {
  try {
    const { songId } = req.body;
    if (!songId) return res.status(400).json({ success: false, message: 'songId required' });
    const song = await Song.findByPk(songId);
    if (!song) return res.status(404).json({ success: false, message: 'Song not found' });
    await RecentlyPlayed.create({ userId: req.user.id, songId });
    res.json({ success: true, message: 'Added to recently played' });
  } catch (error) { next(error); }
};

const clearHistory = async (req, res, next) => {
  try {
    await RecentlyPlayed.destroy({ where: { userId: req.user.id } });
    res.json({ success: true, message: 'History cleared' });
  } catch (error) { next(error); }
};

module.exports = { getRecentlyPlayed, addToRecentlyPlayed, clearHistory };
