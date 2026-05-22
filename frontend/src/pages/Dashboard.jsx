import React, { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import api from '../services/api';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { DocumentArrowDownIcon, CurrencyDollarIcon, ShoppingBagIcon, TargetIcon } from '@heroicons/react/24/outline';

const Dashboard = () => {
  const { user } = useAuth();
  const [dashboardData, setDashboardData] = useState(null);
  const [target, setTarget] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboard();
  }, []);

  const fetchDashboard = async () => {
    try {
      const response = await api.get('/dashboard/client');
      setDashboardData(response.data);
      setTarget(response.data.stats.revenueTarget || '');
    } catch (error) {
      console.error('Error fetching dashboard:', error);
    } finally {
      setLoading(false);
    }
  };

  const setRevenueTarget = async () => {
    try {
      await api.post('/dashboard/set-target', { target: parseFloat(target) });
      toast.success('Revenue target updated');
      fetchDashboard();
    } catch (error) {
      toast.error('Failed to update target');
    }
  };

  if (loading) {
    return <div className="text-center py-12">Loading dashboard...</div>;
  }

  const stats = dashboardData?.stats || {};
  const monthlyData = dashboardData?.monthlySpending || [];

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">My Dashboard</h1>
      
      {/* Stats Cards */}
      <div className="grid md:grid-cols-4 gap-6 mb-8">
        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm">Total Spent</p>
              <p className="text-2xl font-bold">R{stats.totalSpent?.toFixed(2) || '0.00'}</p>
            </div>
            <CurrencyDollarIcon className="h-10 w-10 text-green-500" />
          </div>
        </div>
        
        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm">Total Orders</p>
              <p className="text-2xl font-bold">{stats.totalOrders || 0}</p>
            </div>
            <ShoppingBagIcon className="h-10 w-10 text-blue-500" />
          </div>
        </div>
        
        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm">Completed Orders</p>
              <p className="text-2xl font-bold">{stats.completedOrders || 0}</p>
            </div>
            <ShoppingBagIcon className="h-10 w-10 text-green-500" />
          </div>
        </div>
        
        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm">Target Progress</p>
              <p className="text-2xl font-bold">{stats.targetProgress?.toFixed(1) || 0}%</p>
            </div>
            <TargetIcon className="h-10 w-10 text-purple-500" />
          </div>
        </div>
      </div>
      
      {/* Revenue Target Setter */}
      <div className="card mb-8">
        <h2 className="text-xl font-semibold mb-4">Revenue Target</h2>
        <div className="flex gap-4">
          <input
            type="number"
            value={target}
            onChange={(e) => setTarget(e.target.value)}
            placeholder="Enter your revenue target"
            className="input flex-1"
          />
          <button onClick={setRevenueTarget} className="btn-primary">
            Set Target
          </button>
        </div>
        {stats.revenueTarget > 0 && (
          <div className="mt-4">
            <div className="bg-gray-200 rounded-full h-4">
              <div
                className="bg-green-500 rounded-full h-4 transition-all"
                style={{ width: `${Math.min(stats.targetProgress, 100)}%` }}
              />
            </div>
            <p className="text-sm text-gray-600 mt-2">
              {stats.targetProgress?.toFixed(1)}% of R{stats.revenueTarget?.toFixed(2)} target achieved
            </p>
          </div>
        )}
      </div>
      
      {/* Spending Chart */}
      {monthlyData.length > 0 && (
        <div className="card mb-8">
          <h2 className="text-xl font-semibold mb-4">Spending History</h2>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={monthlyData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="amount" stroke="#1E3A8A" name="Amount (R)" />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}
      
      {/* Recent Orders */}
      <div className="card">
        <h2 className="text-xl font-semibold mb-4">Recent Orders</h2>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b">
                <th className="text-left py-2">Order #</th>
                <th className="text-left py-2">Date</th>
                <th className="text-left py-2">Total</th>
                <th className="text-left py-2">Status</th>
                <th className="text-left py-2">Actions</th>
              </tr>
            </thead>
            <tbody>
              {dashboardData?.recentOrders?.map(order => (
                <tr key={order.id} className="border-b">
                  <td className="py-2">{order.orderNumber}</td>
                  <td className="py-2">{new Date(order.createdAt).toLocaleDateString()}</td>
                  <td className="py-2">R{order.total}</td>
                  <td className="py-2">
                    <span className={`px-2 py-1 rounded text-xs ${
                      order.status === 'paid' ? 'bg-green-100 text-green-800' :
                      order.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {order.status}
                    </span>
                  </td>
                  <td className="py-2">
                    <button
                      onClick={() => window.open(`/api/documents/invoice/${order.id}`, '_blank')}
                      className="text-blue-600 hover:text-blue-800"
                    >
                      <DocumentArrowDownIcon className="h-5 w-5" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
