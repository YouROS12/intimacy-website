
import Link from 'next/link';
import { getFeaturedProducts } from '@/services/api';
import { getProductImage } from '@/utils/imageHelpers';


export const revalidate = 3600; // ISR: Revalidate every hour

export default async function Home() {
  const featuredProducts = await getFeaturedProducts();

  return (
    <div className="flex flex-col min-h-screen">
      {/* Hero Section */}
      <section className="relative w-full py-12 lg:py-20 bg-background-light dark:bg-background-dark">
        <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            {/* Text Content */}
            <div className="flex flex-col gap-6 lg:gap-8 order-2 lg:order-1">
              <div className="space-y-4">
                <span className="inline-block px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-bold uppercase tracking-wider">Moroccan Heritage</span>
                <h1 className="text-5xl md:text-6xl lg:text-7xl font-serif font-medium leading-tight text-text-main dark:text-white">
                  The Art of <br /><span className="text-primary italic">Intimate Care</span>
                </h1>
                <p className="text-lg text-text-muted dark:text-gray-400 max-w-md leading-relaxed">
                  Experience the fusion of Moroccan tradition and modern clinical science. A sanctuary for your most delicate rituals.
                </p>
              </div>
              <div className="flex flex-wrap gap-4 pt-2">
                <Link href="/shop" className="inline-flex items-center justify-center h-12 px-8 rounded-full bg-primary hover:bg-primary/90 text-white text-base font-bold transition-transform active:scale-95 shadow-lg shadow-primary/25">
                  Explore the Sanctuary
                </Link>
                <Link href="/education" className="inline-flex items-center justify-center h-12 px-8 rounded-full bg-white dark:bg-gray-800 border border-[#e7d9cf] dark:border-gray-700 hover:border-primary text-text-main dark:text-white text-base font-medium transition-colors">
                  View Journal
                </Link>
              </div>
            </div>
            {/* Hero Image */}
            <div className="relative order-1 lg:order-2">
              <div className="aspect-[4/5] w-full rounded-xl overflow-hidden shadow-2xl relative group">
                <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent z-10"></div>
                <div
                  className="w-full h-full bg-center bg-cover bg-no-repeat transition-transform duration-700 group-hover:scale-105"
                  style={{ backgroundImage: "url('/durex-hero.png')" }}
                ></div>
                {/* Floating Badge */}
                <div className="absolute bottom-6 left-6 z-20 bg-white/90 dark:bg-gray-900/90 backdrop-blur p-4 rounded-lg shadow-lg max-w-[200px]">
                  <p className="text-xs font-bold text-primary mb-1">New Arrival</p>
                  <p className="text-sm font-serif font-medium text-text-main dark:text-white">Durex Performax Mutual Pleasure</p>
                </div>
              </div>
              {/* Decorative Circle */}
              <div className="absolute -z-10 -bottom-10 -right-10 w-64 h-64 bg-primary/10 rounded-full blur-3xl"></div>
            </div>
          </div>
        </div>
      </section>

      {/* Feature Section (Clinical Excellence) */}
      <section className="py-16 bg-white dark:bg-[#1a120b] border-y border-[#f3ece7] dark:border-[#3a2e26]">
        <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row gap-12 justify-between items-start md:items-end mb-12">
            <div className="max-w-2xl">
              <h2 className="text-3xl md:text-4xl font-serif font-bold text-text-main dark:text-white mb-4">Clinical Excellence</h2>
              <p className="text-text-muted dark:text-gray-400 text-lg">Scientifically formulated. Culturally rooted. We bridge the gap between ancient wisdom and modern dermatology.</p>
            </div>
            <Link href="/about" className="hidden md:flex items-center gap-2 text-primary font-bold hover:gap-3 transition-all">
              Learn about our process <span className="material-symbols-outlined text-sm">arrow_forward</span>
            </Link>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Feature 1 */}
            <div className="group p-8 rounded-xl bg-background-light dark:bg-background-dark border border-[#e7d9cf] dark:border-[#3a2e26] hover:border-primary/30 transition-colors">
              <div className="size-12 rounded-full bg-primary/10 flex items-center justify-center text-primary mb-6 group-hover:scale-110 transition-transform">
                <span className="material-symbols-outlined text-2xl">verified_user</span>
              </div>
              <h3 className="text-xl font-bold text-text-main dark:text-white mb-2">Dermatologist Tested</h3>
              <p className="text-text-muted dark:text-gray-400 text-sm leading-relaxed">Rigorous clinical testing ensures every formula is safe, pH-balanced, and hypoallergenic for the most sensitive skin.</p>
            </div>
            {/* Feature 2 */}
            <div className="group p-8 rounded-xl bg-background-light dark:bg-background-dark border border-[#e7d9cf] dark:border-[#3a2e26] hover:border-primary/30 transition-colors">
              <div className="size-12 rounded-full bg-primary/10 flex items-center justify-center text-primary mb-6 group-hover:scale-110 transition-transform">
                <span className="material-symbols-outlined text-2xl">eco</span>
              </div>
              <h3 className="text-xl font-bold text-text-main dark:text-white mb-2">Organic Ingredients</h3>
              <p className="text-text-muted dark:text-gray-400 text-sm leading-relaxed">Sourced directly from Moroccan cooperatives. 100% natural origins, free from parabens, sulfates, and synthetic fragrances.</p>
            </div>
            {/* Feature 3 */}
            <div className="group p-8 rounded-xl bg-background-light dark:bg-background-dark border border-[#e7d9cf] dark:border-[#3a2e26] hover:border-primary/30 transition-colors">
              <div className="size-12 rounded-full bg-primary/10 flex items-center justify-center text-primary mb-6 group-hover:scale-110 transition-transform">
                <span className="material-symbols-outlined text-2xl">local_shipping</span>
              </div>
              <h3 className="text-xl font-bold text-text-main dark:text-white mb-2">Discreet Shipping</h3>
              <p className="text-text-muted dark:text-gray-400 text-sm leading-relaxed">Your privacy is paramount. All orders are delivered in unbranded, eco-friendly packaging with no external identifiers.</p>
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
      <section className="py-20 bg-background-light dark:bg-background-dark overflow-hidden">
        <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8 mb-10 flex items-end justify-between">
          <div>
            <span className="text-primary font-bold uppercase tracking-wider text-sm">Best Sellers</span>
            <h2 className="text-3xl md:text-4xl font-serif font-bold text-text-main dark:text-white mt-2">Curated Selection</h2>
          </div>
          <div className="flex gap-2">
            <button className="size-10 rounded-full border border-[#e7d9cf] dark:border-gray-700 flex items-center justify-center hover:bg-primary hover:border-primary hover:text-white transition-colors">
              <span className="material-symbols-outlined">arrow_back</span>
            </button>
            <button className="size-10 rounded-full border border-[#e7d9cf] dark:border-gray-700 flex items-center justify-center hover:bg-primary hover:border-primary hover:text-white transition-colors">
              <span className="material-symbols-outlined">arrow_forward</span>
            </button>
          </div>
        </div>

        {/* Scroll Container -- Populated with Real Data */}
        <div className="flex overflow-x-auto pb-8 px-4 sm:px-6 lg:px-40 gap-6 no-scrollbar snap-x snap-mandatory">
          {featuredProducts.map((product) => (
            <Link href={`/product/${product.id}`} key={product.id} className="flex-none w-[280px] md:w-[320px] snap-center group">
              <div className="flex flex-col h-full bg-white dark:bg-[#1a120b] rounded-xl overflow-hidden shadow-sm hover:shadow-xl transition-shadow duration-300">
                <div className="relative aspect-[3/4] overflow-hidden bg-[#f3ece7]">
                  <div
                    className="w-full h-full bg-center bg-cover bg-no-repeat transition-transform duration-500 group-hover:scale-105"
                    style={{ backgroundImage: `url('${getProductImage(product.imageUrl)}')` }}
                  ></div>
                  <div className="absolute top-4 left-4 bg-primary text-white text-xs font-bold px-2 py-1 rounded">Best Seller</div>
                  <button className="absolute bottom-4 right-4 size-10 bg-white/90 dark:bg-gray-800/90 backdrop-blur rounded-full flex items-center justify-center text-text-main dark:text-white shadow-md translate-y-14 group-hover:translate-y-0 transition-transform duration-300 hover:bg-primary hover:text-white">
                    <span className="material-symbols-outlined text-sm">add_shopping_cart</span>
                  </button>
                </div>
                <div className="p-5 flex flex-col gap-2">
                  <div className="flex justify-between items-start">
                    <h3 className="text-lg font-serif font-bold text-text-main dark:text-white group-hover:text-primary transition-colors line-clamp-1">{product.name}</h3>
                    <p className="text-primary font-bold">{product.price} MAD</p>
                  </div>
                  <p className="text-sm text-text-muted dark:text-gray-400 line-clamp-2">{product.description}</p>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Testimonial / Story Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-[1280px] mx-auto">
          <div className="relative rounded-2xl overflow-hidden min-h-[500px] flex items-center justify-center text-center p-8 sm:p-16">
            {/* Background Image with Overlay */}
            <div className="absolute inset-0 z-0">
              <div className="absolute inset-0 bg-black/40 z-10"></div>
              <div
                className="w-full h-full bg-cover bg-center bg-no-repeat"
                style={{ backgroundImage: "url('https://lh3.googleusercontent.com/aida-public/AB6AXuAj6YASFp7lRrI4wBj-HPaES-HUUBvcawOV0ogb-E7LKh9JG0eoPzFfJ98aPVnV5Q9KWXMZnjYTfTWKrGrOxVav4H4D14jYghMznL8UJ7gbW-nacgt-B__EmlDS78NPOg1WwM0VM3oZaBDf063fb1Vzm6WkkhRUvzipkJSjdOjSoBCvNrgQ6n_mgre2sjGBD0cPAVF7moLY9I7gstg5chMZZ0kyBM2b5VovlqwQAcsnGpqmi4ju3wY-X-k-79WBXwcLI6x5AtlV8Lum')" }}
              ></div>
            </div>
            {/* Content */}
            <div className="relative z-20 max-w-3xl flex flex-col items-center gap-8">
              <div className="text-primary/90">
                <span className="material-symbols-outlined text-5xl">format_quote</span>
              </div>
              <blockquote className="text-3xl md:text-4xl lg:text-5xl font-serif font-medium leading-tight text-white">
                "A transcendent experience that redefined self-care for me. The balance of luxury and genuine wellness is unmatched."
              </blockquote>
              <div className="flex flex-col items-center gap-2">
                <cite className="text-white font-bold text-lg not-italic">— Sarah M.</cite>
                <span className="text-white/70 text-sm">Verified Customer</span>
              </div>
              <button className="mt-4 px-6 py-3 rounded-full bg-white/10 hover:bg-white/20 backdrop-blur-sm border border-white/30 text-white font-bold transition-all">
                Read More Stories
              </button>
            </div>
          </div>
        </div>
      </section>


    </div>
  );
}
