const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

const PlaylistSong = sequelize.define('PlaylistSong', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  playlistId: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'playlists',
      key: 'id',
    },
  },
  songId: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'songs',
      key: 'id',
    },
  },
  position: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 0,
  },
}, {
  tableName: 'playlist_songs',
  indexes: [
    { unique: true, fields: ['playlist_id', 'song_id'] },
    { fields: ['position'] },
  ],
});

module.exports = PlaylistSong;
