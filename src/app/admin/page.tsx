'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import dynamic from 'next/dynamic';
import { useAuth } from '@/contexts/AuthContext';
import { AlertTriangle } from 'lucide-react';
import {
    getProducts,
    getWeeklySales,
} from '@/services/api';
import {
    bulkUpdateAdminOrderStatus,
    getAdminOrders,
    getAdminDashboardStats,
    getStockSyncRuns,
    runManualStockSync,
    updateAdminOrderStatus,
} from '@/actions/admin';
import { Order, Product, StockSyncResult, StockSyncRunRecord } from '@/types';

const OverviewTab = dynamic(() => import('@/components/admin/OverviewTab'));
const OrdersTab = dynamic(() => import('@/components/admin/OrdersTab'));
const InventoryTab = dynamic(() => import('@/components/admin/InventoryTab'));
const SeoTab = dynamic(() => import('@/components/admin/SeoTab'));
const StockSyncTab = dynamic(() => import('@/components/admin/StockSyncTab'));

const tabs = [
    { key: 'overview', label: 'Overview' },
    { key: 'orders', label: 'Orders' },
    { key: 'inventory', label: 'Inventory' },
    { key: 'seo', label: 'SEO' },
    { key: 'stockSync', label: 'Stock Sync' },
] as const;

type AdminTab = (typeof tabs)[number]['key'];

interface DashboardStats {
    totalRevenue: number;
    totalOrders: number;
    activeUsers: number;
}

export default function AdminDashboard() {
    const { user, isLoading: authLoading } = useAuth();
    const router = useRouter();

    const [activeTab, setActiveTab] = useState<AdminTab>('overview');
    const [stats, setStats] = useState<DashboardStats>({ totalRevenue: 0, totalOrders: 0, activeUsers: 0 });
    const [salesData, setSalesData] = useState<{ name: string; sales: number }[]>([]);
    const [orders, setOrders] = useState<Order[]>([]);
    const [products, setProducts] = useState<Product[]>([]);
    const [stockSyncRuns, setStockSyncRuns] = useState<StockSyncRunRecord[]>([]);

    const loadData = async () => {
        try {
            const [s, o, p, sales, syncRuns] = await Promise.all([
                getAdminDashboardStats(),
                getAdminOrders(),
                getProducts(),
                getWeeklySales(),
                getStockSyncRuns(),
            ]);

            setStats(s as DashboardStats);
            setOrders(o);
            setProducts(p);
            setSalesData(sales);
            setStockSyncRuns(syncRuns);
        } catch (e) {
            console.error("Failed to load dashboard data", e);
        }
    };

    useEffect(() => {
        router.refresh();

        if (!authLoading) {
            if (!user) {
                router.replace('/login?from=/admin');
                return;
            }
            if (user.role === 'admin') {
                loadData(); // eslint-disable-line react-hooks/set-state-in-effect
            }
        }
    }, [user, authLoading, router]);

    const handleStatusUpdate = async (orderId: string, newStatus: Order['status']) => {
        try {
            await updateAdminOrderStatus(orderId, newStatus);
            await loadData();
        } catch (e: unknown) {
            alert("Failed to update status: " + (e instanceof Error ? e.message : String(e)));
        }
    };

    const handleBulkStatusUpdate = async (orderIds: string[], newStatus: Order['status']) => {
        try {
            await bulkUpdateAdminOrderStatus(orderIds, newStatus);
            await loadData();
        } catch (e: unknown) {
            alert("Failed to update selected orders: " + (e instanceof Error ? e.message : String(e)));
        }
    };

    const handleManualStockSync = async (): Promise<StockSyncResult> => {
        const result = await runManualStockSync();
        await loadData();
        return result;
    };

    if (authLoading) return <div className="min-h-screen flex items-center justify-center">Authentification...</div>;

    if (user && user.role !== 'admin') {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100 p-4">
                <div className="bg-white p-8 rounded-lg shadow-md max-w-md w-full text-center">
                    <AlertTriangle className="h-16 w-16 text-yellow-500 mx-auto mb-4" />
                    <h1 className="text-2xl font-bold text-gray-900 mb-2">Accès Refusé</h1>
                    <p className="text-gray-600 mb-6">
                        Vous n&apos;avez pas les permissions nécessaires pour accéder à cette page.
                    </p>
                    <button
                        onClick={() => router.push('/')}
                        className="bg-primary text-white px-6 py-2 rounded font-medium hover:bg-primary/90"
                    >
                        Retour à l&apos;accueil
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-100 p-8">
            <div className="max-w-7xl mx-auto">
                <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
                    <h1 className="text-2xl font-bold text-gray-900 font-serif">Admin Dashboard</h1>
                    <div className="flex space-x-2 bg-white p-1 rounded-lg shadow-sm border border-gray-200">
                        {tabs.map((tab) => (
                            <button
                                key={tab.key}
                                onClick={() => setActiveTab(tab.key)}
                                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${activeTab === tab.key ? 'bg-primary text-white shadow-sm' : 'text-gray-600 hover:bg-gray-50'
                                    }`}
                            >
                                {tab.label}
                            </button>
                        ))}
                    </div>
                </div>

                {activeTab === 'overview' && (
                    <OverviewTab stats={stats} salesData={salesData} productCount={products.length} />
                )}
                {activeTab === 'orders' && (
                    <OrdersTab
                        orders={orders}
                        onStatusUpdate={handleStatusUpdate}
                        onBulkStatusUpdate={handleBulkStatusUpdate}
                    />
                )}
                {activeTab === 'inventory' && (
                    <InventoryTab products={products} onDataChanged={loadData} />
                )}
                {activeTab === 'seo' && (
                    <SeoTab />
                )}
                {activeTab === 'stockSync' && (
                    <StockSyncTab
                        runs={stockSyncRuns}
                        onManualSync={handleManualStockSync}
                        onRefreshLogs={loadData}
                    />
                )}
            </div>
        </div>
    );
}
