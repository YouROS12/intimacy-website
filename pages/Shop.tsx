import React, { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { getProducts } from '../services/api';
import { Product, ProductCategory } from '../types';
import { Filter, Search, ChevronDown, X, SlidersHorizontal } from 'lucide-react';

const Shop: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchParams, setSearchParams] = useSearchParams();
  const [isMobileFiltersOpen, setIsMobileFiltersOpen] = useState(false);

  // Filter States
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 2000]);
  const [sortBy, setSortBy] = useState<string>('featured');

  const searchQuery = searchParams.get('q') || '';

  useEffect(() => {
    const loadData = async () => {
      const data = await getProducts();
      setProducts(data);
      setLoading(false);
    };
    loadData();
  }, []);

  // Update URL when filters change (optional, but good for UX)
  // For now we keep local state synced

  const filteredProducts = products
    .filter(p => {
      const matchesCategory = selectedCategory === 'All' || p.category === selectedCategory;
      const matchesSearch = searchQuery === '' ||
        p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.description.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesPrice = p.price >= priceRange[0] && p.price <= priceRange[1];

      return matchesCategory && matchesSearch && matchesPrice;
    })
    .sort((a, b) => {
      if (sortBy === 'price-asc') return a.price - b.price;
      if (sortBy === 'price-desc') return b.price - a.price;
      if (sortBy === 'newest') return new Date(b.created_at || '').getTime() - new Date(a.created_at || '').getTime();
      // Default / Featured sort
      if (sortBy === 'featured') {
        // Featured items come first
        return (b.is_featured ? 1 : 0) - (a.is_featured ? 1 : 0);
      }
      return 0;
    });

  const clearFilters = () => {
    setSelectedCategory('All');
    setPriceRange([0, 2000]);
    setSortBy('featured');
    if (searchQuery) {
      searchParams.delete('q');
      setSearchParams(searchParams);
    }
  };

  const handlePriceChange = (e: React.ChangeEvent<HTMLInputElement>, type: 'min' | 'max') => {
    const val = parseInt(e.target.value) || 0;
    if (type === 'min') setPriceRange([val, priceRange[1]]);
    else setPriceRange([priceRange[0], val]);
  };

  return (
    <div className="bg-slate-50 min-h-screen">

      {/* Mobile Filter Dialog (Overlay) */}
      {isMobileFiltersOpen && (
        <div className="fixed inset-0 z-50 flex">
          <div className="fixed inset-0 bg-black/50" onClick={() => setIsMobileFiltersOpen(false)}></div>
          <div className="relative ml-auto flex h-full w-full max-w-xs flex-col overflow-y-auto bg-white py-4 pb-12 shadow-xl animate-in slide-in-from-right">
            <div className="flex items-center justify-between px-4">
              <h2 className="text-lg font-medium text-gray-900">Filters</h2>
              <button onClick={() => setIsMobileFiltersOpen(false)} className="-mr-2 flex h-10 w-10 items-center justify-center rounded-md bg-white p-2 text-gray-400">
                <X className="h-6 w-6" />
              </button>
            </div>
            {/* Mobile Filters Form */}
            <div className="mt-4 px-4 border-t border-gray-200 py-6">
              <h3 className="font-medium text-gray-900">Categories</h3>
              <ul className="mt-4 space-y-3">
                {['All', ...Object.values(ProductCategory)].map((cat) => (
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

              <h3 className="font-medium text-gray-900 mt-8">Price Range</h3>
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
          <h1 className="text-3xl font-extrabold tracking-tight text-slate-900">
            {searchQuery ? `Results for "${searchQuery}"` : 'Shop Collection'}
          </h1>

          <div className="flex items-center">
            {/* Sort Dropdown */}
            <div className="relative inline-block text-left mr-4">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="group inline-flex justify-center text-sm font-medium text-gray-700 hover:text-gray-900 border-none bg-transparent focus:ring-0 cursor-pointer"
              >
                <option value="featured">Sort by: Featured</option>
                <option value="price-asc">Price: Low to High</option>
                <option value="price-desc">Price: High to Low</option>
                <option value="newest">Newest Arrivals</option>
              </select>
            </div>

            <button
              type="button"
              className="-m-2 p-2 text-gray-400 hover:text-gray-500 lg:hidden"
              onClick={() => setIsMobileFiltersOpen(true)}
            >
              <span className="sr-only">Filters</span>
              <SlidersHorizontal className="h-5 w-5" />
            </button>
          </div>
        </div>

        <div className="pt-12 pb-24 lg:grid lg:grid-cols-4 lg:gap-x-8">
          {/* Desktop Sidebar Filters */}
          <aside className="hidden lg:block lg:col-span-1 space-y-8 sticky top-24 h-fit">
            <div>
              <h3 className="text-sm font-bold text-gray-900 uppercase tracking-widest mb-4">Categories</h3>
              <ul className="space-y-3 border-b border-gray-200 pb-6">
                {['All', ...Object.values(ProductCategory)].map((cat) => (
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
              <h3 className="text-sm font-bold text-gray-900 uppercase tracking-widest mb-4">Price</h3>
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
              <button onClick={() => setPriceRange([0, 2000])} className="text-xs text-brand-600 hover:underline">Reset Price</button>
            </div>

            <div className="pt-6">
              <div className="bg-brand-50 rounded-xl p-4">
                <h4 className="font-bold text-brand-800 mb-2 text-sm">Need help choosing?</h4>
                <p className="text-xs text-brand-600 mb-3">Read our expert guides to find the perfect product for you.</p>
                <Link to="/education" className="text-xs font-bold bg-white text-brand-600 px-3 py-2 rounded-lg shadow-sm block text-center hover:shadow-md transition-all">
                  Go to Education Hub
                </Link>
              </div>
            </div>
          </aside>

          {/* Product Grid */}
          <div className="lg:col-span-3">
            {loading ? (
              <div className="flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-600"></div>
              </div>
            ) : filteredProducts.length > 0 ? (
              <div className="grid grid-cols-1 gap-y-10 gap-x-6 sm:grid-cols-2 lg:grid-cols-3 xl:gap-x-8">
                {filteredProducts.map((product) => (
                  <Link key={product.id} to={`/product/${product.id}`} className="group relative bg-white rounded-2xl p-4 hover:shadow-xl transition-all border border-transparent hover:border-gray-100 flex flex-col">
                    <div className="aspect-[4/5] w-full overflow-hidden rounded-xl bg-gray-100 relative">
                      <img
                        src={product.imageUrl}
                        alt={product.name}
                        loading="lazy"
                        className="h-full w-full object-cover object-center group-hover:scale-105 transition-transform duration-500"
                      />
                      {/* Quick Action Overlay (Optional) */}
                      <div className="absolute inset-0 bg-black/5 opacity-0 group-hover:opacity-100 transition-opacity" />
                    </div>

                    <div className="mt-4 flex-1 flex flex-col">
                      <h3 className="text-base font-bold text-slate-900 group-hover:text-brand-600 transition-colors line-clamp-1">
                        {product.name}
                      </h3>
                      <p className="mt-1 text-sm text-slate-500 line-clamp-2 mb-3">
                        {product.description}
                      </p>
                      <div className="mt-auto flex items-center justify-between">
                        <span className="text-lg font-bold text-brand-600">{product.price} MAD</span>
                        <span className="text-xs font-medium bg-slate-100 px-2 py-1 rounded text-slate-600">{product.category}</span>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            ) : (
              <div className="text-center py-20 bg-white rounded-2xl border border-dashed border-gray-300">
                <Search className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900">No matches found</h3>
                <p className="text-gray-500 mt-2 max-w-sm mx-auto">
                  We couldn't find any products matching your filters. Try adjusting price range or category.
                </p>
                <button onClick={clearFilters} className="mt-6 text-brand-600 font-bold hover:underline">
                  Clear all filters
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Shop;