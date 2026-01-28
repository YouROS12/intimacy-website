import React from 'react';
import { useNavigate } from 'react-router-dom';
import { X, Plus, Minus, Trash2 } from 'lucide-react';
import { useCart } from '../contexts/CartContext';

const CartDrawer: React.FC = () => {
  const { items, isOpen, setIsOpen, removeFromCart, updateQuantity, total } = useCart();
  const navigate = useNavigate();

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      <div className="absolute inset-0 bg-gray-500 bg-opacity-75 transition-opacity" onClick={() => setIsOpen(false)} />

      <div className="fixed inset-y-0 right-0 max-w-full flex">
        <div className="w-screen max-w-md">
          <div className="h-full flex flex-col bg-white shadow-xl">
            <div className="flex-1 py-6 overflow-y-auto px-4 sm:px-6">
              <div className="flex items-start justify-between">
                <h2 className="text-lg font-medium text-gray-900">Panier d'achats</h2>
                <div className="ml-3 h-7 flex items-center">
                  <button onClick={() => setIsOpen(false)} className="-m-2 p-2 text-gray-400 hover:text-gray-500">
                    <X className="h-6 w-6" />
                  </button>
                </div>
              </div>

              <div className="mt-8">
                {items.length === 0 ? (
                  <p className="text-center text-gray-500 mt-10">Votre panier est vide.</p>
                ) : (
                  <div className="flow-root">
                    <ul role="list" className="-my-6 divide-y divide-gray-200">
                      {items.map((item) => (
                        <li key={item.id} className="py-6 flex">
                          <div className="flex-shrink-0 w-24 h-24 border border-gray-200 rounded-md overflow-hidden">
                            <img src={item.imageUrl} alt={item.name} className="w-full h-full object-center object-cover" />
                          </div>
                          <div className="ml-4 flex-1 flex flex-col">
                            <div>
                              <div className="flex justify-between text-base font-medium text-gray-900">
                                <h3>{item.name}</h3>
                                <p className="ml-4">{item.price * item.quantity} MAD</p>
                              </div>
                              <p className="mt-1 text-sm text-gray-500">{item.category}</p>
                            </div>
                            <div className="flex-1 flex items-end justify-between text-sm">
                              <div className="flex items-center gap-2 border rounded-md p-1">
                                <button onClick={() => updateQuantity(item.id, item.quantity - 1)} className="p-1 hover:bg-gray-100 rounded">
                                  <Minus className="h-4 w-4" />
                                </button>
                                <span className="font-medium">{item.quantity}</span>
                                <button onClick={() => updateQuantity(item.id, item.quantity + 1)} className="p-1 hover:bg-gray-100 rounded">
                                  <Plus className="h-4 w-4" />
                                </button>
                              </div>
                              <button
                                type="button"
                                onClick={() => removeFromCart(item.id)}
                                className="font-medium text-brand-600 hover:text-brand-500 flex items-center"
                              >
                                <Trash2 className="h-4 w-4 mr-1" /> Supprimer
                              </button>
                            </div>
                          </div>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </div>

            {items.length > 0 && (
              <div className="border-t border-gray-200 py-6 px-4 sm:px-6">
                <div className="flex justify-between text-base font-medium text-gray-900">
                  <p>Sous-total</p>
                  <p>{total} MAD</p>
                </div>
                <p className="mt-0.5 text-sm text-gray-500">Livraison et taxes calculées à la caisse.</p>
                <div className="mt-6">
                  <button
                    onClick={() => {
                      setIsOpen(false);
                      navigate('/checkout');
                    }}
                    className="flex justify-center items-center w-full px-6 py-3 border border-transparent rounded-md shadow-sm text-base font-medium text-white bg-brand-600 hover:bg-brand-700"
                  >
                    Passer à la caisse
                  </button>
                </div>
                <div className="mt-6 flex justify-center text-sm text-center text-gray-500">
                  <p>
                    ou <button type="button" className="text-brand-600 font-medium hover:text-brand-500" onClick={() => setIsOpen(false)}>Continuer vos achats<span aria-hidden="true"> &rarr;</span></button>
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CartDrawer;