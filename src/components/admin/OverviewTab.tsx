'use client';

import React from 'react';
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from 'recharts';
import { Users, ShoppingBag, DollarSign, Package } from 'lucide-react';

interface OverviewTabProps {
    stats: { totalRevenue: number; totalOrders: number; activeUsers: number };
    salesData: { name: string; sales: number }[];
    productCount: number;
}

export default function OverviewTab({ stats, salesData, productCount }: OverviewTabProps) {
    const statCards = [
        { label: 'Total Revenue', value: `${stats.totalRevenue} MAD`, icon: DollarSign, color: 'bg-primary' },
        { label: 'Total Orders', value: stats.totalOrders, icon: ShoppingBag, color: 'bg-blue-500' },
        { label: 'Inventory Count', value: productCount, icon: Package, color: 'bg-green-500' },
        { label: 'Active Users', value: stats.activeUsers, icon: Users, color: 'bg-yellow-500' }
    ];

    return (
        <>
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4 mb-8">
                {statCards.map((stat, idx) => (
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
    );
}
