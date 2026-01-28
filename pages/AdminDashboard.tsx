import React, { useEffect, useState, useRef } from 'react';
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from 'recharts';
import { Users, ShoppingBag, DollarSign, Package, Plus, Trash2, Database, AlertTriangle, Truck, CheckCircle, Clock, Edit, X, Save, Upload, FileSpreadsheet, Download, Copy, FileText, Globe, Eye, MessageCircle, XCircle, RotateCcw } from 'lucide-react';
import { getDashboardStats, getAllOrders, getProducts, deleteProduct, addProduct, addBulkProducts, updateProduct, seedDatabase, updateOrderStatus, getWeeklySales, adminGetAllPseoPages, adminUpdatePseoPage } from '../services/api';
import { Order, Product, ProductCategory } from '../types';
import { isSupabaseConfigured } from '../services/supabase';
import * as XLSX from 'xlsx';

const AdminDashboard: React.FC = () => {
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
        name: '',
        description: '',
        price: 0,
        category: ProductCategory.LUBRICANT,
        brand: '',
        stock: 0,
        imageUrl: '',
        features: [],
        is_featured: false,
        show_on_homepage: false
    });
    const [featureInput, setFeatureInput] = useState('');

    // --- Order Modal State ---
    const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
    const [isOrderModalOpen, setIsOrderModalOpen] = useState(false);

    // --- Bulk Upload Modal State ---
    const [isBulkModalOpen, setIsBulkModalOpen] = useState(false);
    const [bulkFile, setBulkFile] = useState<File | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const loadData = async () => {
        setIsLoading(true);
        try {
            const s = await getDashboardStats();
            const o = await getAllOrders();
            const p = await getProducts();
            const sales = await getWeeklySales();
            const pseo = await adminGetAllPseoPages();

            // @ts-ignore
            setStats(s);
            setOrders(o);
            setFilteredOrders(o); // Initialize filtered list
            setProducts(p);
            setSalesData(sales);
            setPseoPages(pseo);
        } catch (e) {
            console.error("Failed to load dashboard data", e);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        loadData();
    }, []);

    const handleSeed = async () => {
        if (!confirm("This will insert example products into the database. Continue?")) return;
        setIsLoading(true);
        try {
            await seedDatabase();
            await loadData();
            alert("Database populated successfully!");
        } catch (e: any) {
            alert("Error seeding database: " + e.message);
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
            await loadData(); // Refresh list
        } catch (e: any) {
            alert("Failed to update status: " + e.message);
        }
    };

    const handlePseoStatus = async (id: string, currentStatus: string) => {
        const newStatus = currentStatus === 'draft' ? 'published' : 'draft';
        if (!confirm(`Switch page to ${newStatus}?`)) return;
        try {
            await adminUpdatePseoPage(id, { status: newStatus });
            await loadData();
        } catch (e: any) {
            alert("Failed to update page: " + e.message);
        }
    };

    const filterOrders = (status: string) => {
        setOrderFilter(status);
        if (status === 'all') {
            setFilteredOrders(orders);
        } else {
            setFilteredOrders(orders.filter(o => o.status === status));
        }
    };

    const openOrderDetails = (order: Order) => {
        setSelectedOrder(order);
        setIsOrderModalOpen(true);
    };

    const handleWhatsApp = (order: Order) => {
        if (!order.shipping_info?.phone) return alert("Pas de numéro de téléphone disponible");

        const phone = order.shipping_info.phone.replace(/\s+/g, '').replace('+', '');
        const itemsList = order.items.map(i => `- ${i.quantity}x ${i.name}`).join('\n');

        const message = `Bonjour ${order.shipping_info.first_name},
Merci pour votre commande sur Intimacy Wellness.
Nous souhaitons confirmer la livraison de :
${itemsList}

Total : ${order.total} MAD
Adresse : ${order.shipping_info.address}, ${order.shipping_info.city}

Confirmez-vous la livraison ?`;

        const url = `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;
        window.open(url, '_blank');
    };

    // --- Modal Handlers ---

    const openAddProduct = () => {
        setEditingProduct(null);
        setFormData({
            name: '',
            description: '',
            price: 0,
            category: ProductCategory.LUBRICANT,
            brand: '',
            stock: 0,
            imageUrl: '',
            features: [],
            is_featured: false,
            show_on_homepage: false
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
                // Ensure defaults
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

    // --- Bulk Upload Logic ---

    const downloadTemplate = () => {
        const headers = ["name", "description", "price", "category", "stock", "imageUrl", "features"];
        const example = [
            "Durex Extra Safe (3 Pack)",
            "Thicker for extra confidence",
            50,
            "Condom",
            100,
            "https://via.placeholder.com/400",
            "Extra Lubricated, Thick, Easy-On"
        ];

        const ws = XLSX.utils.aoa_to_sheet([headers, example]);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, "Template");

        XLSX.writeFile(wb, "products_template.xlsx");
    };

    const handleBulkFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            setBulkFile(e.target.files[0]);
        }
    };

    const processBulkUpload = async () => {
        if (!bulkFile) return;
        setIsLoading(true);

        const reader = new FileReader();
        reader.onload = async (e) => {
            try {
                const data = e.target?.result;
                const workbook = XLSX.read(data, { type: 'binary' });
                const sheetName = workbook.SheetNames[0];
                const worksheet = workbook.Sheets[sheetName];

                // Convert to JSON
                const rawProducts = XLSX.utils.sheet_to_json(worksheet) as any[];

                // Transform and Validate
                const productsToAdd: Omit<Product, 'id'>[] = [];

                for (const row of rawProducts) {
                    // Basic validation
                    if (!row.name || !row.price) continue;

                    productsToAdd.push({
                        name: row.name,
                        description: row.description || "",
                        price: Number(row.price),
                        category: Object.values(ProductCategory).includes(row.category) ? row.category : ProductCategory.LUBRICANT,
                        stock: Number(row.stock) || 0,
                        imageUrl: row.imageUrl || "https://via.placeholder.com/400",
                        features: row.features ? row.features.split(',').map((f: string) => f.trim()) : []
                    });
                }

                if (productsToAdd.length > 0) {
                    await addBulkProducts(productsToAdd);
                    alert(`Successfully imported ${productsToAdd.length} products!`);
                    setBulkFile(null);
                    setIsBulkModalOpen(false);
                    await loadData();
                } else {
                    alert("No valid products found in file. Please check the template.");
                }

            } catch (err: any) {
                console.error("Bulk upload error", err);
                alert("Failed to process file: " + err.message);
            } finally {
                setIsLoading(false);
            }
        };
        reader.readAsBinaryString(bulkFile);
    };

    const hasMockProducts = products.some(p => p.id.length < 10);

    return (
        <div className="min-h-screen bg-gray-100 p-8">
            <div className="max-w-7xl mx-auto">
                <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
                    <div className="flex items-center gap-4">
                        <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
                        {isSupabaseConfigured() ? (
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 border border-green-200">
                                <span className="w-2 h-2 bg-green-500 rounded-full mr-1.5 animate-pulse"></span>
                                Live Database
                            </span>
                        ) : (
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800 border border-yellow-200">
                                <span className="w-2 h-2 bg-yellow-500 rounded-full mr-1.5"></span>
                                Mock Data Mode
                            </span>
                        )}
                    </div>

                    <div className="flex space-x-2">
                        <button
                            onClick={() => setActiveTab('overview')}
                            className={`px-4 py-2 rounded-md text-sm font-medium ${activeTab === 'overview' ? 'bg-brand-600 text-white' : 'bg-white text-gray-700 hover:bg-gray-50'}`}
                        >
                            Overview
                        </button>
                        <button
                            onClick={() => setActiveTab('orders')}
                            className={`px-4 py-2 rounded-md text-sm font-medium ${activeTab === 'orders' ? 'bg-brand-600 text-white' : 'bg-white text-gray-700 hover:bg-gray-50'}`}
                        >
                            Orders
                        </button>
                        <button
                            onClick={() => setActiveTab('inventory')}
                            className={`px-4 py-2 rounded-md text-sm font-medium ${activeTab === 'inventory' ? 'bg-brand-600 text-white' : 'bg-white text-gray-700 hover:bg-gray-50'}`}
                        >
                            Inventory
                        </button>
                        <button
                            onClick={() => setActiveTab('seo')}
                            className={`px-4 py-2 rounded-md text-sm font-medium ${activeTab === 'seo' ? 'bg-brand-600 text-white' : 'bg-white text-gray-700 hover:bg-gray-50'}`}
                        >
                            SEO Engine
                        </button>
                    </div>
                </div>



                {/* --- Overview Tab --- */}
                {activeTab === 'overview' && (
                    <>
                        {/* Stats Grid */}
                        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4 mb-8">
                            <div className="bg-white overflow-hidden shadow rounded-lg">
                                <div className="p-5">
                                    <div className="flex items-center">
                                        <div className="flex-shrink-0 bg-brand-500 rounded-md p-3">
                                            <DollarSign className="h-6 w-6 text-white" />
                                        </div>
                                        <div className="ml-5 w-0 flex-1">
                                            <dl>
                                                <dt className="text-sm font-medium text-gray-500 truncate">Total Revenue</dt>
                                                <dd className="text-lg font-medium text-gray-900">{stats.totalRevenue} MAD</dd>
                                            </dl>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="bg-white overflow-hidden shadow rounded-lg">
                                <div className="p-5">
                                    <div className="flex items-center">
                                        <div className="flex-shrink-0 bg-blue-500 rounded-md p-3">
                                            <ShoppingBag className="h-6 w-6 text-white" />
                                        </div>
                                        <div className="ml-5 w-0 flex-1">
                                            <dl>
                                                <dt className="text-sm font-medium text-gray-500 truncate">Total Orders</dt>
                                                <dd className="text-lg font-medium text-gray-900">{stats.totalOrders}</dd>
                                            </dl>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="bg-white overflow-hidden shadow rounded-lg">
                                <div className="p-5">
                                    <div className="flex items-center">
                                        <div className="flex-shrink-0 bg-green-500 rounded-md p-3">
                                            <Package className="h-6 w-6 text-white" />
                                        </div>
                                        <div className="ml-5 w-0 flex-1">
                                            <dl>
                                                <dt className="text-sm font-medium text-gray-500 truncate">Inventory Count</dt>
                                                <dd className="text-lg font-medium text-gray-900">{products.length}</dd>
                                            </dl>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="bg-white overflow-hidden shadow rounded-lg">
                                <div className="p-5">
                                    <div className="flex items-center">
                                        <div className="flex-shrink-0 bg-yellow-500 rounded-md p-3">
                                            <Users className="h-6 w-6 text-white" />
                                        </div>
                                        <div className="ml-5 w-0 flex-1">
                                            <dl>
                                                <dt className="text-sm font-medium text-gray-500 truncate">Active Users</dt>
                                                <dd className="text-lg font-medium text-gray-900">{stats.activeUsers}</dd>
                                            </dl>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Charts */}
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
                            <div className="bg-white p-6 rounded-lg shadow">
                                <h3 className="text-lg font-medium leading-6 text-gray-900 mb-4">Weekly Sales</h3>
                                <div className="h-72">
                                    {salesData.length > 0 ? (
                                        <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={0}>
                                            <BarChart data={salesData}>
                                                <CartesianGrid strokeDasharray="3 3" />
                                                <XAxis dataKey="name" />
                                                <YAxis />
                                                <Tooltip />
                                                <Bar dataKey="sales" fill="#ec4899" />
                                            </BarChart>
                                        </ResponsiveContainer>
                                    ) : (
                                        <div className="h-full flex items-center justify-center text-gray-400">
                                            No sales data available for this week.
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </>
                )}

                {/* --- Orders Tab --- */}
                {activeTab === 'orders' && (
                    <div className="bg-white shadow overflow-hidden sm:rounded-lg">
                        <div className="px-4 py-5 sm:px-6 border-b border-gray-200 flex flex-col sm:flex-row justify-between items-center gap-4">
                            <div>
                                <h3 className="text-lg leading-6 font-medium text-gray-900">Gestion des Commandes</h3>
                                <p className="mt-1 text-sm text-gray-500">Suivi et mise à jour des commandes clients.</p>
                            </div>
                            <div className="flex flex-wrap gap-2">
                                {['all', 'pending', 'shipped', 'delivered', 'returned', 'cancelled'].map((status) => (
                                    <button
                                        key={status}
                                        onClick={() => filterOrders(status)}
                                        className={`px-3 py-1 rounded-full text-xs font-medium capitalize border transition-colors ${orderFilter === status
                                            ? 'bg-brand-100 text-brand-800 border-brand-200'
                                            : 'bg-white text-gray-600 border-gray-300 hover:bg-gray-50'
                                            }`}
                                    >
                                        {status === 'all' ? 'Tout' :
                                            status === 'pending' ? 'À Confirmer' :
                                                status === 'returned' ? 'Retourné' :
                                                    status === 'cancelled' ? 'Annulé' :
                                                        status === 'shipped' ? 'Expédié' : 'Livré'}
                                    </button>
                                ))}
                            </div>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Réf.</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Client</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Statut</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {filteredOrders.map((order) => (
                                        <tr key={order.id} className="hover:bg-slate-50 transition-colors">
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">#{order.id.slice(0, 8)}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                <div className="font-medium text-gray-900">{order.shipping_info ? `${order.shipping_info.first_name} ${order.shipping_info.last_name}` : 'Inconnu'}</div>
                                                <div className="text-xs text-gray-400">{order.shipping_info?.phone}</div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-gray-900">{order.total} MAD</td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${order.status === 'delivered' ? 'bg-green-100 text-green-800' :
                                                    order.status === 'shipped' ? 'bg-blue-100 text-blue-800' :
                                                        order.status === 'cancelled' ? 'bg-red-100 text-red-800' :
                                                            order.status === 'returned' ? 'bg-orange-100 text-orange-800' :
                                                                'bg-yellow-100 text-yellow-800'
                                                    }`}>
                                                    {order.status === 'delivered' ? 'Livré' :
                                                        order.status === 'shipped' ? 'Expédié' :
                                                            order.status === 'cancelled' ? 'Annulé' :
                                                                order.status === 'returned' ? 'Retourné' :
                                                                    'À Confirmer'}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                {new Date(order.created_at).toLocaleDateString('fr-FR')}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 flex gap-2">
                                                <button
                                                    onClick={() => handleWhatsApp(order)}
                                                    className="text-green-600 hover:text-green-800 p-1"
                                                    title="Confirmer sur WhatsApp"
                                                >
                                                    <MessageCircle className="h-5 w-5" />
                                                </button>
                                                <button
                                                    onClick={() => openOrderDetails(order)}
                                                    className="text-gray-400 hover:text-brand-600 p-1"
                                                    title="Voir Détails"
                                                >
                                                    <Eye className="h-5 w-5" />
                                                </button>
                                                <div className="h-5 w-px bg-gray-200 mx-1"></div>
                                                <button
                                                    onClick={() => handleStatusUpdate(order.id, 'shipped')}
                                                    className="text-blue-600 hover:text-blue-900 p-1"
                                                    title="Marquer Expédié"
                                                >
                                                    <Truck className="h-5 w-5" />
                                                </button>
                                                <button
                                                    onClick={() => handleStatusUpdate(order.id, 'delivered')}
                                                    className="text-green-600 hover:text-green-900 p-1"
                                                    title="Marquer Livré"
                                                >
                                                    <CheckCircle className="h-5 w-5" />
                                                </button>
                                                <button
                                                    onClick={() => handleStatusUpdate(order.id, 'cancelled')}
                                                    className="text-red-600 hover:text-red-900 p-1"
                                                    title="Annuler"
                                                >
                                                    <XCircle className="h-5 w-5" />
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                    {filteredOrders.length === 0 && (
                                        <tr>
                                            <td colSpan={6} className="px-6 py-12 text-center text-gray-500">
                                                Aucune commande trouvée avec ce statut.
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}

                {/* --- Inventory Tab --- */}
                {activeTab === 'inventory' && (
                    <div className="bg-white shadow overflow-hidden sm:rounded-lg">
                        <div className="px-4 py-5 sm:px-6 border-b border-gray-200 flex flex-col md:flex-row justify-between items-center gap-4">
                            <div>
                                <h3 className="text-lg leading-6 font-medium text-gray-900">Product Inventory</h3>
                                <p className="mt-1 text-sm text-gray-500">Manage your store products.</p>
                            </div>
                            <div className="flex gap-2">
                                {isSupabaseConfigured() && products.length === 0 && (
                                    <button onClick={handleSeed} disabled={isLoading} className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 animate-pulse">
                                        <Database className="h-4 w-4 mr-2" />
                                        {isLoading ? 'Seeding...' : 'Seed Database'}
                                    </button>
                                )}
                                <button
                                    onClick={() => {
                                        setBulkFile(null);
                                        setIsBulkModalOpen(true);
                                    }}
                                    className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                                >
                                    <FileSpreadsheet className="h-4 w-4 mr-2" />
                                    Bulk Upload
                                </button>
                                <button
                                    onClick={openAddProduct}
                                    className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-brand-600 hover:bg-brand-700"
                                >
                                    <Plus className="h-4 w-4 mr-2" />
                                    Add Product
                                </button>
                            </div>
                        </div>
                        {isSupabaseConfigured() && hasMockProducts && (
                            <div className="bg-blue-50 p-4 border-b border-blue-100">
                                <p className="text-sm text-blue-800 flex items-center gap-2">
                                    <AlertTriangle className="h-4 w-4" />
                                    <span>Currently viewing some fallback data. Click <strong>"Seed Database"</strong> to populate your database with real editable records.</span>
                                </p>
                            </div>
                        )}
                        <ul className="divide-y divide-gray-200">
                            {products.map((product) => (
                                <li key={product.id} className="px-4 py-4 sm:px-6 flex items-center justify-between">
                                    <div className="flex items-center">
                                        <img className="h-10 w-10 rounded-full object-cover" src={product.imageUrl} alt="" />
                                        <div className="ml-4">
                                            <div className="text-sm font-medium text-gray-900">{product.name}</div>
                                            <div className="text-sm text-gray-500">{product.category} | Stock: {product.stock}</div>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-4">
                                        <span className="text-sm text-gray-900 font-bold">{product.price} MAD</span>
                                        <button onClick={() => openEditProduct(product)} className="text-blue-600 hover:text-blue-900" title="Edit">
                                            <Edit className="h-5 w-5" />
                                        </button>
                                        <button onClick={() => handleDelete(product.id)} className="text-red-600 hover:text-red-900" title="Delete">
                                            <Trash2 className="h-5 w-5" />
                                        </button>
                                    </div>
                                </li>
                            ))}
                            {products.length === 0 && (
                                <li className="px-4 py-12 text-center text-gray-500">
                                    No products found in database. {isSupabaseConfigured() ? "Click 'Seed Database' to get started." : ""}
                                </li>
                            )}
                        </ul>
                    </div>
                )}

                {/* --- SEO Engine Tab --- */}
                {activeTab === 'seo' && (
                    <div className="bg-white shadow overflow-hidden sm:rounded-lg">
                        <div className="px-4 py-5 sm:px-6 border-b border-gray-200">
                            <h3 className="text-lg leading-6 font-medium text-gray-900">PSEO Content Engine</h3>
                            <p className="mt-1 text-sm text-gray-500">Manage automated landing pages and research content.</p>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Page Title</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Problem</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {pseoPages.map((page) => (
                                        <tr key={page.id}>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="text-sm font-medium text-gray-900">{page.title || 'Untitled Page'}</div>
                                                <div className="text-xs text-gray-400">{page.slug}</div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                {page.problem?.name || 'N/A'}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800">
                                                    {page.type}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${page.status === 'published' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                                                    {page.status}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 flex gap-2">
                                                <a
                                                    href={`/solution/${page.slug}`}
                                                    target="_blank"
                                                    rel="noreferrer"
                                                    className="text-blue-600 hover:text-blue-900 p-1"
                                                    title="View Live"
                                                >
                                                    <Eye className="h-5 w-5" />
                                                </a>
                                                <button
                                                    onClick={() => handlePseoStatus(page.id, page.status)}
                                                    className={`${page.status === 'published' ? 'text-orange-600 hover:text-orange-900' : 'text-green-600 hover:text-green-900'} p-1`}
                                                    title={page.status === 'published' ? "Unpublish" : "Publish"}
                                                >
                                                    {page.status === 'published' ? <X className="h-5 w-5" /> : <CheckCircle className="h-5 w-5" />}
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                    {pseoPages.length === 0 && (
                                        <tr>
                                            <td colSpan={5} className="px-6 py-12 text-center text-gray-500">
                                                <FileText className="h-10 w-10 mx-auto text-gray-300 mb-2" />
                                                <p>No PSEO pages generated yet.</p>
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}


                {/* --- Product Modal --- */}
                {isProductModalOpen && (
                    <div className="fixed inset-0 z-50 overflow-y-auto">
                        <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
                            <div className="fixed inset-0 transition-opacity" aria-hidden="true" onClick={() => setIsProductModalOpen(false)}>
                                <div className="absolute inset-0 bg-gray-500 opacity-75"></div>
                            </div>
                            <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>

                            <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg w-full">
                                <form onSubmit={handleSaveProduct}>
                                    <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                                        <div className="flex justify-between items-start mb-4">
                                            <h3 className="text-lg leading-6 font-medium text-gray-900" id="modal-title">
                                                {editingProduct ? 'Edit Product' : 'Add New Product'}
                                            </h3>
                                            <button type="button" onClick={() => setIsProductModalOpen(false)} className="bg-white rounded-md text-gray-400 hover:text-gray-500 focus:outline-none">
                                                <X className="h-6 w-6" />
                                            </button>
                                        </div>
                                        <div className="space-y-4">
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700">Product Name</label>
                                                <input
                                                    type="text" required
                                                    value={formData.name}
                                                    onChange={e => setFormData({ ...formData, name: e.target.value })}
                                                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-brand-500 focus:border-brand-500 sm:text-sm"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700">Category</label>
                                                <select
                                                    value={formData.category}
                                                    onChange={e => setFormData({ ...formData, category: e.target.value as any })}
                                                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-brand-500 focus:border-brand-500 sm:text-sm"
                                                >
                                                    {Object.values(ProductCategory).map((c) => (
                                                        <option key={c} value={c}>{c}</option>
                                                    ))}
                                                </select>
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700">Brand</label>
                                                <input
                                                    type="text"
                                                    value={formData.brand || ''}
                                                    onChange={e => setFormData({ ...formData, brand: e.target.value })}
                                                    placeholder="e.g. Durex, Manix"
                                                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-brand-500 focus:border-brand-500 sm:text-sm"
                                                />
                                            </div>
                                            <div className="grid grid-cols-2 gap-4">
                                                <div>
                                                    <label className="block text-sm font-medium text-gray-700">Price (MAD)</label>
                                                    <input
                                                        type="number" required min="0"
                                                        value={formData.price}
                                                        onChange={e => setFormData({ ...formData, price: Number(e.target.value) })}
                                                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-brand-500 focus:border-brand-500 sm:text-sm"
                                                    />
                                                </div>
                                                <div>
                                                    <label className="block text-sm font-medium text-gray-700">Stock</label>
                                                    <input
                                                        type="number" required min="0"
                                                        value={formData.stock}
                                                        onChange={e => setFormData({ ...formData, stock: Number(e.target.value) })}
                                                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-brand-500 focus:border-brand-500 sm:text-sm"
                                                    />
                                                </div>
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700">Description</label>
                                                <textarea
                                                    rows={3} required
                                                    value={formData.description}
                                                    onChange={e => setFormData({ ...formData, description: e.target.value })}
                                                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-brand-500 focus:border-brand-500 sm:text-sm"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700">Image URL</label>
                                                <input
                                                    type="text"
                                                    value={formData.imageUrl}
                                                    onChange={e => setFormData({ ...formData, imageUrl: e.target.value })}
                                                    placeholder="https://example.com/image.jpg"
                                                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-brand-500 focus:border-brand-500 sm:text-sm"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700">Features (comma separated)</label>
                                                <input
                                                    type="text"
                                                    value={featureInput}
                                                    onChange={e => setFeatureInput(e.target.value)}
                                                    placeholder="Ultra Thin, Lubricated, Latex Free"
                                                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-brand-500 focus:border-brand-500 sm:text-sm"
                                                />
                                            </div>
                                            <div className="mt-4">
                                                <div className="flex items-center">
                                                    <input
                                                        id="is_featured"
                                                        type="checkbox"
                                                        checked={formData.is_featured || false}
                                                        onChange={e => setFormData({ ...formData, is_featured: e.target.checked })}
                                                        className="h-4 w-4 text-brand-600 focus:ring-brand-500 border-gray-300 rounded"
                                                    />
                                                    <label htmlFor="is_featured" className="ml-2 block text-sm text-gray-900">
                                                        Featured Product (Shows at top of list)
                                                    </label>
                                                </div>
                                                <div className="flex items-center mt-3">
                                                    <input
                                                        id="show_on_homepage"
                                                        type="checkbox"
                                                        checked={formData.show_on_homepage || false}
                                                        onChange={e => setFormData({ ...formData, show_on_homepage: e.target.checked })}
                                                        className="h-4 w-4 text-pink-600 focus:ring-pink-500 border-gray-300 rounded"
                                                    />
                                                    <label htmlFor="show_on_homepage" className="ml-2 block text-sm text-gray-900">
                                                        ⭐ Show on Homepage (Trending Section)
                                                    </label>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                                        <button type="submit" disabled={isLoading} className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-brand-600 text-base font-medium text-white hover:bg-brand-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-500 sm:ml-3 sm:w-auto sm:text-sm">
                                            <Save className="h-4 w-4 mr-2" />
                                            {isLoading ? 'Saving...' : 'Save Product'}
                                        </button>
                                        <button type="button" onClick={() => setIsProductModalOpen(false)} className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm">
                                            Cancel
                                        </button>
                                    </div>
                                </form>
                            </div>
                        </div>
                    </div>
                )}

                {/* --- Bulk Upload Modal --- */}
                {isBulkModalOpen && (
                    <div className="fixed inset-0 z-50 overflow-y-auto">
                        <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
                            <div className="fixed inset-0 transition-opacity" aria-hidden="true" onClick={() => setIsBulkModalOpen(false)}>
                                <div className="absolute inset-0 bg-gray-500 opacity-75"></div>
                            </div>
                            <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>

                            <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg w-full">
                                <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                                    <div className="flex justify-between items-start mb-4">
                                        <h3 className="text-lg leading-6 font-medium text-gray-900">
                                            Bulk Product Upload
                                        </h3>
                                        <button type="button" onClick={() => setIsBulkModalOpen(false)} className="bg-white rounded-md text-gray-400 hover:text-gray-500 focus:outline-none">
                                            <X className="h-6 w-6" />
                                        </button>
                                    </div>

                                    <div className="space-y-6">
                                        <div className="bg-blue-50 p-4 rounded-md border border-blue-100">
                                            <h4 className="text-sm font-bold text-blue-800 mb-2">Instructions:</h4>
                                            <ul className="list-disc list-inside text-sm text-blue-700 space-y-1">
                                                <li>Download the template below.</li>
                                                <li>Fill in your product data. Keep headers exact.</li>
                                                <li>'Category' must match: {Object.values(ProductCategory).join(', ')}.</li>
                                                <li>Save as .xlsx and upload here.</li>
                                            </ul>
                                        </div>

                                        <div className="flex justify-center">
                                            <button
                                                onClick={downloadTemplate}
                                                className="flex items-center gap-2 text-brand-600 hover:text-brand-700 border border-brand-200 hover:bg-brand-50 px-4 py-2 rounded-md transition-colors"
                                            >
                                                <Download className="h-4 w-4" /> Download Excel Template
                                            </button>
                                        </div>

                                        <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:bg-gray-50 transition-colors">
                                            <input
                                                type="file"
                                                ref={fileInputRef}
                                                accept=".xlsx, .xls"
                                                onChange={handleBulkFileChange}
                                                className="hidden"
                                            />
                                            {!bulkFile ? (
                                                <div className="flex flex-col items-center cursor-pointer" onClick={() => fileInputRef.current?.click()}>
                                                    <Upload className="h-10 w-10 text-gray-400 mb-3" />
                                                    <span className="text-gray-600 font-medium">Click to upload Excel file</span>
                                                    <span className="text-xs text-gray-400 mt-1">.xlsx or .xls</span>
                                                </div>
                                            ) : (
                                                <div className="flex flex-col items-center">
                                                    <FileSpreadsheet className="h-10 w-10 text-green-500 mb-3" />
                                                    <span className="text-gray-900 font-medium">{bulkFile.name}</span>
                                                    <button onClick={() => setBulkFile(null)} className="text-xs text-red-500 mt-2 hover:underline">Remove</button>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                                <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                                    <button
                                        type="button"
                                        onClick={processBulkUpload}
                                        disabled={!bulkFile || isLoading}
                                        className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-brand-600 text-base font-medium text-white hover:bg-brand-700 focus:outline-none disabled:opacity-50 sm:ml-3 sm:w-auto sm:text-sm"
                                    >
                                        {isLoading ? 'Processing...' : 'Upload & Import'}
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setIsBulkModalOpen(false)}
                                        className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
                                    >
                                        Cancel
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* --- Order Details Modal --- */}
                {isOrderModalOpen && selectedOrder && (
                    <div className="fixed inset-0 z-50 overflow-y-auto">
                        <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
                            <div className="fixed inset-0 transition-opacity" aria-hidden="true" onClick={() => setIsOrderModalOpen(false)}>
                                <div className="absolute inset-0 bg-gray-500 opacity-75"></div>
                            </div>
                            <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>

                            <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-2xl w-full">
                                <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                                    <div className="flex justify-between items-start mb-6">
                                        <div>
                                            <h3 className="text-xl leading-6 font-bold text-gray-900">
                                                Commande #{selectedOrder.id.slice(0, 8)}
                                            </h3>
                                            <p className="text-sm text-gray-500 mt-1">
                                                Passée le {new Date(selectedOrder.created_at).toLocaleString('fr-FR')}
                                            </p>
                                        </div>
                                        <button onClick={() => setIsOrderModalOpen(false)} className="bg-gray-100 hover:bg-gray-200 rounded-full p-2 text-gray-500">
                                            <X className="h-5 w-5" />
                                        </button>
                                    </div>

                                    <div className="grid md:grid-cols-2 gap-8 mb-8 border-b border-gray-100 pb-8">
                                        <div>
                                            <h4 className="font-bold text-gray-900 mb-2 flex items-center gap-2">
                                                <Users className="h-4 w-4 text-brand-500" /> Informations Client
                                            </h4>
                                            <div className="bg-gray-50 p-4 rounded-lg text-sm text-gray-600 space-y-1">
                                                <p className="font-bold text-gray-900 text-base">
                                                    {selectedOrder.shipping_info?.first_name} {selectedOrder.shipping_info?.last_name}
                                                </p>
                                                <p>{selectedOrder.shipping_info?.phone}</p>
                                                <p>{selectedOrder.shipping_info?.address}</p>
                                                <p>{selectedOrder.shipping_info?.city}</p>
                                            </div>
                                        </div>
                                        <div>
                                            <h4 className="font-bold text-gray-900 mb-2 flex items-center gap-2">
                                                <Package className="h-4 w-4 text-brand-500" /> Statut & Paiement
                                            </h4>
                                            <div className="bg-gray-50 p-4 rounded-lg text-sm text-gray-600 space-y-3">
                                                <div className="flex justify-between items-center">
                                                    <span>Statut actuel:</span>
                                                    <span className={`px-2 py-0.5 rounded-full text-xs font-bold uppercase ${selectedOrder.status === 'delivered' ? 'bg-green-100 text-green-800' :
                                                        selectedOrder.status === 'shipped' ? 'bg-blue-100 text-blue-800' :
                                                            'bg-yellow-100 text-yellow-800'
                                                        }`}>
                                                        {selectedOrder.status}
                                                    </span>
                                                </div>
                                                <div className="flex justify-between items-center">
                                                    <span>Méthode:</span>
                                                    <span className="font-medium">Paiement à la livraison (COD)</span>
                                                </div>
                                                <div className="flex justify-between items-center border-t border-gray-200 pt-2 mt-2">
                                                    <span className="font-bold text-gray-900">Total à encaisser:</span>
                                                    <span className="font-bold text-xl text-brand-600">{selectedOrder.total} MAD</span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    <div>
                                        <h4 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                                            <ShoppingBag className="h-4 w-4 text-brand-500" /> Articles commandés ({selectedOrder.items.length})
                                        </h4>
                                        <ul className="divide-y divide-gray-100">
                                            {selectedOrder.items.map((item, idx) => (
                                                <li key={idx} className="py-3 flex items-center justify-between">
                                                    <div className="flex items-center gap-4">
                                                        <div className="h-12 w-12 rounded-md bg-gray-100 border border-gray-200 overflow-hidden flex-shrink-0">
                                                            <img src={item.imageUrl} alt={item.name} className="h-full w-full object-cover" />
                                                        </div>
                                                        <div>
                                                            <p className="font-medium text-gray-900">{item.name}</p>
                                                            <p className="text-sm text-gray-500">Quantité: {item.quantity}</p>
                                                        </div>
                                                    </div>
                                                    <span className="font-bold text-gray-900">
                                                        {item.price * item.quantity} MAD
                                                    </span>
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                </div>
                                <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse gap-2">
                                    <button
                                        type="button"
                                        onClick={() => handleWhatsApp(selectedOrder)}
                                        className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-green-500 text-base font-medium text-white hover:bg-green-600 focus:outline-none sm:w-auto sm:text-sm"
                                    >
                                        <MessageCircle className="h-4 w-4 mr-2" /> Confirmer sur WhatsApp
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => {
                                            handleStatusUpdate(selectedOrder.id, 'shipped');
                                            setIsOrderModalOpen(false);
                                        }}
                                        className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-blue-600 text-base font-medium text-white hover:bg-blue-700 focus:outline-none sm:w-auto sm:text-sm"
                                    >
                                        <Truck className="h-4 w-4 mr-2" /> Marquer Expédié
                                    </button>
                                    {(selectedOrder.status !== 'cancelled' && selectedOrder.status !== 'returned') && (
                                        <>
                                            <button
                                                type="button"
                                                onClick={() => {
                                                    handleStatusUpdate(selectedOrder.id, 'returned');
                                                    setIsOrderModalOpen(false);
                                                }}
                                                className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-orange-600 text-base font-medium text-white hover:bg-orange-700 focus:outline-none sm:w-auto sm:text-sm"
                                            >
                                                <RotateCcw className="h-4 w-4 mr-2" /> Retourné
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => {
                                                    handleStatusUpdate(selectedOrder.id, 'cancelled');
                                                    setIsOrderModalOpen(false);
                                                }}
                                                className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-red-600 text-base font-medium text-white hover:bg-red-700 focus:outline-none sm:w-auto sm:text-sm"
                                            >
                                                <XCircle className="h-4 w-4 mr-2" /> Annuler
                                            </button>
                                        </>
                                    )}
                                    <button
                                        type="button"
                                        onClick={() => setIsOrderModalOpen(false)}
                                        className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
                                    >
                                        Fermer
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div >
        </div >
    );
};

export default AdminDashboard;