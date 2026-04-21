'use client';

import React, { useState } from 'react';
import { AlertCircle, Clock3, Play, RefreshCw } from 'lucide-react';
import { StockSyncResult, StockSyncRunRecord } from '@/types';

interface StockSyncTabProps {
    runs: StockSyncRunRecord[];
    onManualSync: () => Promise<StockSyncResult>;
    onRefreshLogs: () => Promise<void>;
}

function formatDateTime(value: string | null): string {
    if (!value) return 'En cours';

    return new Intl.DateTimeFormat('fr-MA', {
        dateStyle: 'medium',
        timeStyle: 'short',
        timeZone: 'Africa/Casablanca',
    }).format(new Date(value));
}

function formatTrigger(source: StockSyncRunRecord['trigger_source']): string {
    return source === 'manual' ? 'Manuel' : 'Cron';
}

function formatStatus(status: StockSyncRunRecord['status']): string {
    if (status === 'success') return 'Succès';
    if (status === 'error') return 'Erreur';
    return 'En cours';
}

function formatMeta(meta?: Record<string, string | number | boolean | null>): string {
    if (!meta) return '';
    return Object.entries(meta)
        .map(([key, value]) => `${key}=${String(value)}`)
        .join(' | ');
}

export default function StockSyncTab({ runs, onManualSync, onRefreshLogs }: StockSyncTabProps) {
    const [isSyncing, setIsSyncing] = useState(false);
    const [isRefreshing, setIsRefreshing] = useState(false);
    const [message, setMessage] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);

    const latestRun = runs[0] ?? null;

    const handleManualSync = async () => {
        setIsSyncing(true);
        setMessage(null);
        setError(null);

        try {
            const result = await onManualSync();
            if (!result.success) {
                setError(result.error ?? 'La synchronisation a échoué.');
                return;
            }

            setMessage(
                `Synchronisation terminée: ${result.stats.updated} mis à jour, ${result.stats.skipped} ignorés, ${result.stats.failed} échecs.`
            );
        } catch (syncError) {
            setError(syncError instanceof Error ? syncError.message : 'La synchronisation a échoué.');
        } finally {
            setIsSyncing(false);
        }
    };

    const handleRefreshLogs = async () => {
        setIsRefreshing(true);
        setError(null);

        try {
            await onRefreshLogs();
        } catch (refreshError) {
            setError(refreshError instanceof Error ? refreshError.message : 'Impossible de rafraîchir les logs.');
        } finally {
            setIsRefreshing(false);
        }
    };

    return (
        <div className="space-y-6">
            <div className="bg-white shadow overflow-hidden sm:rounded-lg border border-gray-200">
                <div className="px-4 py-5 sm:px-6 border-b border-gray-200 bg-gray-50/50 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                    <div>
                        <h3 className="text-lg leading-6 font-medium text-gray-900">Stock Sync LACDP</h3>
                        <p className="mt-1 text-sm text-gray-500">
                            Déclenchement automatique à 07:00 et 19:00. Vous pouvez aussi lancer une synchronisation manuelle ici.
                        </p>
                    </div>
                    <div className="flex flex-wrap gap-2">
                        <button
                            onClick={handleRefreshLogs}
                            disabled={isRefreshing || isSyncing}
                            className="inline-flex items-center px-4 py-2 rounded-md border border-gray-300 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"
                        >
                            <RefreshCw className={`mr-2 h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
                            Rafraîchir les logs
                        </button>
                        <button
                            onClick={handleManualSync}
                            disabled={isSyncing || isRefreshing}
                            className="inline-flex items-center px-4 py-2 rounded-md bg-primary text-sm font-medium text-white hover:bg-primary/90 disabled:opacity-50"
                        >
                            <Play className="mr-2 h-4 w-4" />
                            {isSyncing ? 'Synchronisation...' : 'Lancer la synchronisation'}
                        </button>
                    </div>
                </div>

                <div className="px-4 py-4 sm:px-6 grid gap-4 md:grid-cols-4">
                    <div className="rounded-lg border border-gray-200 p-4">
                        <div className="text-xs uppercase tracking-wide text-gray-500">Dernier statut</div>
                        <div className="mt-2 text-lg font-semibold text-gray-900">{latestRun ? formatStatus(latestRun.status) : 'Aucun log'}</div>
                    </div>
                    <div className="rounded-lg border border-gray-200 p-4">
                        <div className="text-xs uppercase tracking-wide text-gray-500">Dernier départ</div>
                        <div className="mt-2 text-sm font-medium text-gray-900">{latestRun ? formatDateTime(latestRun.started_at) : 'Aucune exécution'}</div>
                    </div>
                    <div className="rounded-lg border border-gray-200 p-4">
                        <div className="text-xs uppercase tracking-wide text-gray-500">Dernière source</div>
                        <div className="mt-2 text-sm font-medium text-gray-900">{latestRun ? formatTrigger(latestRun.trigger_source) : 'Aucune exécution'}</div>
                    </div>
                    <div className="rounded-lg border border-gray-200 p-4">
                        <div className="text-xs uppercase tracking-wide text-gray-500">Dernier résumé</div>
                        <div className="mt-2 text-sm font-medium text-gray-900">
                            {latestRun?.stats ? `${latestRun.stats.updated} / ${latestRun.stats.total} produits traités` : 'Pas de données'}
                        </div>
                    </div>
                    <div className="rounded-lg border border-gray-200 p-4">
                        <div className="text-xs uppercase tracking-wide text-gray-500">Rupture totale</div>
                        <div className="mt-2 text-sm font-medium text-gray-900">{latestRun?.stats?.outOfStockTotal ?? 0} produit(s)</div>
                    </div>
                </div>

                {(message || error) && (
                    <div className={`mx-4 mb-4 rounded-lg border px-4 py-3 text-sm ${error ? 'border-red-200 bg-red-50 text-red-700' : 'border-emerald-200 bg-emerald-50 text-emerald-700'}`}>
                        {error ? (
                            <div className="flex items-start gap-2">
                                <AlertCircle className="mt-0.5 h-4 w-4 flex-shrink-0" />
                                <span>{error}</span>
                            </div>
                        ) : (
                            message
                        )}
                    </div>
                )}
            </div>

            <div className="space-y-4">
                {runs.length === 0 ? (
                    <div className="rounded-lg border border-dashed border-gray-300 bg-white px-6 py-10 text-center text-sm text-gray-500">
                        Aucun log enregistré pour le moment. La table `stock_sync_runs` doit exister pour stocker l&apos;historique.
                    </div>
                ) : (
                    runs.map((run) => (
                        <div key={run.id} className="rounded-lg border border-gray-200 bg-white shadow-sm overflow-hidden">
                            <div className="px-4 py-4 sm:px-6 flex flex-col gap-4 md:flex-row md:items-start md:justify-between border-b border-gray-100">
                                <div>
                                    <div className="flex flex-wrap items-center gap-2">
                                        <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold ${run.status === 'success' ? 'bg-emerald-100 text-emerald-700' : run.status === 'error' ? 'bg-red-100 text-red-700' : 'bg-amber-100 text-amber-700'}`}>
                                            {formatStatus(run.status)}
                                        </span>
                                        <span className="inline-flex items-center rounded-full bg-gray-100 px-2.5 py-1 text-xs font-medium text-gray-700">
                                            {formatTrigger(run.trigger_source)}
                                        </span>
                                        <span className="inline-flex items-center rounded-full bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-700">
                                            Run #{run.id}
                                        </span>
                                    </div>
                                    <div className="mt-3 flex flex-wrap items-center gap-4 text-sm text-gray-600">
                                        <span className="inline-flex items-center gap-1">
                                            <Clock3 className="h-4 w-4" />
                                            Début: {formatDateTime(run.started_at)}
                                        </span>
                                        <span>Fin: {formatDateTime(run.completed_at)}</span>
                                    </div>
                                    {run.error_message && (
                                        <p className="mt-3 text-sm text-red-600">{run.error_message}</p>
                                    )}
                                </div>

                                <div className="grid grid-cols-2 gap-3 text-sm text-gray-700 md:min-w-[320px]">
                                    <div className="rounded-md bg-gray-50 px-3 py-2">
                                        <div className="text-xs uppercase tracking-wide text-gray-500">Mis à jour</div>
                                        <div className="mt-1 font-semibold">{run.stats?.updated ?? 0}</div>
                                    </div>
                                    <div className="rounded-md bg-gray-50 px-3 py-2">
                                        <div className="text-xs uppercase tracking-wide text-gray-500">Ignorés</div>
                                        <div className="mt-1 font-semibold">{run.stats?.skipped ?? 0}</div>
                                    </div>
                                    <div className="rounded-md bg-gray-50 px-3 py-2">
                                        <div className="text-xs uppercase tracking-wide text-gray-500">Échecs</div>
                                        <div className="mt-1 font-semibold">{run.stats?.failed ?? 0}</div>
                                    </div>
                                    <div className="rounded-md bg-gray-50 px-3 py-2">
                                        <div className="text-xs uppercase tracking-wide text-gray-500">Commandes / ruptures</div>
                                        <div className="mt-1 font-semibold">{run.orders_count} / {run.rupture_products.length}</div>
                                    </div>
                                    <div className="rounded-md bg-gray-50 px-3 py-2 col-span-2">
                                        <div className="text-xs uppercase tracking-wide text-gray-500">Total produits en rupture</div>
                                        <div className="mt-1 font-semibold">{run.stats?.outOfStockTotal ?? 0}</div>
                                    </div>
                                </div>
                            </div>

                            {run.rupture_products.length > 0 && (
                                <div className="px-4 py-3 sm:px-6 border-b border-gray-100 bg-red-50/60">
                                    <div className="text-xs uppercase tracking-wide text-red-600">Produits passés en rupture</div>
                                    <div className="mt-2 flex flex-wrap gap-2">
                                        {run.rupture_products.map((productName) => (
                                            <span key={`${run.id}-${productName}`} className="inline-flex rounded-full bg-white px-3 py-1 text-xs font-medium text-red-700 border border-red-200">
                                                {productName}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            )}

                            <details className="px-4 py-3 sm:px-6">
                                <summary className="cursor-pointer text-sm font-medium text-gray-900">
                                    Voir les requêtes et logs LACDP ({run.log_lines?.length ?? 0})
                                </summary>
                                <div className="mt-4 max-h-[420px] overflow-y-auto rounded-lg bg-slate-950 px-4 py-3 text-xs text-slate-100">
                                    {(run.log_lines ?? []).length === 0 ? (
                                        <div className="text-slate-400">Aucun détail enregistré pour cette exécution.</div>
                                    ) : (
                                        <div className="space-y-2 font-mono">
                                            {(run.log_lines ?? []).map((entry, index) => (
                                                <div key={`${run.id}-${entry.timestamp}-${index}`} className="border-b border-slate-800 pb-2 last:border-b-0">
                                                    <div className="flex flex-wrap gap-2 text-[11px] text-slate-400">
                                                        <span>{formatDateTime(entry.timestamp)}</span>
                                                        <span>{entry.level.toUpperCase()}</span>
                                                        <span>{entry.scope.toUpperCase()}</span>
                                                    </div>
                                                    <div className="mt-1 text-slate-100">{entry.message}</div>
                                                    {entry.meta && (
                                                        <div className="mt-1 text-slate-400 break-words">{formatMeta(entry.meta)}</div>
                                                    )}
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </details>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}