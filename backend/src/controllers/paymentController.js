const PaymentService = require('../services/paymentService');
const { Order, Payment } = require('../models');

exports.createPayment = async (req, res) => {
  try {
    const { orderId, paymentMethod, successUrl, cancelUrl } = req.body;
    
    const order = await Order.findByPk(orderId);
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }
    
    let paymentData;
    
    switch (paymentMethod) {
      case 'stripe':
        paymentData = await PaymentService.createStripePayment(
          order.total, 'zar', orderId, successUrl, cancelUrl
        );
        break;
      case 'paypal':
        paymentData = await PaymentService.createPayPalPayment(
          order.total, 'ZAR', orderId, successUrl, cancelUrl
        );
        break;
      case 'payfast':
        paymentData = await PaymentService.createPayFastPayment(
          order.total, orderId, successUrl, cancelUrl, `${process.env.APP_URL}/api/payments/payfast-webhook`
        );
        break;
      case 'ozow':
        paymentData = await PaymentService.createOzowPayment(
          order.total, orderId, process.env.OZOW_SITE_CODE, successUrl
        );
        break;
      case 'direct_eft':
        paymentData = await PaymentService.createDirectEFT(orderId, order.total);
        break;
      default:
        return res.status(400).json({ message: 'Invalid payment method' });
    }
    
    res.json({ paymentMethod, data: paymentData });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Payment creation failed' });
  }
};

exports.handleStripeWebhook = async (req, res) => {
  const sig = req.headers['stripe-signature'];
  try {
    await PaymentService.handleStripeWebhook(req.body, sig);
    res.json({ received: true });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

exports.handlePayPalSuccess = async (req, res) => {
  const { paymentId, PayerID, orderId } = req.query;
  try {
    await PaymentService.executePayPalPayment(paymentId, PayerID, orderId);
    res.redirect(`${process.env.FRONTEND_URL}/payment/success?order=${orderId}`);
  } catch (error) {
    res.redirect(`${process.env.FRONTEND_URL}/payment/failed`);
  }
};

exports.handlePayFastITN = async (req, res) => {
  const isValid = await PaymentService.verifyPayFastITN(req.body);
  if (isValid && req.body.payment_status === 'COMPLETE') {
    await PaymentService.completePayment(req.body.m_payment_id, 'payfast', req.body.pf_payment_id);
  }
  res.send('OK');
};

exports.getPaymentStatus = async (req, res) => {
  try {
    const { orderId } = req.params;
    const payment = await Payment.findOne({ where: { orderId } });
    res.json({ status: payment?.status || 'pending', payment });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching payment status' });
  }
};
