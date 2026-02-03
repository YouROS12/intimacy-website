import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import Navbar from '@/components/Navbar';
import { AuthProvider } from '@/contexts/AuthContext';
import { CartProvider } from '@/contexts/CartContext';
import Link from 'next/link';
import CookieConsent from '@/components/CookieConsent';
import WhatsAppButton from '@/components/WhatsAppButton';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Intimacy Wellness Morocco | Bien-être intime Premium',
  description: 'Premier store bien-être intime au Maroc. Livraison discrète et rapide.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="fr">
      <body className={inter.className}>
        <AuthProvider>
          <CartProvider>
            <div className="min-h-screen bg-white">
              <Navbar />
              {/* CartDrawer component needs migration, skipping visual for MVP start */}
              <main>{children}</main>

              <footer className="bg-slate-900 text-slate-400 py-12">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                  <p>&copy; 2026 Intimacy Wellness Morocco. Tous droits réservés.</p>
                  <p className="text-sm mt-2">Livraison Discrète | Paiement Sécurisé</p>
                  <p className="text-xs mt-2 text-slate-600">
                    Propulsé par <a href="https://vitasana.ma" target="_blank" rel="noopener noreferrer" className="hover:text-slate-400">vitasana.ma</a>
                  </p>
                  <div className="mt-4 flex justify-center gap-4 text-xs text-slate-500">
                    <Link href="/about" className="hover:text-slate-300">À propos</Link>
                    <span>|</span>
                    <Link href="/legal/privacy" className="hover:text-slate-300">Politique de Confidentialité</Link>
                    <span>|</span>
                    <Link href="/legal/terms" className="hover:text-slate-300">Conditions d'Utilisation</Link>
                  </div>
                </div>
              </footer>

              {/* Floating Elements */}
              <CookieConsent />
              <WhatsAppButton />
            </div>
          </CartProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
