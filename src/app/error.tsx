'use client';

import { useEffect, useState } from 'react';

export default function Error({
    error,
    reset,
}: {
    error: Error & { digest?: string };
    reset: () => void;
}) {
    const [showDetails, setShowDetails] = useState(false);

    useEffect(() => {
        console.error(error);
    }, [error]);

    return (
        <main className="min-h-screen flex items-center justify-center py-20 px-4 bg-slate-50 font-sans">
            <div className="max-w-xl w-full text-center space-y-6 bg-white p-10 rounded-3xl shadow-xl">
                <div className="relative mx-auto w-20 h-20 mb-6 text-rose-500 bg-rose-50 rounded-full flex items-center justify-center">
                    <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><line x1="12" x2="12" y1="8" y2="12" /><line x1="12" x2="12.01" y1="16" y2="16" /></svg>
                </div>

                <h2 className="text-3xl font-serif font-bold text-slate-800">
                    Oups ! Une erreur est survenue.
                </h2>

                <p className="text-slate-600">
                    Nous n'avons pas pu charger cette page correctement.
                </p>

                <div className="flex flex-col gap-4 justify-center pt-4">
                    <button
                        onClick={() => reset()}
                        className="inline-flex items-center justify-center h-12 px-8 rounded-full bg-slate-900 hover:bg-slate-800 text-white text-base font-medium transition-colors"
                    >
                        Réessayer
                    </button>

                    <button
                        onClick={() => setShowDetails(!showDetails)}
                        className="text-xs text-slate-400 hover:text-slate-600 underline"
                    >
                        {showDetails ? 'Masquer les détails' : 'Afficher les détails techniques (Debug)'}
                    </button>
                </div>

                {showDetails && (
                    <div className="mt-8 p-4 bg-slate-900 text-slate-200 text-left text-xs font-mono rounded-xl overflow-auto max-h-64 border border-slate-700">
                        <p className="font-bold text-red-400 mb-2">Error Digest: {error.digest || 'N/A'}</p>
                        <p className="mb-2 text-yellow-300">{error.message}</p>
                        <pre className="opacity-70 whitespace-pre-wrap">{error.stack}</pre>
                    </div>
                )}
            </div>
        </main>
    );
}
