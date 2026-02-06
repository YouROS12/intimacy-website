'use client';

import React, { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from 'recharts';
import {
    Users, ShoppingBag, DollarSign, Package, Plus, Trash2, Database, AlertTriangle,
    Truck, CheckCircle, Clock, Edit, X, Save, Upload, FileSpreadsheet, Eye,
    MessageCircle, XCircle
} from 'lucide-react';
import {
    getDashboardStats, getAllOrders, getProducts, deleteProduct, addProduct,
    addBulkProducts, updateProduct, updateOrderStatus,
    getWeeklySales, adminGetAllPseoPages, adminUpdatePseoPage
} from '@/services/api';
import { Order, Product, ProductCategory } from '@/types';
import { isSupabaseConfigured } from '@/services/supabase';
import * as XLSX from 'xlsx';
import { getProductImage } from '@/utils/imageHelpers';

import { supabase } from '@/services/supabase';

export default function AdminDashboard() {
    const { user, isLoading: authLoading } = useAuth();
    const router = useRouter();

    const [activeTab, setActiveTab] = useState<'overview' | 'inventory' | 'orders' | 'seo'>('overview');
    const [stats, setStats] = useState({ totalRevenue: 0, totalOrders: 0, activeUsers: 0 });
    const [salesData, setSalesData] = useState<{ name: string, sales: number }[]>([]);
    const [orders, setOrders] = useState<Order[]>([]);
    const [filteredOrders, setFilteredOrders] = useState<Order[]>([]);
    const [orderFilter, setOrderFilter] = useState('all');
    const [pseoPages, setPseoPages] = useState<any[]>([]);
    const [products, setProducts] = useState<Product[]>([]);
    const [isLoading, setIsLoading] = useState(false);

    // --- Product Modal State ---
    const [isProductModalOpen, setIsProductModalOpen] = useState(false);
    const [editingProduct, setEditingProduct] = useState<Product | null>(null);
    const [formData, setFormData] = useState<Partial<Product>>({
        name: '', description: '', price: 0, category: ProductCategory.LUBRICANT,
        brand: '', stock: 0, imageUrl: '', features: [], is_featured: false, show_on_homepage: false
    });
    const [featureInput, setFeatureInput] = useState('');

    // --- Bulk Upload Modal State ---
    const [isBulkModalOpen, setIsBulkModalOpen] = useState(false);
    const [bulkFile, setBulkFile] = useState<File | null>(null);

    // --- Auth Check ---
    useEffect(() => {
        // Force refresh to ensure we have the latest session data from server (middleware check passed)
        router.refresh();

        if (!authLoading) {
            if (!user) {
                // Not logged in at all
                router.replace('/login?from=/admin');
                return;
            }
            // If logged in but not admin, we will show Access Denied state below instead of redirecting
            // This helps debugging
            if (user.role === 'admin') {
                loadData();
            }
        }
    }, [user, authLoading, router]);

    if (authLoading) return <div className="min-h-screen flex items-center justify-center">Authentification...</div>;

    if (user && user.role !== 'admin') {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100 p-4">
                <div className="bg-white p-8 rounded-lg shadow-md max-w-md w-full text-center">
                    <AlertTriangle className="h-16 w-16 text-yellow-500 mx-auto mb-4" />
                    <h1 className="text-2xl font-bold text-gray-900 mb-2">Accès Refusé</h1>
                    <p className="text-gray-600 mb-6">
                        Vous n'avez pas les permissions nécessaires pour accéder à cette page.
                    </p>
                    <button
                        onClick={() => router.push('/')}
                        className="bg-primary text-white px-6 py-2 rounded font-medium hover:bg-primary/90"
                    >
                        Retour à l'accueil
                    </button>
                </div>
            </div>
        );
    }

    const loadData = async () => {
        setIsLoading(true);
        try {
            const [s, o, p, sales, pseo] = await Promise.all([
                getDashboardStats(),
                getAllOrders(),
                getProducts(),
                getWeeklySales(),
                adminGetAllPseoPages()
            ]);

            // @ts-ignore
            setStats(s);
            setOrders(o);
            setFilteredOrders(o);
            setProducts(p);
            setSalesData(sales);
            setPseoPages(pseo);
        } catch (e) {
            console.error("Failed to load dashboard data", e);
        } finally {
            setIsLoading(false);
        }
    };



    const handleDelete = async (id: string) => {
        if (!confirm("Are you sure you want to delete this product?")) return;
        try {
            await deleteProduct(id);
            await loadData();
        } catch (e: any) {
            alert("Failed to delete: " + e.message);
        }
    };

    const handleStatusUpdate = async (orderId: string, newStatus: string) => {
        try {
            await updateOrderStatus(orderId, newStatus);
            await loadData();
        } catch (e: any) {
            alert("Failed to update status: " + e.message);
        }
    };

    const handleWhatsApp = (order: Order) => {
        if (!order.shipping_info?.phone) return alert("Pas de numéro de téléphone disponible");
        const phone = order.shipping_info.phone.replace(/\s+/g, '').replace('+', '');
        const itemsList = order.items.map(i => `- ${i.quantity}x ${i.name}`).join('\n');
        const message = `Bonjour ${order.shipping_info.first_name},\nMerci pour votre commande sur Intimacy Wellness.\nVoici le détail :\n${itemsList}\n\nTotal : ${order.total} MAD\nAdresse : ${order.shipping_info.address}\n\nConfirmez-vous ?`;
        window.open(`https://wa.me/${phone}?text=${encodeURIComponent(message)}`, '_blank');
    };

    const filterOrders = (status: string) => {
        setOrderFilter(status);
        if (status === 'all') {
            setFilteredOrders(orders);
        } else {
            setFilteredOrders(orders.filter(o => o.status === status));
        }
    };

    // --- Product Management Logic ---
    const openAddProduct = () => {
        setEditingProduct(null);
        setFormData({
            name: '', description: '', price: 0, category: ProductCategory.LUBRICANT,
            brand: '', stock: 0, imageUrl: '', features: [], is_featured: false, show_on_homepage: false
        });
        setFeatureInput('');
        setIsProductModalOpen(true);
    };

    const openEditProduct = (product: Product) => {
        setEditingProduct(product);
        setFormData({ ...product });
        setFeatureInput(product.features ? product.features.join(', ') : '');
        setIsProductModalOpen(true);
    };

    const handleSaveProduct = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        try {
            const featuresArray = featureInput.split(',').map(f => f.trim()).filter(f => f !== '');
            const productData = {
                ...formData,
                features: featuresArray,
                imageUrl: formData.imageUrl || 'https://via.placeholder.com/400'
            } as Product;

            if (editingProduct) {
                await updateProduct({ ...productData, id: editingProduct.id });
            } else {
                await addProduct(productData);
            }
            await loadData();
            setIsProductModalOpen(false);
        } catch (err: any) {
            alert("Failed to save product: " + err.message);
        } finally {
            setIsLoading(false);
        }
    };

    if (authLoading) return <div className="min-h-screen flex items-center justify-center">Authentification...</div>;

    return (
        <div className="min-h-screen bg-gray-100 p-8">
            <div className="max-w-7xl mx-auto">
                <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
                    <h1 className="text-2xl font-bold text-gray-900 font-serif">Admin Dashboard</h1>
                    <div className="flex space-x-2 bg-white p-1 rounded-lg shadow-sm border border-gray-200">
                        {['overview', 'orders', 'inventory', 'seo'].map((tab) => (
                            <button
                                key={tab}
                                onClick={() => setActiveTab(tab as any)}
                                className={`px-4 py-2 rounded-md text-sm font-medium capitalize transition-colors ${activeTab === tab ? 'bg-primary text-white shadow-sm' : 'text-gray-600 hover:bg-gray-50'
                                    }`}
                            >
                                {tab}
                            </button>
                        ))}
                    </div>
                </div>

                {/* --- Overview Tab --- */}
                {activeTab === 'overview' && (
                    <>
                        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4 mb-8">
                            {[
                                { label: 'Total Revenue', value: `${stats.totalRevenue} MAD`, icon: DollarSign, color: 'bg-primary' },
                                { label: 'Total Orders', value: stats.totalOrders, icon: ShoppingBag, color: 'bg-blue-500' },
                                { label: 'Inventory Count', value: products.length, icon: Package, color: 'bg-green-500' },
                                { label: 'Active Users', value: stats.activeUsers, icon: Users, color: 'bg-yellow-500' }
                            ].map((stat, idx) => (
                                <div key={idx} className="bg-white overflow-hidden shadow rounded-lg border border-gray-100">
                                    <div className="p-5 flex items-center">
                                        <div className={`flex-shrink-0 ${stat.color} rounded-md p-3`}>
                                            <stat.icon className="h-6 w-6 text-white" />
                                        </div>
                                        <div className="ml-5 w-0 flex-1">
                                            <p className="text-sm font-medium text-gray-500 truncate">{stat.label}</p>
                                            <p className="text-lg font-medium text-gray-900">{stat.value}</p>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>

                        <div className="bg-white p-6 rounded-lg shadow border border-gray-100">
                            <h3 className="text-lg font-medium leading-6 text-gray-900 mb-4">Weekly Sales</h3>
                            <div className="h-72">
                                <ResponsiveContainer width="100%" height="100%">
                                    <BarChart data={salesData}>
                                        <CartesianGrid strokeDasharray="3 3" />
                                        <XAxis dataKey="name" />
                                        <YAxis />
                                        <Tooltip />
                                        <Bar dataKey="sales" fill="#bd580f" />
                                    </BarChart>
                                </ResponsiveContainer>
                            </div>
                        </div>
                    </>
                )}

                {/* --- Orders Tab --- */}
                {activeTab === 'orders' && (
                    <div className="bg-white shadow overflow-hidden sm:rounded-lg border border-gray-200">
                        <div className="px-4 py-5 sm:px-6 border-b border-gray-200 flex flex-col sm:flex-row justify-between items-center gap-4 bg-gray-50/50">
                            <h3 className="text-lg leading-6 font-medium text-gray-900">Gestion des Commandes</h3>
                            <div className="flex flex-wrap gap-2">
                                {['all', 'pending', 'shipped', 'delivered', 'returned', 'cancelled'].map((status) => (
                                    <button
                                        key={status}
                                        onClick={() => filterOrders(status)}
                                        className={`px-3 py-1 rounded-full text-xs font-medium capitalize border transition-colors ${orderFilter === status ? 'bg-primary/10 text-primary border-primary/20' : 'bg-white text-gray-600 border-gray-300 hover:bg-gray-50'
                                            }`}
                                    >
                                        {status === 'all' ? 'Tout' : status}
                                    </button>
                                ))}
                            </div>
                        </div>
                        {/* Mobile View (Cards) */}
                        <div className="sm:hidden space-y-4 p-4">
                            {filteredOrders.map((order) => (
                                <div key={order.id} className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
                                    <div className="flex justify-between items-start mb-2">
                                        <div>
                                            <span className="text-sm font-medium text-gray-900">#{order.id.slice(0, 8)}</span>
                                            <p className="text-xs text-gray-500">{new Date(order.created_at || '').toLocaleDateString()}</p>
                                        </div>
                                        <span className={`px-2 py-1 text-xs font-semibold rounded-full ${order.status === 'delivered' ? 'bg-green-100 text-green-800' :
                                            order.status === 'shipped' ? 'bg-blue-100 text-blue-800' :
                                                'bg-yellow-100 text-yellow-800'
                                            }`}>
                                            {order.status.toUpperCase()}
                                        </span>
                                    </div>
                                    <div className="mb-3">
                                        <p className="text-sm font-medium text-gray-900">{order.shipping_info?.first_name} {order.shipping_info?.last_name}</p>
                                        <p className="text-xs text-gray-500">{order.shipping_info?.phone}</p>
                                    </div>
                                    <div className="flex justify-between items-center pt-3 border-t border-gray-100">
                                        <span className="font-bold text-gray-900">{order.total} MAD</span>
                                        <div className="flex gap-2">
                                            <button onClick={() => handleWhatsApp(order)} className="p-2 text-green-600 bg-green-50 rounded-full"><MessageCircle className="h-4 w-4" /></button>
                                            <button onClick={() => handleStatusUpdate(order.id, 'shipped')} className="p-2 text-blue-600 bg-blue-50 rounded-full"><Truck className="h-4 w-4" /></button>
                                            {/* Expand/More actions could go here */}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Desktop View (Table) */}
                        <div className="hidden sm:block overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Réf.</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Client</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Total</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Statut</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {filteredOrders.map((order) => (
                                        <tr key={order.id} className="hover:bg-gray-50 transition-colors">
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">#{order.id.slice(0, 8)}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                <div className="font-medium text-gray-900">{order.shipping_info?.first_name} {order.shipping_info?.last_name}</div>
                                                <div className="text-xs text-gray-400">{order.shipping_info?.phone}</div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-gray-900">{order.total} MAD</td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${order.status === 'delivered' ? 'bg-green-100 text-green-800' :
                                                    order.status === 'shipped' ? 'bg-blue-100 text-blue-800' :
                                                        'bg-yellow-100 text-yellow-800'
                                                    }`}>
                                                    {order.status.toUpperCase()}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 flex gap-2">
                                                <button onClick={() => handleWhatsApp(order)} className="text-green-600 hover:bg-green-50 p-1 rounded"><MessageCircle className="h-5 w-5" /></button>
                                                <button onClick={() => handleStatusUpdate(order.id, 'shipped')} className="text-blue-600 hover:bg-blue-50 p-1 rounded"><Truck className="h-5 w-5" /></button>
                                                <button onClick={() => handleStatusUpdate(order.id, 'delivered')} className="text-green-600 hover:bg-green-50 p-1 rounded"><CheckCircle className="h-5 w-5" /></button>
                                                <button onClick={() => handleStatusUpdate(order.id, 'cancelled')} className="text-red-600 hover:bg-red-50 p-1 rounded"><XCircle className="h-5 w-5" /></button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}

                {/* --- Inventory Tab --- */}
                {activeTab === 'inventory' && (
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
                                                    <img className="h-10 w-10 rounded-full object-cover border border-gray-200" src={getProductImage(product.imageUrl)} alt="" />
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
                )}

                {/* --- Generic Modal for Products (Simplified) --- */}
                {isProductModalOpen && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
                        <div className="bg-white rounded-lg shadow-xl max-w-lg w-full overflow-hidden">
                            <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center bg-gray-50">
                                <h3 className="text-lg font-medium text-gray-900">{editingProduct ? 'Edit Product' : 'Add New Product'}</h3>
                                <button onClick={() => setIsProductModalOpen(false)}><X className="h-6 w-6 text-gray-400 hover:text-gray-600" /></button>
                            </div>
                            <form onSubmit={handleSaveProduct} className="p-6 space-y-4 max-h-[80vh] overflow-y-auto">
                                <input placeholder="Name" className="w-full border p-2 rounded" value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} required />
                                <div className="grid grid-cols-2 gap-4">
                                    <input type="number" placeholder="Price" className="w-full border p-2 rounded" value={formData.price} onChange={e => setFormData({ ...formData, price: Number(e.target.value) })} required />
                                    <input type="number" placeholder="Stock" className="w-full border p-2 rounded" value={formData.stock} onChange={e => setFormData({ ...formData, stock: Number(e.target.value) })} required />
                                </div>
                                <select className="w-full border p-2 rounded" value={formData.category} onChange={e => setFormData({ ...formData, category: e.target.value as any })}>
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

                                <button type="submit" className="w-full bg-primary text-white py-2 rounded hover:bg-primary/90 font-medium">Save Product</button>
                            </form>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
