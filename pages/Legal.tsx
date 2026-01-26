import React from 'react';
import { Link, useLocation } from 'react-router-dom';

const Legal: React.FC = () => {
  const location = useLocation();
  const isPrivacy = location.pathname.includes('privacy');

  return (
    <div className="bg-white min-h-screen py-16 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        <div className="mb-8 border-b border-gray-200 pb-4">
            <div className="flex gap-4">
                <Link to="/legal/privacy" className={`text-lg font-medium ${isPrivacy ? 'text-brand-600 underline' : 'text-gray-500 hover:text-gray-900'}`}>Privacy Policy</Link>
                <Link to="/legal/terms" className={`text-lg font-medium ${!isPrivacy ? 'text-brand-600 underline' : 'text-gray-500 hover:text-gray-900'}`}>Terms of Service</Link>
            </div>
        </div>

        {isPrivacy ? (
            <div className="prose prose-slate">
                <h1>Privacy Policy</h1>
                <p className="text-sm text-gray-500">Last updated: {new Date().toLocaleDateString()}</p>
                
                <h3>1. Introduction</h3>
                <p>IntimacyWellness Morocco ("we", "us") is committed to protecting your privacy. This policy explains how we collect and use your data.</p>
                
                <h3>2. Data We Collect</h3>
                <p>We collect information necessary to process your orders, including name, shipping address, and phone number. We do not store credit card details.</p>
                
                <h3>3. Discreet Shipping</h3>
                <p>We use third-party couriers. Your data is shared with them solely for delivery purposes. The package label does not describe the contents.</p>
                
                <h3>4. Data Security</h3>
                <p>We implement security measures to maintain the safety of your personal information.</p>
            </div>
        ) : (
            <div className="prose prose-slate">
                <h1>Terms of Service</h1>
                <p className="text-sm text-gray-500">Last updated: {new Date().toLocaleDateString()}</p>

                <h3>1. Acceptance of Terms</h3>
                <p>By accessing this website, you agree to be bound by these Terms and Conditions.</p>

                <h3>2. Age Restriction</h3>
                <p>You must be at least 18 years old to purchase from this site.</p>

                <h3>3. Products</h3>
                <p>All products are sold for wellness purposes. We are not responsible for misuse of products.</p>

                <h3>4. Returns</h3>
                <p>Due to the intimate nature of our products, we cannot accept returns on opened items for hygiene reasons.</p>
            </div>
        )}
      </div>
    </div>
  );
};

export default Legal;