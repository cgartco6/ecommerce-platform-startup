import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useCart } from '../../contexts/CartContext';
import { ShoppingCartIcon, UserIcon, Bars3Icon, XMarkIcon } from '@heroicons/react/24/outline';

const Navbar = () => {
  const { user, logout } = useAuth();
  const { itemCount } = useCart();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const navigate = useNavigate();

  const navLinks = [
    { name: 'Home', path: '/' },
    { name: 'Products', path: '/products' },
  ];

  const getDashboardLink = () => {
    if (!user) return null;
    if (user.role === 'owner') return { name: 'Owner Dashboard', path: '/owner' };
    if (user.role === 'admin') return { name: 'Admin Dashboard', path: '/admin' };
    return { name: 'Dashboard', path: '/dashboard' };
  };

  const dashboardLink = getDashboardLink();

  return (
    <nav className="bg-navy-700 text-white shadow-lg sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link to="/" className="flex items-center space-x-2">
              <span className="text-2xl font-bold text-white">ShopHub</span>
              <span className="text-xs text-blue-300">SA</span>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            {navLinks.map(link => (
              <Link key={link.path} to={link.path} className="hover:text-blue-300 transition">
                {link.name}
              </Link>
            ))}
            {dashboardLink && (
              <Link to={dashboardLink.path} className="hover:text-blue-300 transition">
                {dashboardLink.name}
              </Link>
            )}
            <Link to="/marketing" className="hover:text-blue-300 transition">
              Marketing
            </Link>
            <Link to="/cart" className="relative">
              <ShoppingCartIcon className="h-6 w-6" />
              {itemCount > 0 && (
                <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                  {itemCount}
                </span>
              )}
            </Link>
            {user ? (
              <div className="flex items-center space-x-4">
                <span className="text-sm">{user.firstName}</span>
                <button onClick={logout} className="bg-red-600 px-3 py-1 rounded hover:bg-red-700">
                  Logout
                </button>
              </div>
            ) : (
              <Link to="/login" className="bg-blue-600 px-4 py-2 rounded-lg hover:bg-blue-700">
                Login / Register
              </Link>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden flex items-center">
            <Link to="/cart" className="relative mr-4">
              <ShoppingCartIcon className="h-6 w-6" />
              {itemCount > 0 && (
                <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                  {itemCount}
                </span>
              )}
            </Link>
            <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
              {mobileMenuOpen ? <XMarkIcon className="h-6 w-6" /> : <Bars3Icon className="h-6 w-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {mobileMenuOpen && (
          <div className="md:hidden pb-4 space-y-2">
            {navLinks.map(link => (
              <Link
                key={link.path}
                to={link.path}
                className="block py-2 hover:text-blue-300"
                onClick={() => setMobileMenuOpen(false)}
              >
                {link.name}
              </Link>
            ))}
            {dashboardLink && (
              <Link
                to={dashboardLink.path}
                className="block py-2 hover:text-blue-300"
                onClick={() => setMobileMenuOpen(false)}
              >
                {dashboardLink.name}
              </Link>
            )}
            <Link to="/marketing" className="block py-2 hover:text-blue-300" onClick={() => setMobileMenuOpen(false)}>
              Marketing
            </Link>
            {user ? (
              <>
                <span className="block py-2 text-sm">{user.firstName} {user.lastName}</span>
                <button
                  onClick={() => { logout(); setMobileMenuOpen(false); }}
                  className="block w-full text-left py-2 text-red-300"
                >
                  Logout
                </button>
              </>
            ) : (
              <Link to="/login" className="block py-2 text-blue-300" onClick={() => setMobileMenuOpen(false)}>
                Login / Register
              </Link>
            )}
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
