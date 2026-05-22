const { Op } = require('sequelize');
const { Order, Payout, User } = require('../models');
const moment = require('moment');

class PayoutService {
  async processWeeklyPayout() {
    const today = moment();
    if (today.day() !== 3) { // Wednesday
      console.log('Not payout day (Wednesday)');
      return;
    }
    
    const weekStart = today.clone().subtract(7, 'days').startOf('day');
    const weekEnd = today.clone().subtract(1, 'days').endOf('day');
    
    const orders = await Order.findAll({
      where: {
        status: 'paid',
        createdAt: { [Op.between]: [weekStart.toDate(), weekEnd.toDate()] }
      }
    });
    
    const totalRevenue = orders.reduce((sum, order) => sum + parseFloat(order.total), 0);
    const ownerAmount = totalRevenue * 0.5;
    const companyAmount = totalRevenue * 0.5;
    
    const payout = await Payout.create({
      weekStartDate: weekStart.toDate(),
      weekEndDate: weekEnd.toDate(),
      totalRevenue,
      ownerAmount,
      companyAmount,
      status: 'pending'
    });
    
    // Process actual payout to owner
    await this.transferToOwner(ownerAmount, payout.id);
    await this.transferToCompany(companyAmount, payout.id);
    
    payout.status = 'processed';
    await payout.save();
    
    return payout;
  }
  
  async transferToOwner(amount, payoutId) {
    // Integration with actual payment provider for owner payout
    console.log(`Transferring R${amount} to owner account`);
    // Update payout with transaction ID
    await Payout.update(
      { ownerTransactionId: `PAYOUT_OWNER_${Date.now()}` },
      { where: { id: payoutId } }
    );
  }
  
  async transferToCompany(amount, payoutId) {
    console.log(`Transferring R${amount} to company account`);
    await Payout.update(
      { companyTransactionId: `PAYOUT_COMPANY_${Date.now()}` },
      { where: { id: payoutId } }
    );
  }
  
  async getUserPayoutHistory(userId) {
    const orders = await Order.findAll({
      where: { userId, status: 'paid' },
      include: ['payments']
    });
    
    const totalSpent = orders.reduce((sum, order) => sum + parseFloat(order.total), 0);
    return { orders, totalSpent };
  }
}

module.exports = new PayoutService();
