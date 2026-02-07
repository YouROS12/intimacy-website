'use client'; // Error components must be Client Components

import { useEffect } from 'react';

export default function Error({
    error,
    reset,
}: {
    error: Error & { digest?: string };
    reset: () => void;
}) {
    useEffect(() => {
        // Log the error to an error reporting service
        console.error(error);
    }, [error]);

    return (
        <main className="flex-grow flex items-center justify-center py-20 px-4 bg-background-light">
            <div className="max-w-md w-full text-center space-y-6">
                <div className="relative mx-auto w-24 h-24 mb-6 text-red-500 bg-red-50 rounded-full flex items-center justify-center">
                    <span className="material-symbols-outlined text-5xl">error</span>
                </div>

                <h2 className="text-3xl font-serif font-bold text-text-main">
                    Une erreur est survenue
                </h2>

                <p className="text-text-muted">
                    Nous n'avons pas pu charger cette page correctement.
                </p>

                <button
                    onClick={
                        // Attempt to recover by trying to re-render the segment
                        () => reset()
                    }
                    className="inline-flex items-center justify-center h-12 px-8 rounded-full bg-text-main hover:bg-black text-white text-base font-bold transition-colors"
                >
                    Réessayer
                </button>
            </div>
        </main>
    );
}
