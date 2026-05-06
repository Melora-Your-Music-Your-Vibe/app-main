const { Op } = require('sequelize');
const { Song, Artist, Album, Favorite } = require('../models');
const { uploadAudio, uploadImage, deleteResource } = require('../utils/cloudinaryUpload');
const { paginate, paginationResponse } = require('../utils/helpers');

const getSongs = async (req, res, next) => {
  try {
    const { page, limit, genre, year, artist, sortBy, order } = req.query;
    const { limit: pLimit, offset, page: pPage } = paginate(page, limit);
    const where = { isActive: true };
    if (genre) where.genre = genre;
    if (year) where.year = parseInt(year);
    if (artist) where.artist = { [Op.iLike]: `%${artist}%` };

    const sortField = sortBy === 'playCount' ? 'playCount' : sortBy === 'title' ? 'title' : 'createdAt';
    const { count, rows: songs } = await Song.findAndCountAll({
      where, order: [[sortField, order === 'asc' ? 'ASC' : 'DESC']],
      limit: pLimit, offset,
      include: [
        { model: Artist, as: 'artistInfo', attributes: ['id', 'name', 'profileImage'] },
        { model: Album, as: 'albumInfo', attributes: ['id', 'title', 'coverImage'] },
      ],
    });

    let favIds = [];
    if (req.user) {
      const favs = await Favorite.findAll({ where: { userId: req.user.id }, attributes: ['songId'] });
      favIds = favs.map(f => f.songId);
    }

    res.json({
      success: true,
      data: songs.map(s => ({ ...s.toJSON(), isFavorite: favIds.includes(s.id) })),
      pagination: paginationResponse(count, pPage, pLimit),
    });
  } catch (error) { next(error); }
};

const getSong = async (req, res, next) => {
  try {
    const song = await Song.findByPk(req.params.id, {
      include: [{ model: Artist, as: 'artistInfo' }, { model: Album, as: 'albumInfo' }],
    });
    if (!song) return res.status(404).json({ success: false, message: 'Song not found' });
    let isFavorite = false;
    if (req.user) {
      isFavorite = !!(await Favorite.findOne({ where: { userId: req.user.id, songId: song.id } }));
    }
    res.json({ success: true, data: { ...song.toJSON(), isFavorite } });
  } catch (error) { next(error); }
};

const createSong = async (req, res, next) => {
  try {
    const { title, artist, album, genre, year, lyrics, language, tags } = req.body;
    if (!title || !artist) return res.status(400).json({ success: false, message: 'Title and artist required' });

    let audioResult = null, thumbnailResult = null;
    if (req.files?.audioFile) audioResult = await uploadAudio(req.files.audioFile[0].buffer);
    if (req.files?.thumbnail) thumbnailResult = await uploadImage(req.files.thumbnail[0].buffer, 'melora/thumbnails');

    let artistRec = await Artist.findOne({ where: { name: artist } });
    if (!artistRec) artistRec = await Artist.create({ name: artist });

    let albumRec = null;
    if (album) {
      albumRec = await Album.findOne({ where: { title: album, artistId: artistRec.id } });
      if (!albumRec) albumRec = await Album.create({ title: album, artistId: artistRec.id, artistName: artist, year: year ? parseInt(year) : null, genre });
    }

    const song = await Song.create({
      title, artist, artistId: artistRec.id, album: album || 'Unknown Album', albumId: albumRec?.id,
      genre: genre || 'Unknown', year: year ? parseInt(year) : null,
      duration: audioResult?.duration || 0, audioUrl: audioResult?.url || '',
      audioUrlAac: audioResult?.formats?.aac, audioUrlOgg: audioResult?.formats?.ogg,
      audioPublicId: audioResult?.publicId, thumbnailUrl: thumbnailResult?.url || '/default-album.png',
      thumbnailPublicId: thumbnailResult?.publicId, lyrics, language: language || 'English',
      tags: tags ? (Array.isArray(tags) ? tags : tags.split(',').map(t => t.trim())) : [],
      fileSize: audioResult?.fileSize, bitrate: audioResult?.bitrate || '320kbps',
      uploadedBy: req.user?.id,
    });

    artistRec.songCount += 1; await artistRec.save();
    if (albumRec) { albumRec.totalTracks += 1; await albumRec.save(); }

    res.status(201).json({ success: true, message: 'Song uploaded successfully', data: song });
  } catch (error) { next(error); }
};

const updateSong = async (req, res, next) => {
  try {
    const song = await Song.findByPk(req.params.id);
    if (!song) return res.status(404).json({ success: false, message: 'Song not found' });
    ['title', 'artist', 'album', 'genre', 'year', 'lyrics', 'language', 'tags'].forEach(f => {
      if (req.body[f] !== undefined) song[f] = req.body[f];
    });
    if (req.files?.thumbnail) {
      if (song.thumbnailPublicId) await deleteResource(song.thumbnailPublicId);
      const r = await uploadImage(req.files.thumbnail[0].buffer, 'melora/thumbnails');
      song.thumbnailUrl = r.url; song.thumbnailPublicId = r.publicId;
    }
    await song.save();
    res.json({ success: true, message: 'Song updated', data: song });
  } catch (error) { next(error); }
};

const deleteSong = async (req, res, next) => {
  try {
    const song = await Song.findByPk(req.params.id);
    if (!song) return res.status(404).json({ success: false, message: 'Song not found' });
    if (song.audioPublicId) await deleteResource(song.audioPublicId, 'video');
    if (song.thumbnailPublicId) await deleteResource(song.thumbnailPublicId);
    await song.destroy();
    res.json({ success: true, message: 'Song deleted' });
  } catch (error) { next(error); }
};

const getPopularSongs = async (req, res, next) => {
  try {
    const limit = Math.min(parseInt(req.query.limit) || 20, 50);
    const songs = await Song.findAll({ where: { isActive: true }, order: [['playCount', 'DESC']], limit,
      include: [{ model: Artist, as: 'artistInfo', attributes: ['id', 'name', 'profileImage'] }] });
    res.json({ success: true, data: songs });
  } catch (error) { next(error); }
};

const getLatestSongs = async (req, res, next) => {
  try {
    const limit = Math.min(parseInt(req.query.limit) || 20, 50);
    const songs = await Song.findAll({ where: { isActive: true }, order: [['createdAt', 'DESC']], limit,
      include: [{ model: Artist, as: 'artistInfo', attributes: ['id', 'name', 'profileImage'] }] });
    res.json({ success: true, data: songs });
  } catch (error) { next(error); }
};

const incrementPlayCount = async (req, res, next) => {
  try {
    const song = await Song.findByPk(req.params.id);
    if (!song) return res.status(404).json({ success: false, message: 'Song not found' });
    song.playCount += 1; await song.save();
    res.json({ success: true, data: { playCount: song.playCount } });
  } catch (error) { next(error); }
};

const getGenres = async (req, res, next) => {
  try {
    const { fn, col } = require('sequelize');
    const genres = await Song.findAll({
      attributes: [[fn('DISTINCT', col('genre')), 'genre']],
      where: { isActive: true, genre: { [Op.not]: null } }, raw: true,
    });
    res.json({ success: true, data: genres.map(g => g.genre).filter(Boolean) });
  } catch (error) { next(error); }
};

module.exports = { getSongs, getSong, createSong, updateSong, deleteSong, getPopularSongs, getLatestSongs, incrementPlayCount, getGenres };
