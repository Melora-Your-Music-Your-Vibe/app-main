const User = require('./User');
const Song = require('./Song');
const Artist = require('./Artist');
const Album = require('./Album');
const Playlist = require('./Playlist');
const PlaylistSong = require('./PlaylistSong');
const Favorite = require('./Favorite');
const RecentlyPlayed = require('./RecentlyPlayed');
const Advertisement = require('./Advertisement');

// Artist <-> Song
Artist.hasMany(Song, { foreignKey: 'artistId', as: 'songs' });
Song.belongsTo(Artist, { foreignKey: 'artistId', as: 'artistInfo' });

// Album <-> Song
Album.hasMany(Song, { foreignKey: 'albumId', as: 'songs' });
Song.belongsTo(Album, { foreignKey: 'albumId', as: 'albumInfo' });

// Artist <-> Album
Artist.hasMany(Album, { foreignKey: 'artistId', as: 'albums' });
Album.belongsTo(Artist, { foreignKey: 'artistId', as: 'artistInfo' });

// User <-> Playlist
User.hasMany(Playlist, { foreignKey: 'userId', as: 'playlists' });
Playlist.belongsTo(User, { foreignKey: 'userId', as: 'owner' });

// Playlist <-> Song (Many-to-Many through PlaylistSong)
Playlist.belongsToMany(Song, { through: PlaylistSong, foreignKey: 'playlistId', otherKey: 'songId', as: 'songs' });
Song.belongsToMany(Playlist, { through: PlaylistSong, foreignKey: 'songId', otherKey: 'playlistId', as: 'playlists' });

// User <-> Favorite <-> Song
User.hasMany(Favorite, { foreignKey: 'userId', as: 'favorites' });
Favorite.belongsTo(User, { foreignKey: 'userId' });
Song.hasMany(Favorite, { foreignKey: 'songId', as: 'favorites' });
Favorite.belongsTo(Song, { foreignKey: 'songId', as: 'song' });

// User <-> RecentlyPlayed <-> Song
User.hasMany(RecentlyPlayed, { foreignKey: 'userId', as: 'recentlyPlayed' });
RecentlyPlayed.belongsTo(User, { foreignKey: 'userId' });
Song.hasMany(RecentlyPlayed, { foreignKey: 'songId' });
RecentlyPlayed.belongsTo(Song, { foreignKey: 'songId', as: 'song' });

// User uploaded songs
User.hasMany(Song, { foreignKey: 'uploadedBy', as: 'uploadedSongs' });
Song.belongsTo(User, { foreignKey: 'uploadedBy', as: 'uploader' });

module.exports = {
  User,
  Song,
  Artist,
  Album,
  Playlist,
  PlaylistSong,
  Favorite,
  RecentlyPlayed,
  Advertisement,
};
