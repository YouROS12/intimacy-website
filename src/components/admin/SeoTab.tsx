'use client';

import React, { useState } from 'react';
import { BarChart3, Database, Globe2, Lightbulb, RefreshCw, Search, Upload } from 'lucide-react';
import {
    addToQueue,
    getQueueStats,
    getSitemapUrls,
    processQueueBatch,
    scheduleFreshUrls,
} from '@/actions/indexing';
import { getSeoInsights } from '@/actions/seo-insights';
import { SeoIndexStatus, SeoInsightsDashboard, SeoPageInsight } from '@/types';

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

function getIndexStatusClasses(status: SeoIndexStatus) {
    switch (status) {
        case 'indexed':
            return 'bg-green-100 text-green-800';
        case 'not_indexed':
            return 'bg-yellow-100 text-yellow-800';
        case 'blocked':
            return 'bg-red-100 text-red-800';
        case 'error':
            return 'bg-slate-200 text-slate-700';
        default:
            return 'bg-gray-100 text-gray-700';
    }
}

function formatIndexStatus(status: SeoIndexStatus) {
    switch (status) {
        case 'indexed':
            return 'Indexed';
        case 'not_indexed':
            return 'Not indexed';
        case 'blocked':
            return 'Blocked';
        case 'error':
            return 'Check failed';
        default:
            return 'Unknown';
    }
}

function formatPercent(value: number) {
    return `${(value * 100).toFixed(1)}%`;
}

function formatDate(value: string | null) {
    if (!value) return 'Not available';
    return new Date(value).toLocaleString('fr-MA', {
        dateStyle: 'medium',
        timeStyle: 'short',
        timeZone: 'Africa/Casablanca',
    });
}

function renderKeywordList(items: string[]) {
    if (items.length === 0) {
        return <span className="text-xs text-gray-400">No signals yet</span>;
    }

    return (
        <div className="flex flex-wrap gap-1.5">
            {items.map((item) => (
                <span key={item} className="inline-flex rounded-full bg-gray-100 px-2.5 py-1 text-xs font-medium text-gray-700">
                    {item}
                </span>
            ))}
        </div>
    );
}

