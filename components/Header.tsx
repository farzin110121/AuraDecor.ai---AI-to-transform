
import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import Button from './Button';
import Logo from './Logo';

const Header: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };
  
  const getHomeLink = () => {
    if (user?.role === 'Property Owner') return "/dashboard";
    if (user?.role === 'Material Supplier') return "/supplier-dashboard";
    if (user?.role === 'Admin') return "/admin";
    return "/";
  }

  return (
    <header className="bg-brand-dark/80 backdrop-blur-sm sticky top-0 z-50">
      <nav className="container mx-auto px-6 py-4 flex justify-between items-center">
        <div className="flex items-center gap-8">
            <Link to={getHomeLink()} className="flex items-center gap-3 text-2xl font-bold text-brand-gold">
              <Logo />
              <span className="hidden sm:inline">AuraDecor.ai</span>
            </Link>
            <div className="hidden md:flex items-center space-x-6">
              {user?.role === 'Property Owner' ? (
                <>
                  <Link to="/projects" className="text-gray-300 hover:text-brand-gold transition">My Projects</Link>
                  <Link to="/find-suppliers" className="text-gray-300 hover:text-brand-gold transition">Find Suppliers</Link>
                  <Link to="/dashboard" className="text-gray-300 hover:text-brand-gold transition">Dashboard</Link>
                </>
              ) : user?.role === 'Material Supplier' ? (
                <>
                  <Link to="/supplier-dashboard" className="text-gray-300 hover:text-brand-gold transition">Dashboard</Link>
                  <Link to="/supplier-dashboard" className="text-gray-300 hover:text-brand-gold transition">Material Requests</Link>
                </>
              ) : user?.role === 'Admin' ? (
                 <>
                  <Link to="/admin" className="text-gray-300 hover:text-brand-gold transition">Admin Dashboard</Link>
                  <Link to="/admin" className="text-gray-300 hover:text-brand-gold transition">Manage Users</Link>
                 </>
              ) : null}
            </div>
        </div>
        <div className="flex items-center space-x-4">
          <span className="text-gray-200 hidden lg:block">{user?.email}</span>
          <Button onClick={handleLogout} variant="outline" className="py-2 px-4">Logout</Button>
        </div>
      </nav>
    </header>
  );
};

export default Header;