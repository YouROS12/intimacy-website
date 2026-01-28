import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useCart } from '../contexts/CartContext';
import { useAuth } from '../contexts/AuthContext';
import { createOrder, getMoroccanCities } from '../services/api';
import { ShieldCheck, ShoppingBag, Truck, MapPin, AlertCircle, Eye, EyeOff, Check, X, UserPlus } from 'lucide-react';
import SeoHead from '../components/SeoHead';
import { validateMoroccanPhone, parseAddress } from '../utils/helpers';
import { sanitizeInput, sanitizePhone, sanitizeEmail } from '../utils/sanitize';
import { validatePassword, PASSWORD_RULES } from '../utils/passwordValidation';

const Checkout: React.FC = () => {
  const { items, total, clearCart } = useCart();
  const { user, signup, signInAnonymously, convertGuestToPermanent } = useAuth();
  const navigate = useNavigate();
  const [isProcessing, setIsProcessing] = useState(false);
  const [cities, setCities] = useState<string[]>(["Casablanca"]);
  const [submitError, setSubmitError] = useState('');

  // Shipping form data
  const [formData, setFormData] = useState({
    fullName: '',
    phone: '',
    city: 'Casablanca',
    address: ''
  });

  // Account creation toggle and fields
  const [wantsAccount, setWantsAccount] = useState(false);
  const [accountData, setAccountData] = useState({
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Validation errors
  const [phoneError, setPhoneError] = useState('');
  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [confirmPasswordError, setConfirmPasswordError] = useState('');

  // Password strength
  const passwordStrength = validatePassword(accountData.password);

  useEffect(() => {
    getMoroccanCities().then(data => setCities(data));
  }, []);

  // Pre-fill for logged-in users
  useEffect(() => {
    if (user) {
      const { city, street } = parseAddress(user.address);
      setFormData(prev => ({
        ...prev,
        fullName: user.name || '',
        address: street,
        city: city || 'Casablanca',
        phone: user.phone || ''
      }));
    }
  }, [user]);

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setFormData({ ...formData, phone: val });
    if (val.length >= 10 && validateMoroccanPhone(val)) {
      setPhoneError('');
    }
  };

  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError('');
    setEmailError('');
    setPasswordError('');
    setConfirmPasswordError('');

    // Validate phone
    if (!validateMoroccanPhone(formData.phone)) {
      setPhoneError('Please enter a valid Moroccan number (e.g., 06XXXXXXXX)');
      window.scrollTo(0, 0);
      return;
    }

    // If creating account, validate account fields
    if (wantsAccount && !user) {
      if (!validateEmail(accountData.email)) {
        setEmailError('Please enter a valid email address');
        return;
      }

      if (!passwordStrength.isValid) {
        setPasswordError('Password does not meet requirements');
        return;
      }

      if (accountData.password !== accountData.confirmPassword) {
        setConfirmPasswordError('Passwords do not match');
        return;
      }
    }

    setIsProcessing(true);

    try {
      // Sanitize all inputs
      const sanitizedFullName = sanitizeInput(formData.fullName);
      const sanitizedAddress = sanitizeInput(formData.address);
      const sanitizedPhone = sanitizePhone(formData.phone);

      let userId = user?.id || null;
      let isNewAccount = false;

      // Create account if requested
      // Create account if requested
      if (wantsAccount) {
        try {
          const sanitizedEmail = sanitizeEmail(accountData.email);
          let signupResult;

          // Check if we are already an anonymous user
          // Supabase users have an 'is_anonymous' property (check your User type definition) or we can check session
          // For now, we assume if we have a user ID but no metadata/email, it might be anon.
          // Better check: use the AuthContext user object?
          // Since our User type is simplified, let's try to detect if we should Convert or Signup.

          if (user && !user.email) {
            // Logic: If we have a user but no email, treat as Anonymous needing upgrade
            // This depends on how you store anon users in context.
            // Actually, Supabase auth.user() has is_anonymous. 
            // Our AuthContext 'user' shape might not expose it.
            // Let's assume if we have a user ID and we are creating an account, we want to upgrade.

            // Wait, if we are "Guest" we might have signed in anonymously ALREADY in previous steps?
            // No, Checkout.tsx logic is: 
            // 1. create account 
            // 2. OR sign in anon.

            // If the user arrived here as a GUEST (already anon signed in from previous session?), 
            // we should convert.
            // But our `user` object in context is likely null if anon? 
            // Let's check AuthContext. It only sets `user` if session exists.
            // Anonymous session DOES exist.
            // So `user` will be NOT null.

            // So if `user` exists but we are clicking "Create Account", it implies we are converting.
            signupResult = await convertGuestToPermanent(
              sanitizedEmail,
              accountData.password,
              sanitizedFullName,
              sanitizedPhone,
              `${formData.city}, ${sanitizedAddress}`
            );
            // After conversion, the ID stays the same!
            userId = user.id;
            isNewAccount = true;
          } else if (!user) {
            // Standard signup
            signupResult = await signup(
              sanitizedEmail,
              accountData.password,
              sanitizedFullName,
              sanitizedPhone,
              `${formData.city}, ${sanitizedAddress}`
            );
            if (signupResult?.user) {
              isNewAccount = true;
              userId = signupResult.user.id;
            }
          }

        } catch (signupError: any) {
          console.error('Signup failed:', signupError);
          // FALLBACK: If signup fails (e.g. rate limit, existing user), proceed as guest
          // We don't want to block the sale!
          userId = null;
          isNewAccount = false;
          // You might want to notify via a toast, but for now we proceed silently or log it
          console.warn("Falling back to guest checkout due to signup error");
        }
      }

      // If we still don't have a userId (guest checkout), sign in anonymously (if enabled in Supabase)
      if (!userId) {
        try {
          const anonResult = await signInAnonymously();
          if (anonResult?.user) {
            userId = anonResult.user.id;
          }
        } catch (anonError) {
          console.error('Anonymous sign-in failed (might be disabled in Supabase):', anonError);
          // If anonymous auth fails, we proceed with null userID 
          // (which requires the "Guests can create orders" policy we added)
          userId = null;
        }
      }

      // Create the order
      const orderId = await createOrder({
        user_id: userId,
        items: items,
        total: total,
        status: 'pending',
        shipping_info: {
          first_name: sanitizedFullName,
          last_name: '',
          address: sanitizedAddress,
          city: formData.city,
          phone: sanitizedPhone,
          guest_email: wantsAccount ? accountData.email : undefined
        }
      });

      clearCart();

      // Navigate to confirmation page
      navigate('/order-confirmation', {
        state: {
          orderId: orderId,
          total: total,
          itemCount: items.length,
          email: wantsAccount ? accountData.email : undefined,
          isNewAccount: isNewAccount
        }
      });
    } catch (error) {
      console.error('Order creation failed:', error);
      setSubmitError('Failed to place order: ' + (error as any).message || 'Unknown error');
      window.scrollTo(0, 0);
    } finally {
      setIsProcessing(false);
    }
  };

  // Empty cart state
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

  return (
    <div className="bg-gray-50 min-h-screen py-12">
      <SeoHead title="Secure Checkout" />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Error Banner */}
        {submitError && (
          <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4 flex items-start gap-3">
            <AlertCircle className="h-5 w-5 text-red-500 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <h3 className="text-sm font-medium text-red-800">Order Submission Failed</h3>
              <p className="text-sm text-red-700 mt-1">{submitError}</p>
              <p className="text-xs text-red-600 mt-2">
                Please take a screenshot of this error and send it to us on WhatsApp.
              </p>
              <a
                href={`https://wa.me/212656201278?text=${encodeURIComponent('Bonjour, j\'ai une erreur: ' + submitError)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-red-600 hover:text-red-700 underline mt-2 inline-block font-medium"
              >
                Contact Support on WhatsApp →
              </a>
            </div>
          </div>
        )}

        {/* Logged in badge */}
        {user && (
          <div className="mb-6 bg-green-50 border border-green-200 rounded-lg p-4 flex items-center gap-3">
            <ShieldCheck className="h-5 w-5 text-green-600" />
            <p className="text-green-800">
              <span className="font-medium">Logged in as {user.email}</span>
              <span className="text-green-600 text-sm ml-2">• Your info is pre-filled</span>
            </p>
          </div>
        )}

        <h1 className="text-3xl font-bold text-gray-900 mb-8">Checkout</h1>

        <form onSubmit={handleSubmit} className="lg:grid lg:grid-cols-12 lg:gap-x-12 lg:items-start">

          {/* Left Column: Forms */}
          <section className="lg:col-span-7 space-y-8">

            {/* Shipping Information */}
            <div className="bg-white shadow rounded-lg p-6">
              <h2 className="text-lg font-medium text-gray-900 mb-6 flex items-center gap-2">
                <MapPin className="h-5 w-5 text-gray-400" /> Shipping Details
              </h2>
              <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6">
                <div className="sm:col-span-6">
                  <label className="block text-sm font-medium text-gray-700">Full Name *</label>
                  <input
                    type="text"
                    required
                    value={formData.fullName}
                    onChange={e => setFormData({ ...formData, fullName: e.target.value })}
                    className="mt-1 block w-full p-2.5 border border-gray-300 rounded-md focus:ring-brand-500 focus:border-brand-500 shadow-sm"
                    placeholder="Ahmed Benali"
                  />
                </div>
                <div className="sm:col-span-3">
                  <label className="block text-sm font-medium text-gray-700">Phone *</label>
                  <input
                    type="tel"
                    required
                    value={formData.phone}
                    onChange={handlePhoneChange}
                    className={`mt-1 block w-full p-2.5 border rounded-md focus:ring-brand-500 focus:border-brand-500 shadow-sm ${phoneError ? 'border-red-300' : 'border-gray-300'}`}
                    placeholder="06XXXXXXXX"
                  />
                  {phoneError && <p className="mt-1 text-xs text-red-600 flex items-center gap-1"><AlertCircle className="h-3 w-3" /> {phoneError}</p>}
                </div>
                <div className="sm:col-span-3">
                  <label className="block text-sm font-medium text-gray-700">City *</label>
                  <select
                    value={formData.city}
                    onChange={e => setFormData({ ...formData, city: e.target.value })}
                    className="mt-1 block w-full p-2.5 border border-gray-300 rounded-md focus:ring-brand-500 focus:border-brand-500 shadow-sm bg-white"
                  >
                    {cities.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
                <div className="sm:col-span-6">
                  <label className="block text-sm font-medium text-gray-700">Address *</label>
                  <input
                    type="text"
                    required
                    value={formData.address}
                    onChange={e => setFormData({ ...formData, address: e.target.value })}
                    className="mt-1 block w-full p-2.5 border border-gray-300 rounded-md focus:ring-brand-500 focus:border-brand-500 shadow-sm"
                    placeholder="123 Rue Mohammed V, Apt 4B"
                  />
                </div>
              </div>
            </div>

            {/* Account Creation (only show if not logged in) */}
            {!user && (
              <div className="bg-white shadow rounded-lg p-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-medium text-gray-900 flex items-center gap-2">
                    <UserPlus className="h-5 w-5 text-gray-400" /> Create Account
                    <span className="text-sm font-normal text-gray-500">(Optional)</span>
                  </h2>
                  <button
                    type="button"
                    onClick={() => setWantsAccount(!wantsAccount)}
                    className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-brand-500 focus:ring-offset-2 ${wantsAccount ? 'bg-brand-600' : 'bg-gray-200'}`}
                  >
                    <span className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${wantsAccount ? 'translate-x-5' : 'translate-x-0'}`} />
                  </button>
                </div>

                <p className="text-sm text-gray-500 mb-4">
                  Track your orders and save your address for faster checkout next time.
                </p>

                {/* Already have account link */}
                <Link to="/login" state={{ from: { pathname: '/checkout' } }} className="text-sm text-brand-600 hover:text-brand-700 font-medium">
                  Already have an account? Sign in →
                </Link>

                {/* Account fields (shown when toggle is on) */}
                {wantsAccount && (
                  <div className="mt-6 space-y-4 pt-4 border-t border-gray-200">
                    {/* Email */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Email *</label>
                      <input
                        type="email"
                        value={accountData.email}
                        onChange={e => setAccountData({ ...accountData, email: e.target.value })}
                        className={`mt-1 block w-full p-2.5 border rounded-md focus:ring-brand-500 focus:border-brand-500 shadow-sm ${emailError ? 'border-red-300' : 'border-gray-300'}`}
                        placeholder="your.email@example.com"
                      />
                      {emailError && <p className="mt-1 text-xs text-red-600">{emailError}</p>}
                    </div>

                    {/* Password */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Password *</label>
                      <div className="relative mt-1">
                        <input
                          type={showPassword ? 'text' : 'password'}
                          value={accountData.password}
                          onChange={e => setAccountData({ ...accountData, password: e.target.value })}
                          className={`block w-full p-2.5 pr-10 border rounded-md focus:ring-brand-500 focus:border-brand-500 shadow-sm ${passwordError ? 'border-red-300' : 'border-gray-300'}`}
                          placeholder="••••••••"
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
                        >
                          {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </button>
                      </div>

                      {/* Password strength meter */}
                      {accountData.password && (
                        <div className="mt-2">
                          <div className="flex gap-1 mb-2">
                            {[1, 2, 3, 4].map(level => (
                              <div
                                key={level}
                                className={`h-1 flex-1 rounded-full ${level <= passwordStrength.score ? passwordStrength.color : 'bg-gray-200'}`}
                              />
                            ))}
                          </div>
                          <p className={`text-xs font-medium ${passwordStrength.label === 'weak' ? 'text-red-600' :
                            passwordStrength.label === 'fair' ? 'text-yellow-600' :
                              passwordStrength.label === 'good' ? 'text-blue-600' : 'text-green-600'
                            }`}>
                            Password strength: {passwordStrength.label}
                          </p>
                        </div>
                      )}

                      {/* Password requirements */}
                      <div className="mt-3 space-y-1">
                        {PASSWORD_RULES.map(rule => {
                          const passed = passwordStrength.requirements[rule.key as keyof typeof passwordStrength.requirements];
                          return (
                            <div key={rule.key} className={`flex items-center gap-2 text-xs ${passed ? 'text-green-600' : 'text-gray-400'}`}>
                              {passed ? <Check className="h-3 w-3" /> : <X className="h-3 w-3" />}
                              {rule.label}
                            </div>
                          );
                        })}
                      </div>
                      {passwordError && <p className="mt-2 text-xs text-red-600">{passwordError}</p>}
                    </div>

                    {/* Confirm Password */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Confirm Password *</label>
                      <div className="relative mt-1">
                        <input
                          type={showConfirmPassword ? 'text' : 'password'}
                          value={accountData.confirmPassword}
                          onChange={e => setAccountData({ ...accountData, confirmPassword: e.target.value })}
                          className={`block w-full p-2.5 pr-10 border rounded-md focus:ring-brand-500 focus:border-brand-500 shadow-sm ${confirmPasswordError ? 'border-red-300' : 'border-gray-300'}`}
                          placeholder="••••••••"
                        />
                        <button
                          type="button"
                          onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                          className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
                        >
                          {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </button>
                      </div>
                      {accountData.confirmPassword && accountData.password !== accountData.confirmPassword && (
                        <p className="mt-1 text-xs text-red-600">Passwords do not match</p>
                      )}
                      {confirmPasswordError && <p className="mt-1 text-xs text-red-600">{confirmPasswordError}</p>}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Payment Method */}
            <div className="bg-white shadow rounded-lg p-6">
              <h2 className="text-lg font-medium text-gray-900 mb-4 flex items-center gap-2">
                <Truck className="h-5 w-5 text-gray-400" /> Payment
              </h2>
              <div className="border rounded-lg p-4 flex items-center justify-between cursor-pointer border-brand-500 bg-brand-50/20 ring-1 ring-brand-500">
                <div className="flex items-center">
                  <input type="radio" checked readOnly className="h-4 w-4 text-brand-600 focus:ring-brand-500 border-gray-300" />
                  <label className="ml-3 block text-sm font-medium text-gray-900">Cash on Delivery (COD)</label>
                </div>
                <span className="text-xs font-semibold text-brand-600 uppercase tracking-wide">Selected</span>
              </div>
              <p className="mt-3 text-xs text-gray-500">Pay when your order arrives. We'll call to confirm delivery time.</p>
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
                  disabled={isProcessing}
                  className="mt-8 w-full bg-brand-600 text-white py-4 rounded-lg font-bold text-lg hover:bg-brand-700 shadow-lg hover:shadow-brand-500/30 transition-all disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {isProcessing ? (
                    <>Processing...</>
                  ) : (
                    <>Confirm Order <Truck className="h-5 w-5" /></>
                  )}
                </button>

                <div className="mt-4 flex items-center justify-center gap-4 text-xs text-gray-500">
                  <span className="flex items-center gap-1"><ShieldCheck className="h-3 w-3" /> Secure</span>
                  <span className="flex items-center gap-1"><Truck className="h-3 w-3" /> Discreet Shipping</span>
                </div>
              </div>
            </div>
          </section>

        </form>
      </div>
    </div>
  );
};

export default Checkout;