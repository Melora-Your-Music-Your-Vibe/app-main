const { Playlist, PlaylistSong, Song, Artist } = require('../models');

const getPlaylists = async (req, res, next) => {
  try {
    const where = req.user ? { userId: req.user.id } : { isPublic: true };
    const playlists = await Playlist.findAll({ where, order: [['updatedAt', 'DESC']] });
    res.json({ success: true, data: playlists });
  } catch (error) { next(error); }
};

const getPlaylist = async (req, res, next) => {
  try {
    const playlist = await Playlist.findByPk(req.params.id, {
      include: [{
        model: Song, as: 'songs', through: { attributes: ['position'] },
        include: [{ model: Artist, as: 'artistInfo', attributes: ['id', 'name', 'profileImage'] }],
      }],
    });
    if (!playlist) return res.status(404).json({ success: false, message: 'Playlist not found' });
    res.json({ success: true, data: playlist });
  } catch (error) { next(error); }
};

const createPlaylist = async (req, res, next) => {
  try {
    const { name, description, isPublic } = req.body;
    if (!name) return res.status(400).json({ success: false, message: 'Playlist name required' });
    const playlist = await Playlist.create({
      name, description, isPublic: isPublic || false, userId: req.user.id,
    });
    res.status(201).json({ success: true, message: 'Playlist created', data: playlist });
  } catch (error) { next(error); }
};

const updatePlaylist = async (req, res, next) => {
  try {
    const playlist = await Playlist.findByPk(req.params.id);
    if (!playlist) return res.status(404).json({ success: false, message: 'Playlist not found' });
    if (playlist.userId !== req.user.id) return res.status(403).json({ success: false, message: 'Not authorized' });
    const { name, description, isPublic } = req.body;
    if (name) playlist.name = name;
    if (description !== undefined) playlist.description = description;
    if (isPublic !== undefined) playlist.isPublic = isPublic;
    await playlist.save();
    res.json({ success: true, data: playlist });
  } catch (error) { next(error); }
};

const deletePlaylist = async (req, res, next) => {
  try {
    const playlist = await Playlist.findByPk(req.params.id);
    if (!playlist) return res.status(404).json({ success: false, message: 'Playlist not found' });
    if (playlist.userId !== req.user.id) return res.status(403).json({ success: false, message: 'Not authorized' });
    await PlaylistSong.destroy({ where: { playlistId: playlist.id } });
    await playlist.destroy();
    res.json({ success: true, message: 'Playlist deleted' });
  } catch (error) { next(error); }
};

const addSongToPlaylist = async (req, res, next) => {
  try {
    const { songId } = req.body;
    const playlist = await Playlist.findByPk(req.params.id);
    if (!playlist) return res.status(404).json({ success: false, message: 'Playlist not found' });
    if (playlist.userId !== req.user.id) return res.status(403).json({ success: false, message: 'Not authorized' });
    const song = await Song.findByPk(songId);
    if (!song) return res.status(404).json({ success: false, message: 'Song not found' });
    const existing = await PlaylistSong.findOne({ where: { playlistId: playlist.id, songId } });
    if (existing) return res.status(409).json({ success: false, message: 'Song already in playlist' });
    const maxPos = await PlaylistSong.max('position', { where: { playlistId: playlist.id } });
    await PlaylistSong.create({ playlistId: playlist.id, songId, position: (maxPos || 0) + 1 });
    playlist.songCount += 1;
    playlist.totalDuration += song.duration || 0;
    await playlist.save();
    res.json({ success: true, message: 'Song added to playlist' });
  } catch (error) { next(error); }
};

const removeSongFromPlaylist = async (req, res, next) => {
  try {
    const playlist = await Playlist.findByPk(req.params.id);
    if (!playlist) return res.status(404).json({ success: false, message: 'Playlist not found' });
    if (playlist.userId !== req.user.id) return res.status(403).json({ success: false, message: 'Not authorized' });
    const ps = await PlaylistSong.findOne({ where: { playlistId: playlist.id, songId: req.params.songId } });
    if (!ps) return res.status(404).json({ success: false, message: 'Song not in playlist' });
    const song = await Song.findByPk(req.params.songId);
    await ps.destroy();
    playlist.songCount = Math.max(0, playlist.songCount - 1);
    playlist.totalDuration = Math.max(0, playlist.totalDuration - (song?.duration || 0));
    await playlist.save();
    res.json({ success: true, message: 'Song removed from playlist' });
  } catch (error) { next(error); }
};

module.exports = { getPlaylists, getPlaylist, createPlaylist, updatePlaylist, deletePlaylist, addSongToPlaylist, removeSongFromPlaylist };
