
import Link from 'next/link';
import React from 'react';

type Tab = {
    path: string;
    label: string;
};

const tabs: Tab[] = [
    { path: '/legal/privacy', label: 'Politique de Confidentialité' },
    { path: '/legal/terms', label: 'Conditions Générales' },
    { path: '/legal/returns', label: 'Politique de Retour' },
];

export default function LegalLayout({
    children,
    activeTab
}: {
    children: React.ReactNode,
    activeTab: 'privacy' | 'terms' | 'returns'
}) {
    return (
        <div className="bg-white min-h-screen py-16 px-4 sm:px-6 lg:px-8">
            <div className="max-w-3xl mx-auto">
                {/* Tab Navigation */}
                <div className="mb-8 border-b border-gray-200 pb-4">
                    <div className="flex flex-wrap gap-4">
                        {tabs.map(tab => {
                            const isActive = tab.path.includes(activeTab);
                            return (
                                <Link
                                    key={tab.path}
                                    href={tab.path}
                                    className={`text-sm sm:text-base font-medium transition-colors ${isActive
                                        ? 'text-brand-600 border-b-2 border-brand-600 pb-2'
                                        : 'text-gray-500 hover:text-gray-900'
                                        }`}
                                >
                                    {tab.label}
                                </Link>
                            )
                        })}
                    </div>
                </div>

                {/* Content */}
                {children}
            </div>
        </div>
    );
}
