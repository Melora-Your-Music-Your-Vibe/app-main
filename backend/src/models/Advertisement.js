const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

const Advertisement = sequelize.define('Advertisement', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  // Type: 'commercial' (settings/feature updates), 'brand' (brand ads for revenue), 'subscription' (app subscription selling)
  type: {
    type: DataTypes.ENUM('commercial', 'brand', 'subscription'),
    allowNull: false,
    defaultValue: 'commercial',
  },
  title: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: false,
  },
  price: {
    type: DataTypes.STRING,
    allowNull: true,
    comment: 'Price if applicable (e.g., "$9.99/mo", "Free", "$49.99")',
  },
  imageUrl: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  imagePublicId: {
    type: DataTypes.STRING,
    allowNull: true,
    comment: 'Cloudinary public ID for the ad image',
  },
  // Duration: how long the ad should be displayed
  startDate: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW,
  },
  endDate: {
    type: DataTypes.DATE,
    allowNull: false,
  },
  isActive: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
  },
}, {
  tableName: 'advertisements',
  indexes: [
    { fields: ['is_active'] },
    { fields: ['start_date'] },
    { fields: ['end_date'] },
    { fields: ['type'] },
  ],
});

module.exports = Advertisement;
