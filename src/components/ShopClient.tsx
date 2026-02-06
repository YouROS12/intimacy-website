"use client";

import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { Filter, Search, ChevronDown, X, SlidersHorizontal, Check } from 'lucide-react';
import { Product, ProductCategory } from '@/types';
import ProductCard from './ProductCard';

interface ShopClientProps {
    initialProducts: Product[];
}

const ShopClientContent: React.FC<ShopClientProps> = ({ initialProducts }) => {
    const router = useRouter();
    const searchParams = useSearchParams();

    // Filter States
    const [selectedCategory, setSelectedCategory] = useState<string>(searchParams.get('category') || 'Tout');
    const [selectedBrand, setSelectedBrand] = useState<string>(searchParams.get('brand') || 'Tout');
    const [priceRange, setPriceRange] = useState<[number, number]>([
        Number(searchParams.get('minPrice')) || 0,
        Number(searchParams.get('maxPrice')) || 2000
    ]);
    const [sortBy, setSortBy] = useState<string>(searchParams.get('sort') || 'featured');
    const [visibleCount, setVisibleCount] = useState<number>(24);
    const [searchQuery, setSearchQuery] = useState(searchParams.get('q') || '');
    const [isMobileFiltersOpen, setIsMobileFiltersOpen] = useState(false);

    // Sync URL with state
    useEffect(() => {
        const params = new URLSearchParams();
        if (selectedCategory !== 'Tout') params.set('category', selectedCategory);
        if (selectedBrand !== 'Tout') params.set('brand', selectedBrand);
        if (priceRange[0] > 0) params.set('minPrice', priceRange[0].toString());
        if (priceRange[1] < 2000) params.set('maxPrice', priceRange[1].toString());
        if (sortBy !== 'featured') params.set('sort', sortBy);
        if (searchQuery) params.set('q', searchQuery);

        // Convert to strings for comparison (sorting keys for consistency)
        const newQueryString = params.toString();
        const currentQueryString = searchParams.toString();

        // Only update if actually different to prevent infinite loops
        if (newQueryString !== currentQueryString) {
            router.replace(`?${newQueryString}`, { scroll: false });
        }
    }, [selectedCategory, selectedBrand, priceRange, sortBy, searchQuery, router, searchParams]);


    // Extract unique brands
    const brands = ['Tout', ...new Set(initialProducts.map(p => p.brand).filter(Boolean))].sort((a, b) => {
        if (a === 'Tout') return -1;
        if (b === 'Tout') return 1;
        return String(a).localeCompare(String(b));
    });

    const filteredProducts = initialProducts
        .filter(p => {
            const matchesCategory = selectedCategory === 'Tout' || p.category === selectedCategory;
            const matchesBrand = selectedBrand === 'Tout' || p.brand === selectedBrand;
            const matchesSearch = searchQuery === '' ||
                p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                p.description.toLowerCase().includes(searchQuery.toLowerCase());
            const matchesPrice = p.price >= priceRange[0] && p.price <= priceRange[1];

            return matchesCategory && matchesBrand && matchesSearch && matchesPrice;
        })
        .sort((a, b) => {
            if (sortBy === 'price-asc') return a.price - b.price;
            if (sortBy === 'price-desc') return b.price - a.price;
            // if (sortBy === 'newest') return new Date(b.created_at || '').getTime() - new Date(a.created_at || '').getTime();
            // Default / Featured sort
            if (sortBy === 'featured') {
                return (b.is_featured ? 1 : 0) - (a.is_featured ? 1 : 0);
            }
            return 0;
        });

    const clearFilters = () => {
        setSelectedCategory('Tout');
        setSelectedBrand('Tout');
        setPriceRange([0, 2000]);
        setSortBy('featured');
        setSearchQuery('');
        setVisibleCount(24);
        router.replace('/shop'); // Clear URL
    };

    const handlePriceChange = (e: React.ChangeEvent<HTMLInputElement>, type: 'min' | 'max') => {
        const val = parseInt(e.target.value) || 0;
        if (type === 'min') setPriceRange([val, priceRange[1]]);
        else setPriceRange([priceRange[0], val]);
    };

    return (
        <div className="bg-cream min-h-screen">

            {/* Mobile Filter Dialog (Overlay) */}
            {isMobileFiltersOpen && (
                <div className="fixed inset-0 z-50 flex">
                    <div className="fixed inset-0 bg-black/50" onClick={() => setIsMobileFiltersOpen(false)}></div>
                    <div className="relative ml-auto flex h-full w-full max-w-xs flex-col overflow-y-auto bg-white py-4 pb-12 shadow-xl">
                        <div className="flex items-center justify-between px-4">
                            <h2 className="text-lg font-serif font-bold text-gray-900">Filtres</h2>
                            <button onClick={() => setIsMobileFiltersOpen(false)} className="-mr-2 flex h-10 w-10 items-center justify-center rounded-md bg-white p-2 text-gray-400">
                                <X className="h-6 w-6" />
                            </button>
                        </div>
                        {/* Mobile Filters Form */}
                        <div className="mt-4 px-4 border-t border-gray-200 py-6">
                            <h3 className="font-serif font-medium text-gray-900">Catégories</h3>
                            <ul className="mt-4 space-y-3">
                                {['Tout', ...Object.values(ProductCategory)].map((cat) => (
                                    <li key={cat}>
                                        <button
                                            onClick={() => setSelectedCategory(cat)}
                                            className={`text-sm ${selectedCategory === cat ? 'text-brand-600 font-bold' : 'text-gray-600'}`}
                                        >
                                            {cat}
                                        </button>
                                    </li>
                                ))}
                            </ul>

                            <h3 className="font-serif font-medium text-gray-900 mt-8">Marques</h3>
                            <ul className="mt-4 space-y-3">
                                {brands.map((brand) => (
                                    <li key={String(brand)}>
                                        <button
                                            onClick={() => setSelectedBrand(String(brand))}
                                            className={`text-sm ${selectedBrand === brand ? 'text-brand-600 font-bold' : 'text-gray-600'}`}
                                        >
                                            {brand}
                                        </button>
                                    </li>
                                ))}
                            </ul>

                            <h3 className="font-serif font-medium text-gray-900 mt-8">Prix</h3>
                            <div className="mt-4 flex items-center mb-4 gap-2">
                                <input type="number" value={priceRange[0]} onChange={(e) => handlePriceChange(e, 'min')} className="w-20 p-2 text-sm border rounded" />
                                <span>-</span>
                                <input type="number" value={priceRange[1]} onChange={(e) => handlePriceChange(e, 'max')} className="w-20 p-2 text-sm border rounded" />
                                <span className="text-xs text-gray-500">MAD</span>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                <div className="flex items-baseline justify-between border-b border-gray-200 pb-6">
                    <h1 className="text-4xl font-serif font-bold tracking-tight text-slate-900">
                        {searchQuery ? `Résultats pour "${searchQuery}"` : 'Boutique'}
                    </h1>

                    <div className="flex items-center">
                        {/* Sort Dropdown */}
                        <div className="relative inline-block text-left mr-4">
                            <select
                                value={sortBy}
                                onChange={(e) => setSortBy(e.target.value)}
                                className="group inline-flex justify-center text-sm font-medium text-gray-700 hover:text-gray-900 border-none bg-transparent focus:ring-0 cursor-pointer"
                            >
                                <option value="featured">Trier par : En vedette</option>
                                <option value="price-asc">Prix : Croissant</option>
                                <option value="price-desc">Prix : Décroissant</option>
                                <option value="newest">Nouveautés</option>
                            </select>
                        </div>

                        <button
                            type="button"
                            className="-m-2 p-2 text-gray-400 hover:text-gray-500 lg:hidden"
                            onClick={() => setIsMobileFiltersOpen(true)}
                        >
                            <span className="sr-only">Filtres</span>
                            <SlidersHorizontal className="h-5 w-5" />
                        </button>
                    </div>
                </div>

                <div className="pt-12 pb-24 lg:grid lg:grid-cols-4 lg:gap-x-8">
                    {/* Desktop Sidebar Filters */}
                    <aside className="hidden lg:block lg:col-span-1 space-y-8 sticky top-24 max-h-[calc(100vh-8rem)] overflow-y-auto pr-4 scrollbar-thin scrollbar-thumb-gray-200">
                        <div>
                            <h3 className="text-sm font-bold text-gray-900 uppercase tracking-widest mb-4">Catégories</h3>
                            <ul className="space-y-3 border-b border-gray-200 pb-6">
                                {['Tout', ...Object.values(ProductCategory)].map((cat) => (
                                    <li key={cat}>
                                        <button
                                            onClick={() => setSelectedCategory(cat)}
                                            className={`text-sm flex items-center w-full justify-between group ${selectedCategory === cat ? 'text-brand-600 font-bold' : 'text-slate-600 hover:text-brand-500'
                                                }`}
                                        >
                                            {cat}
                                            {selectedCategory === cat && <div className="h-1.5 w-1.5 rounded-full bg-brand-500" />}
                                        </button>
                                    </li>
                                ))}
                            </ul>
                        </div>

                        <div>
                            <h3 className="text-sm font-bold text-gray-900 uppercase tracking-widest mb-4">Marques</h3>
                            <div className="max-h-60 overflow-y-auto pr-2 border-b border-gray-200 pb-6 scrollbar-thin scrollbar-thumb-gray-200">
                                <ul className="space-y-3">
                                    {brands.map((brand) => (
                                        <li key={String(brand)}>
                                            <button
                                                onClick={() => setSelectedBrand(String(brand))}
                                                className={`text-sm flex items-center w-full justify-between group ${selectedBrand === brand ? 'text-brand-600 font-bold' : 'text-slate-600 hover:text-brand-500'
                                                    }`}
                                            >
                                                {brand}
                                                {selectedBrand === brand && <div className="h-1.5 w-1.5 rounded-full bg-brand-500" />}
                                            </button>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        </div>

                        <div>
                            <h3 className="text-sm font-bold text-gray-900 uppercase tracking-widest mb-4">Prix</h3>
                            <div className="flex items-center gap-2 mb-4">
                                <div className="relative">
                                    <span className="absolute left-3 top-2 text-xs text-gray-400">Min</span>
                                    <input type="number" value={priceRange[0]} onChange={(e) => handlePriceChange(e, 'min')}
                                        className="w-full pl-3 pr-2 py-2 pt-5 border border-gray-200 rounded-lg text-sm focus:ring-brand-500 focus:border-brand-500"
                                    />
                                </div>
                                <div className="relative">
                                    <span className="absolute left-3 top-2 text-xs text-gray-400">Max</span>
                                    <input type="number" value={priceRange[1]} onChange={(e) => handlePriceChange(e, 'max')}
                                        className="w-full pl-3 pr-2 py-2 pt-5 border border-gray-200 rounded-lg text-sm focus:ring-brand-500 focus:border-brand-500"
                                    />
                                </div>
                            </div>
                            <button onClick={() => setPriceRange([0, 2000])} className="text-xs text-brand-600 hover:underline">Réinitialiser</button>
                        </div>
                    </aside>

                    {/* Product Grid */}
                    <div className="lg:col-span-3">
                        {filteredProducts.length > 0 ? (
                            <>
                                <div className="grid grid-cols-1 gap-y-10 gap-x-6 sm:grid-cols-2 lg:grid-cols-3 xl:gap-x-8">
                                    {filteredProducts.slice(0, visibleCount).map((product) => (
                                        <ProductCard key={product.id} product={product} />
                                    ))}
                                </div>

                                {visibleCount < filteredProducts.length && (
                                    <div className="mt-12 text-center">
                                        <button
                                            onClick={() => setVisibleCount(prev => prev + 24)}
                                            className="inline-flex items-center px-8 py-3 border border-transparent text-base font-medium rounded-full shadow-sm text-white bg-brand-600 hover:bg-brand-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-500 transition-all"
                                        >
                                            Voir Plus de Produits ({filteredProducts.length - visibleCount} restants)
                                        </button>
                                    </div>
                                )}
                            </>
                        ) : (
                            <div className="text-center py-20 bg-white rounded-2xl border border-dashed border-gray-300">
                                <Search className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                                <h3 className="text-lg font-medium text-gray-900">Aucun résultat trouvé</h3>
                                <p className="text-gray-500 mt-2 max-w-sm mx-auto">
                                    Nous n'avons trouvé aucun produit correspondant à vos filtres. Essayez d'ajuster la fourchette de prix ou la catégorie.
                                </p>
                                <button onClick={clearFilters} className="mt-6 text-brand-600 font-bold hover:underline">
                                    Effacer les filtres
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default function ShopClient(props: ShopClientProps) {
    return (
        <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Chargement...</div>}>
            <ShopClientContent {...props} />
        </Suspense>
    );
}
