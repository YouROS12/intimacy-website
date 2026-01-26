import React, { useEffect, useState, useRef } from 'react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer 
} from 'recharts';
import { Users, ShoppingBag, DollarSign, Package, Plus, Trash2, Database, AlertTriangle, Truck, CheckCircle, Clock, Edit, X, Save, Upload, FileSpreadsheet, Download, Copy } from 'lucide-react';
import { getDashboardStats, getAllOrders, getProducts, deleteProduct, addProduct, addBulkProducts, updateProduct, seedDatabase, updateOrderStatus, getWeeklySales } from '../services/api';
import { Order, Product, ProductCategory } from '../types';
import { isSupabaseConfigured } from '../services/supabase';
import * as XLSX from 'xlsx';

const AdminDashboard: React.FC = () => {
    const [activeTab, setActiveTab] = useState<'overview' | 'inventory' | 'orders' | 'setup'>('overview');
    const [stats, setStats] = useState({ totalRevenue: 0, totalOrders: 0, activeUsers: 0 });
    const [salesData, setSalesData] = useState<{name: string, sales: number}[]>([]);
    const [orders, setOrders] = useState<Order[]>([]);
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
        stock: 0,
        imageUrl: '',
        features: []
    });
    const [featureInput, setFeatureInput] = useState('');

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
            
            // @ts-ignore
            setStats(s);
            setOrders(o);
            setProducts(p);
            setSalesData(sales);
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
        if(!confirm("Are you sure you want to delete this product?")) return;
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

    // --- Modal Handlers ---

    const openAddProduct = () => {
        setEditingProduct(null);
        setFormData({
            name: '',
            description: '',
            price: 0,
            category: ProductCategory.LUBRICANT,
            stock: 0,
            imageUrl: '',
            features: []
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
                    onClick={() => setActiveTab('setup')}
                    className={`px-4 py-2 rounded-md text-sm font-medium ${activeTab === 'setup' ? 'bg-brand-600 text-white' : 'bg-white text-gray-700 hover:bg-gray-50'}`}
                >
                    Database Setup
                </button>
            </div>
        </div>

        {!isSupabaseConfigured() && (
            <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-8">
                <div className="flex">
                    <div className="flex-shrink-0">
                        <AlertTriangle className="h-5 w-5 text-yellow-400" />
                    </div>
                    <div className="ml-3">
                        <p className="text-sm text-yellow-700">
                            <strong>Running in Mock Mode.</strong> Changes will not persist after reload.
                        </p>
                    </div>
                </div>
            </div>
        )}

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
                <div className="px-4 py-5 sm:px-6 border-b border-gray-200">
                    <h3 className="text-lg leading-6 font-medium text-gray-900">Order Management</h3>
                    <p className="mt-1 text-sm text-gray-500">View and update customer orders.</p>
                </div>
                <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Order ID</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Customer</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {orders.map((order) => (
                            <tr key={order.id}>
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">#{order.id.slice(0, 8)}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                    {order.shipping_info ? `${order.shipping_info.first_name} ${order.shipping_info.last_name}` : 'Unknown'}
                                    <div className="text-xs text-gray-400">{order.shipping_info?.phone}</div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{order.total} MAD</td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                                        order.status === 'delivered' ? 'bg-green-100 text-green-800' : 
                                        order.status === 'shipped' ? 'bg-blue-100 text-blue-800' :
                                        'bg-yellow-100 text-yellow-800'
                                    }`}>
                                        {order.status}
                                    </span>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                    {new Date(order.created_at).toLocaleDateString()}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 flex gap-2">
                                    <button 
                                        onClick={() => handleStatusUpdate(order.id, 'processing')}
                                        className="text-yellow-600 hover:text-yellow-900 p-1" 
                                        title="Mark Processing"
                                    >
                                        <Clock className="h-5 w-5" />
                                    </button>
                                    <button 
                                        onClick={() => handleStatusUpdate(order.id, 'shipped')}
                                        className="text-blue-600 hover:text-blue-900 p-1"
                                        title="Mark Shipped"
                                    >
                                        <Truck className="h-5 w-5" />
                                    </button>
                                    <button 
                                        onClick={() => handleStatusUpdate(order.id, 'delivered')}
                                        className="text-green-600 hover:text-green-900 p-1"
                                        title="Mark Delivered"
                                    >
                                        <CheckCircle className="h-5 w-5" />
                                    </button>
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

        {/* --- Database Setup Tab --- */}
        {activeTab === 'setup' && (
            <div className="bg-white shadow sm:rounded-lg p-6">
                <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">Database Master Reset</h3>
                <p className="mb-4 text-gray-600">
                    Use this script to completely rebuild your database tables, policies, and triggers. <span className="text-red-600 font-bold">WARNING: This will delete existing public data.</span>
                </p>
                
                <div className="bg-gray-800 rounded-lg p-4 relative group">
                    <button 
                        onClick={() => {
                            const sql = document.getElementById('sql-code')?.innerText;
                            if (sql) {
                                navigator.clipboard.writeText(sql);
                                alert("SQL copied to clipboard!");
                            }
                        }}
                        className="absolute top-4 right-4 text-gray-400 hover:text-white bg-gray-700 hover:bg-gray-600 p-2 rounded transition-colors"
                        title="Copy SQL"
                    >
                        <Copy className="h-4 w-4" />
                    </button>
                    <pre id="sql-code" className="text-green-400 font-mono text-sm overflow-x-auto whitespace-pre-wrap">
{`-- ==============================================================================
-- MASTER RESET SCRIPT
-- WARNING: This will DELETE existing data in the public tables to ensure a clean slate.
-- ==============================================================================

-- 1. CLEANUP (Remove old conflicts)
drop trigger if exists on_auth_user_created on auth.users;
drop function if exists public.handle_new_user();
drop table if exists public.orders;
drop table if exists public.products;
drop table if exists public.profiles;

-- 2. CREATE TABLES

-- Profiles: Links to Supabase Auth, stores User roles
create table public.profiles (
  id uuid references auth.users(id) on delete cascade not null primary key,
  email text,
  full_name text,
  phone text,
  address text,
  role text default 'user', -- 'admin' or 'user'
  updated_at timestamp with time zone default now()
);

-- Products: Store inventory
create table public.products (
  id uuid default gen_random_uuid() primary key,
  name text not null,
  description text,
  price float8 not null,
  category text,
  image_url text,
  stock int default 0,
  features text[] -- Array of strings
);

-- Orders: Store purchase history
create table public.orders (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id) on delete cascade not null,
  items jsonb not null, -- Stores snapshot of cart items
  total float8 not null,
  status text default 'pending', -- pending, processing, shipped, delivered
  shipping_info jsonb,
  created_at timestamp with time zone default now()
);

-- 3. ENABLE SECURITY (RLS)

alter table public.profiles enable row level security;
alter table public.products enable row level security;
alter table public.orders enable row level security;

-- 4. CREATE POLICIES (Permissions)

-- Profiles
create policy "Public profiles are viewable by everyone" 
  on public.profiles for select using (true);

create policy "Users can update their own profile" 
  on public.profiles for update using (auth.uid() = id);

-- Products
create policy "Anyone can read products" 
  on public.products for select using (true);

create policy "Admins can insert products" 
  on public.products for insert 
  with check (exists (select 1 from public.profiles where id = auth.uid() and role = 'admin'));

create policy "Admins can update products" 
  on public.products for update 
  using (exists (select 1 from public.profiles where id = auth.uid() and role = 'admin'));

create policy "Admins can delete products" 
  on public.products for delete 
  using (exists (select 1 from public.profiles where id = auth.uid() and role = 'admin'));

-- Orders
create policy "Users can view their own orders" 
  on public.orders for select 
  using (auth.uid() = user_id);

create policy "Admins can view all orders" 
  on public.orders for select 
  using (exists (select 1 from public.profiles where id = auth.uid() and role = 'admin'));

create policy "Users can insert their own orders" 
  on public.orders for insert 
  with check (auth.uid() = user_id);

create policy "Admins can update order status" 
  on public.orders for update 
  using (exists (select 1 from public.profiles where id = auth.uid() and role = 'admin'));

-- 5. AUTOMATION (Auto-create Profile on Signup)

create or replace function public.handle_new_user() 
returns trigger as $$
begin
  insert into public.profiles (id, email, full_name, phone, address, role)
  values (
    new.id, 
    new.email, 
    new.raw_user_meta_data->>'full_name', 
    new.raw_user_meta_data->>'phone', 
    new.raw_user_meta_data->>'address', 
    'user'
  );
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- 6. REPAIR (Backfill for existing users if any)
insert into public.profiles (id, email)
select id, email from auth.users
where id not in (select id from public.profiles)
on conflict (id) do nothing;`}
                    </pre>
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
                                            onChange={e => setFormData({...formData, name: e.target.value})}
                                            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-brand-500 focus:border-brand-500 sm:text-sm"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700">Category</label>
                                        <select 
                                            value={formData.category}
                                            onChange={e => setFormData({...formData, category: e.target.value as any})}
                                            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-brand-500 focus:border-brand-500 sm:text-sm"
                                        >
                                            {Object.values(ProductCategory).map((c) => (
                                                <option key={c} value={c}>{c}</option>
                                            ))}
                                        </select>
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700">Price (MAD)</label>
                                            <input 
                                                type="number" required min="0"
                                                value={formData.price}
                                                onChange={e => setFormData({...formData, price: Number(e.target.value)})}
                                                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-brand-500 focus:border-brand-500 sm:text-sm"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700">Stock</label>
                                            <input 
                                                type="number" required min="0"
                                                value={formData.stock}
                                                onChange={e => setFormData({...formData, stock: Number(e.target.value)})}
                                                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-brand-500 focus:border-brand-500 sm:text-sm"
                                            />
                                        </div>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700">Description</label>
                                        <textarea 
                                            rows={3} required
                                            value={formData.description}
                                            onChange={e => setFormData({...formData, description: e.target.value})}
                                            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-brand-500 focus:border-brand-500 sm:text-sm"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700">Image URL</label>
                                        <input 
                                            type="text" 
                                            value={formData.imageUrl}
                                            onChange={e => setFormData({...formData, imageUrl: e.target.value})}
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
      </div>
    </div>
  );
};

export default AdminDashboard;