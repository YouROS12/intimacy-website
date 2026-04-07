import Link from 'next/link';
import Image from 'next/image';
import { getFeaturedProducts } from '@/services/api';
import { Package, ShieldCheck, CreditCard } from 'lucide-react';
import heroImage from '@/assets/durex-hero.png';
import HomeCarousel from '@/components/HomeCarousel';
import messages from '../../messages/fr.json';

// Server-side translation helper (defaults to French for SSR/SEO)
function t(key: string): string {
  const keys = key.split('.');
  let value: any = messages;
  for (const k of keys) {
    value = value?.[k];
  }
  return typeof value === 'string' ? value : key;
}

export const revalidate = 3600;

export default async function Home() {
  const featuredProducts = await getFeaturedProducts();

  const organizationJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'Intimacy Wellness Morocco',
    url: 'https://intimacy.ma',
    logo: 'https://intimacy.ma/logo.png',
    contactPoint: {
      '@type': 'ContactPoint',
      telephone: '+212-656-201278',
      contactType: 'customer service',
      areaServed: 'MA',
      availableLanguage: ['en', 'fr', 'ar']
    }
  };

  const websiteJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: 'Intimacy Wellness Morocco',
    url: 'https://intimacy.ma',
    potentialAction: {
      '@type': 'SearchAction',
      target: 'https://intimacy.ma/shop?q={search_term_string}',
      'query-input': 'required name=search_term_string'
    }
  };

  return (
    <div className="flex flex-col min-h-screen">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteJsonLd) }}
      />

      {/* Hero Section */}
      <section className="relative w-full py-12 lg:py-20 bg-background-light overflow-hidden">
        <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            {/* Text Content */}
            <div className="flex flex-col gap-6 lg:gap-8 order-2 lg:order-1">
              <div className="space-y-4">
                <span className="inline-block px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-bold uppercase tracking-wider">{t('home.hero.badge')}</span>
                <h1 className="text-4xl md:text-6xl lg:text-7xl font-serif font-medium leading-tight text-text-main">
                  {t('home.hero.title')} <br /><span className="text-primary italic">{t('home.hero.titleHighlight')}</span>
                </h1>
                <p className="text-lg text-text-muted max-w-md leading-relaxed">
                  {t('home.hero.description')}
                </p>
              </div>
              <div className="flex flex-wrap gap-4 pt-2">
                <Link href="/shop" className="inline-flex items-center justify-center h-12 px-8 rounded-full bg-primary hover:bg-primary/90 text-white text-base font-bold transition-transform active:scale-95 shadow-lg shadow-primary/25">
                  {t('home.hero.ctaPrimary')}
                </Link>
                <Link href="/education" className="inline-flex items-center justify-center h-12 px-8 rounded-full bg-white border border-[#e7d9cf] hover:border-primary text-text-main text-base font-medium transition-colors">
                  {t('home.hero.ctaSecondary')}
                </Link>
              </div>
            </div>
            {/* Hero Image */}
            <div className="relative order-1 lg:order-2">
              <div className="aspect-[4/5] w-full rounded-xl overflow-hidden shadow-2xl relative group">
                <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent z-10"></div>
                <Image
                  src={heroImage}
                  alt="Durex Performax Mutual Pleasure"
                  fill
                  priority
                  placeholder="blur"
                  quality={85}
                  className="object-cover transition-transform duration-700 group-hover:scale-105"
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 600px"
                />
                {/* Floating Badge */}
                <div className="absolute bottom-6 left-6 z-20 bg-white/90 backdrop-blur p-4 rounded-lg shadow-lg max-w-[200px]">
                  <p className="text-xs font-bold text-primary mb-1">{t('home.hero.newArrival')}</p>
                  <p className="text-sm font-serif font-medium text-text-main">{t('home.hero.productName')}</p>
                </div>
              </div>
              {/* Decorative Circle */}
              <div className="absolute -z-10 -bottom-10 -right-10 w-64 h-64 bg-primary/10 rounded-full blur-3xl"></div>
            </div>
          </div>
        </div>
      </section>

      {/* Trust Badges */}
      <section className="py-8 bg-white border-y border-[#f3ece7]">
        <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="flex items-center gap-4 p-4 rounded-lg bg-background-light">
              <div className="flex-shrink-0 size-12 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                <CreditCard className="size-6" />
              </div>
              <div>
                <h3 className="font-bold text-text-main text-sm">{t('home.trust.cod.title')}</h3>
                <p className="text-xs text-text-muted">{t('home.trust.cod.description')}</p>
              </div>
            </div>
            <div className="flex items-center gap-4 p-4 rounded-lg bg-background-light">
              <div className="flex-shrink-0 size-12 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                <Package className="size-6" />
              </div>
              <div>
                <h3 className="font-bold text-text-main text-sm">{t('home.trust.discreet.title')}</h3>
                <p className="text-xs text-text-muted">{t('home.trust.discreet.description')}</p>
              </div>
            </div>
            <div className="flex items-center gap-4 p-4 rounded-lg bg-background-light">
              <div className="flex-shrink-0 size-12 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                <ShieldCheck className="size-6" />
              </div>
              <div>
                <h3 className="font-bold text-text-main text-sm">{t('home.trust.authentic.title')}</h3>
                <p className="text-xs text-text-muted">{t('home.trust.authentic.description')}</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Feature Section (Clinical Excellence) */}
      <section className="py-16 bg-white border-b border-[#f3ece7]">
        <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row gap-12 justify-between items-start md:items-end mb-12">
            <div className="max-w-2xl">
              <h2 className="text-3xl md:text-4xl font-serif font-bold text-text-main mb-4">{t('home.features.title')}</h2>
              <p className="text-text-muted text-lg">{t('home.features.description')}</p>
            </div>
            <Link href="/about" className="hidden md:flex items-center gap-2 text-primary font-bold hover:gap-3 transition-all">
              {t('home.features.learnMore')} <span className="material-symbols-outlined text-sm">arrow_forward</span>
            </Link>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Feature 1 */}
            <div className="group p-8 rounded-xl bg-background-light border border-[#e7d9cf] hover:border-primary/30 transition-colors">
              <div className="size-12 rounded-full bg-primary/10 flex items-center justify-center text-primary mb-6 group-hover:scale-110 transition-transform">
                <span className="material-symbols-outlined text-2xl">verified_user</span>
              </div>
              <h3 className="text-xl font-bold text-text-main mb-2">{t('home.features.dermatologist.title')}</h3>
              <p className="text-text-muted text-sm leading-relaxed">{t('home.features.dermatologist.description')}</p>
            </div>
            {/* Feature 2 */}
            <div className="group p-8 rounded-xl bg-background-light border border-[#e7d9cf] hover:border-primary/30 transition-colors">
              <div className="size-12 rounded-full bg-primary/10 flex items-center justify-center text-primary mb-6 group-hover:scale-110 transition-transform">
                <span className="material-symbols-outlined text-2xl">eco</span>
              </div>
              <h3 className="text-xl font-bold text-text-main mb-2">{t('home.features.organic.title')}</h3>
              <p className="text-text-muted text-sm leading-relaxed">{t('home.features.organic.description')}</p>
            </div>
            {/* Feature 3 */}
            <div className="group p-8 rounded-xl bg-background-light border border-[#e7d9cf] hover:border-primary/30 transition-colors">
              <div className="size-12 rounded-full bg-primary/10 flex items-center justify-center text-primary mb-6 group-hover:scale-110 transition-transform">
                <span className="material-symbols-outlined text-2xl">local_shipping</span>
              </div>
              <h3 className="text-xl font-bold text-text-main mb-2">{t('home.features.shipping.title')}</h3>
              <p className="text-text-muted text-sm leading-relaxed">{t('home.features.shipping.description')}</p>
            </div>
          </div>
          <div className="mt-8 md:hidden">
            <Link href="/about" className="flex items-center gap-2 text-primary font-bold">
              {t('home.features.learnMore')} <span className="material-symbols-outlined text-sm">arrow_forward</span>
            </Link>
          </div>
        </div>
      </section>

      {/* Carousel / Product Selection — Client Component */}
      <HomeCarousel products={featuredProducts} />

    </div>
  );
}
