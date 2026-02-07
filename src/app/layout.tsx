import { GoogleAnalytics } from '@next/third-parties/google';
import type { Metadata, Viewport } from 'next';
import { Inter, Lora } from 'next/font/google';
import './globals.css';
import Navbar from '@/components/Navbar';
import { AuthProvider } from '@/contexts/AuthContext';
import { CartProvider } from '@/contexts/CartContext';
import { I18nProvider } from '@/contexts/I18nContext';
import CartDrawer from '@/components/CartDrawer';
import Link from 'next/link';
import CookieConsent from '@/components/CookieConsent';
import WhatsAppButton from '@/components/WhatsAppButton';
import Footer from '@/components/Footer';
import OneSignalInit from '@/components/OneSignalInit';

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' });
const lora = Lora({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-playfair'
});
// Use Inter for display/body text
const interDisplay = Inter({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-manrope'
});

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  themeColor: '#fbe6ff',
};

export const metadata: Metadata = {
  title: 'Intimacy Wellness Morocco | Bien-être intime Premium',
  description: 'Premier store bien-être intime au Maroc. Livraison discrète et rapide.',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'Intimacy Morocco'
  },
  formatDetection: {
    telephone: false,
  },
  manifest: '/manifest.json',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="fr" className={`${lora.variable} ${interDisplay.variable} ${inter.variable}`}>
      <head>
        <link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap" rel="stylesheet" />
      </head>
      <body className="font-display antialiased text-text-main bg-background-light">
        <I18nProvider>
          <AuthProvider>
            <CartProvider>
              <div className="min-h-screen bg-[#fbe6ff] flex flex-col">
                <Navbar />
                <CartDrawer />
                <main className="flex-grow">{children}</main>

                <Footer />

                {/* Floating Elements */}
                <CookieConsent />
                <WhatsAppButton />
                <OneSignalInit />
              </div>
            </CartProvider>
          </AuthProvider>
        </I18nProvider>
      </body>
      <GoogleAnalytics gaId="G-9ZBDX7N6LP" />
    </html>
  );
}
