const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const ContentSuggestion = sequelize.define('ContentSuggestion', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  title: {
    type: DataTypes.STRING,
    allowNull: false
  },
  content: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  platform: {
    type: DataTypes.STRING,
    allowNull: false
  },
  suggestedTime: {
    type: DataTypes.DATE
  },
  engagementScore: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  complianceScore: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  isApproved: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  isPosted: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  actualViews: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  actualReactions: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  aiGenerated: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  }
});

module.exports = ContentSuggestion;
