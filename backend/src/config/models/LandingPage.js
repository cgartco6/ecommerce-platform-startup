const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const LandingPage = sequelize.define('LandingPage', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  slug: {
    type: DataTypes.STRING,
    unique: true,
    allowNull: false
  },
  title: {
    type: DataTypes.STRING,
    allowNull: false
  },
  content: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  productId: {
    type: DataTypes.INTEGER
  },
  html: {
    type: DataTypes.TEXT
  },
  css: {
    type: DataTypes.TEXT
  },
  isPublished: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  views: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  conversions: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  conversionRate: {
    type: DataTypes.DECIMAL(5, 2),
    defaultValue: 0
  }
});

module.exports = LandingPage;
