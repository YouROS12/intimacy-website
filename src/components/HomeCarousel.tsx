"use client";

import { useRef } from 'react';
import Link from 'next/link';
import { Product } from '@/types';
import { getProductImage } from '@/utils/imageHelpers';
import { getProductSlug } from '@/utils/slugHelpers';
import { useI18n } from '@/contexts/I18nContext';

interface HomeCarouselProps {
  products: Product[];
}

export default function HomeCarousel({ products }: HomeCarouselProps) {
  const carouselRef = useRef<HTMLDivElement>(null);
  const { t } = useI18n();

  const scrollCarousel = (direction: 'left' | 'right') => {
    if (carouselRef.current) {
      const scrollAmount = 340;
      const newScrollLeft = carouselRef.current.scrollLeft + (direction === 'right' ? scrollAmount : -scrollAmount);
      carouselRef.current.scrollTo({ left: newScrollLeft, behavior: 'smooth' });
    }
  };

  return (
    <section className="py-20 bg-background-light overflow-hidden">
      <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8 mb-10 flex items-end justify-between">
        <div>
          <span className="text-primary font-bold uppercase tracking-wider text-sm">{t('home.carousel.badge')}</span>
          <h2 className="text-3xl md:text-4xl font-serif font-bold text-text-main mt-2">{t('home.carousel.title')}</h2>
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

      <div
        ref={carouselRef}
        className="flex overflow-x-auto pb-8 px-4 sm:px-6 lg:px-40 gap-6 no-scrollbar snap-x snap-mandatory"
      >
        {products.map((product) => (
          <Link href={`/product/${getProductSlug(product)}`} key={product.id} className="flex-none w-[280px] md:w-[320px] snap-center group">
            <div className="flex flex-col h-full bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-xl transition-shadow duration-300">
              <div className="relative aspect-[3/4] overflow-hidden bg-[#f3ece7]">
                <div
                  className="w-full h-full bg-center bg-cover bg-no-repeat transition-transform duration-500 group-hover:scale-105"
                  style={{ backgroundImage: `url('${getProductImage(product.imageUrl)}')` }}
                ></div>
                <div className="absolute top-4 left-4 bg-primary text-white text-xs font-bold px-2 py-1 rounded">{t('home.carousel.bestSeller')}</div>
                <button className="absolute bottom-4 right-4 size-10 bg-white/90 backdrop-blur rounded-full flex items-center justify-center text-text-main shadow-md translate-y-14 group-hover:translate-y-0 transition-transform duration-300 hover:bg-primary hover:text-white">
                  <span className="material-symbols-outlined text-sm">add_shopping_cart</span>
                </button>
              </div>
              <div className="p-5 flex flex-col gap-2">
                <div className="flex justify-between items-start">
                  <h3 className="text-lg font-serif font-bold text-text-main group-hover:text-primary transition-colors line-clamp-1">{product.name}</h3>
                  <p className="text-primary font-bold">{product.price} MAD</p>
                </div>
                <p className="text-sm text-text-muted line-clamp-2">{product.description}</p>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
