import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Shield, Package, Lock, ChevronRight, Droplet, Clock } from 'lucide-react';
import { getFeaturedProducts } from '../services/api';
import { Product } from '../types';
import LoveAtmosphere from '../components/LoveAtmosphere';
import SeoHead from '../components/SeoHead';

const Home: React.FC = () => {
    const [featuredProducts, setFeaturedProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        getFeaturedProducts().then(products => {
            setFeaturedProducts(products);
            setLoading(false);
        });
    }, []);

    return (
        <div className="bg-white">
            <SeoHead
                title="Premium Sexual Wellness Morocco"
                description="Discreet delivery of condoms, lubricants, and delay sprays in Morocco. Authentic brands, plain packaging, and 100% privacy guaranteed."
            />

            {/* Hero Section - Modernized & Dynamic */}
            <div className="relative bg-slate-900 overflow-hidden">
                {/* Dynamic Heart Background */}
                <LoveAtmosphere />

                <div className="absolute inset-0">
                    <img
                        className="w-full h-full object-cover opacity-40 mix-blend-overlay"
                        src="https://images.unsplash.com/photo-1620916566398-39f1143ab7be?q=80&w=1920&auto=format&fit=crop"
                        alt="Wellness background"
                    />
                    <div className="absolute inset-0 bg-gradient-to-r from-slate-900 via-slate-900/90 to-slate-900/30" />
                </div>

                <div className="relative max-w-7xl mx-auto py-24 px-4 sm:py-32 sm:px-6 lg:px-8 flex flex-col justify-center min-h-[600px]">
                    <div className="max-w-2xl relative z-10">
                        <span className="inline-block py-1 px-3 rounded-full bg-brand-500/20 text-brand-300 text-sm font-semibold mb-6 border border-brand-500/30 backdrop-blur-sm animate-pulse_slow">
                            #1 Wellness Store in Morocco
                        </span>
                        <h1 className="text-4xl font-extrabold tracking-tight text-white sm:text-5xl lg:text-7xl mb-6 leading-tight">
                            Intimacy, <br />
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-300 to-brand-500">Elevated.</span>
                        </h1>
                        <p className="mt-4 text-xl text-slate-300 max-w-xl leading-relaxed">
                            Experience premium sexual wellness with absolute confidence.
                            We deliver authentic international brands to your doorstep in
                            <span className="text-white font-semibold"> completely plain packaging</span>.
                        </p>
                        <div className="mt-10 flex flex-col sm:flex-row gap-4">
                            <Link
                                to="/shop"
                                className="inline-flex justify-center items-center px-8 py-4 border border-transparent text-base font-bold rounded-full text-white bg-brand-600 hover:bg-brand-700 md:text-lg transition-all shadow-lg hover:shadow-brand-500/30 animate-heartbeat"
                            >
                                Start Shopping <ArrowRight className="ml-2 h-5 w-5" />
                            </Link>
                            <Link
                                to="/about"
                                className="inline-flex justify-center items-center px-8 py-4 border border-slate-600 text-base font-bold rounded-full text-slate-200 hover:bg-slate-800 md:text-lg transition-all backdrop-blur-sm bg-white/5"
                            >
                                How We Ship Discreetly
                            </Link>
                        </div>
                    </div>
                </div>
            </div>

            {/* Category Quick Links */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-16 relative z-10">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {/* Category 1 */}
                    <Link to="/shop?q=Condom" className="group bg-white p-6 rounded-2xl shadow-xl hover:shadow-2xl hover:-translate-y-1 transition-all duration-300 border border-gray-100 flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <div className="p-4 bg-blue-50 rounded-xl text-blue-600 group-hover:bg-blue-600 group-hover:text-white transition-colors duration-300">
                                <Shield className="h-8 w-8" />
                            </div>
                            <div>
                                <h3 className="font-bold text-gray-900 text-lg">Condoms</h3>
                                <p className="text-sm text-gray-500">Safe & Sensitive</p>
                            </div>
                        </div>
                        <div className="h-8 w-8 rounded-full bg-gray-50 flex items-center justify-center text-gray-400 group-hover:bg-brand-50 group-hover:text-brand-600 transition-colors">
                            <ChevronRight className="h-5 w-5" />
                        </div>
                    </Link>

                    {/* Category 2 */}
                    <Link to="/shop?q=Lubricant" className="group bg-white p-6 rounded-2xl shadow-xl hover:shadow-2xl hover:-translate-y-1 transition-all duration-300 border border-gray-100 flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <div className="p-4 bg-pink-50 rounded-xl text-pink-600 group-hover:bg-pink-600 group-hover:text-white transition-colors duration-300">
                                <Droplet className="h-8 w-8" />
                            </div>
                            <div>
                                <h3 className="font-bold text-gray-900 text-lg">Lubricants</h3>
                                <p className="text-sm text-gray-500">Smooth & Silky</p>
                            </div>
                        </div>
                        <div className="h-8 w-8 rounded-full bg-gray-50 flex items-center justify-center text-gray-400 group-hover:bg-brand-50 group-hover:text-brand-600 transition-colors">
                            <ChevronRight className="h-5 w-5" />
                        </div>
                    </Link>

                    {/* Category 3 */}
                    <Link to="/shop?q=Delay" className="group bg-white p-6 rounded-2xl shadow-xl hover:shadow-2xl hover:-translate-y-1 transition-all duration-300 border border-gray-100 flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <div className="p-4 bg-purple-50 rounded-xl text-purple-600 group-hover:bg-purple-600 group-hover:text-white transition-colors duration-300">
                                <Clock className="h-8 w-8" />
                            </div>
                            <div>
                                <h3 className="font-bold text-gray-900 text-lg">Delay Sprays</h3>
                                <p className="text-sm text-gray-500">Last Longer</p>
                            </div>
                        </div>
                        <div className="h-8 w-8 rounded-full bg-gray-50 flex items-center justify-center text-gray-400 group-hover:bg-brand-50 group-hover:text-brand-600 transition-colors">
                            <ChevronRight className="h-5 w-5" />
                        </div>
                    </Link>
                </div>
            </div>

            {/* Features Grid with Background Blob Animation */}
            <div className="py-24 bg-white relative overflow-hidden">
                {/* Animated Background Blobs */}
                <div className="absolute top-0 left-0 w-72 h-72 bg-brand-100 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob"></div>
                <div className="absolute top-0 right-0 w-72 h-72 bg-purple-100 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-2000"></div>
                <div className="absolute -bottom-8 left-20 w-72 h-72 bg-pink-100 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-4000"></div>

                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl font-bold text-gray-900 sm:text-4xl">Why Choose Us?</h2>
                        <p className="mt-4 text-lg text-gray-500">We prioritize your experience, privacy, and health above all else.</p>
                    </div>
                    <div className="grid grid-cols-1 gap-12 sm:grid-cols-3">
                        <div className="flex flex-col items-center text-center group">
                            <div className="flex items-center justify-center h-20 w-20 rounded-full bg-brand-50 text-brand-600 mb-6 shadow-sm group-hover:scale-110 transition-transform duration-300">
                                <Package className="h-10 w-10" />
                            </div>
                            <h3 className="text-xl font-bold text-gray-900">100% Blind Packaging</h3>
                            <p className="mt-4 text-base text-gray-500 leading-relaxed">
                                No logos, no branding, no product descriptions on the box. The courier won't even know what's inside.
                            </p>
                        </div>
                        <div className="flex flex-col items-center text-center group">
                            <div className="flex items-center justify-center h-20 w-20 rounded-full bg-blue-50 text-blue-600 mb-6 shadow-sm group-hover:scale-110 transition-transform duration-300">
                                <Shield className="h-10 w-10" />
                            </div>
                            <h3 className="text-xl font-bold text-gray-900">Authentic Brands</h3>
                            <p className="mt-4 text-base text-gray-500 leading-relaxed">
                                We only stock certified international brands like Durex and Manix. Quality you can trust.
                            </p>
                        </div>
                        <div className="flex flex-col items-center text-center group">
                            <div className="flex items-center justify-center h-20 w-20 rounded-full bg-green-50 text-green-600 mb-6 shadow-sm group-hover:scale-110 transition-transform duration-300">
                                <Lock className="h-10 w-10" />
                            </div>
                            <h3 className="text-xl font-bold text-gray-900">Secure & Private</h3>
                            <p className="mt-4 text-base text-gray-500 leading-relaxed">
                                Your data is encrypted. We never share your information with third parties beyond delivery necessities.
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Featured Products */}
            <div className="bg-gray-50 py-24">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-end mb-12">
                        <div>
                            <h2 className="text-3xl font-bold text-slate-900">Trending Now</h2>
                            <p className="mt-2 text-gray-600">Our most popular essentials this week.</p>
                        </div>
                        <Link to="/shop" className="hidden sm:flex items-center text-brand-600 font-semibold hover:text-brand-700 transition-colors">
                            View All <ArrowRight className="ml-2 h-5 w-5" />
                        </Link>
                    </div>

                    {loading ? (
                        <div className="flex justify-center py-20">
                            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-600"></div>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 gap-y-10 gap-x-6 sm:grid-cols-2 lg:grid-cols-4 xl:gap-x-8">
                            {featuredProducts.map((product) => (
                                <Link key={product.id} to={`/product/${product.id}`} className="group bg-white rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden flex flex-col">
                                    <div className="aspect-w-1 aspect-h-1 w-full bg-gray-200 relative overflow-hidden">
                                        <img
                                            src={product.imageUrl}
                                            alt={product.name}
                                            loading="lazy"
                                            className="h-64 w-full object-cover object-center group-hover:scale-105 transition-transform duration-500"
                                        />
                                        <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm px-2 py-1 rounded text-xs font-bold text-gray-900 shadow-sm">
                                            {product.price} MAD
                                        </div>
                                    </div>
                                    <div className="p-6 flex flex-col flex-1">
                                        <p className="text-xs font-medium text-brand-600 mb-2 uppercase tracking-wide">{product.category}</p>
                                        <h3 className="text-lg font-bold text-gray-900 group-hover:text-brand-600 transition-colors mb-2">
                                            {product.name}
                                        </h3>
                                        <p className="text-sm text-gray-500 line-clamp-2 mb-4 flex-1">{product.description}</p>
                                        <div className="flex items-center text-sm font-medium text-brand-600 group-hover:translate-x-1 transition-transform">
                                            View Details <ArrowRight className="ml-1 h-4 w-4" />
                                        </div>
                                    </div>
                                </Link>
                            ))}
                        </div>
                    )}

                    <div className="mt-12 text-center sm:hidden">
                        <Link to="/shop" className="inline-flex items-center text-brand-600 font-semibold hover:text-brand-500">
                            View All Products <ArrowRight className="ml-2 h-5 w-5" />
                        </Link>
                    </div>
                </div>
            </div>

            {/* Trust Banner */}
            <div className="bg-slate-900 py-12">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row justify-center items-center gap-8 text-center md:text-left">
                    <div>
                        <h2 className="text-2xl font-bold text-white mb-2">Not sure what you need?</h2>
                        <p className="text-slate-300">Our AI assistant is here to help you discreetly find the perfect product.</p>
                    </div>
                    <div className="flex items-center gap-2 px-6 py-3 bg-white/10 rounded-full border border-white/20 text-white backdrop-blur-sm hover:bg-white/20 transition-colors cursor-pointer">
                        <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                        <span className="font-medium">AI Expert Online</span>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Home;