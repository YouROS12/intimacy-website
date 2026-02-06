import Link from 'next/link';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

export default function NotFound() {
    return (
        <div className="min-h-screen bg-background-light flex flex-col">
            <Navbar />
            <main className="flex-grow flex items-center justify-center py-20 px-4">
                <div className="max-w-md w-full text-center space-y-6">
                    <div className="relative mx-auto w-32 h-32 mb-6">
                        <div className="absolute inset-0 bg-primary/10 rounded-full animate-pulse"></div>
                        <div className="absolute inset-0 flex items-center justify-center text-primary">
                            <span className="material-symbols-outlined text-6xl">spa</span>
                        </div>
                    </div>

                    <h1 className="text-4xl md:text-5xl font-serif font-bold text-text-main dark:text-white">
                        Page Introuvable
                    </h1>

                    <p className="text-lg text-text-muted dark:text-gray-400">
                        Désolé, le chemin vers ce sanctuaire semble s'être effacé.
                    </p>

                    <div className="pt-6">
                        <Link
                            href="/"
                            className="inline-flex items-center justify-center h-12 px-8 rounded-full bg-primary hover:bg-primary/90 text-white text-base font-bold transition-transform active:scale-95 shadow-lg shadow-primary/25"
                        >
                            Retour à l'accueil
                        </Link>
                    </div>
                </div>
            </main>
            <Footer />
        </div>
    );
}
