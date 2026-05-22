const { Order, Payment, Product, User, Payout } = require('../models');
const { Op } = require('sequelize');
const moment = require('moment');

exports.getClientDashboard = async (req, res) => {
  try {
    const userId = req.user.id;
    
    const orders = await Order.findAll({
      where: { userId },
      order: [['createdAt', 'DESC']],
      limit: 10
    });
    
    const payments = await Payment.findAll({
      where: { userId, status: 'completed' }
    });
    
    const totalSpent = payments.reduce((sum, p) => sum + parseFloat(p.amount), 0);
    const totalOrders = orders.length;
    const completedOrders = orders.filter(o => o.status === 'delivered').length;
    
    // Revenue target tracking
    const user = await User.findByPk(userId);
    const targetProgress = (totalSpent / (user.revenueTarget || 1)) * 100;
    
    // Monthly spending chart
    const monthlySpending = await Payment.findAll({
      where: {
        userId,
        status: 'completed',
        createdAt: { [Op.gte]: moment().subtract(6, 'months').startOf('month').toDate() }
      },
      attributes: ['createdAt', 'amount']
    });
    
    res.json({
      stats: {
        totalSpent,
        totalOrders,
        completedOrders,
        targetProgress,
        revenueTarget: user.revenueTarget
      },
      recentOrders: orders,
      monthlySpending
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error fetching dashboard data' });
  }
};

exports.getAdminDashboard = async (req, res) => {
  try {
    const totalUsers = await User.count();
    const totalOrders = await Order.count();
    const totalRevenue = await Payment.sum('amount', { where: { status: 'completed' } });
    const pendingOrders = await Order.count({ where: { status: 'pending' } });
    
    const recentOrders = await Order.findAll({
      include: [{ model: User, attributes: ['firstName', 'lastName', 'email'] }],
      order: [['createdAt', 'DESC']],
      limit: 20
    });
    
    const topProducts = await Order.findAll({
      attributes: ['items'],
      limit: 100
    });
    
    // Process top products
    const productSales = {};
    topProducts.forEach(order => {
      order.items.forEach(item => {
        productSales[item.name] = (productSales[item.name] || 0) + item.quantity;
      });
    });
    
    const topSelling = Object.entries(productSales)
      .map(([name, quantity]) => ({ name, quantity }))
      .sort((a, b) => b.quantity - a.quantity)
      .slice(0, 10);
    
    const dailyRevenue = await Payment.findAll({
      where: { status: 'completed' },
      attributes: ['createdAt', 'amount']
    });
    
    res.json({
      stats: { totalUsers, totalOrders, totalRevenue: totalRevenue || 0, pendingOrders },
      recentOrders,
      topSelling,
      dailyRevenue
    });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching admin dashboard' });
  }
};

exports.getOwnerDashboard = async (req, res) => {
  try {
    const payouts = await Payout.findAll({ order: [['weekStartDate', 'DESC']] });
    const totalPaidOut = payouts.reduce((sum, p) => sum + parseFloat(p.ownerAmount), 0);
    const companyBalance = payouts.reduce((sum, p) => sum + parseFloat(p.companyAmount), 0);
    
    const platformCosts = {
      hosting: 5000,
      ai: 2000,
      paymentFees: 3000,
      support: 4000,
      total: 14000
    };
    
    const netProfit = companyBalance - platformCosts.total;
    
    res.json({
      payouts,
      financials: {
        totalPaidOut,
        companyBalance,
        platformCosts,
        netProfit,
        nextPayoutDate: moment().day(3).format('YYYY-MM-DD')
      },
      platformMetrics: {
        totalUsers: await User.count(),
        totalOrders: await Order.count(),
        averageOrderValue: await Payment.average('amount', { where: { status: 'completed' } })
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching owner dashboard' });
  }
};

exports.setRevenueTarget = async (req, res) => {
  try {
    const { target } = req.body;
    await User.update({ revenueTarget: target }, { where: { id: req.user.id } });
    res.json({ message: 'Revenue target updated', target });
  } catch (error) {
    res.status(500).json({ message: 'Error setting revenue target' });
  }
};
