import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Navbar from './components/Navbar';
import CartDrawer from './components/CartDrawer';
import ScrollToTop from './components/ScrollToTop';
import CookieConsent from './components/CookieConsent';
import AgeGate from './components/AgeGate';
import Home from './pages/Home';
import Shop from './pages/Shop';
import ProductDetail from './pages/ProductDetail';
import Login from './pages/Login';
import Checkout from './pages/Checkout';
import Profile from './pages/Profile';
import About from './pages/About';
import Legal from './pages/Legal';
import AdminDashboard from './pages/AdminDashboard';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { CartProvider } from './contexts/CartContext';
import { UserRole } from './types';

// Protected Route Component
const ProtectedRoute: React.FC<{ children: React.ReactNode; requiredRole?: UserRole }> = ({ children, requiredRole }) => {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return <div className="flex justify-center items-center h-screen">Loading...</div>;
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (requiredRole && user.role !== requiredRole) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
};

const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <div className="min-h-screen bg-white">
      <Navbar />
      <CartDrawer />
      <main>{children}</main>
      <footer className="bg-slate-900 text-slate-400 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p>&copy; 2024 Intimacy Wellness Morocco. All rights reserved.</p>
          <p className="text-sm mt-2">Discreet Shipping | Secure Payment</p>
          <div className="mt-4 flex justify-center gap-4 text-xs text-slate-500">
            <a href="/legal/privacy" className="hover:text-slate-300">Privacy Policy</a>
            <span>|</span>
            <a href="/legal/terms" className="hover:text-slate-300">Terms of Service</a>
          </div>
        </div>
      </footer>
      <CookieConsent />
    </div>
  )
}

const App: React.FC = () => {
  return (
    <AuthProvider>
      <CartProvider>
        <BrowserRouter>
          <ScrollToTop />
          <AgeGate />
          <Routes>
            <Route path="/login" element={<Login />} />

            <Route path="/" element={<Layout><Home /></Layout>} />
            <Route path="/shop" element={<Layout><Shop /></Layout>} />
            <Route path="/product/:id" element={<Layout><ProductDetail /></Layout>} />
            <Route path="/about" element={<Layout><About /></Layout>} />
            <Route path="/legal/privacy" element={<Layout><Legal /></Layout>} />
            <Route path="/legal/terms" element={<Layout><Legal /></Layout>} />

            <Route path="/checkout" element={<Layout><Checkout /></Layout>} />
            <Route path="/profile" element={<ProtectedRoute><Layout><Profile /></Layout></ProtectedRoute>} />

            <Route
              path="/admin"
              element={
                <ProtectedRoute requiredRole={UserRole.ADMIN}>
                  <Layout>
                    <AdminDashboard />
                  </Layout>
                </ProtectedRoute>
              }
            />

            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </BrowserRouter>
      </CartProvider>
    </AuthProvider>
  );
};

export default App;