import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { ShoppingBag, ArrowLeft, Check, AlertCircle } from 'lucide-react';
import { getProductById, getRelatedProducts } from '../services/api';
import { Product } from '../types';
import { useCart } from '../contexts/CartContext';
import SeoHead from '../components/SeoHead';

const ProductDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const [product, setProduct] = useState<Product | undefined>(undefined);
  const [relatedProducts, setRelatedProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [addingToCart, setAddingToCart] = useState(false);

  useEffect(() => {
    if (id) {
      setLoading(true);
      // Scroll to top when id changes
      window.scrollTo(0, 0);

      getProductById(id).then(async (p) => {
        setProduct(p);
        if (p) {
          const related = await getRelatedProducts(p.category, p.id);
          setRelatedProducts(related);
        }
        setLoading(false);
      });
    }
  }, [id]);

  const handleAddToCart = (p: Product) => {
    setAddingToCart(true);
    addToCart(p);
    setTimeout(() => setAddingToCart(false), 500);
  };

  if (loading) return <div className="p-10 text-center">Loading...</div>;

  if (!product) {
    return <div className="p-10 text-center">Product not found <button onClick={() => navigate('/shop')} className="text-blue-500 underline">Go back</button></div>;
  }

  return (
    <div className="bg-white min-h-screen">
      <SeoHead
        title={product.seo_title || product.name}
        description={product.seo_description || `Buy ${product.name} in Morocco. ${(product.description || '').substring(0, 100)}... Discreet shipping.`}
      />
      <script type="application/ld+json">
        {JSON.stringify({
          "@context": "https://schema.org",
          "@type": "Product",
          "name": product.name,
          "description": product.seo_description || product.description,
          "image": product.imageUrl || product.image_url,
          "offers": {
            "@type": "Offer",
            "price": product.price,
            "priceCurrency": "MAD",
            "availability": product.stock > 0 ? "https://schema.org/InStock" : "https://schema.org/OutOfStock",
            "url": window.location.href
          }
        })}
      </script>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <button onClick={() => navigate(-1)} className="flex items-center text-gray-500 hover:text-brand-600 mb-6">
          <ArrowLeft className="h-4 w-4 mr-1" /> Back to Shop
        </button>

        <div className="lg:grid lg:grid-cols-2 lg:gap-x-8 lg:items-start">
          {/* Image */}
          <div className="flex flex-col">
            <div className="aspect-w-1 aspect-h-1 w-full rounded-lg overflow-hidden">
              <img
                src={product.imageUrl}
                alt={product.name}
                className="w-full h-full object-center object-cover"
              />
            </div>
          </div>

          {/* Info */}
          <div className="mt-10 px-4 sm:px-0 sm:mt-16 lg:mt-0">
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-brand-100 text-brand-800 mb-4">
              {product.category}
            </span>
            <h1 className="text-3xl font-extrabold tracking-tight text-gray-900">{product.name}</h1>

            <div className="mt-3">
              <h2 className="sr-only">Product information</h2>
              <p className="text-3xl text-gray-900">{product.price} MAD</p>
            </div>

            <div className="mt-6">
              <h3 className="sr-only">Description</h3>
              <p className="text-base text-gray-700">{product.description}</p>
            </div>

            <div className="mt-6">
              <h3 className="text-sm font-medium text-gray-900">Highlights</h3>
              <ul role="list" className="mt-4 space-y-2">
                {product.features?.map((feature, idx) => (
                  <li key={idx} className="flex items-center text-sm text-gray-500">
                    <Check className="h-4 w-4 text-green-500 mr-2" />
                    {feature}
                  </li>
                ))}
              </ul>
            </div>

            <div className="mt-6 flex items-start p-4 bg-blue-50 rounded-md">
              <AlertCircle className="h-5 w-5 text-blue-400 mt-0.5 mr-3 flex-shrink-0" />
              <p className="text-sm text-blue-700">
                <strong>Discreet Shipping:</strong> This item ships in a plain standard box. No content description on label.
              </p>
            </div>

            <div className="mt-10 flex sm:flex-col1">
              <button
                type="button"
                onClick={() => handleAddToCart(product)}
                className={`max-w-xs flex-1 border border-transparent rounded-md py-3 px-8 flex items-center justify-center text-base font-medium text-white focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-50 focus:ring-brand-500 sm:w-full transition-colors ${addingToCart ? 'bg-green-600' : 'bg-brand-600 hover:bg-brand-700'}`}
              >
                {addingToCart ? (
                  <>
                    <Check className="h-5 w-5 mr-2" /> Added!
                  </>
                ) : (
                  <>
                    <ShoppingBag className="h-5 w-5 mr-2" /> Add to Cart
                  </>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Related Products Section */}
        {relatedProducts.length > 0 && (
          <div className="mt-16 border-t border-gray-200 pt-10">
            <h2 className="text-2xl font-bold tracking-tight text-gray-900 mb-6">You might also like</h2>
            <div className="grid grid-cols-1 gap-y-10 gap-x-6 sm:grid-cols-2 lg:grid-cols-4 xl:gap-x-8">
              {relatedProducts.map((rp) => (
                <Link key={rp.id} to={`/product/${rp.id}`} className="group relative">
                  <div className="aspect-w-1 aspect-h-1 w-full overflow-hidden rounded-md bg-gray-200 group-hover:opacity-75 lg:aspect-none lg:h-64">
                    <img
                      src={rp.imageUrl}
                      alt={rp.name}
                      loading="lazy"
                      className="h-full w-full object-cover object-center lg:h-full lg:w-full"
                    />
                  </div>
                  <div className="mt-4 flex justify-between">
                    <div>
                      <h3 className="text-sm text-gray-700">
                        <span aria-hidden="true" className="absolute inset-0" />
                        {rp.name}
                      </h3>
                      <p className="mt-1 text-sm text-gray-500">{rp.category}</p>
                    </div>
                    <p className="text-sm font-medium text-brand-600">{rp.price} MAD</p>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProductDetail;