const { Op } = require('sequelize');
const { Song, Artist, Album } = require('../models');

const search = async (req, res, next) => {
  try {
    const { q, type, limit: lim } = req.query;
    if (!q) return res.status(400).json({ success: false, message: 'Search query required' });
    const limit = Math.min(parseInt(lim) || 20, 50);
    const searchType = type || 'all';
    const result = {};
    const likeQuery = { [Op.iLike]: `%${q}%` };

    if (searchType === 'all' || searchType === 'songs') {
      result.songs = await Song.findAll({
        where: { isActive: true, [Op.or]: [{ title: likeQuery }, { artist: likeQuery }, { album: likeQuery }, { genre: likeQuery }] },
        limit, include: [{ model: Artist, as: 'artistInfo', attributes: ['id', 'name', 'profileImage'] }],
      });
    }
    if (searchType === 'all' || searchType === 'artists') {
      result.artists = await Artist.findAll({ where: { name: likeQuery }, limit });
    }
    if (searchType === 'all' || searchType === 'albums') {
      result.albums = await Album.findAll({
        where: { [Op.or]: [{ title: likeQuery }, { artistName: likeQuery }] }, limit,
      });
    }
    res.json({ success: true, data: result });
  } catch (error) { next(error); }
};

const suggestions = async (req, res, next) => {
  try {
    const { q } = req.query;
    if (!q || q.length < 2) return res.json({ success: true, data: [] });
    const likeQuery = { [Op.iLike]: `%${q}%` };
    const songs = await Song.findAll({
      where: { isActive: true, [Op.or]: [{ title: likeQuery }, { artist: likeQuery }] },
      attributes: ['id', 'title', 'artist', 'thumbnailUrl'], limit: 8,
    });
    res.json({ success: true, data: songs });
  } catch (error) { next(error); }
};

module.exports = { search, suggestions };