function SeoInsightRow({ page }: { page: SeoPageInsight }) {
    const canonicalMismatch = page.googleCanonical && page.userCanonical && page.googleCanonical !== page.userCanonical;

    return (
        <tr className="align-top hover:bg-gray-50">
            <td className="px-6 py-4 min-w-[260px]">
                <div className="text-sm font-medium text-gray-900 break-all">{page.url}</div>
                <div className="mt-2 flex flex-wrap gap-2">
                    <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${getIndexStatusClasses(page.indexStatus)}`}>
                        {formatIndexStatus(page.indexStatus)}
                    </span>
                    {page.indexCoverageState && (
                        <span className="inline-flex rounded-full bg-blue-50 px-2.5 py-1 text-xs font-medium text-blue-700">
                            {page.indexCoverageState}
                        </span>
                    )}
                    {canonicalMismatch && (
                        <span className="inline-flex rounded-full bg-orange-50 px-2.5 py-1 text-xs font-medium text-orange-700">
                            Canonical mismatch
                        </span>
                    )}
                </div>
                <div className="mt-2 text-xs text-gray-500">
                    Last crawl: {formatDate(page.lastCrawlTime)}
                </div>
                {page.inspectionError && (
                    <div className="mt-2 text-xs text-red-600">{page.inspectionError}</div>
                )}
            </td>
            <td className="px-6 py-4 text-sm text-gray-700 whitespace-nowrap">
                <div className="font-semibold text-gray-900">{page.clicks}</div>
                <div className="text-xs text-gray-500">Clicks</div>
                <div className="mt-2 font-semibold text-gray-900">{page.impressions}</div>
                <div className="text-xs text-gray-500">Impressions</div>
            </td>
            <td className="px-6 py-4 text-sm text-gray-700 whitespace-nowrap">
                <div className="font-semibold text-gray-900">{formatPercent(page.ctr)}</div>
                <div className="text-xs text-gray-500">CTR</div>
                <div className="mt-2 font-semibold text-gray-900">{page.position ?? '-'}</div>
                <div className="text-xs text-gray-500">Avg position</div>
            </td>
            <td className="px-6 py-4 min-w-[280px]">
                {page.topQueries.length === 0 ? (
                    <div className="text-xs text-gray-400">No Morocco query data yet</div>
                ) : (
                    <div className="space-y-2">
                        {page.topQueries.map((query) => (
                            <div key={query.query} className="rounded-lg bg-gray-50 px-3 py-2">
                                <div className="text-sm font-medium text-gray-900">{query.query}</div>
                                <div className="mt-1 text-xs text-gray-500">
                                    {query.impressions} impressions · {query.clicks} clicks · pos {query.position}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </td>
            <td className="px-6 py-4 min-w-[260px]">
                <div className="space-y-3">
                    <div>
                        <div className="mb-1 text-xs font-semibold uppercase tracking-wide text-gray-500">Short-tail</div>
                        {renderKeywordList(page.keywordIdeas.shortTail)}
                    </div>
                    <div>
                        <div className="mb-1 text-xs font-semibold uppercase tracking-wide text-gray-500">Long-tail</div>
                        {renderKeywordList(page.keywordIdeas.longTail)}
                    </div>
                    <div>
                        <div className="mb-1 text-xs font-semibold uppercase tracking-wide text-gray-500">Quick wins</div>
                        {renderKeywordList(page.keywordIdeas.quickWins)}
                    </div>
                </div>
            </td>
        </tr>
    );
}

export default function SeoTab() {
    const [isLoading, setIsLoading] = useState(false);
    const [isIndexing, setIsIndexing] = useState(false);
    const [isInsightsLoading, setIsInsightsLoading] = useState(false);
    const [indexingResult, setIndexingResult] = useState<{ success: boolean; message: string } | null>(null);
    const [queueStats, setQueueStats] = useState<QueueStats | null>(null);
    const [sitemapEntries, setSitemapEntries] = useState<SitemapEntry[]>([]);
    const [selectedUrls, setSelectedUrls] = useState<string[]>([]);
    const [seoInsights, setSeoInsights] = useState<SeoInsightsDashboard | null>(null);
    const [seoInsightsError, setSeoInsightsError] = useState<string | null>(null);
    const [insightsPage, setInsightsPage] = useState(1);
    const [insightsPageSize, setInsightsPageSize] = useState(20);

    const loadSeoInsights = async (options?: { page?: number; pageSize?: number; forceRefresh?: boolean }) => {
        const nextPage = options?.page ?? insightsPage;
        const nextPageSize = options?.pageSize ?? insightsPageSize;

        setIsInsightsLoading(true);
        setSeoInsightsError(null);

        try {
            const result = await getSeoInsights({
                page: nextPage,
                pageSize: nextPageSize,
                forceRefresh: options?.forceRefresh ?? false,
            });

            if (!result.ok) {
                setSeoInsightsError(result.error);
                return;
            }

            const insights = result.data;
            setSeoInsights(insights);
            setInsightsPage(insights.pagination.page);
            setInsightsPageSize(insights.pagination.pageSize);
        } catch (e: unknown) {
            setSeoInsightsError(e instanceof Error ? e.message : String(e));
        } finally {
            setIsInsightsLoading(false);
        }
    };

    const loadSmartSchedule = async () => {
        setIsLoading(true);
        try {
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
            <div className="bg-white shadow sm:rounded-lg border border-gray-200 p-6">
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-6">
                    <div>
                        <h3 className="text-lg font-medium leading-6 text-gray-900 flex items-center gap-2">
                            <Search className="h-5 w-5 text-primary" />
                            Morocco SEO Insights
                        </h3>
                        <p className="mt-1 text-sm text-gray-500">
                            Inspect the full sitemap and Search Console property to see indexing status, Morocco performance, current queries, and keyword opportunities.
                        </p>
                    </div>
                    <div className="flex flex-wrap items-center gap-2">
                        <label className="text-sm text-gray-600">
                            Page size
                        </label>
                        <select
                            value={insightsPageSize}
                            onChange={(event) => {
                                const nextPageSize = Number(event.target.value);
                                setInsightsPageSize(nextPageSize);
                                if (seoInsights) {
                                    void loadSeoInsights({ page: 1, pageSize: nextPageSize });
                                }
                            }}
                            className="rounded-md border border-gray-300 px-3 py-2 text-sm text-gray-700"
                        >
                            {[20, 30, 50].map((size) => (
                                <option key={size} value={size}>{size}</option>
                            ))}
                        </select>
                        <button
                            onClick={() => void loadSeoInsights({ page: insightsPage, pageSize: insightsPageSize })}
                            disabled={isInsightsLoading}
                            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-primary hover:bg-primary/90 disabled:opacity-50"
                        >
                            <RefreshCw className={`h-4 w-4 mr-2 ${isInsightsLoading ? 'animate-spin' : ''}`} />
                            {isInsightsLoading ? 'Loading snapshot...' : 'Load snapshot'}
                        </button>
                        <button
                            onClick={() => void loadSeoInsights({ page: insightsPage, pageSize: insightsPageSize, forceRefresh: true })}
                            disabled={isInsightsLoading}
                            className="inline-flex items-center px-4 py-2 border border-gray-300 bg-white text-sm font-medium rounded-md text-gray-700 hover:bg-gray-50 disabled:opacity-50"
                        >
                            <RefreshCw className="h-4 w-4 mr-2" />
                            Refresh live data
                        </button>
                    </div>
                </div>

                {seoInsightsError && (
                    <div className="mb-6 rounded-md bg-red-50 px-4 py-3 text-sm text-red-700">
                        {seoInsightsError}
                    </div>
                )}

                {seoInsights && (
                    <div className="space-y-6">
                        <div className="rounded-lg border border-gray-200 bg-gray-50 px-4 py-3 text-sm text-gray-600">
                            Property: <span className="font-medium text-gray-900">{seoInsights.property}</span>
                            {' · '}Country: <span className="font-medium text-gray-900">{seoInsights.country}</span>
                            {' · '}Window: <span className="font-medium text-gray-900">{seoInsights.periodStart}</span> to <span className="font-medium text-gray-900">{seoInsights.periodEnd}</span>
                            {' · '}Snapshot: <span className="font-medium text-gray-900">{formatDate(seoInsights.cache.snapshotCreatedAt || seoInsights.generatedAt)}</span>
                            {' · '}Source: <span className="font-medium text-gray-900">{seoInsights.cache.source === 'cache' ? 'Supabase cache' : 'Live refresh'}</span>
                        </div>

                        <div className="grid grid-cols-2 xl:grid-cols-6 gap-4">
                            <div className="rounded-lg bg-blue-50 p-4">
                                <div className="text-sm font-medium text-blue-800">Pages monitored</div>
                                <div className="mt-1 text-2xl font-bold text-blue-900">{seoInsights.summary.selectedPages}</div>
                            </div>
                            <div className="rounded-lg bg-green-50 p-4">
                                <div className="text-sm font-medium text-green-800">Indexed</div>
                                <div className="mt-1 text-2xl font-bold text-green-900">{seoInsights.summary.indexedPages}</div>
                            </div>
                            <div className="rounded-lg bg-yellow-50 p-4">
                                <div className="text-sm font-medium text-yellow-800">Not indexed</div>
                                <div className="mt-1 text-2xl font-bold text-yellow-900">{seoInsights.summary.notIndexedPages}</div>
                            </div>
                            <div className="rounded-lg bg-red-50 p-4">
                                <div className="text-sm font-medium text-red-800">Blocked</div>
                                <div className="mt-1 text-2xl font-bold text-red-900">{seoInsights.summary.blockedPages}</div>
                            </div>
                            <div className="rounded-lg bg-purple-50 p-4">
                                <div className="text-sm font-medium text-purple-800">Quick-win pages</div>
                                <div className="mt-1 text-2xl font-bold text-purple-900">{seoInsights.summary.quickWinPages}</div>
                            </div>
                            <div className="rounded-lg bg-emerald-50 p-4">
                                <div className="text-sm font-medium text-emerald-800">Avg position</div>
                                <div className="mt-1 text-2xl font-bold text-emerald-900">{seoInsights.summary.averagePosition ?? '-'}</div>
                            </div>
                        </div>

                        <div className="rounded-lg border border-gray-200 p-4 text-sm text-gray-700">
                            <div className="flex flex-col gap-2 lg:flex-row lg:items-center lg:justify-between">
                                <div>
                                    Showing <span className="font-semibold text-gray-900">{seoInsights.pagination.startIndex}</span>
                                    {' - '}
                                    <span className="font-semibold text-gray-900">{seoInsights.pagination.endIndex}</span>
                                    {' '}of <span className="font-semibold text-gray-900">{seoInsights.pagination.totalUrls}</span> monitored URLs
                                </div>
                                <div>
                                    Cache age: <span className="font-semibold text-gray-900">{seoInsights.cache.cacheAgeMinutes ?? 0} min</span>
                                    {' · '}Expires: <span className="font-semibold text-gray-900">{seoInsights.cache.expiresAt ? formatDate(seoInsights.cache.expiresAt) : 'Not available'}</span>
                                </div>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
                            <div className="rounded-lg border border-gray-200 p-4">
                                <div className="flex items-center gap-2 text-sm font-semibold text-gray-900 mb-3">
                                    <Globe2 className="h-4 w-4 text-primary" />
                                    Morocco visibility
                                </div>
                                <div className="space-y-2 text-sm text-gray-700">
                                    <div className="flex justify-between gap-3"><span>Pages with performance</span><span className="font-semibold">{seoInsights.summary.pagesWithPerformance}</span></div>
                                    <div className="flex justify-between gap-3"><span>Total impressions</span><span className="font-semibold">{seoInsights.summary.totalImpressions}</span></div>
                                    <div className="flex justify-between gap-3"><span>Total clicks</span><span className="font-semibold">{seoInsights.summary.totalClicks}</span></div>
                                </div>
                            </div>
                            <div className="rounded-lg border border-gray-200 p-4">
                                <div className="flex items-center gap-2 text-sm font-semibold text-gray-900 mb-3">
                                    <BarChart3 className="h-4 w-4 text-primary" />
                                    Opportunity signals
                                </div>
                                <div className="space-y-2 text-sm text-gray-700">
                                    <div className="flex justify-between gap-3"><span>CTR opportunity pages</span><span className="font-semibold">{seoInsights.summary.ctrOpportunityPages}</span></div>
                                    <div className="flex justify-between gap-3"><span>Quick-win pages</span><span className="font-semibold">{seoInsights.summary.quickWinPages}</span></div>
                                    <div className="flex justify-between gap-3"><span>Inspected pages</span><span className="font-semibold">{seoInsights.summary.inspectedPages}</span></div>
                                </div>
                            </div>
                            <div className="rounded-lg border border-gray-200 p-4">
                                <div className="flex items-center gap-2 text-sm font-semibold text-gray-900 mb-3">
                                    <Lightbulb className="h-4 w-4 text-primary" />
                                    Notes
                                </div>
                                <div className="space-y-2 text-sm text-gray-700">
                                    {seoInsights.notes.map((note) => (
                                        <p key={note}>{note}</p>
                                    ))}
                                </div>
                            </div>
                        </div>

                        <div className="overflow-x-auto rounded-lg border border-gray-200">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50 sticky top-0">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Page</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Traffic</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">CTR / Position</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Top Morocco queries</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Keyword ideas</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-200 bg-white">
                                    {seoInsights.pages.map((page) => (
                                        <SeoInsightRow key={page.url} page={page} />
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        {seoInsights.pagination.totalPages > 1 && (
                            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                                <div className="text-sm text-gray-600">
                                    Page <span className="font-semibold text-gray-900">{seoInsights.pagination.page}</span> of <span className="font-semibold text-gray-900">{seoInsights.pagination.totalPages}</span>
                                </div>
                                <div className="flex gap-2">
                                    <button
                                        onClick={() => void loadSeoInsights({ page: insightsPage - 1, pageSize: insightsPageSize })}
                                        disabled={isInsightsLoading || !seoInsights.pagination.hasPrevious}
                                        className="inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"
                                    >
                                        Previous
                                    </button>
                                    <button
                                        onClick={() => void loadSeoInsights({ page: insightsPage + 1, pageSize: insightsPageSize })}
                                        disabled={isInsightsLoading || !seoInsights.pagination.hasNext}
                                        className="inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"
                                    >
                                        Next
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                )}
            </div>

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
