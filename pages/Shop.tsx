import React, { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { getProducts } from '../services/api';
import { Product, ProductCategory } from '../types';
import { Filter, Search } from 'lucide-react';

const Shop: React.FC = () => {
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchParams, setSearchParams] = useSearchParams();

  const searchQuery = searchParams.get('q') || '';

  useEffect(() => {
    const loadData = async () => {
      const data = await getProducts();
      setProducts(data);
      setLoading(false);
    };
    loadData();
  }, []);

  const filteredProducts = products.filter(p => {
    const matchesCategory = selectedCategory === 'All' || p.category === selectedCategory;
    const matchesSearch = searchQuery === '' ||
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const clearSearch = () => {
    searchParams.delete('q');
    setSearchParams(searchParams);
  };

  return (
    <div className="bg-white min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">
              {searchQuery ? `Results for "${searchQuery}"` : 'Shop All'}
            </h1>
            {searchQuery && (
              <button
                onClick={clearSearch}
                className="text-sm text-brand-600 hover:text-brand-500 mt-1 flex items-center gap-1"
              >
                Clear Search
              </button>
            )}
          </div>

          <div className="mt-4 md:mt-0 flex items-center space-x-2">
            <Filter className="h-5 w-5 text-gray-500" />
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-brand-500 focus:border-brand-500 sm:text-sm rounded-md border"
            >
              <option value="All">All Categories</option>
              {Object.values(ProductCategory).map((cat) => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>
        </div>

        {loading ? (
          <div className="text-center py-20">Loading products...</div>
        ) : (
          <div className="grid grid-cols-1 gap-y-10 gap-x-6 sm:grid-cols-2 lg:grid-cols-4 xl:gap-x-8">
            {filteredProducts.map((product) => (
              <Link key={product.id} to={`/product/${product.id}`} className="group relative flex flex-col">
                <div className="aspect-w-1 aspect-h-1 w-full overflow-hidden rounded-lg bg-gray-200 xl:aspect-w-7 xl:aspect-h-8">
                  <img
                    src={product.imageUrl}
                    alt={product.name}
                    className="h-full w-full object-cover object-center group-hover:opacity-75"
                  />
                </div>
                <h3 className="mt-4 text-sm text-gray-700 font-medium">{product.name}</h3>
                <p className="mt-1 text-xs text-gray-500 flex-1">{(product.description || '').substring(0, 60)}...</p>
                <p className="mt-2 text-lg font-medium text-brand-600">{product.price} MAD</p>
              </Link>
            ))}
          </div>
        )}

        {!loading && filteredProducts.length === 0 && (
          <div className="text-center py-20 bg-gray-50 rounded-lg">
            <Search className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900">No products found</h3>
            <p className="text-gray-500 mt-2">Try adjusting your search or filter to find what you're looking for.</p>
            {searchQuery && (
              <button onClick={clearSearch} className="mt-4 text-brand-600 font-medium hover:underline">
                View all products
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Shop;