const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Payout = sequelize.define('Payout', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  weekStartDate: {
    type: DataTypes.DATE,
    allowNull: false
  },
  weekEndDate: {
    type: DataTypes.DATE,
    allowNull: false
  },
  totalRevenue: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false
  },
  ownerAmount: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false
  },
  companyAmount: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false
  },
  status: {
    type: DataTypes.ENUM('pending', 'processed', 'failed'),
    defaultValue: 'pending'
  },
  ownerTransactionId: {
    type: DataTypes.STRING
  },
  companyTransactionId: {
    type: DataTypes.STRING
  }
});

module.exports = Payout;
