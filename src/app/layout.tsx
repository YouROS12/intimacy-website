
import type { Metadata } from 'next';
import { Inter, Playfair_Display, Manrope } from 'next/font/google';
import './globals.css';
import Navbar from '@/components/Navbar';
import { AuthProvider } from '@/contexts/AuthContext';
import { CartProvider } from '@/contexts/CartContext';
import CartDrawer from '@/components/CartDrawer';
import Link from 'next/link';
import CookieConsent from '@/components/CookieConsent';
import WhatsAppButton from '@/components/WhatsAppButton';
import Footer from '@/components/Footer';

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' });
const playfair = Playfair_Display({ subsets: ['latin'], variable: '--font-playfair' });
const manrope = Manrope({ subsets: ['latin'], variable: '--font-manrope' });

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
    <html lang="fr" className={`${playfair.variable} ${manrope.variable} ${inter.variable}`}>
      <head>
        <link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap" rel="stylesheet" />
      </head>
      <body className="font-display antialiased text-text-main bg-background-light">
        <AuthProvider>
          <CartProvider>
            <div className="min-h-screen bg-[#f8f7f6] flex flex-col">
              <Navbar />
              <CartDrawer />
              <main className="flex-grow">{children}</main>

              <Footer />

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
