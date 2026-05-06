const { Song, Artist, Album, User, Playlist } = require('../models');

const getOverview = async (req, res, next) => {
  try {
    const [totalSongs, totalArtists, totalAlbums, totalUsers, totalPlaylists] = await Promise.all([
      Song.count({ where: { isActive: true } }),
      Artist.count(),
      Album.count(),
      User.count(),
      Playlist.count(),
    ]);
    res.json({
      success: true,
      data: { totalSongs, totalArtists, totalAlbums, totalUsers, totalPlaylists },
    });
  } catch (error) { next(error); }
};

module.exports = { getOverview };
