'use client';

import React, { useState } from 'react';
import { Plus, Edit, Trash2, X } from 'lucide-react';
import { Product, ProductCategory } from '@/types';
import { getProductImage } from '@/utils/imageHelpers';
import Image from 'next/image';
import { addProduct, updateProduct, deleteProduct } from '@/services/api';

interface InventoryTabProps {
    products: Product[];
    onDataChanged: () => Promise<void>;
}

export default function InventoryTab({ products, onDataChanged }: InventoryTabProps) {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingProduct, setEditingProduct] = useState<Product | null>(null);
    const [formData, setFormData] = useState<Partial<Product>>({
        name: '', description: '', price: 0, category: ProductCategory.LUBRICANT,
        brand: '', stock: 0, imageUrl: '', features: [], is_featured: false, show_on_homepage: false
    });
    const [featureInput, setFeatureInput] = useState('');
    const [isSaving, setIsSaving] = useState(false);

    const openAddProduct = () => {
        setEditingProduct(null);
        setFormData({
            name: '', description: '', price: 0, category: ProductCategory.LUBRICANT,
            brand: '', stock: 0, imageUrl: '', features: [], is_featured: false, show_on_homepage: false
        });
        setFeatureInput('');
        setIsModalOpen(true);
    };

    const openEditProduct = (product: Product) => {
        setEditingProduct(product);
        setFormData({ ...product });
        setFeatureInput(product.features ? product.features.join(', ') : '');
        setIsModalOpen(true);
    };

    const handleSaveProduct = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSaving(true);
        try {
            const featuresArray = featureInput.split(',').map(f => f.trim()).filter(f => f !== '');
            const productData = {
                ...formData,
                features: featuresArray,
                imageUrl: formData.imageUrl || '/placeholder-product.svg'
            } as Product;

            if (editingProduct) {
                await updateProduct({ ...productData, id: editingProduct.id });
            } else {
                await addProduct(productData);
            }
            await onDataChanged();
            setIsModalOpen(false);
        } catch (err: unknown) {
            alert("Failed to save product: " + (err instanceof Error ? err.message : String(err)));
        } finally {
            setIsSaving(false);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm("Are you sure you want to delete this product?")) return;
        try {
            await deleteProduct(id);
            await onDataChanged();
        } catch (e: unknown) {
            alert("Failed to delete: " + (e instanceof Error ? e.message : String(e)));
        }
    };

    return (
        <>
            <div className="bg-white shadow overflow-hidden sm:rounded-lg border border-gray-200">
                <div className="px-4 py-5 sm:px-6 border-b border-gray-200 flex justify-between items-center bg-gray-50/50">
                    <h3 className="text-lg leading-6 font-medium text-gray-900">Inventaire Produits</h3>
                    <div className="flex gap-2">
                        <button
                            onClick={openAddProduct}
                            className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary hover:bg-primary/90 focus:outline-none"
                        >
                            <Plus className="-ml-1 mr-2 h-5 w-5" /> Ajouter
                        </button>
                    </div>
                </div>
                <ul className="divide-y divide-gray-200">
                    {products.length === 0 ? (
                        <li className="px-4 py-8 text-center text-gray-500">Aucun produit trouvé. Cliquez sur Ajouter.</li>
                    ) : (
                        products.map((product) => (
                            <li key={product.id} className="px-4 py-4 sm:px-6 hover:bg-gray-50 transition-colors">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center">
                                        <div className="flex-shrink-0 h-10 w-10">
                                            <Image className="rounded-full object-cover border border-gray-200" src={getProductImage(product.imageUrl)} alt="" width={40} height={40} />
                                        </div>
                                        <div className="ml-4 flex-1">
                                            <div className="text-sm font-medium text-gray-900 truncate max-w-[150px] sm:max-w-none">{product.name}</div>
                                            <div className="text-sm text-gray-500 flex flex-wrap items-center gap-2 mt-1">
                                                <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-800">
                                                    {product.category}
                                                </span>
                                                <span>Stock: <span className={product.stock < 5 ? "text-red-600 font-bold" : "text-gray-600"}>{product.stock}</span></span>
                                                <span className="font-bold text-primary">{product.price} MAD</span>
                                                {product.is_featured && (
                                                    <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-yellow-100 text-yellow-800">
                                                        Featured
                                                    </span>
                                                )}
                                                {product.show_on_homepage && (
                                                    <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800">
                                                        Homepage
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <button
                                            onClick={() => openEditProduct(product)}
                                            className="p-2 text-indigo-600 hover:bg-indigo-50 rounded-full transition-colors"
                                        >
                                            <Edit className="h-5 w-5" />
                                        </button>
                                        <button
                                            onClick={() => handleDelete(product.id)}
                                            className="p-2 text-red-600 hover:bg-red-50 rounded-full transition-colors"
                                        >
                                            <Trash2 className="h-5 w-5" />
                                        </button>
                                    </div>
                                </div>
                            </li>
                        ))
                    )}
                </ul>
            </div>

            {/* Product Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
                    <div className="bg-white rounded-lg shadow-xl max-w-lg w-full overflow-hidden">
                        <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center bg-gray-50">
                            <h3 className="text-lg font-medium text-gray-900">{editingProduct ? 'Edit Product' : 'Add New Product'}</h3>
                            <button onClick={() => setIsModalOpen(false)}><X className="h-6 w-6 text-gray-400 hover:text-gray-600" /></button>
                        </div>
                        <form onSubmit={handleSaveProduct} className="p-6 space-y-4 max-h-[80vh] overflow-y-auto">
                            <input placeholder="Name" className="w-full border p-2 rounded" value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} required />
                            <div className="grid grid-cols-2 gap-4">
                                <input type="number" placeholder="Price" className="w-full border p-2 rounded" value={formData.price} onChange={e => setFormData({ ...formData, price: Number(e.target.value) })} required />
                                <input type="number" placeholder="Stock" className="w-full border p-2 rounded" value={formData.stock} onChange={e => setFormData({ ...formData, stock: Number(e.target.value) })} required />
                            </div>
                            <select className="w-full border p-2 rounded" value={formData.category} onChange={e => setFormData({ ...formData, category: e.target.value as ProductCategory })}>
                                {Object.values(ProductCategory).map(c => <option key={c} value={c}>{c}</option>)}
                            </select>
                            <textarea placeholder="Description" className="w-full border p-2 rounded" value={formData.description} onChange={e => setFormData({ ...formData, description: e.target.value })} required />
                            <input placeholder="Image URL" className="w-full border p-2 rounded" value={formData.imageUrl} onChange={e => setFormData({ ...formData, imageUrl: e.target.value })} />
                            <input placeholder="Features (comma separated)" className="w-full border p-2 rounded" value={featureInput} onChange={e => setFeatureInput(e.target.value)} />

                            <div className="flex gap-4">
                                <label className="flex items-center gap-2 cursor-pointer">
                                    <input
                                        type="checkbox"
                                        className="h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded"
                                        checked={formData.is_featured}
                                        onChange={e => setFormData({ ...formData, is_featured: e.target.checked })}
                                    />
                                    <span className="text-sm text-gray-700">Featured (Top of List)</span>
                                </label>

                                <label className="flex items-center gap-2 cursor-pointer">
                                    <input
                                        type="checkbox"
                                        className="h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded"
                                        checked={formData.show_on_homepage}
                                        onChange={e => setFormData({ ...formData, show_on_homepage: e.target.checked })}
                                    />
                                    <span className="text-sm text-gray-700">Show on Homepage</span>
                                </label>
                            </div>

                            <button type="submit" disabled={isSaving} className="w-full bg-primary text-white py-2 rounded hover:bg-primary/90 font-medium disabled:opacity-50">
                                {isSaving ? 'Saving...' : 'Save Product'}
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </>
    );
}
