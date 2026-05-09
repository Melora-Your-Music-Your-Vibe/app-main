const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

const RecentlyPlayed = sequelize.define('RecentlyPlayed', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  userId: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'users',
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
  playedAt: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
  },
}, {
  tableName: 'recently_played',
  indexes: [
    { fields: ['user_id', 'played_at'] },
  ],
});

module.exports = RecentlyPlayed;
