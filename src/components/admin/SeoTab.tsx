'use client';

import React, { useState } from 'react';
import { Database, RefreshCw, Upload } from 'lucide-react';

interface QueueStats {
    pending: number;
    processing: number;
    completed: number;
    retry?: number;
    failed: number;
}

interface SitemapEntry {
    url: string;
    lastmod?: string;
}

export default function SeoTab() {
    const [isLoading, setIsLoading] = useState(false);
    const [isIndexing, setIsIndexing] = useState(false);
    const [indexingResult, setIndexingResult] = useState<{ success: boolean; message: string } | null>(null);
    const [queueStats, setQueueStats] = useState<QueueStats | null>(null);
    const [sitemapEntries, setSitemapEntries] = useState<SitemapEntry[]>([]);
    const [selectedUrls, setSelectedUrls] = useState<string[]>([]);

    const loadSmartSchedule = async () => {
        setIsLoading(true);
        try {
            const { getQueueStats, getSitemapUrls } = await import('@/actions/indexing');
            const stats = await getQueueStats();
            setQueueStats(stats as unknown as QueueStats);
            const sitemap = await getSitemapUrls();
            setSitemapEntries(sitemap as unknown as SitemapEntry[]);
        } catch (e: unknown) {
            alert("Error loading data: " + (e instanceof Error ? e.message : String(e)));
        } finally {
            setIsLoading(false);
        }
    };

    const handleScheduleFresh = async () => {
        if (!confirm("This will scan the 'seo_freshness' table for high-priority items and queue them.\n\nContinue?")) return;
        setIsLoading(true);
        try {
            const { scheduleFreshUrls, getQueueStats } = await import('@/actions/indexing');
            const res = await scheduleFreshUrls(50);
            alert(res.message);
            const stats = await getQueueStats();
            setQueueStats(stats as unknown as QueueStats);
        } catch (e: unknown) {
            alert('Error: ' + (e instanceof Error ? e.message : String(e)));
        } finally {
            setIsLoading(false);
        }
    };

    const handleProcessBatch = async () => {
        setIsIndexing(true);
        try {
            const { processQueueBatch, getQueueStats } = await import('@/actions/indexing');
            const res = await processQueueBatch(10);
            setIndexingResult(res);
            const stats = await getQueueStats();
            setQueueStats(stats as unknown as QueueStats);
        } catch (e: unknown) {
            setIndexingResult({ success: false, message: e instanceof Error ? e.message : String(e) });
        } finally {
            setIsIndexing(false);
        }
    };

    const handleAddToQueue = async () => {
        if (!confirm(`Add ${selectedUrls.length} URLs to the indexing queue?`)) return;
        setIsLoading(true);
        try {
            const { addToQueue, getQueueStats } = await import('@/actions/indexing');
            const res = await addToQueue(selectedUrls);
            alert(`Successfully queued ${res.count} URLs.`);
            setSelectedUrls([]);
            const stats = await getQueueStats();
            setQueueStats(stats as unknown as QueueStats);
        } catch (e: unknown) {
            alert("Failed: " + (e instanceof Error ? e.message : String(e)));
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="space-y-6">
            {/* Queue Statistics & Action Bar */}
            <div className="bg-white shadow sm:rounded-lg border border-gray-200 p-6">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
                    <div>
                        <h3 className="text-lg font-medium leading-6 text-gray-900 flex items-center gap-2">
                            <Database className="h-5 w-5 text-primary" />
                            Google Indexing Queue
                        </h3>
                        <p className="mt-1 text-sm text-gray-500">
                            Manage your daily indexing quota (200/day). Queue URLs here and process them in batches.
                        </p>
                    </div>
                    <div className="flex gap-2">
                        <button
                            onClick={loadSmartSchedule}
                            disabled={isLoading}
                            className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
                        >
                            <RefreshCw className="h-4 w-4 mr-2" />
                            Smart Schedule
                        </button>
                        <button
                            onClick={handleScheduleFresh}
                            disabled={isLoading}
                            className="inline-flex items-center px-4 py-2 border border-purple-500 text-purple-600 bg-purple-50 hover:bg-purple-100 rounded-md text-sm font-medium disabled:opacity-50"
                        >
                            <Upload className="h-4 w-4 mr-2" />
                            Load Sitemap
                        </button>
                        <button
                            onClick={handleProcessBatch}
                            disabled={isIndexing}
                            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700 disabled:opacity-50"
                        >
                            {isIndexing ? 'Processing...' : 'Process Next 10'}
                        </button>
                    </div>
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
                    <div className="bg-blue-50 p-4 rounded-lg">
                        <div className="text-sm font-medium text-blue-800">Pending</div>
                        <div className="text-2xl font-bold text-blue-900">{queueStats?.pending || 0}</div>
                    </div>
                    <div className="bg-yellow-50 p-4 rounded-lg">
                        <div className="text-sm font-medium text-yellow-800">Processing</div>
                        <div className="text-2xl font-bold text-yellow-900">{queueStats?.processing || 0}</div>
                    </div>
                    <div className="bg-green-50 p-4 rounded-lg">
                        <div className="text-sm font-medium text-green-800">Completed</div>
                        <div className="text-2xl font-bold text-green-900">{queueStats?.completed || 0}</div>
                    </div>
                    <div className="bg-orange-50 p-4 rounded-lg">
                        <div className="text-sm font-medium text-orange-800">Retry (Quota)</div>
                        <div className="text-2xl font-bold text-orange-900">{queueStats?.retry || 0}</div>
                    </div>
                    <div className="bg-red-50 p-4 rounded-lg">
                        <div className="text-sm font-medium text-red-800">Failed</div>
                        <div className="text-2xl font-bold text-red-900">{queueStats?.failed || 0}</div>
                    </div>
                </div>

                {indexingResult && (
                    <div className={`mb-6 p-4 rounded-md ${indexingResult.success ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
                        <p>{indexingResult.message}</p>
                    </div>
                )}
            </div>

            {/* Sitemap Selection Table */}
            <div className="bg-white shadow sm:rounded-lg border border-gray-200 overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center bg-gray-50">
                    <h3 className="text-lg font-medium text-gray-900">Sitemap URLs</h3>
                    {selectedUrls.length > 0 && (
                        <button
                            onClick={handleAddToQueue}
                            disabled={isLoading}
                            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-primary hover:bg-primary/90 disabled:opacity-50"
                        >
                            Add {selectedUrls.length} to Queue
                        </button>
                    )}
                </div>
                <div className="overflow-x-auto max-h-[600px]">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50 sticky top-0">
                            <tr>
                                <th className="px-6 py-3 text-left">
                                    <input
                                        type="checkbox"
                                        onChange={(e) => {
                                            if (e.target.checked) {
                                                setSelectedUrls(sitemapEntries.map(p => p.url));
                                            } else {
                                                setSelectedUrls([]);
                                            }
                                        }}
                                        checked={sitemapEntries.length > 0 && selectedUrls.length === sitemapEntries.length}
                                        className="h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded"
                                    />
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">URL</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Last Modified</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {sitemapEntries.map((page, idx) => (
                                <tr key={idx} className="hover:bg-gray-50">
                                    <td className="px-6 py-4">
                                        <input
                                            type="checkbox"
                                            checked={selectedUrls.includes(page.url)}
                                            onChange={(e) => {
                                                if (e.target.checked) {
                                                    setSelectedUrls([...selectedUrls, page.url]);
                                                } else {
                                                    setSelectedUrls(selectedUrls.filter(u => u !== page.url));
                                                }
                                            }}
                                            className="h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded"
                                        />
                                    </td>
                                    <td className="px-6 py-4 text-sm text-gray-900 break-all">{page.url}</td>
                                    <td className="px-6 py-4 text-sm text-gray-500">
                                        {page.lastmod ? new Date(page.lastmod).toLocaleDateString() : '-'}
                                    </td>
                                </tr>
                            ))}
                            {sitemapEntries.length === 0 && (
                                <tr>
                                    <td colSpan={3} className="px-6 py-12 text-center text-gray-500">
                                        No sitemap loaded. Click &quot;Load Sitemap&quot; to start.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
