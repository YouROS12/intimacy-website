import React, { useState, useEffect } from 'react';
import { ShieldAlert } from 'lucide-react';

const AgeGate: React.FC = () => {
  const [showGate, setShowGate] = useState(false);

  useEffect(() => {
    const hasVerified = localStorage.getItem('age_verified');
    if (!hasVerified) {
      setShowGate(true);
    }
  }, []);

  const handleVerify = () => {
    localStorage.setItem('age_verified', 'true');
    setShowGate(false);
  };

  const handleExit = () => {
    window.location.href = 'https://www.google.com';
  };

  if (!showGate) return null;

  return (
    <div className="fixed inset-0 z-[100] bg-slate-900 bg-opacity-95 flex items-center justify-center p-4 backdrop-blur-md">
      <div className="bg-white rounded-2xl max-w-md w-full p-8 text-center shadow-2xl border border-gray-200">
        <div className="flex justify-center mb-6">
          <div className="bg-brand-100 p-4 rounded-full">
            <ShieldAlert className="h-10 w-10 text-brand-600" />
          </div>
        </div>
        
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Age Verification Required</h2>
        <p className="text-gray-600 mb-8 leading-relaxed">
          This website contains products intended for adults (18+). 
          By entering, you confirm that you are at least 18 years of age.
        </p>

        <div className="space-y-4">
          <button 
            onClick={handleVerify}
            className="w-full bg-brand-600 text-white font-bold py-4 rounded-xl hover:bg-brand-700 transition-colors shadow-lg shadow-brand-500/30"
          >
            I am 18 or older - Enter
          </button>
          
          <button 
            onClick={handleExit}
            className="w-full bg-gray-100 text-gray-500 font-medium py-3 rounded-xl hover:bg-gray-200 transition-colors"
          >
            I am under 18 - Exit
          </button>
        </div>
        <p className="mt-6 text-xs text-gray-400">
            IntimacyWellness promotes responsible sexual health and wellness.
        </p>
      </div>
    </div>
  );
};

export default AgeGate;