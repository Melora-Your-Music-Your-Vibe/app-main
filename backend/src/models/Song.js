const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

const Song = sequelize.define('Song', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  title: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  artist: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  artistId: {
    type: DataTypes.UUID,
    allowNull: true,
    references: {
      model: 'artists',
      key: 'id',
    },
  },
  album: {
    type: DataTypes.STRING,
    allowNull: true,
    defaultValue: 'Unknown Album',
  },
  albumId: {
    type: DataTypes.UUID,
    allowNull: true,
    references: {
      model: 'albums',
      key: 'id',
    },
  },
  genre: {
    type: DataTypes.STRING,
    allowNull: true,
    defaultValue: 'Unknown',
  },
  year: {
    type: DataTypes.INTEGER,
    allowNull: true,
  },
  duration: {
    type: DataTypes.FLOAT,
    allowNull: true,
    defaultValue: 0,
    comment: 'Duration in seconds',
  },
  audioUrl: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  audioUrlAac: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  audioUrlOgg: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  audioPublicId: {
    type: DataTypes.STRING,
    allowNull: true,
    comment: 'Cloudinary public ID for the audio file',
  },
  thumbnailUrl: {
    type: DataTypes.STRING,
    allowNull: true,
    defaultValue: '/default-album.png',
  },
  thumbnailPublicId: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  lyrics: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  language: {
    type: DataTypes.STRING,
    allowNull: true,
    defaultValue: 'English',
  },
  playCount: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
  },
  tags: {
    type: DataTypes.ARRAY(DataTypes.STRING),
    defaultValue: [],
  },
  fileSize: {
    type: DataTypes.BIGINT,
    allowNull: true,
    comment: 'File size in bytes',
  },
  bitrate: {
    type: DataTypes.STRING,
    allowNull: true,
    defaultValue: '320kbps',
  },
  uploadedBy: {
    type: DataTypes.UUID,
    allowNull: true,
    references: {
      model: 'users',
      key: 'id',
    },
  },
  isActive: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
  },
}, {
  tableName: 'songs',
  indexes: [
    { fields: ['title'] },
    { fields: ['artist'] },
    { fields: ['genre'] },
    { fields: ['play_count'] },
    { fields: ['created_at'] },
  ],
});

module.exports = Song;
