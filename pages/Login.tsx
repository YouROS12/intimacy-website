import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { ShieldCheck, MapPin, Phone, User as UserIcon, Lock, ArrowLeft, Building, AlertCircle } from 'lucide-react';
import { getMoroccanCities } from '../services/api';
import { validateMoroccanPhone, formatAddress } from '../utils/helpers';
import { sanitizeInput, sanitizeEmail, sanitizePhone } from '../utils/sanitize';

const Login: React.FC = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  // Profile Data
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [city, setCity] = useState('Casablanca');
  const [cities, setCities] = useState<string[]>([]);

  const [error, setError] = useState('');
  const [fieldErrors, setFieldErrors] = useState<{ phone?: string, password?: string }>({});
  const [loading, setLoading] = useState(false);

  const { login, signup } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const from = location.state?.from?.pathname || '/';

  useEffect(() => {
    getMoroccanCities().then(setCities);
  }, []);

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    if (value === '' || /^\d+$/.test(value)) {
      setPhone(value);
      // Real-time validation clear
      if (validateMoroccanPhone(value)) {
        setFieldErrors(prev => ({ ...prev, phone: undefined }));
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setFieldErrors({});
    setLoading(true);

    try {
      if (isLogin) {
        await login(email, password);
        navigate(from, { replace: true });
      } else {
        // --- Strict Validations ---
        let hasError = false;
        const newFieldErrors: any = {};

        if (password !== confirmPassword) {
          setError("Passwords do not match.");
          return; // Stop immediately
        }
        if (password.length < 6) {
          newFieldErrors.password = "Password must be at least 6 characters.";
          hasError = true;
        }
        if (!fullName.trim()) {
          setError("Full Name is required.");
          hasError = true;
        }
        if (!validateMoroccanPhone(phone)) {
          newFieldErrors.phone = "Invalid Moroccan number. Use format 06XXXXXXXX.";
          hasError = true;
        }
        if (!address.trim()) {
          setError("Street address is required.");
          hasError = true;
        }

        if (hasError) {
          setFieldErrors(newFieldErrors);
          throw new Error("Please fix the errors in the form.");
        }

        // Sanitize all inputs before submission
        const sanitizedEmail = sanitizeEmail(email);
        const sanitizedName = sanitizeInput(fullName);
        const sanitizedPhone = sanitizePhone(phone);
        const sanitizedAddress = sanitizeInput(address);
        const fullAddress = formatAddress(city, sanitizedAddress);

        // --- Database Insertion ---
        await signup(sanitizedEmail, password, sanitizedName, sanitizedPhone, fullAddress);

        setIsLogin(true);
        setError("Account created successfully! Please check your email to verify before signing in.");
        // Clear form
        setPassword('');
        setConfirmPassword('');
      }
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Authentication failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8 relative">
      <button
        onClick={() => navigate('/')}
        className="absolute top-8 left-8 text-gray-500 hover:text-brand-600 flex items-center gap-2"
      >
        <ArrowLeft className="h-5 w-5" /> Back to Store
      </button>

      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="flex justify-center">
          <ShieldCheck className="h-12 w-12 text-brand-600" />
        </div>
        <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
          {isLogin ? 'Sign in to your account' : 'Create a New Account'}
        </h2>
        <p className="mt-2 text-center text-sm text-gray-600">
          {from.includes('checkout')
            ? <span className="text-brand-600 font-medium">Please sign in to complete your order.</span>
            : 'Join our discreet community.'}
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          <form className="space-y-6" onSubmit={handleSubmit}>
            {error && (
              <div className={`p-3 rounded text-sm border ${error.includes('created') ? 'bg-green-50 text-green-700 border-green-200' : 'bg-red-50 text-red-700 border-red-200'}`}>
                {error}
              </div>
            )}

            {/* Email Field */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                Email address
              </label>
              <div className="mt-1">
                <input
                  id="email"
                  name="email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-brand-500 focus:border-brand-500 sm:text-sm"
                />
              </div>
            </div>

            {/* Additional Fields for Signup */}
            {!isLogin && (
              <>
                <div>
                  <label htmlFor="fullName" className="block text-sm font-medium text-gray-700">Full Name</label>
                  <div className="mt-1 relative rounded-md shadow-sm">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <UserIcon className="h-4 w-4 text-gray-400" />
                    </div>
                    <input
                      id="fullName"
                      type="text"
                      required
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      className="focus:ring-brand-500 focus:border-brand-500 block w-full pl-10 sm:text-sm border-gray-300 rounded-md py-2 border"
                      placeholder="John Doe"
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="phone" className="block text-sm font-medium text-gray-700">Phone Number</label>
                  <div className="mt-1 relative rounded-md shadow-sm">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Phone className="h-4 w-4 text-gray-400" />
                    </div>
                    <input
                      id="phone"
                      type="tel"
                      inputMode="numeric"
                      pattern="[0-9]*"
                      required
                      value={phone}
                      onChange={handlePhoneChange}
                      className={`focus:ring-brand-500 focus:border-brand-500 block w-full pl-10 sm:text-sm border rounded-md py-2 ${fieldErrors.phone ? 'border-red-300' : 'border-gray-300'}`}
                      placeholder="0600000000"
                    />
                  </div>
                  {fieldErrors.phone && <p className="mt-1 text-xs text-red-600">{fieldErrors.phone}</p>}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="city" className="block text-sm font-medium text-gray-700">City</label>
                    <div className="mt-1 relative rounded-md shadow-sm">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Building className="h-4 w-4 text-gray-400" />
                      </div>
                      <select
                        id="city"
                        value={city}
                        onChange={(e) => setCity(e.target.value)}
                        className="focus:ring-brand-500 focus:border-brand-500 block w-full pl-10 sm:text-sm border-gray-300 rounded-md py-2 border bg-white"
                      >
                        {cities.map(c => <option key={c} value={c}>{c}</option>)}
                      </select>
                    </div>
                  </div>
                  <div>
                    <label htmlFor="address" className="block text-sm font-medium text-gray-700">Home Address</label>
                    <div className="mt-1 relative rounded-md shadow-sm">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <MapPin className="h-4 w-4 text-gray-400" />
                      </div>
                      <input
                        id="address"
                        type="text"
                        required
                        value={address}
                        onChange={(e) => setAddress(e.target.value)}
                        className="focus:ring-brand-500 focus:border-brand-500 block w-full pl-10 sm:text-sm border-gray-300 rounded-md py-2 border"
                        placeholder="Street, Apt..."
                      />
                    </div>
                  </div>
                </div>
              </>
            )}

            {/* Password Fields */}
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                Password
              </label>
              <div className="mt-1 relative rounded-md shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-4 w-4 text-gray-400" />
                </div>
                <input
                  id="password"
                  name="password"
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="appearance-none block w-full pl-10 px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-brand-500 focus:border-brand-500 sm:text-sm"
                />
              </div>
              {fieldErrors.password && <p className="mt-1 text-xs text-red-600">{fieldErrors.password}</p>}
            </div>

            {!isLogin && (
              <div>
                <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">
                  Confirm Password
                </label>
                <div className="mt-1 relative rounded-md shadow-sm">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Lock className="h-4 w-4 text-gray-400" />
                  </div>
                  <input
                    id="confirmPassword"
                    name="confirmPassword"
                    type="password"
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className={`appearance-none block w-full pl-10 px-3 py-2 border rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-brand-500 focus:border-brand-500 sm:text-sm ${confirmPassword && password !== confirmPassword ? 'border-red-300' : 'border-gray-300'
                      }`}
                  />
                </div>
                {confirmPassword && password !== confirmPassword && (
                  <p className="mt-1 text-xs text-red-600">Passwords do not match</p>
                )}
              </div>
            )}

            <div>
              <button
                type="submit"
                disabled={loading}
                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-brand-600 hover:bg-brand-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-500 disabled:opacity-50"
              >
                {loading ? 'Processing...' : (isLogin ? 'Sign in' : 'Create Account')}
              </button>
            </div>
          </form>

          <div className="mt-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-gray-500">
                  {isLogin ? 'New to the store?' : 'Already have an account?'}
                </span>
              </div>
            </div>

            <div className="mt-6">
              <button
                onClick={() => {
                  setIsLogin(!isLogin);
                  setError('');
                  setFieldErrors({});
                }}
                className="w-full flex justify-center py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none"
              >
                {isLogin ? 'Create Account' : 'Back to Login'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;