import React from 'react';
import { Shield, Box, Lock, HelpCircle, CheckCircle } from 'lucide-react';
import { Link } from 'react-router-dom';

const About: React.FC = () => {
  return (
    <div className="bg-white min-h-screen font-sans text-slate-800">
        {/* Hero */}
        <div className="relative bg-slate-900 py-20 overflow-hidden">
            <div className="absolute inset-0 opacity-20">
                 {/* Abstract pattern or gradient */}
                 <div className="absolute inset-0 bg-gradient-to-br from-slate-800 to-black" />
            </div>
            <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-white">
                <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight mb-6">
                    Wellness, Privacy, & <span className="text-brand-400">Trust</span>.
                </h1>
                <p className="text-xl text-slate-300 max-w-2xl mx-auto leading-relaxed">
                    We are Morocco's premier destination for intimate wellness products. 
                    We believe sexual health should be accessible, safe, and completely judgment-free.
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
                        <h3 className="text-xl font-bold mb-3 text-slate-900">100% Private</h3>
                        <p className="text-slate-600">
                            Your data is encrypted. We never sell your information. Your order history is yours alone and secured.
                        </p>
                    </div>
                    <div className="text-center p-6 bg-white rounded-xl hover:shadow-lg transition-shadow border border-slate-100">
                        <div className="inline-flex items-center justify-center h-16 w-16 rounded-full bg-blue-50 text-blue-600 mb-6">
                            <Box className="h-8 w-8" />
                        </div>
                        <h3 className="text-xl font-bold mb-3 text-slate-900">Discreet Delivery</h3>
                        <p className="text-slate-600">
                            Delivered in unbranded, plain packaging. The shipping label is generic. Even the courier doesn't know what's inside.
                        </p>
                    </div>
                    <div className="text-center p-6 bg-white rounded-xl hover:shadow-lg transition-shadow border border-slate-100">
                        <div className="inline-flex items-center justify-center h-16 w-16 rounded-full bg-green-50 text-green-600 mb-6">
                            <Shield className="h-8 w-8" />
                        </div>
                        <h3 className="text-xl font-bold mb-3 text-slate-900">Authentic Brands</h3>
                        <p className="text-slate-600">
                            We are authorized retailers for Durex, Manix, and other premium global brands. No counterfeits, ever.
                        </p>
                    </div>
                </div>
            </div>
        </div>

        {/* Detailed Shipping Section */}
        <div className="bg-slate-50 py-16">
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-center mb-12">
                    <h2 className="text-3xl font-bold text-slate-900">How Our Discreet Shipping Works</h2>
                    <p className="mt-4 text-slate-600">We understand that privacy is your #1 concern. Here is exactly what happens when you order.</p>
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
                            <h4 className="text-lg font-bold text-slate-900">Plain Packaging</h4>
                            <p className="text-slate-600">Your items are packed in a standard brown cardboard box or opaque courier flyer. There are no logos, no "Intimacy Wellness" branding, and no pictures on the outside.</p>
                        </div>
                    </div>

                    {/* Step 2 */}
                    <div className="relative z-10 bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex gap-4 md:items-center">
                        <div className="flex-shrink-0">
                            <div className="h-12 w-12 rounded-full bg-brand-600 text-white flex items-center justify-center font-bold text-lg shadow-lg">2</div>
                        </div>
                        <div>
                            <h4 className="text-lg font-bold text-slate-900">Generic Shipping Label</h4>
                            <p className="text-slate-600">The shipping label lists the sender as "IW Logistics" or a generic fulfillment name. The content description simply says "Personal Care" or "Accessories".</p>
                        </div>
                    </div>

                    {/* Step 3 */}
                    <div className="relative z-10 bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex gap-4 md:items-center">
                        <div className="flex-shrink-0">
                            <div className="h-12 w-12 rounded-full bg-slate-900 text-white flex items-center justify-center font-bold text-lg shadow-lg">3</div>
                        </div>
                        <div>
                            <h4 className="text-lg font-bold text-slate-900">Private Delivery</h4>
                            <p className="text-slate-600">The courier hands you the sealed package. We currently support Cash on Delivery (COD) so you can pay privately upon receipt without online bank records.</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        {/* FAQ */}
        <div className="py-16 max-w-3xl mx-auto px-4">
            <h2 className="text-2xl font-bold text-slate-900 mb-8 text-center">Frequently Asked Questions</h2>
            <div className="space-y-6">
                <div className="bg-white border border-gray-200 rounded-lg p-6">
                    <h3 className="text-lg font-bold text-slate-900 flex items-start gap-3">
                        <HelpCircle className="h-6 w-6 text-brand-600 flex-shrink-0" />
                        Can the delivery person see what's inside?
                    </h3>
                    <p className="mt-3 text-slate-600 pl-9">Absolutely not. The package is sealed before it leaves our warehouse. The courier has no information about the contents.</p>
                </div>
                <div className="bg-white border border-gray-200 rounded-lg p-6">
                    <h3 className="text-lg font-bold text-slate-900 flex items-start gap-3">
                        <HelpCircle className="h-6 w-6 text-brand-600 flex-shrink-0" />
                        What shows up on my bank statement?
                    </h3>
                    <p className="mt-3 text-slate-600 pl-9">If you pay online (feature coming soon), it appears as "IW Store". However, we primarily use Cash on Delivery (COD), so there is no bank record of the purchase.</p>
                </div>
                <div className="bg-white border border-gray-200 rounded-lg p-6">
                    <h3 className="text-lg font-bold text-slate-900 flex items-start gap-3">
                        <HelpCircle className="h-6 w-6 text-brand-600 flex-shrink-0" />
                        Do you sell products for under 18?
                    </h3>
                    <p className="mt-3 text-slate-600 pl-9">No. We strictly sell to adults 18+. By using our site, you confirm you are of legal age.</p>
                </div>
            </div>
        </div>

        {/* Quality Guarantee */}
        <div className="bg-white border-t border-slate-100 py-16">
            <div className="max-w-7xl mx-auto px-4 text-center">
                 <h2 className="text-2xl font-bold text-slate-900 mb-12">Our Quality Guarantee</h2>
                 <div className="flex flex-wrap justify-center gap-8">
                    <div className="flex items-center gap-2 px-6 py-3 bg-gray-50 rounded-full text-gray-700 font-medium border border-gray-200">
                        <CheckCircle className="h-5 w-5 text-green-500" /> Original Products
                    </div>
                    <div className="flex items-center gap-2 px-6 py-3 bg-gray-50 rounded-full text-gray-700 font-medium border border-gray-200">
                        <CheckCircle className="h-5 w-5 text-green-500" /> Long Expiry Dates
                    </div>
                    <div className="flex items-center gap-2 px-6 py-3 bg-gray-50 rounded-full text-gray-700 font-medium border border-gray-200">
                        <CheckCircle className="h-5 w-5 text-green-500" /> Clinically Tested
                    </div>
                 </div>
            </div>
        </div>

        {/* CTA */}
        <div className="bg-slate-900 py-16 text-center">
            <div className="max-w-2xl mx-auto px-4">
                <h2 className="text-3xl font-bold text-white mb-6">Ready to shop with confidence?</h2>
                <Link to="/shop" className="inline-block bg-brand-600 text-white font-bold py-4 px-10 rounded-full hover:bg-brand-700 transition-all shadow-lg hover:shadow-brand-500/50 transform hover:-translate-y-1">
                    Browse Shop Now
                </Link>
            </div>
        </div>
    </div>
  );
};
export default About;