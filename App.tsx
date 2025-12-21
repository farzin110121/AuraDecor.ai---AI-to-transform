
import React from 'react';
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import LandingPage from './pages/LandingPage';
import SignupPage from './pages/SignupPage';
import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';
import NewProjectPage from './pages/NewProjectPage';
import MyProjectsPage from './pages/MyProjectsPage';
import DesignStudioPage from './pages/DesignStudioPage';
import SupplierDashboardPage from './pages/SupplierDashboardPage';
import SubscriptionPage from './pages/SubscriptionPage';
import SupplierSubscriptionPage from './pages/SupplierSubscriptionPage';
import FindSuppliersPage from './pages/FindSuppliersPage';
import VerifyEmailPage from './pages/VerifyEmailPage';
import CheckoutPage from './pages/CheckoutPage';
import AdminDashboardPage from './pages/AdminDashboardPage';
import ContactPage from './pages/ContactPage';


const App: React.FC = () => {
  return (
    <AuthProvider>
      <HashRouter>
        <Main />
      </HashRouter>
    </AuthProvider>
  );
};

const Main: React.FC = () => {
  const { user } = useAuth();

  const getHomeRedirect = () => {
    if (!user) return "/login";
    if (user.role === 'Admin') return '/admin';
    return user.role === 'Property Owner' ? '/dashboard' : '/supplier-dashboard';
  };

  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/signup" element={!user ? <SignupPage /> : <Navigate to={getHomeRedirect()} />} />
      <Route path="/login" element={!user ? <LoginPage /> : <Navigate to={getHomeRedirect()} />} />
      <Route path="/verify-email" element={<VerifyEmailPage />} />
      <Route path="/checkout" element={<CheckoutPage />} />
      <Route path="/contact" element={<ContactPage />} />


      {/* Property Owner Routes */}
      <Route path="/dashboard" element={user?.role === 'Property Owner' ? <DashboardPage /> : <Navigate to={getHomeRedirect()} />} />
      <Route path="/new-project" element={user?.role === 'Property Owner' ? <NewProjectPage /> : <Navigate to={getHomeRedirect()} />} />
      <Route path="/projects" element={user?.role === 'Property Owner' ? <MyProjectsPage /> : <Navigate to={getHomeRedirect()} />} />
      <Route path="/design-studio/:projectId/:spaceId" element={user?.role === 'Property Owner' || user?.role === 'Admin' ? <DesignStudioPage /> : <Navigate to={getHomeRedirect()} />} />
      <Route path="/subscription" element={user?.role === 'Property Owner' ? <SubscriptionPage /> : <Navigate to={getHomeRedirect()} />} />
      <Route path="/find-suppliers" element={user?.role === 'Property Owner' ? <FindSuppliersPage /> : <Navigate to={getHomeRedirect()} />} />

      {/* Supplier Routes */}
      <Route path="/supplier-dashboard" element={user?.role === 'Material Supplier' ? <SupplierDashboardPage /> : <Navigate to={getHomeRedirect()} />} />
      <Route path="/supplier-subscription" element={user?.role === 'Material Supplier' ? <SupplierSubscriptionPage /> : <Navigate to={getHomeRedirect()} />} />
      
      {/* Admin Route */}
      <Route path="/admin" element={user?.role === 'Admin' ? <AdminDashboardPage /> : <Navigate to={getHomeRedirect()} />} />


      <Route path="*" element={<Navigate to="/" />} />
    </Routes>
  );
};

export default App;