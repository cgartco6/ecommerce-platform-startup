const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const ComplianceRule = sequelize.define('ComplianceRule', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  platform: {
    type: DataTypes.ENUM('facebook', 'instagram', 'tiktok', 'twitter', 'linkedin', 'google'),
    allowNull: false
  },
  ruleType: {
    type: DataTypes.ENUM('content', 'timing', 'frequency', 'prohibited_words', 'image_rules'),
    allowNull: false
  },
  ruleValue: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  isActive: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  },
  penalty: {
    type: DataTypes.STRING
  }
});

module.exports = ComplianceRule;
