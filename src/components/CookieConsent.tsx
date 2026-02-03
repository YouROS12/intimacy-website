"use client";

import React, { useState, useEffect } from 'react';

const CookieConsent: React.FC = () => {
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        // Safe access to localStorage in client component
        const consent = localStorage.getItem('cookie_consent');
        if (!consent) {
            setIsVisible(true);
        }
    }, []);

    const accept = () => {
        localStorage.setItem('cookie_consent', 'true');
        setIsVisible(false);
    };

    if (!isVisible) return null;

    return (
        <div className="fixed bottom-0 left-0 right-0 bg-slate-900 text-white p-4 z-[60] shadow-lg border-t border-slate-700 animate-fade-in-up">
            <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="text-sm text-slate-300">
                    <p>
                        Nous utilisons des cookies pour améliorer votre expérience et assurer le bon fonctionnement du site.
                        En continuant à naviguer, vous acceptez notre utilisation des cookies.
                    </p>
                </div>
                <div className="flex gap-4">
                    <button
                        onClick={accept}
                        className="bg-brand-600 hover:bg-brand-700 text-white px-6 py-2 rounded-full text-sm font-bold transition-colors whitespace-nowrap"
                    >
                        Accepter & Fermer
                    </button>
                </div>
            </div>
        </div>
    );
};

export default CookieConsent;
