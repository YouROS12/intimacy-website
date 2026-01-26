import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useCart } from '../contexts/CartContext';
import { useAuth } from '../contexts/AuthContext';
import { createOrder, getMoroccanCities } from '../services/api';
import { ShieldCheck, ShoppingBag, CreditCard, Truck, User, MapPin, Lock, LogIn, AlertCircle } from 'lucide-react';
import SeoHead from '../components/SeoHead';
import { validateMoroccanPhone, parseAddress } from '../utils/helpers';

const Checkout: React.FC = () => {
  const { items, total, clearCart } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [isProcessing, setIsProcessing] = useState(false);
  const [cities, setCities] = useState<string[]>(["Casablanca"]);

  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    address: '',
    city: 'Casablanca',
    phone: ''
  });

  const [phoneError, setPhoneError] = useState('');

  useEffect(() => {
    getMoroccanCities().then(data => setCities(data));
  }, []);

  useEffect(() => {
    if (user) {
      // Use helper to parse City and Street correctly from user profile
      const { city, street } = parseAddress(user.address);

      setFormData(prev => ({
        ...prev,
        firstName: user.name || '',
        address: street,
        city: city,
        phone: user.phone || ''
      }));
    }
  }, [user]);

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setFormData({ ...formData, phone: val });

    // Clear error as user types valid input
    if (val.length >= 10 && validateMoroccanPhone(val)) {
      setPhoneError('');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    // Strict Validation on submit
    if (!validateMoroccanPhone(formData.phone)) {
      setPhoneError('Please enter a valid Moroccan number (e.g., 06XXXXXXXX)');
      window.scrollTo(0, 0);
      return;
    }

    setIsProcessing(true);

    try {
      await createOrder({
        user_id: user.id,
        items: items,
        total: total,
        status: 'pending',
        shipping_info: {
          first_name: formData.firstName,
          last_name: formData.lastName,
          address: formData.address,
          city: formData.city,
          phone: formData.phone.replace(/[\s-]/g, '') // strip spacing
        }
      });
      clearCart();
      navigate('/profile');
    } catch (error) {
      alert("Failed to place order. Please try again.");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleLoginRedirect = () => {
    navigate('/login', { state: { from: location } });
  };

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col justify-center items-center p-4 text-center">
        <SeoHead title="Cart Empty" />
        <ShoppingBag className="h-16 w-16 text-gray-300 mb-4" />
        <h2 className="text-2xl font-bold text-gray-900">Your cart is empty</h2>
        <p className="text-gray-500 mt-2 mb-8">Add some items to get started.</p>
        <button onClick={() => navigate('/shop')} className="px-6 py-3 bg-brand-600 text-white rounded-full font-medium hover:bg-brand-700 transition-colors">
          Return to Shop
        </button>
      </div>
    );
  }

  // --- State 1: Not Logged In ---
  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
        <SeoHead title="Checkout Login" />
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-10">
            <h1 className="text-3xl font-extrabold text-gray-900">Checkout</h1>
            <p className="mt-2 text-gray-600">Please sign in to complete your secure purchase.</p>
          </div>

          <div className="bg-white shadow-xl rounded-2xl overflow-hidden">
            <div className="p-8 sm:p-12 text-center">
              <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-brand-100 mb-6">
                <Lock className="h-8 w-8 text-brand-600" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Account Required</h2>
              <p className="text-gray-500 mb-8 max-w-md mx-auto">
                To ensure discreet delivery and order tracking, we require a secure account. It takes less than a minute.
              </p>

              <div className="space-y-4">
                <button
                  onClick={handleLoginRedirect}
                  className="w-full sm:w-auto px-8 py-3 bg-brand-600 text-white rounded-lg font-bold hover:bg-brand-700 transition-colors flex items-center justify-center gap-2 mx-auto"
                >
                  <LogIn className="h-5 w-5" /> Sign In / Create Account
                </button>
                <p className="text-xs text-gray-400 mt-4">
                  You will be redirected back here automatically.
                </p>
              </div>
            </div>
            <div className="bg-gray-50 px-8 py-6 border-t border-gray-100 flex justify-center gap-6 text-sm text-gray-500">
              <span className="flex items-center gap-1"><ShieldCheck className="h-4 w-4" /> Secure Data</span>
              <span className="flex items-center gap-1"><Truck className="h-4 w-4" /> Discreet Shipping</span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // --- State 2: Logged In (Checkout Form) ---
  return (
    <div className="bg-gray-50 min-h-screen py-12">
      <SeoHead title="Secure Checkout" />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Checkout</h1>

        <form onSubmit={handleSubmit} className="lg:grid lg:grid-cols-12 lg:gap-x-12 lg:items-start">

          {/* Left Column: Forms */}
          <section className="lg:col-span-7 space-y-8">

            {/* Contact Info (Read Only) */}
            <div className="bg-white shadow rounded-lg p-6">
              <h2 className="text-lg font-medium text-gray-900 mb-4 flex items-center gap-2">
                <User className="h-5 w-5 text-gray-400" /> Contact Information
              </h2>
              <div className="flex justify-between items-center text-sm">
                <div className="text-gray-600">
                  <p><span className="font-medium text-gray-900">Name:</span> {user.name}</p>
                  <p><span className="font-medium text-gray-900">Email:</span> {user.email}</p>
                </div>
                <div className="text-green-600 flex items-center gap-1 text-xs font-medium bg-green-50 px-2 py-1 rounded">
                  <ShieldCheck className="h-3 w-3" /> Verified
                </div>
              </div>
            </div>

            {/* Shipping Address */}
            <div className="bg-white shadow rounded-lg p-6">
              <h2 className="text-lg font-medium text-gray-900 mb-6 flex items-center gap-2">
                <MapPin className="h-5 w-5 text-gray-400" /> Shipping Details
              </h2>
              <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6">
                <div className="sm:col-span-3">
                  <label className="block text-sm font-medium text-gray-700">First name</label>
                  <input type="text" required value={formData.firstName} onChange={e => setFormData({ ...formData, firstName: e.target.value })} className="mt-1 block w-full p-2.5 border border-gray-300 rounded-md focus:ring-brand-500 focus:border-brand-500 shadow-sm" />
                </div>
                <div className="sm:col-span-3">
                  <label className="block text-sm font-medium text-gray-700">Last name</label>
                  <input type="text" required value={formData.lastName} onChange={e => setFormData({ ...formData, lastName: e.target.value })} className="mt-1 block w-full p-2.5 border border-gray-300 rounded-md focus:ring-brand-500 focus:border-brand-500 shadow-sm" />
                </div>
                <div className="sm:col-span-6">
                  <label className="block text-sm font-medium text-gray-700">Address</label>
                  <input type="text" required value={formData.address} onChange={e => setFormData({ ...formData, address: e.target.value })} className="mt-1 block w-full p-2.5 border border-gray-300 rounded-md focus:ring-brand-500 focus:border-brand-500 shadow-sm" placeholder="Street name, apartment, suite, unit, etc." />
                </div>
                <div className="sm:col-span-3">
                  <label className="block text-sm font-medium text-gray-700">City</label>
                  <select value={formData.city} onChange={e => setFormData({ ...formData, city: e.target.value })} className="mt-1 block w-full p-2.5 border border-gray-300 rounded-md focus:ring-brand-500 focus:border-brand-500 shadow-sm bg-white">
                    {cities.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
                <div className="sm:col-span-3">
                  <label className="block text-sm font-medium text-gray-700">Phone</label>
                  <input
                    type="tel"
                    required
                    value={formData.phone}
                    onChange={handlePhoneChange}
                    className={`mt-1 block w-full p-2.5 border rounded-md focus:ring-brand-500 focus:border-brand-500 shadow-sm ${phoneError ? 'border-red-300 ring-red-500' : 'border-gray-300'}`}
                    placeholder="06XXXXXXXX"
                  />
                  {phoneError && <p className="mt-1 text-xs text-red-600 flex items-center gap-1"><AlertCircle className="h-3 w-3" /> {phoneError}</p>}
                </div>
              </div>
            </div>

            {/* Payment Method */}
            <div className="bg-white shadow rounded-lg p-6">
              <h2 className="text-lg font-medium text-gray-900 mb-4 flex items-center gap-2">
                <CreditCard className="h-5 w-5 text-gray-400" /> Payment
              </h2>
              <div className="border rounded-lg p-4 flex items-center justify-between cursor-pointer border-brand-500 bg-brand-50/20 ring-1 ring-brand-500">
                <div className="flex items-center">
                  <input type="radio" checked readOnly className="h-4 w-4 text-brand-600 focus:ring-brand-500 border-gray-300" />
                  <label className="ml-3 block text-sm font-medium text-gray-900">Cash on Delivery (COD)</label>
                </div>
                <span className="text-xs font-semibold text-brand-600 uppercase tracking-wide">Selected</span>
              </div>
            </div>
          </section>

          {/* Right Column: Order Summary */}
          <section className="lg:col-span-5 mt-8 lg:mt-0">
            <div className="bg-white shadow rounded-lg overflow-hidden sticky top-24">
              <div className="p-6 border-b border-gray-200">
                <h2 className="text-lg font-medium text-gray-900">Order Summary</h2>
              </div>
              <div className="p-6">
                <ul className="divide-y divide-gray-200">
                  {items.map((item) => (
                    <li key={item.id} className="py-4 flex">
                      <div className="flex-shrink-0 h-16 w-16 border border-gray-200 rounded-md overflow-hidden bg-gray-100">
                        <img src={item.imageUrl} alt={item.name} className="h-full w-full object-cover" />
                      </div>
                      <div className="ml-4 flex-1 flex flex-col justify-between">
                        <div>
                          <div className="flex justify-between text-base font-medium text-gray-900">
                            <h3 className="line-clamp-1">{item.name}</h3>
                            <p className="ml-2">{item.price * item.quantity} MAD</p>
                          </div>
                          <p className="mt-1 text-sm text-gray-500">{item.category}</p>
                        </div>
                        <div className="flex items-end justify-between text-sm">
                          <p className="text-gray-500">Qty {item.quantity}</p>
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>

                <div className="mt-6 space-y-4 pt-6 border-t border-gray-200">
                  <div className="flex items-center justify-between text-sm text-gray-600">
                    <p>Subtotal</p>
                    <p>{total} MAD</p>
                  </div>
                  <div className="flex items-center justify-between text-sm text-gray-600">
                    <p>Shipping</p>
                    <p className="text-green-600 font-medium">Free</p>
                  </div>
                  <div className="flex items-center justify-between border-t border-gray-200 pt-4">
                    <p className="text-base font-bold text-gray-900">Total</p>
                    <p className="text-xl font-bold text-brand-600">{total} MAD</p>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isProcessing || !!phoneError}
                  className="mt-8 w-full bg-brand-600 text-white py-4 rounded-lg font-bold text-lg hover:bg-brand-700 shadow-lg hover:shadow-brand-500/30 transition-all disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {isProcessing ? (
                    <>Processing...</>
                  ) : (
                    <>Confirm Order <Truck className="h-5 w-5" /></>
                  )}
                </button>

                <p className="mt-4 text-center text-xs text-gray-500">
                  By placing this order, you agree to our Terms of Service and Privacy Policy.
                  Your privacy is our priority.
                </p>
              </div>
            </div>
          </section>

        </form>
      </div>
    </div>
  );
};

export default Checkout;