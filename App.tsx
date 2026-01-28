import React, { Suspense } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Navbar from './components/Navbar';
import CartDrawer from './components/CartDrawer';
import ScrollToTop from './components/ScrollToTop';
import CookieConsent from './components/CookieConsent';
import AgeGate from './components/AgeGate';
import WhatsAppButton from './components/WhatsAppButton';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { CartProvider } from './contexts/CartContext';
import { UserRole } from './types';

// Lazy load pages for code splitting
const Home = React.lazy(() => import('./pages/Home'));
const Shop = React.lazy(() => import('./pages/Shop'));
const ProductDetail = React.lazy(() => import('./pages/ProductDetail'));
const Login = React.lazy(() => import('./pages/Login'));
const Checkout = React.lazy(() => import('./pages/Checkout'));
const Profile = React.lazy(() => import('./pages/Profile'));
const About = React.lazy(() => import('./pages/About'));
const Legal = React.lazy(() => import('./pages/Legal'));
const AdminDashboard = React.lazy(() => import('./pages/AdminDashboard'));
const OrderConfirmation = React.lazy(() => import('./pages/OrderConfirmation'));

const EducationIndex = React.lazy(() => import('./pages/Education/EducationIndex'));
const PseoSolution = React.lazy(() => import('./pages/Education/PseoSolution'));
const BlogIndex = React.lazy(() => import('./pages/Education/BlogIndex'));
const BlogPost = React.lazy(() => import('./pages/Education/BlogPost'));

// Loading fallback component
const PageLoader = () => (
  <div className="flex justify-center items-center h-screen">
    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-600"></div>
  </div>
);

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
            <Link to="/legal/privacy" className="hover:text-slate-300">Privacy Policy</Link>
            <span>|</span>
            <Link to="/legal/terms" className="hover:text-slate-300">Terms of Service</Link>
          </div>
        </div>
      </footer>
      <CookieConsent />
      <WhatsAppButton />
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
          <Suspense fallback={<PageLoader />}>
            <Routes>
              <Route path="/login" element={<Login />} />

              <Route path="/" element={<Layout><Home /></Layout>} />
              <Route path="/shop" element={<Layout><Shop /></Layout>} />
              <Route path="/education" element={<Layout><EducationIndex /></Layout>} />
              <Route path="/blog" element={<Layout><BlogIndex /></Layout>} />
              <Route path="/solution/:slug" element={<Layout><PseoSolution /></Layout>} />
              <Route path="/guide/:slug" element={<Layout><BlogPost /></Layout>} />

              <Route path="/product/:id" element={<Layout><ProductDetail /></Layout>} />
              <Route path="/about" element={<Layout><About /></Layout>} />
              <Route path="/legal/privacy" element={<Layout><Legal /></Layout>} />
              <Route path="/legal/terms" element={<Layout><Legal /></Layout>} />

              <Route path="/checkout" element={<Layout><Checkout /></Layout>} />
              <Route path="/order-confirmation" element={<Layout><OrderConfirmation /></Layout>} />
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
          </Suspense>
        </BrowserRouter>
      </CartProvider>
    </AuthProvider>
  );
};

export default App;