const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

const Artist = sequelize.define('Artist', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
  },
  bio: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  profileImage: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  profileImagePublicId: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  genres: {
    type: DataTypes.ARRAY(DataTypes.STRING),
    defaultValue: [],
  },
  socialLinks: {
    type: DataTypes.JSONB,
    defaultValue: {},
  },
  songCount: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
  },
  albumCount: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
  },
}, {
  tableName: 'artists',
  indexes: [
    { fields: ['name'] },
  ],
});

module.exports = Artist;
