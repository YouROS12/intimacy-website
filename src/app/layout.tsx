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
import ClientWidgets from '@/components/ClientWidgets';
import Footer from '@/components/Footer';

const inter = Inter({ subsets: ['latin'], variable: '--font-inter', display: 'swap' });
const lora = Lora({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-playfair',
  display: 'swap'
});
// Use Inter for display/body text
const interDisplay = Inter({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-manrope',
  display: 'swap'
});

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  themeColor: '#fbe6ff',
};

export const metadata: Metadata = {
  metadataBase: new URL('https://intimacy.ma'),
  title: {
    default: 'Intimacy Wellness Morocco | Bien-être intime Premium',
    template: '%s | Intimacy Wellness Maroc',
  },
  description: 'Premier store bien-être intime au Maroc. Livraison discrète et rapide partout au Maroc.',
  openGraph: {
    type: 'website',
    locale: 'fr_MA',
    siteName: 'Intimacy Wellness Morocco',
    title: 'Intimacy Wellness Morocco | Bien-être intime Premium',
    description: 'Premier store bien-être intime au Maroc. Livraison discrète et rapide.',
    url: 'https://intimacy.ma',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'Intimacy Wellness Morocco',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Intimacy Wellness Morocco',
    description: 'Premier store bien-être intime au Maroc. Livraison discrète et rapide.',
    images: ['/og-image.png'],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  alternates: {
    canonical: '/',
  },
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
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        {/* Optimized loading for Material Symbols */}
        <link
          href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="font-display antialiased text-text-main bg-background-light overflow-x-hidden">
        <I18nProvider>
          <AuthProvider>
            <CartProvider>
              <div className="min-h-screen bg-[#fbe6ff] flex flex-col">
                <Navbar />
                <CartDrawer />
                <main className="flex-grow">{children}</main>

                <Footer />

                {/* Floating Elements - Lazy Loaded */}
                <ClientWidgets />
              </div>
            </CartProvider>
          </AuthProvider>
        </I18nProvider>
      </body>
      <GoogleAnalytics gaId="G-9ZBDX7N6LP" />
    </html>
  );
}
