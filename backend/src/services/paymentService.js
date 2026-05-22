const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const paypal = require('paypal-rest-sdk');
const crypto = require('crypto');
const axios = require('axios');
const { Payment, Order } = require('../models');

// Configure PayPal
paypal.configure({
  mode: process.env.PAYPAL_MODE,
  client_id: process.env.PAYPAL_CLIENT_ID,
  client_secret: process.env.PAYPAL_CLIENT_SECRET
});

class PaymentService {
  // Stripe Payment
  async createStripePayment(amount, currency, orderId, successUrl, cancelUrl) {
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [{
        price_data: {
          currency: currency.toLowerCase(),
          product_data: { name: `Order #${orderId}` },
          unit_amount: Math.round(amount * 100)
        },
        quantity: 1
      }],
      mode: 'payment',
      success_url: successUrl,
      cancel_url: cancelUrl,
      metadata: { orderId }
    });
    return session;
  }

  async handleStripeWebhook(payload, signature) {
    const event = stripe.webhooks.constructEvent(payload, signature, process.env.STRIPE_WEBHOOK_SECRET);
    if (event.type === 'checkout.session.completed') {
      const session = event.data.object;
      await this.completePayment(session.metadata.orderId, 'stripe', session.payment_intent);
    }
  }

  // PayPal Payment
  async createPayPalPayment(amount, currency, orderId, returnUrl, cancelUrl) {
    const create_payment_json = {
      intent: 'sale',
      payer: { payment_method: 'paypal' },
      redirect_urls: { return_url: returnUrl, cancel_url: cancelUrl },
      transactions: [{
        amount: { currency: currency, total: amount.toFixed(2) },
        description: `Order #${orderId}`
      }]
    };
    return new Promise((resolve, reject) => {
      paypal.payment.create(create_payment_json, (error, payment) => {
        if (error) reject(error);
        else resolve(payment);
      });
    });
  }

  async executePayPalPayment(paymentId, payerId, orderId) {
    const execute_payment_json = { payer_id: payerId };
    return new Promise((resolve, reject) => {
      paypal.payment.execute(paymentId, execute_payment_json, async (error, payment) => {
        if (error) reject(error);
        else {
          await this.completePayment(orderId, 'paypal', payment.id);
          resolve(payment);
        }
      });
    });
  }

  // PayFast (South Africa)
  async createPayFastPayment(amount, orderId, returnUrl, cancelUrl, notifyUrl) {
    const data = {
      merchant_id: process.env.PAYFAST_MERCHANT_ID,
      merchant_key: process.env.PAYFAST_MERCHANT_KEY,
      return_url: returnUrl,
      cancel_url: cancelUrl,
      notify_url: notifyUrl,
      name_first: 'Customer',
      email_address: 'customer@example.com',
      m_payment_id: orderId,
      amount: amount.toFixed(2),
      item_name: `Order #${orderId}`,
      custom_str1: orderId
    };
    
    const signature = this.generatePayFastSignature(data);
    data.signature = signature;
    
    const action = process.env.PAYFAST_SANDBOX === 'true' 
      ? 'https://sandbox.payfast.co.za/eng/process' 
      : 'https://www.payfast.co.za/eng/process';
    
    return { action, data };
  }

  generatePayFastSignature(data) {
    let pfOutput = '';
    for (let key in data) {
      if (data.hasOwnProperty(key) && key !== 'signature') {
        pfOutput += `${key}=${encodeURIComponent(data[key].trim().replace(/%20/g, '+'))}&`;
      }
    }
    const pfOutputTrimmed = pfOutput.slice(0, -1);
    return crypto.createHash('md5').update(pfOutputTrimmed).digest('hex');
  }

  async verifyPayFastITN(data) {
    const signature = data.signature;
    delete data.signature;
    const calculatedSignature = this.generatePayFastSignature(data);
    return signature === calculatedSignature;
  }

  // Ozow Payment
  async createOzowPayment(amount, orderId, siteCode, returnUrl) {
    const timestamp = new Date().toISOString().replace(/[-:T.Z]/g, '');
    const data = {
      SiteCode: siteCode,
      CountryCode: 'ZA',
      CurrencyCode: 'ZAR',
      Amount: amount.toFixed(2),
      TransactionReference: orderId,
      BankReference: `ORD${orderId}`,
      CancelUrl: returnUrl,
      ErrorUrl: returnUrl,
      SuccessUrl: returnUrl,
      NotifyUrl: `${process.env.APP_URL}/api/payments/ozow-webhook`,
      IsTest: process.env.OZOW_SANDBOX === 'true'
    };
    
    const signature = this.generateOzowSignature(data);
    data.Signature = signature;
    return data;
  }

  generateOzowSignature(data) {
    const sorted = Object.keys(data).sort().map(key => `${key}=${data[key]}`).join('&');
    return crypto.createHmac('sha256', process.env.OZOW_PRIVATE_KEY).update(sorted).digest('hex');
  }

  // Direct EFT
  async createDirectEFT(orderId, amount) {
    const reference = `EFT${Date.now()}${orderId}`;
    return {
      bankName: process.env.BANK_NAME,
      accountName: process.env.BANK_ACCOUNT_NAME,
      accountNumber: process.env.BANK_ACCOUNT_NUMBER,
      branchCode: process.env.BANK_BRANCH_CODE,
      reference: reference,
      amount: amount.toFixed(2)
    };
  }

  async completePayment(orderId, provider, transactionId) {
    const order = await Order.findByPk(orderId);
    if (!order) throw new Error('Order not found');
    
    await Payment.create({
      orderId,
      userId: order.userId,
      amount: order.total,
      provider,
      transactionId,
      status: 'completed'
    });
    
    order.paymentStatus = 'completed';
    order.status = 'paid';
    await order.save();
    
    return order;
  }
}

module.exports = new PaymentService();
