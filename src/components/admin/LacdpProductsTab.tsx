'use client';

import React, { useEffect, useState } from 'react';
import Image from 'next/image';
import { AlertCircle, CheckCircle2, PackagePlus, RefreshCw, Search } from 'lucide-react';
import { LacdpCatalogProduct, LacdpCatalogResult, LacdpImportResult } from '@/types';
import { getProductImage } from '@/utils/imageHelpers';

interface LacdpProductsTabProps {
    onFetchCatalog: () => Promise<LacdpCatalogResult>;
    onImportProduct: (product: LacdpCatalogProduct) => Promise<LacdpImportResult>;
}

function formatPrice(value: number): string {
    return new Intl.NumberFormat('fr-MA', {
        style: 'currency',
        currency: 'MAD',
        maximumFractionDigits: 2,
    }).format(value);
}

function formatDateTime(value: string | null | undefined): string {
    if (!value) return 'Jamais';

    return new Intl.DateTimeFormat('fr-MA', {
        dateStyle: 'medium',
        timeStyle: 'short',
        timeZone: 'Africa/Casablanca',
    }).format(new Date(value));
}

export default function LacdpProductsTab({ onFetchCatalog, onImportProduct }: LacdpProductsTabProps) {
    const [catalogResult, setCatalogResult] = useState<LacdpCatalogResult | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [addingSourceId, setAddingSourceId] = useState<string | null>(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

    const handleRefresh = async () => {
        setIsLoading(true);
        setFeedback(null);

        try {
            const result = await onFetchCatalog();
            setCatalogResult(result);

            if (!result.success) {
                setFeedback({
                    type: 'error',
                    message: result.error ?? 'Impossible de récupérer les produits LACDP.',
                });
            }
        } catch (error) {
            setCatalogResult(null);
            setFeedback({
                type: 'error',
                message: error instanceof Error ? error.message : 'Impossible de récupérer les produits LACDP.',
            });
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        let isActive = true;

        const loadInitialCatalog = async () => {
            setIsLoading(true);
            setFeedback(null);

            try {
                const result = await onFetchCatalog();
                if (!isActive) return;

                setCatalogResult(result);

                if (!result.success) {
                    setFeedback({
                        type: 'error',
                        message: result.error ?? 'Impossible de récupérer les produits LACDP.',
                    });
                }
            } catch (error) {
                if (!isActive) return;

                setCatalogResult(null);
                setFeedback({
                    type: 'error',
                    message: error instanceof Error ? error.message : 'Impossible de récupérer les produits LACDP.',
                });
            } finally {
                if (isActive) {
                    setIsLoading(false);
                }
            }
        };

        void loadInitialCatalog();

        return () => {
            isActive = false;
        };
    }, [onFetchCatalog]);

    const catalogProducts = catalogResult?.products ?? [];
    const filteredProducts = catalogProducts.filter((product) => {
        const haystack = [product.name, product.brand, product.sourceId]
            .filter(Boolean)
            .join(' ')
            .toLowerCase();

        return haystack.includes(searchQuery.trim().toLowerCase());
    });
    const importableCount = catalogProducts.filter((product) => !product.existingProductId).length;

    const handleImport = async (product: LacdpCatalogProduct) => {
        setAddingSourceId(product.sourceId);
        setFeedback(null);

        try {
            const result = await onImportProduct(product);
            if (!result.success) {
                setFeedback({
                    type: 'error',
                    message: result.error ?? `Impossible d'ajouter ${product.name}.`,
                });
                return;
            }

            setCatalogResult((current) => {
                if (!current) return current;

                return {
                    ...current,
                    products: current.products.map((item) =>
                        item.sourceId === product.sourceId
                            ? {
                                ...item,
                                existingProductId: result.productId ?? item.existingProductId ?? product.sourceId,
                                existingProductName: result.productName ?? item.existingProductName ?? product.name,
                                matchReason: item.matchReason ?? 'external_id',
                            }
                            : item
                    ),
                };
            });

            setFeedback({
                type: 'success',
                message: result.alreadyExists
                    ? `${result.productName ?? product.name} existe déjà dans la boutique.`
                    : `${result.productName ?? product.name} a été ajouté à la boutique et publié.`,
            });
        } catch (error) {
            setFeedback({
                type: 'error',
                message: error instanceof Error ? error.message : `Impossible d'ajouter ${product.name}.`,
            });
        } finally {
            setAddingSourceId(null);
        }
    };

    return (
        <div className="space-y-6">
            <div className="bg-white shadow overflow-hidden sm:rounded-lg border border-gray-200">
                <div className="px-4 py-5 sm:px-6 border-b border-gray-200 bg-gray-50/50 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                    <div>
                        <h3 className="text-lg leading-6 font-medium text-gray-900">Produits LACDP</h3>
                        <p className="mt-1 text-sm text-gray-500">
                            Catalogue live LACDP pour importer manuellement de nouveaux produits dans la boutique.
                        </p>
                    </div>
                    <div className="flex flex-wrap gap-2">
                        <button
                            onClick={handleRefresh}
                            disabled={isLoading || addingSourceId !== null}
                            className="inline-flex items-center px-4 py-2 rounded-md border border-gray-300 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"
                        >
                            <RefreshCw className={`mr-2 h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
                            {isLoading ? 'Chargement...' : 'Rafraîchir le catalogue'}
                        </button>
                    </div>
                </div>

                <div className="px-4 py-4 sm:px-6 grid gap-4 md:grid-cols-4">
                    <div className="rounded-lg border border-gray-200 p-4">
                        <div className="text-xs uppercase tracking-wide text-gray-500">Produits chargés</div>
                        <div className="mt-2 text-lg font-semibold text-gray-900">{catalogResult?.meta?.uniqueCount ?? 0}</div>
                    </div>
                    <div className="rounded-lg border border-gray-200 p-4">
                        <div className="text-xs uppercase tracking-wide text-gray-500">À importer</div>
                        <div className="mt-2 text-lg font-semibold text-gray-900">{importableCount}</div>
                    </div>
                    <div className="rounded-lg border border-gray-200 p-4">
                        <div className="text-xs uppercase tracking-wide text-gray-500">Déjà présents</div>
                        <div className="mt-2 text-lg font-semibold text-gray-900">{catalogResult?.meta?.existingMatches ?? 0}</div>
                    </div>
                    <div className="rounded-lg border border-gray-200 p-4">
                        <div className="text-xs uppercase tracking-wide text-gray-500">Dernière récupération</div>
                        <div className="mt-2 text-sm font-medium text-gray-900">{formatDateTime(catalogResult?.fetchedAt)}</div>
                        <div className="mt-1 text-xs text-gray-500">Mode: {catalogResult?.meta?.queryMode ?? 'n/a'}</div>
                    </div>
                </div>

                <div className="px-4 pb-4 sm:px-6">
                    <label className="relative block">
                        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                        <input
                            value={searchQuery}
                            onChange={(event) => setSearchQuery(event.target.value)}
                            placeholder="Filtrer par nom, marque ou ID LACDP"
                            className="w-full rounded-lg border border-gray-300 py-2 pl-10 pr-4 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                        />
                    </label>
                </div>

                {feedback && (
                    <div className={`mx-4 mb-4 rounded-lg border px-4 py-3 text-sm ${feedback.type === 'error' ? 'border-red-200 bg-red-50 text-red-700' : 'border-emerald-200 bg-emerald-50 text-emerald-700'}`}>
                        <div className="flex items-start gap-2">
                            {feedback.type === 'error' ? (
                                <AlertCircle className="mt-0.5 h-4 w-4 flex-shrink-0" />
                            ) : (
                                <CheckCircle2 className="mt-0.5 h-4 w-4 flex-shrink-0" />
                            )}
                            <span>{feedback.message}</span>
                        </div>
                    </div>
                )}
            </div>

            <div className="rounded-lg border border-gray-200 bg-white shadow-sm overflow-hidden">
                {filteredProducts.length === 0 ? (
                    <div className="px-6 py-10 text-center text-sm text-gray-500">
                        {isLoading
                            ? 'Chargement du catalogue LACDP...'
                            : 'Aucun produit LACDP à afficher avec les filtres actuels.'}
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200 text-sm">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-4 py-3 text-left font-medium text-gray-500 uppercase tracking-wider">Produit</th>
                                    <th className="px-4 py-3 text-left font-medium text-gray-500 uppercase tracking-wider">Prix / stock</th>
                                    <th className="px-4 py-3 text-left font-medium text-gray-500 uppercase tracking-wider">Catégorie</th>
                                    <th className="px-4 py-3 text-left font-medium text-gray-500 uppercase tracking-wider">Statut</th>
                                    <th className="px-4 py-3 text-right font-medium text-gray-500 uppercase tracking-wider">Action</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200 bg-white">
                                {filteredProducts.map((product) => {
                                    const isExisting = Boolean(product.existingProductId);

                                    return (
                                        <tr key={product.id} className="hover:bg-gray-50 transition-colors">
                                            <td className="px-4 py-4 align-top">
                                                <div className="flex items-start gap-3 min-w-[280px]">
                                                    <div className="relative h-14 w-14 overflow-hidden rounded-lg border border-gray-200 bg-gray-50 flex-shrink-0">
                                                        <Image
                                                            src={getProductImage(product.imageUrl)}
                                                            alt={product.name}
                                                            fill
                                                            sizes="56px"
                                                            className="object-cover"
                                                        />
                                                    </div>
                                                    <div>
                                                        <div className="font-medium text-gray-900">{product.name}</div>
                                                        {product.brand && (
                                                            <div className="mt-1 text-xs text-gray-500">Marque: {product.brand}</div>
                                                        )}
                                                        <div className="mt-1 text-xs text-gray-500">LACDP ID: {product.sourceId}</div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-4 py-4 align-top">
                                                <div className="font-medium text-gray-900">{formatPrice(product.price)}</div>
                                                <div className="mt-1 text-xs text-gray-500">Stock: {product.stock}</div>
                                            </td>
                                            <td className="px-4 py-4 align-top">
                                                <span className="inline-flex rounded-full bg-blue-50 px-2.5 py-1 text-xs font-medium text-blue-700 border border-blue-100">
                                                    Dietary Supplement
                                                </span>
                                            </td>
                                            <td className="px-4 py-4 align-top">
                                                {isExisting ? (
                                                    <div>
                                                        <span className="inline-flex rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-medium text-emerald-700 border border-emerald-100">
                                                            Déjà dans la boutique
                                                        </span>
                                                        <div className="mt-1 text-xs text-gray-500">
                                                            {product.existingProductName}
                                                            {product.matchReason === 'external_id' ? ' • match externe' : ' • match nom/slug'}
                                                        </div>
                                                    </div>
                                                ) : (
                                                    <span className="inline-flex rounded-full bg-amber-50 px-2.5 py-1 text-xs font-medium text-amber-700 border border-amber-100">
                                                        Importable
                                                    </span>
                                                )}
                                            </td>
                                            <td className="px-4 py-4 align-top text-right">
                                                <button
                                                    onClick={() => handleImport(product)}
                                                    disabled={isExisting || addingSourceId !== null}
                                                    className="inline-flex items-center rounded-md bg-primary px-3 py-2 text-sm font-medium text-white hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-50"
                                                >
                                                    <PackagePlus className="mr-2 h-4 w-4" />
                                                    {addingSourceId === product.sourceId ? 'Ajout...' : 'Ajouter'}
                                                </button>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
}