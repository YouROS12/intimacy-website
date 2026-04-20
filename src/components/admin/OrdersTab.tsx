'use client';

import React, { useEffect, useState } from 'react';
import {
    Eye, Package, Truck, Clock, MessageCircle
} from 'lucide-react';
import { Order } from '@/types';
import { getProductImage } from '@/utils/imageHelpers';
import Image from 'next/image';

interface OrdersTabProps {
    orders: Order[];
    onStatusUpdate: (orderId: string, newStatus: Order['status']) => Promise<void>;
    onBulkStatusUpdate: (orderIds: string[], newStatus: Order['status']) => Promise<void>;
}

const ORDER_STATUSES: Order['status'][] = ['pending', 'processing', 'shipped', 'delivered', 'returned', 'cancelled'];

function formatStatusLabel(status: Order['status']) {
    return status.charAt(0).toUpperCase() + status.slice(1);
}

export default function OrdersTab({ orders, onStatusUpdate, onBulkStatusUpdate }: OrdersTabProps) {
    const [orderFilter, setOrderFilter] = useState<'all' | Order['status']>('all');
    const [selectedOrderIds, setSelectedOrderIds] = useState<string[]>([]);
    const [bulkStatus, setBulkStatus] = useState<Order['status'] | ''>('');
    const [isBulkUpdating, setIsBulkUpdating] = useState(false);

    useEffect(() => {
        setSelectedOrderIds((current) => current.filter((id) => orders.some((order) => order.id === id)));
    }, [orders]);

    const filteredOrders = orderFilter === 'all'
        ? orders
        : orders.filter(o => o.status === orderFilter);

    const filteredOrderIds = filteredOrders.map((order) => order.id);
    const selectedFilteredCount = filteredOrderIds.filter((id) => selectedOrderIds.includes(id)).length;
    const allFilteredSelected = filteredOrders.length > 0 && selectedFilteredCount === filteredOrders.length;

    const toggleOrderSelection = (orderId: string) => {
        setSelectedOrderIds((current) => (
            current.includes(orderId)
                ? current.filter((id) => id !== orderId)
                : [...current, orderId]
        ));
    };

    const toggleFilteredSelection = () => {
        if (allFilteredSelected) {
            setSelectedOrderIds((current) => current.filter((id) => !filteredOrderIds.includes(id)));
            return;
        }

        setSelectedOrderIds((current) => [...new Set([...current, ...filteredOrderIds])]);
    };

    const handleBulkUpdate = async () => {
        if (!bulkStatus || selectedOrderIds.length === 0) return;

        const confirmed = window.confirm(
            `Mettre à jour ${selectedOrderIds.length} commande(s) sélectionnée(s) vers ${formatStatusLabel(bulkStatus)} ?`
        );
        if (!confirmed) return;

        setIsBulkUpdating(true);
        try {
            await onBulkStatusUpdate(selectedOrderIds, bulkStatus);
            setSelectedOrderIds([]);
            setBulkStatus('');
        } finally {
            setIsBulkUpdating(false);
        }
    };

    const handleWhatsApp = (order: Order) => {
        if (!order.shipping_info?.phone) return alert("Pas de numéro de téléphone disponible");
        const phone = order.shipping_info.phone.replace(/\s+/g, '').replace('+', '');
        const itemsList = order.items.map(i => `- ${i.quantity}x ${i.name}`).join('\n');
        const message = `Bonjour ${order.shipping_info.first_name},\nMerci pour votre commande sur Intimacy Wellness.\nVoici le détail :\n${itemsList}\n\nTotal : ${order.total} MAD\nAdresse : ${order.shipping_info.address}\n\nConfirmez-vous ?`;
        window.open(`https://wa.me/${phone}?text=${encodeURIComponent(message)}`, '_blank');
    };

    return (
        <div className="bg-white shadow overflow-hidden sm:rounded-lg border border-gray-200">
            <div className="px-4 py-5 sm:px-6 border-b border-gray-200 flex flex-col sm:flex-row justify-between items-center gap-4 bg-gray-50/50">
                <h3 className="text-lg leading-6 font-medium text-gray-900">Gestion des Commandes ({filteredOrders.length})</h3>
                <div className="flex flex-wrap gap-2">
                    {(['all', ...ORDER_STATUSES] as const).map((status) => (
                        <button
                            key={status}
                            onClick={() => setOrderFilter(status)}
                            className={`px-3 py-1 rounded-full text-xs font-medium capitalize border transition-colors ${orderFilter === status ? 'bg-primary/10 text-primary border-primary/20' : 'bg-white text-gray-600 border-gray-300 hover:bg-gray-50'
                                }`}
                        >
                            {status === 'all' ? 'Tout' : status}
                            {status !== 'all' && ` (${orders.filter(o => o.status === status).length})`}
                        </button>
                    ))}
                </div>
            </div>

            {selectedOrderIds.length > 0 && (
                <div className="px-4 py-4 sm:px-6 border-b border-primary/10 bg-primary/5 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3">
                    <div className="text-sm font-medium text-gray-900">
                        {selectedOrderIds.length} commande(s) sélectionnée(s)
                    </div>
                    <div className="flex flex-col sm:flex-row gap-2 sm:items-center">
                        <select
                            value={bulkStatus}
                            onChange={(e) => setBulkStatus(e.target.value as Order['status'] | '')}
                            className="rounded-md border border-gray-300 px-3 py-2 text-sm text-gray-700 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                        >
                            <option value="">Choisir le nouveau statut</option>
                            {ORDER_STATUSES.map((status) => (
                                <option key={status} value={status}>{formatStatusLabel(status)}</option>
                            ))}
                        </select>
                        <button
                            onClick={() => setSelectedOrderIds([])}
                            className="rounded-md border border-gray-300 px-3 py-2 text-sm font-medium text-gray-700 hover:bg-white"
                        >
                            Effacer la sélection
                        </button>
                        <button
                            onClick={handleBulkUpdate}
                            disabled={!bulkStatus || isBulkUpdating}
                            className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary/90 disabled:opacity-50"
                        >
                            {isBulkUpdating ? 'Mise à jour...' : 'Appliquer à la sélection'}
                        </button>
                    </div>
                </div>
            )}

            <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase w-12">
                                <input
                                    type="checkbox"
                                    checked={allFilteredSelected}
                                    onChange={toggleFilteredSelection}
                                    className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                                    title="Sélectionner les commandes filtrées"
                                />
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase w-12"></th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Commande</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Client</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Total</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Statut</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {filteredOrders.map((order) => (
                            <React.Fragment key={order.id}>
                                <tr className="hover:bg-gray-50 transition-colors">
                                    <td className="px-6 py-4">
                                        <input
                                            type="checkbox"
                                            checked={selectedOrderIds.includes(order.id)}
                                            onChange={() => toggleOrderSelection(order.id)}
                                            className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                                        />
                                    </td>
                                    <td className="px-6 py-4">
                                        <button
                                            onClick={() => {
                                                const el = document.getElementById(`order-details-${order.id}`);
                                                if (el) el.classList.toggle('hidden');
                                            }}
                                            className="text-gray-400 hover:text-gray-600"
                                        >
                                            <Eye className="h-4 w-4" />
                                        </button>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="text-sm font-mono font-medium text-gray-900">#{order.id.slice(0, 8).toUpperCase()}</div>
                                        <div className="text-xs text-gray-500">{order.items.length} article(s)</div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="text-sm font-medium text-gray-900">{order.shipping_info?.first_name} {order.shipping_info?.last_name}</div>
                                        <div className="text-xs text-gray-500">{order.shipping_info?.phone}</div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="text-sm text-gray-900">{new Date(order.created_at).toLocaleDateString('fr-FR')}</div>
                                        <div className="text-xs text-gray-500">{new Date(order.created_at).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}</div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="text-sm font-bold text-primary">{order.total} MAD</div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <select
                                            value={order.status}
                                            onChange={(e) => onStatusUpdate(order.id, e.target.value as Order['status'])}
                                            className={`text-xs font-semibold rounded-full px-3 py-1 border-0 focus:ring-2 focus:ring-primary ${order.status === 'delivered' ? 'bg-green-100 text-green-800' :
                                                order.status === 'shipped' ? 'bg-blue-100 text-blue-800' :
                                                    order.status === 'processing' ? 'bg-yellow-100 text-yellow-800' :
                                                        order.status === 'cancelled' ? 'bg-red-100 text-red-800' :
                                                            order.status === 'returned' ? 'bg-purple-100 text-purple-800' :
                                                                'bg-gray-100 text-gray-800'
                                                }`}
                                        >
                                            <option value="pending">Pending</option>
                                            <option value="processing">Processing</option>
                                            <option value="shipped">Shipped</option>
                                            <option value="delivered">Delivered</option>
                                            <option value="returned">Returned</option>
                                            <option value="cancelled">Cancelled</option>
                                        </select>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <button
                                            onClick={() => handleWhatsApp(order)}
                                            className="p-2 text-green-600 hover:bg-green-50 rounded-full transition-colors"
                                            title="Contact via WhatsApp"
                                        >
                                            <MessageCircle className="h-5 w-5" />
                                        </button>
                                    </td>
                                </tr>

                                {/* Expandable Order Details Row */}
                                <tr id={`order-details-${order.id}`} className="hidden bg-gray-50">
                                    <td colSpan={8} className="px-6 py-4">
                                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                            {/* Left: Products */}
                                            <div>
                                                <h4 className="font-medium text-sm text-gray-900 mb-3 flex items-center gap-2">
                                                    <Package className="h-4 w-4" />
                                                    Produits commandés
                                                </h4>
                                                <div className="space-y-2">
                                                    {order.items.map((item, idx) => (
                                                        <div key={idx} className="flex items-center gap-3 bg-white p-3 rounded-lg border border-gray-200">
                                                            <div className="h-12 w-12 rounded bg-gray-100 flex-shrink-0 overflow-hidden relative">
                                                                {item.imageUrl || item.image_url ? (
                                                                    <Image
                                                                        src={getProductImage(item.imageUrl || item.image_url || '')}
                                                                        alt={item.name}
                                                                        fill
                                                                        className="object-cover"
                                                                    />
                                                                ) : (
                                                                    <div className="w-full h-full bg-gradient-to-br from-gray-200 to-gray-300 flex items-center justify-center">
                                                                        <Package className="h-6 w-6 text-gray-400" />
                                                                    </div>
                                                                )}
                                                            </div>
                                                            <div className="flex-1 min-w-0">
                                                                <p className="text-sm font-medium text-gray-900 truncate">{item.name}</p>
                                                                <p className="text-xs text-gray-500">Qté: {item.quantity} × {item.price} MAD</p>
                                                            </div>
                                                            <div className="text-sm font-bold text-gray-900">
                                                                {item.price * item.quantity} MAD
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>

                                            {/* Right: Shipping & Timeline */}
                                            <div className="space-y-4">
                                                <div>
                                                    <h4 className="font-medium text-sm text-gray-900 mb-3 flex items-center gap-2">
                                                        <Truck className="h-4 w-4" />
                                                        Informations de livraison
                                                    </h4>
                                                    <div className="bg-white p-3 rounded-lg border border-gray-200 text-sm space-y-1">
                                                        <p className="font-medium text-gray-900">{order.shipping_info?.first_name} {order.shipping_info?.last_name}</p>
                                                        <p className="text-gray-600">{order.shipping_info?.phone}</p>
                                                        <p className="text-gray-600">{order.shipping_info?.address}</p>
                                                        <p className="text-gray-600">{order.shipping_info?.city}</p>
                                                        {order.shipping_info?.guest_email && (
                                                            <p className="text-gray-600 text-xs">Email: {order.shipping_info.guest_email}</p>
                                                        )}
                                                    </div>
                                                </div>

                                                <div>
                                                    <h4 className="font-medium text-sm text-gray-900 mb-3 flex items-center gap-2">
                                                        <Clock className="h-4 w-4" />
                                                        Chronologie
                                                    </h4>
                                                    <div className="bg-white p-3 rounded-lg border border-gray-200 space-y-2">
                                                        <TimelineEntry color="bg-blue-500" label="Commande créée" date={order.created_at} />
                                                        {order.confirmed_at && <TimelineEntry color="bg-yellow-500" label="Confirmée" date={order.confirmed_at} />}
                                                        {order.shipped_at && <TimelineEntry color="bg-indigo-500" label="Expédiée" date={order.shipped_at} />}
                                                        {order.delivered_at && <TimelineEntry color="bg-green-500" label="Livrée" date={order.delivered_at} />}
                                                        {order.cancelled_at && <TimelineEntry color="bg-red-500" label="Annulée" date={order.cancelled_at} />}
                                                        {order.returned_at && <TimelineEntry color="bg-purple-500" label="Retournée" date={order.returned_at} />}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </td>
                                </tr>
                            </React.Fragment>
                        ))}
                    </tbody>
                </table>
                {filteredOrders.length === 0 && (
                    <div className="text-center py-12 text-gray-500">
                        Aucune commande trouvée
                    </div>
                )}
            </div>
        </div>
    );
}

function TimelineEntry({ color, label, date }: { color: string; label: string; date: string }) {
    return (
        <div className="flex items-start gap-2">
            <div className={`h-2 w-2 rounded-full ${color} mt-1`}></div>
            <div className="flex-1">
                <p className="text-xs font-medium text-gray-900">{label}</p>
                <p className="text-xs text-gray-500">{new Date(date).toLocaleString('fr-FR')}</p>
            </div>
        </div>
    );
}
