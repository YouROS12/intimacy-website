"use client";

import Link from 'next/link';
import Image from 'next/image';
import { useEffect, useState, useRef } from 'react';
import { getFeaturedProducts } from '@/services/api';
import { getProductImage } from '@/utils/imageHelpers';
import { useI18n } from '@/contexts/I18nContext';
import { Product } from '@/types';
import { Package, ShieldCheck, CreditCard } from 'lucide-react';
import heroImage from '@/assets/durex-hero.png';
import { getProductSlug } from '@/utils/slugHelpers';

export default function Home() {

  const { t } = useI18n();
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([]);
  const carouselRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    getFeaturedProducts().then(setFeaturedProducts);
  }, []);

  const scrollCarousel = (direction: 'left' | 'right') => {
    if (carouselRef.current) {
      const scrollAmount = 340; // Card width + gap
      const newScrollLeft = carouselRef.current.scrollLeft + (direction === 'right' ? scrollAmount : -scrollAmount);
      carouselRef.current.scrollTo({ left: newScrollLeft, behavior: 'smooth' });
    }
  };

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
              <h2 className="text-3xl md:text-4xl font-serif font-bold text-text-main mb-4">Clinical Excellence</h2>
              <p className="text-text-muted text-lg">Scientifically formulated. Culturally rooted. We bridge the gap between ancient wisdom and modern dermatology.</p>
            </div>
            <Link href="/about" className="hidden md:flex items-center gap-2 text-primary font-bold hover:gap-3 transition-all">
              Learn about our process <span className="material-symbols-outlined text-sm">arrow_forward</span>
            </Link>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Feature 1 */}
            <div className="group p-8 rounded-xl bg-background-light border border-[#e7d9cf] hover:border-primary/30 transition-colors">
              <div className="size-12 rounded-full bg-primary/10 flex items-center justify-center text-primary mb-6 group-hover:scale-110 transition-transform">
                <span className="material-symbols-outlined text-2xl">verified_user</span>
              </div>
              <h3 className="text-xl font-bold text-text-main mb-2">Dermatologist Tested</h3>
              <p className="text-text-muted text-sm leading-relaxed">Rigorous clinical testing ensures every formula is safe, pH-balanced, and hypoallergenic for the most sensitive skin.</p>
            </div>
            {/* Feature 2 */}
            <div className="group p-8 rounded-xl bg-background-light border border-[#e7d9cf] hover:border-primary/30 transition-colors">
              <div className="size-12 rounded-full bg-primary/10 flex items-center justify-center text-primary mb-6 group-hover:scale-110 transition-transform">
                <span className="material-symbols-outlined text-2xl">eco</span>
              </div>
              <h3 className="text-xl font-bold text-text-main mb-2">Organic Ingredients</h3>
              <p className="text-text-muted text-sm leading-relaxed">Sourced directly from Moroccan cooperatives. 100% natural origins, free from parabens, sulfates, and synthetic fragrances.</p>
            </div>
            {/* Feature 3 */}
            <div className="group p-8 rounded-xl bg-background-light border border-[#e7d9cf] hover:border-primary/30 transition-colors">
              <div className="size-12 rounded-full bg-primary/10 flex items-center justify-center text-primary mb-6 group-hover:scale-110 transition-transform">
                <span className="material-symbols-outlined text-2xl">local_shipping</span>
              </div>
              <h3 className="text-xl font-bold text-text-main mb-2">Discreet Shipping</h3>
              <p className="text-text-muted text-sm leading-relaxed">Your privacy is paramount. All orders are delivered in unbranded, eco-friendly packaging with no external identifiers.</p>
            </div>
          </div>
          <div className="mt-8 md:hidden">
            <Link href="/about" className="flex items-center gap-2 text-primary font-bold">
              Learn about our process <span className="material-symbols-outlined text-sm">arrow_forward</span>
            </Link>
          </div>
        </div>
      </section>

      {/* Carousel / Product Selection */}
      <section className="py-20 bg-background-light overflow-hidden">
        <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8 mb-10 flex items-end justify-between">
          <div>
            <span className="text-primary font-bold uppercase tracking-wider text-sm">Best Sellers</span>
            <h2 className="text-3xl md:text-4xl font-serif font-bold text-text-main mt-2">Curated Selection</h2>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => scrollCarousel('left')}
              className="size-10 rounded-full border border-[#e7d9cf] flex items-center justify-center hover:bg-primary hover:border-primary hover:text-white transition-colors"
            >
              <span className="material-symbols-outlined">arrow_back</span>
            </button>
            <button
              onClick={() => scrollCarousel('right')}
              className="size-10 rounded-full border border-[#e7d9cf] flex items-center justify-center hover:bg-primary hover:border-primary hover:text-white transition-colors"
            >
              <span className="material-symbols-outlined">arrow_forward</span>
            </button>
          </div>
        </div>

        {/* Scroll Container -- Populated with Real Data */}
        <div
          ref={carouselRef}
          className="flex overflow-x-auto pb-8 px-4 sm:px-6 lg:px-40 gap-6 no-scrollbar snap-x snap-mandatory"
        >
          {featuredProducts.map((product) => (
            <Link href={`/product/${getProductSlug(product)}`} key={product.id} className="flex-none w-[280px] md:w-[320px] snap-center group">
              <div className="flex flex-col h-full bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-xl transition-shadow duration-300">
                <div className="relative aspect-[3/4] overflow-hidden bg-[#f3ece7]">
                  <div
                    className="w-full h-full bg-center bg-cover bg-no-repeat transition-transform duration-500 group-hover:scale-105"
                    style={{ backgroundImage: `url('${getProductImage(product.imageUrl)}')` }}
                  ></div>
                  <div className="absolute top-4 left-4 bg-primary text-white text-xs font-bold px-2 py-1 rounded">Best Seller</div>
                  <button className="absolute bottom-4 right-4 size-10 bg-white/90 backdrop-blur rounded-full flex items-center justify-center text-text-main shadow-md translate-y-14 group-hover:translate-y-0 transition-transform duration-300 hover:bg-primary hover:text-white">
                    <span className="material-symbols-outlined text-sm">add_shopping_cart</span>
                  </button>
                </div>
                <div className="p-5 flex flex-col gap-2">
                  <div className="flex justify-between items-start">
                    <h3 className="text-lg font-serif font-bold text-text-main group-hover:text-primary transition-colors line-clamp-1">{product.name}</h3>
                    <p className="text-primary font-bold">{product.price} MAD</p>
                  </div>
                  <p className="text-sm text-text-muted dark:text-gray-400 line-clamp-2">{product.description}</p>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>

    </div>
  );
}
