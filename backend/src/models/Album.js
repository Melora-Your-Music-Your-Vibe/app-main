const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

const Album = sequelize.define('Album', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  title: {
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
  artistName: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  year: {
    type: DataTypes.INTEGER,
    allowNull: true,
  },
  genre: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  coverImage: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  coverImagePublicId: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  totalTracks: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
  },
  totalDuration: {
    type: DataTypes.FLOAT,
    defaultValue: 0,
    comment: 'Total duration in seconds',
  },
}, {
  tableName: 'albums',
  indexes: [
    { fields: ['title'] },
    { fields: ['artist_name'] },
  ],
});

module.exports = Album;
