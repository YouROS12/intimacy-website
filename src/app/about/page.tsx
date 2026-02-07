
import React from 'react';
import { Shield, Box, Lock, HelpCircle, CheckCircle } from 'lucide-react';
import Link from 'next/link';
import { useTranslations } from 'next-intl';

export default function AboutPage() {
    const t = useTranslations('about');

    return (
        <div className="bg-white min-h-screen font-sans text-slate-800">
            {/* Hero */}
            <div className="relative bg-slate-900 py-20 overflow-hidden">
                <div className="absolute inset-0 opacity-20">
                    {/* Abstract pattern or gradient */}
                    <div className="absolute inset-0 bg-gradient-to-br from-slate-800 to-black" />
                </div>
                <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-white">
                    <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight mb-6" dangerouslySetInnerHTML={{ __html: t('hero.title') }} />
                    <p className="text-xl text-slate-300 max-w-2xl mx-auto leading-relaxed">
                        {t('hero.subtitle')}
                    </p>
                </div>
            </div>

            {/* The 3 Pillars */}
            <div className="py-16 bg-white">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
                        <div className="text-center p-6 bg-white rounded-xl hover:shadow-lg transition-shadow border border-slate-100">
                            <div className="inline-flex items-center justify-center h-16 w-16 rounded-full bg-brand-50 text-brand-600 mb-6">
                                <Lock className="h-8 w-8" />
                            </div>
                            <h3 className="text-xl font-bold mb-3 text-slate-900">{t('features.private.title')}</h3>
                            <p className="text-slate-600">
                                {t('features.private.description')}
                            </p>
                        </div>
                        <div className="text-center p-6 bg-white rounded-xl hover:shadow-lg transition-shadow border border-slate-100">
                            <div className="inline-flex items-center justify-center h-16 w-16 rounded-full bg-blue-50 text-blue-600 mb-6">
                                <Box className="h-8 w-8" />
                            </div>
                            <h3 className="text-xl font-bold mb-3 text-slate-900">{t('features.discreet.title')}</h3>
                            <p className="text-slate-600">
                                {t('features.discreet.description')}
                            </p>
                        </div>
                        <div className="text-center p-6 bg-white rounded-xl hover:shadow-lg transition-shadow border border-slate-100">
                            <div className="inline-flex items-center justify-center h-16 w-16 rounded-full bg-green-50 text-green-600 mb-6">
                                <Shield className="h-8 w-8" />
                            </div>
                            <h3 className="text-xl font-bold mb-3 text-slate-900">{t('features.authentic.title')}</h3>
                            <p className="text-slate-600">
                                {t('features.authentic.description')}
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Detailed Shipping Section */}
            <div className="bg-slate-50 py-16">
                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-12">
                        <h2 className="text-3xl font-bold text-slate-900">{t('process.title')}</h2>
                        <p className="mt-4 text-slate-600">{t('process.subtitle')}</p>
                    </div>

                    <div className="space-y-8 relative">
                        {/* Connecting Line (Desktop) */}
                        <div className="hidden md:block absolute left-[2.45rem] top-8 bottom-8 w-1 bg-slate-200 z-0"></div>

                        {/* Step 1 */}
                        <div className="relative z-10 bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex gap-4 md:items-center">
                            <div className="flex-shrink-0">
                                <div className="h-12 w-12 rounded-full bg-slate-900 text-white flex items-center justify-center font-bold text-lg shadow-lg">1</div>
                            </div>
                            <div>
                                <h4 className="text-lg font-bold text-slate-900">{t('process.step1.title')}</h4>
                                <p className="text-slate-600">{t('process.step1.description')}</p>
                            </div>
                        </div>

                        {/* Step 2 */}
                        <div className="relative z-10 bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex gap-4 md:items-center">
                            <div className="flex-shrink-0">
                                <div className="h-12 w-12 rounded-full bg-brand-600 text-white flex items-center justify-center font-bold text-lg shadow-lg">2</div>
                            </div>
                            <div>
                                <h4 className="text-lg font-bold text-slate-900">{t('process.step2.title')}</h4>
                                <p className="text-slate-600">{t('process.step2.description')}</p>
                            </div>
                        </div>

                        {/* Step 3 */}
                        <div className="relative z-10 bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex gap-4 md:items-center">
                            <div className="flex-shrink-0">
                                <div className="h-12 w-12 rounded-full bg-slate-900 text-white flex items-center justify-center font-bold text-lg shadow-lg">3</div>
                            </div>
                            <div>
                                <h4 className="text-lg font-bold text-slate-900">{t('process.step3.title')}</h4>
                                <p className="text-slate-600">{t('process.step3.description')}</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* FAQ */}
            <div className="py-16 max-w-3xl mx-auto px-4">
                <h2 className="text-2xl font-bold text-slate-900 mb-8 text-center">{t('faq.title')}</h2>
                <div className="space-y-6">
                    <div className="bg-white border border-gray-200 rounded-lg p-6">
                        <h3 className="text-lg font-bold text-slate-900 flex items-start gap-3">
                            <HelpCircle className="h-6 w-6 text-brand-600 flex-shrink-0" />
                            {t('faq.q1.question')}
                        </h3>
                        <p className="mt-3 text-slate-600 pl-9">{t('faq.q1.answer')}</p>
                    </div>
                    <div className="bg-white border border-gray-200 rounded-lg p-6">
                        <h3 className="text-lg font-bold text-slate-900 flex items-start gap-3">
                            <HelpCircle className="h-6 w-6 text-brand-600 flex-shrink-0" />
                            {t('faq.q2.question')}
                        </h3>
                        <p className="mt-3 text-slate-600 pl-9">{t('faq.q2.answer')}</p>
                    </div>
                    <div className="bg-white border border-gray-200 rounded-lg p-6">
                        <h3 className="text-lg font-bold text-slate-900 flex items-start gap-3">
                            <HelpCircle className="h-6 w-6 text-brand-600 flex-shrink-0" />
                            {t('faq.q3.question')}
                        </h3>
                        <p className="mt-3 text-slate-600 pl-9">{t('faq.q3.answer')}</p>
                    </div>
                </div>
            </div>

            {/* Quality Guarantee */}
            <div className="bg-white border-t border-slate-100 py-16">
                <div className="max-w-7xl mx-auto px-4 text-center">
                    <h2 className="text-2xl font-bold text-slate-900 mb-12">{t('guarantee.title')}</h2>
                    <div className="flex flex-wrap justify-center gap-8">
                        <div className="flex items-center gap-2 px-6 py-3 bg-gray-50 rounded-full text-gray-700 font-medium border border-gray-200">
                            <CheckCircle className="h-5 w-5 text-green-500" /> {t('guarantee.items.original')}
                        </div>
                        <div className="flex items-center gap-2 px-6 py-3 bg-gray-50 rounded-full text-gray-700 font-medium border border-gray-200">
                            <CheckCircle className="h-5 w-5 text-green-500" /> {t('guarantee.items.dates')}
                        </div>
                        <div className="flex items-center gap-2 px-6 py-3 bg-gray-50 rounded-full text-gray-700 font-medium border border-gray-200">
                            <CheckCircle className="h-5 w-5 text-green-500" /> {t('guarantee.items.clinical')}
                        </div>
                    </div>
                </div>
            </div>

            {/* CTA */}
            <div className="bg-slate-900 py-16 text-center">
                <div className="max-w-2xl mx-auto px-4">
                    <h2 className="text-3xl font-bold text-white mb-6">{t('cta.title')}</h2>
                    <Link href="/shop" className="inline-block bg-brand-600 text-white font-bold py-4 px-10 rounded-full hover:bg-brand-700 transition-all shadow-lg hover:shadow-brand-500/50 transform hover:-translate-y-1">
                        {t('cta.button')}
                    </Link>
                </div>
            </div>
        </div>
    );
};
