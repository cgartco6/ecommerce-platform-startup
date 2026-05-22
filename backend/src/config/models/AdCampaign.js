const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const AdCampaign = sequelize.define('AdCampaign', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false
  },
  landingPageId: {
    type: DataTypes.INTEGER
  },
  targetUrl: {
    type: DataTypes.STRING
  },
  adCopy: {
    type: DataTypes.TEXT
  },
  imageUrl: {
    type: DataTypes.STRING
  },
  platform: {
    type: DataTypes.STRING
  },
  budget: {
    type: DataTypes.DECIMAL(10, 2)
  },
  status: {
    type: DataTypes.ENUM('draft', 'active', 'paused', 'completed'),
    defaultValue: 'draft'
  },
  clicks: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  impressions: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  conversions: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  }
});

module.exports = AdCampaign;
