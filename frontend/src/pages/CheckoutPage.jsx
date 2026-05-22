import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../contexts/CartContext';
import { useAuth } from '../contexts/AuthContext';
import api from '../services/api';
import toast from 'react-hot-toast';

const CheckoutPage = () => {
  const { cartItems, cartTotal, clearCart } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState('stripe');
  const [formData, setFormData] = useState({
    firstName: user?.firstName || '',
    lastName: user?.lastName || '',
    email: user?.email || '',
    phone: '',
    address: '',
    city: '',
    postalCode: ''
  });

  if (cartItems.length === 0) {
    navigate('/cart');
    return null;
  }

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Create order
      const orderData = {
        items: cartItems.map(item => ({
          id: item.id,
          name: item.name,
          price: item.price,
          quantity: item.quantity
        })),
        subtotal: cartTotal,
        tax: cartTotal * 0.15,
        total: cartTotal * 1.15,
        shippingAddress: formData,
        paymentMethod
      };

      const orderResponse = await api.post('/orders', orderData);
      const order = orderResponse.data;

      // Create payment
      const paymentResponse = await api.post('/payments/create', {
        orderId: order.id,
        paymentMethod,
        successUrl: `${window.location.origin}/payment/success`,
        cancelUrl: `${window.location.origin}/payment/cancel`
      });

      const { data } = paymentResponse.data;

      // Handle different payment methods
      if (paymentMethod === 'stripe') {
        window.location.href = data.url;
      } else if (paymentMethod === 'paypal') {
        const approvalUrl = data.links.find(link => link.rel === 'approval_url').href;
        window.location.href = approvalUrl;
      } else if (paymentMethod === 'payfast') {
        const form = document.createElement('form');
        form.method = 'POST';
        form.action = data.action;
        Object.entries(data.data).forEach(([key, value]) => {
          const input = document.createElement('input');
          input.type = 'hidden';
          input.name = key;
          input.value = value;
          form.appendChild(input);
        });
        document.body.appendChild(form);
        form.submit();
      } else if (paymentMethod === 'direct_eft') {
        toast.success('Order created! Use the bank details below to complete payment.');
        // Show bank details
        alert(`Please make an EFT payment to:\n\nBank: ${data.bankName}\nAccount Name: ${data.accountName}\nAccount Number: ${data.accountNumber}\nBranch Code: ${data.branchCode}\nReference: ${data.reference}\nAmount: R${data.amount}`);
        clearCart();
        navigate('/dashboard');
      } else {
        clearCart();
        navigate('/dashboard');
      }
    } catch (error) {
      toast.error('Checkout failed. Please try again.');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const tax = cartTotal * 0.15;
  const total = cartTotal + tax;

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Checkout</h1>
      
      <div className="grid md:grid-cols-3 gap-8">
        <div className="md:col-span-2">
          <form onSubmit={handleSubmit} className="card space-y-4">
            <h2 className="text-xl font-semibold mb-4">Shipping Information</h2>
            
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">First Name *</label>
                <input type="text" name="firstName" required value={formData.firstName} onChange={handleInputChange} className="input" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Last Name *</label>
                <input type="text" name="lastName" required value={formData.lastName} onChange={handleInputChange} className="input" />
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-1">Email *</label>
              <input type="email" name="email" required value={formData.email} onChange={handleInputChange} className="input" />
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-1">Phone *</label>
              <input type="tel" name="phone" required value={formData.phone} onChange={handleInputChange} className="input" />
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-1">Address *</label>
              <input type="text" name="address" required value={formData.address} onChange={handleInputChange} className="input" />
            </div>
            
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">City *</label>
                <input type="text" name="city" required value={formData.city} onChange={handleInputChange} className="input" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Postal Code</label>
                <input type="text" name="postalCode" value={formData.postalCode} onChange={handleInputChange} className="input" />
              </div>
            </div>
          </form>
        </div>
        
        <div>
          <div className="card sticky top-24">
            <h2 className="text-xl font-semibold mb-4">Order Summary</h2>
            
            <div className="space-y-2 max-h-64 overflow-y-auto mb-4">
              {cartItems.map(item => (
                <div key={item.id} className="flex justify-between text-sm">
                  <span>{item.name} x {item.quantity}</span>
                  <span>R{(item.price * item.quantity).toFixed(2)}</span>
                </div>
              ))}
            </div>
            
            <div className="border-t pt-4 space-y-2">
              <div className="flex justify-between">
                <span>Subtotal:</span>
                <span>R{cartTotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span>Tax (15%):</span>
                <span>R{tax.toFixed(2)}</span>
              </div>
              <div className="flex justify-between font-bold text-lg pt-2 border-t">
                <span>Total:</span>
                <span>R{total.toFixed(2)}</span>
              </div>
            </div>
            
            <div className="mt-6">
              <label className="block text-sm font-medium mb-2">Payment Method</label>
              <select value={paymentMethod} onChange={(e) => setPaymentMethod(e.target.value)} className="input mb-4">
                <option value="stripe">Credit Card (Stripe)</option>
                <option value="paypal">PayPal</option>
                <option value="payfast">PayFast (South Africa)</option>
                <option value="direct_eft">Direct EFT (African Bank)</option>
              </select>
              
              <button
                type="submit"
                onClick={handleSubmit}
                disabled={loading}
                className="btn-primary w-full py-3 text-lg"
              >
                {loading ? 'Processing...' : `Pay R${total.toFixed(2)}`}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CheckoutPage;
