const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Payment = sequelize.define('Payment', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  orderId: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  userId: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  amount: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false
  },
  currency: {
    type: DataTypes.STRING,
    defaultValue: 'ZAR'
  },
  provider: {
    type: DataTypes.ENUM('stripe', 'paypal', 'payfast', 'ozow', 'direct_eft'),
    allowNull: false
  },
  transactionId: {
    type: DataTypes.STRING
  },
  status: {
    type: DataTypes.ENUM('pending', 'completed', 'failed', 'refunded'),
    defaultValue: 'pending'
  },
  metadata: {
    type: DataTypes.JSON,
    defaultValue: {}
  }
});

module.exports = Payment;
