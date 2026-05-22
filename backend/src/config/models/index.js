const sequelize = require('../config/database');
const User = require('./User');
const Product = require('./Product');
const Order = require('./Order');
const Payment = require('./Payment');
const Payout = require('./Payout');
const ComplianceRule = require('./ComplianceRule');
const ContentSuggestion = require('./ContentSuggestion');
const AdCampaign = require('./AdCampaign');
const LandingPage = require('./LandingPage');

// Associations
User.hasMany(Order, { foreignKey: 'userId' });
Order.belongsTo(User, { foreignKey: 'userId' });

User.hasMany(Payment, { foreignKey: 'userId' });
Payment.belongsTo(User, { foreignKey: 'userId' });

Order.hasOne(Payment, { foreignKey: 'orderId' });
Payment.belongsTo(Order, { foreignKey: 'orderId' });

User.hasMany(ContentSuggestion, { foreignKey: 'userId' });
ContentSuggestion.belongsTo(User, { foreignKey: 'userId' });

LandingPage.belongsTo(Product, { foreignKey: 'productId' });
Product.hasMany(LandingPage, { foreignKey: 'productId' });

AdCampaign.belongsTo(LandingPage, { foreignKey: 'landingPageId' });
LandingPage.hasMany(AdCampaign, { foreignKey: 'landingPageId' });

const syncDatabase = async () => {
  await sequelize.sync({ alter: process.env.NODE_ENV === 'development' });
  console.log('Database synced');
};

module.exports = {
  sequelize,
  syncDatabase,
  User,
  Product,
  Order,
  Payment,
  Payout,
  ComplianceRule,
  ContentSuggestion,
  AdCampaign,
  LandingPage
};
