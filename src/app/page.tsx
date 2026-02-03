import Link from 'next/link';
import { ArrowRight, Shield, Package, Lock, Droplet, Clock, Flame, Sparkles, Heart } from 'lucide-react';
import { getHomepageProducts } from '@/services/api';
import LoveAtmosphere from '@/components/LoveAtmosphere';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Intimacy Wellness Maroc | Premium Sexual Wellness',
  description: 'Livraison discrète de préservatifs, lubrifiants et sprays retardants au Maroc. Marques authentiques, emballage neutre, 100% confidentialité.',
};

export const revalidate = 3600; // ISR: Revalidate every hour

export default async function Home() {
  const featuredProducts = await getHomepageProducts();

  return (
    <div className="bg-black text-white overflow-x-hidden">
      {/* ═══════════════════════════════════════════════════════════════════════
                🔥 HERO SECTION - FULL IMMERSIVE EXPERIENCE
            ═══════════════════════════════════════════════════════════════════════ */}
      <div className="relative py-32 md:py-40 flex items-center justify-center overflow-hidden">
        {/* Animated Gradient Background */}
        <div
          className="absolute inset-0 bg-gradient-to-br from-black via-slate-900 to-brand-950 animate-gradient_shift"
          style={{ backgroundSize: '400% 400%' }}
        />

        {/* Floating Hearts Atmosphere */}
        <LoveAtmosphere />

        {/* Glowing Orbs */}
        <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-brand-500/20 rounded-full filter blur-[150px] animate-pulse_glow" />
        <div className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] bg-purple-500/20 rounded-full filter blur-[120px] animate-pulse_glow" style={{ animationDelay: '2s' }} />

        {/* Hero Content */}
        <div className="relative z-10 max-w-7xl mx-auto px-4 text-center">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-5 py-2 rounded-full bg-white/5 border border-white/10 backdrop-blur-xl mb-8 animate-reveal_up">
            <Flame className="h-4 w-4 text-brand-400" />
            <span className="text-sm font-medium text-brand-300 tracking-wide">#1 Wellness Store au Maroc</span>
            <Sparkles className="h-4 w-4 text-brand-400" />
          </div>

          {/* Main Headline */}
          <h1 className="text-5xl md:text-7xl lg:text-8xl font-black mb-6 leading-[0.95] tracking-tight">
            <span className="block animate-text_reveal" style={{ animationDelay: '0.1s' }}>
              Éveillez
            </span>
            <span
              className="block text-transparent bg-clip-text bg-gradient-to-r from-brand-400 via-pink-400 to-purple-400 animate-text_reveal"
              style={{
                animationDelay: '0.3s',
                backgroundSize: '200% auto',
              }}
            >
              Vos Sens
            </span>
          </h1>

          {/* Subheadline */}
          <p className="text-xl md:text-2xl text-slate-400 max-w-2xl mx-auto mb-12 leading-relaxed animate-reveal_up" style={{ animationDelay: '0.5s' }}>
            Produits premium. Discrétion absolue.
            <span className="block mt-2 text-white/80">Livré chez vous dans un emballage 100% neutre.</span>
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center animate-reveal_up" style={{ animationDelay: '0.7s' }}>
            <Link
              href="/shop"
              className="group relative inline-flex items-center justify-center px-10 py-5 text-lg font-bold rounded-full overflow-hidden transition-all duration-500"
            >
              {/* Glowing background */}
              <div className="absolute inset-0 bg-gradient-to-r from-brand-500 via-pink-500 to-brand-600 animate-glow rounded-full" />
              <div className="absolute inset-0 bg-gradient-to-r from-brand-500 via-pink-500 to-brand-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300" style={{ filter: 'blur(20px)' }} />
              <span className="relative z-10 flex items-center gap-2">
                Explorer la Boutique
                <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
              </span>
            </Link>
            <Link
              href="/education"
              className="inline-flex items-center justify-center px-10 py-5 text-lg font-bold rounded-full bg-white/5 border border-white/20 hover:bg-white/10 hover:border-white/30 backdrop-blur-sm transition-all duration-300"
            >
              <Heart className="h-5 w-5 mr-2 text-brand-400" />
              Centre d'Expertise
            </Link>
          </div>
        </div>
      </div>

      {/* ═══════════════════════════════════════════════════════════════════════
                🔥 PERFORMAX SPOTLIGHT - ULTRA PREMIUM SECTION
            ═══════════════════════════════════════════════════════════════════════ */}
      <div className="relative py-32 overflow-hidden">
        {/* Dark gradient background */}
        <div className="absolute inset-0 bg-gradient-to-b from-black via-slate-900 to-black" />

        {/* Animated glow behind product */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-blue-500/10 rounded-full filter blur-[200px] animate-pulse_glow" />

        <div className="relative z-10 max-w-7xl mx-auto px-4">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            {/* Left: Product Image with Glow */}
            <div className="relative group order-2 lg:order-1">
              {/* Outer glow ring */}
              <div className="absolute inset-0 bg-gradient-to-r from-blue-500 via-cyan-400 to-blue-600 rounded-3xl opacity-20 blur-3xl group-hover:opacity-40 transition-opacity duration-700 scale-110" />

              {/* Product container */}
              <div className="relative bg-gradient-to-br from-slate-800/50 to-slate-900/50 backdrop-blur-xl rounded-3xl p-8 border border-white/10 overflow-hidden">
                {/* Shimmer effect */}
                <div
                  className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent animate-shimmer"
                  style={{ backgroundSize: '200% 100%' }}
                />

                <img
                  src="/durex-performax-intense.jpg"
                  alt="Durex Performax Intense"
                  className="relative w-full max-w-xs mx-auto drop-shadow-2xl group-hover:scale-105 transition-transform duration-700 animate-float_slow"
                />
              </div>

              {/* Floating badges */}
              <div className="absolute -top-4 -right-4 px-4 py-2 bg-gradient-to-r from-pink-500 to-red-500 rounded-full text-sm font-bold shadow-lg shadow-pink-500/30 animate-float_slow">
                🔥 BEST-SELLER
              </div>
            </div>

            {/* Right: Content */}
            <div className="order-1 lg:order-2 text-left lg:text-left">
              <span className="inline-block px-4 py-1.5 rounded-full bg-pink-500/10 border border-pink-500/30 text-pink-400 text-sm font-bold tracking-wider mb-6">
                ENDURANCE & PLAISIR
              </span>

              <h2 className="text-4xl md:text-6xl font-black mb-6 leading-tight">
                Durex
                <span className="block text-transparent bg-clip-text bg-gradient-to-r from-pink-400 via-red-400 to-pink-500">
                  Performax Intense
                </span>
              </h2>

              <p className="text-xl text-slate-400 mb-8 leading-relaxed max-w-lg">
                <span className="text-white font-semibold">Une expérience plus intense pour vous deux.</span>
                <span className="block mt-3 text-lg">Gel retardant pour lui, texture perlée pour elle. 10 préservatifs.</span>
              </p>

              {/* Features */}
              <div className="grid grid-cols-2 gap-4 mb-10">
                {[
                  { icon: Clock, text: "Effet Retardant" },
                  { icon: Sparkles, text: "Texture Perlée" },
                  { icon: Shield, text: "Protection Maximale" },
                  { icon: Heart, text: "Plaisir Mutuel" },
                ].map((feature, i) => (
                  <div key={i} className="flex items-center gap-3 px-4 py-3 bg-white/5 rounded-xl border border-white/10">
                    <feature.icon className="h-5 w-5 text-pink-400" />
                    <span className="text-sm font-medium text-slate-300">{feature.text}</span>
                  </div>
                ))}
              </div>

              <Link
                href="/shop"
                className="group inline-flex items-center px-8 py-4 bg-gradient-to-r from-pink-500 to-red-500 hover:from-pink-600 hover:to-red-600 text-white rounded-full font-bold text-lg transition-all duration-300 shadow-lg shadow-pink-500/30 hover:shadow-pink-500/50"
              >
                Commander Maintenant
                <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* ═══════════════════════════════════════════════════════════════════════
                💧 LUBRICANTS - SENSUAL COLLECTION
            ═══════════════════════════════════════════════════════════════════════ */}
      <div className="relative py-32 overflow-hidden">
        {/* Gradient Background */}
        <div className="absolute inset-0 bg-gradient-to-br from-purple-950/50 via-black to-pink-950/30" />

        {/* Animated orbs */}
        <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-pink-500/10 rounded-full filter blur-[200px] animate-blob" />
        <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-purple-500/10 rounded-full filter blur-[150px] animate-blob" style={{ animationDelay: '3s' }} />

        <div className="relative z-10 max-w-7xl mx-auto px-4">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            {/* Left: Content */}
            <div className="text-left">
              <span className="inline-block px-4 py-1.5 rounded-full bg-pink-500/10 border border-pink-500/30 text-pink-400 text-sm font-bold tracking-wider mb-6">
                COLLECTION SENSUELLE
              </span>

              <h2 className="text-4xl md:text-6xl font-black mb-6 leading-tight">
                Glisse
                <span className="block text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-pink-400 to-rose-400">
                  Infinie
                </span>
              </h2>

              <p className="text-xl text-slate-400 mb-8 leading-relaxed max-w-lg">
                Lubrifiants premium à base d'eau et silicone.
                <span className="block mt-3 text-white font-semibold">
                  Confort absolu. Sensations décuplées.
                </span>
              </p>

              {/* Glowing feature cards */}
              <div className="space-y-4 mb-10">
                {[
                  { title: "Base Aqueuse", desc: "Compatible préservatifs, douceur naturelle" },
                  { title: "Base Silicone", desc: "Longue durée, idéal pour le bain" },
                ].map((item, i) => (
                  <div
                    key={i}
                    className="group relative px-6 py-4 bg-white/5 rounded-2xl border border-white/10 hover:border-pink-500/30 transition-all duration-300 overflow-hidden"
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-pink-500/0 via-pink-500/5 to-purple-500/0 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                    <h4 className="font-bold text-white mb-1">{item.title}</h4>
                    <p className="text-sm text-slate-400">{item.desc}</p>
                  </div>
                ))}
              </div>

              <Link
                href="/shop"
                className="group inline-flex items-center px-8 py-4 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white rounded-full font-bold text-lg transition-all duration-300 shadow-lg shadow-pink-500/30 hover:shadow-pink-500/50"
              >
                Voir la Collection
                <Droplet className="ml-2 h-5 w-5 group-hover:scale-110 transition-transform" />
              </Link>
            </div>

            {/* Right: Visual Grid */}
            <div className="relative">
              <div className="grid grid-cols-2 gap-6">
                <div className="relative rounded-3xl overflow-hidden group animate-float_slow p-8 bg-gradient-to-br from-purple-900/50 to-pink-900/50 backdrop-blur-sm border border-white/10">
                  <Droplet className="w-16 h-16 text-pink-400 mx-auto mb-4" />
                  <p className="text-center text-white font-bold">Base Aqueuse</p>
                  <p className="text-center text-slate-400 text-sm">Naturelle & Douce</p>
                </div>
                <div className="relative rounded-3xl overflow-hidden group animate-float_slow p-8 bg-gradient-to-br from-pink-900/50 to-purple-900/50 backdrop-blur-sm border border-white/10" style={{ animationDelay: '1s' }}>
                  <Sparkles className="w-16 h-16 text-purple-400 mx-auto mb-4" />
                  <p className="text-center text-white font-bold">Base Silicone</p>
                  <p className="text-center text-slate-400 text-sm">Longue Durée</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ═══════════════════════════════════════════════════════════════════════
                🛡️ TRUST SECTION - WHY CHOOSE US
            ═══════════════════════════════════════════════════════════════════════ */}
      <div className="relative py-32 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-black via-slate-900/50 to-black" />

        <div className="relative z-10 max-w-7xl mx-auto px-4">
          {/* Section Header */}
          <div className="text-center mb-20">
            <span className="inline-block px-4 py-1.5 rounded-full bg-white/5 border border-white/10 text-slate-400 text-sm font-medium tracking-wider mb-6">
              POURQUOI NOUS
            </span>
            <h2 className="text-4xl md:text-5xl font-black mb-6">
              Votre Confiance,
              <span className="block text-transparent bg-clip-text bg-gradient-to-r from-brand-400 to-pink-400">
                Notre Priorité
              </span>
            </h2>
          </div>

          {/* Features Grid */}
          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                icon: Package,
                color: 'from-brand-500 to-pink-500',
                title: 'Emballage 100% Discret',
                desc: 'Aucun logo, aucune marque. Le livreur ne saura jamais ce qu\'il y a dedans.'
              },
              {
                icon: Shield,
                color: 'from-blue-500 to-cyan-500',
                title: 'Marques Authentiques',
                desc: 'Durex, Manix, et autres marques internationales certifiées.'
              },
              {
                icon: Lock,
                color: 'from-purple-500 to-violet-500',
                title: 'Données Sécurisées',
                desc: 'Vos informations sont cryptées et ne sont jamais partagées.'
              }
            ].map((feature, idx) => (
              <div
                key={idx}
                className="group relative p-8 rounded-3xl bg-white/5 border border-white/10 hover:border-white/20 transition-all duration-500 overflow-hidden"
              >
                {/* Hover glow */}
                <div className={`absolute inset-0 bg-gradient-to-br ${feature.color} opacity-0 group-hover:opacity-10 transition-opacity duration-500`} />

                {/* Icon */}
                <div className={`inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br ${feature.color} mb-6 shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                  <feature.icon className="h-8 w-8 text-white" />
                </div>

                <h3 className="text-xl font-bold text-white mb-3">{feature.title}</h3>
                <p className="text-slate-400 leading-relaxed">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ═══════════════════════════════════════════════════════════════════════
                🛒 FEATURED PRODUCTS
            ═══════════════════════════════════════════════════════════════════════ */}
      <div className="relative py-32 overflow-hidden">
        <div className="absolute inset-0 bg-black" />

        <div className="relative z-10 max-w-7xl mx-auto px-4">
          {/* Header */}
          <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-16">
            <div>
              <span className="inline-block px-4 py-1.5 rounded-full bg-brand-500/10 border border-brand-500/30 text-brand-400 text-sm font-bold tracking-wider mb-4">
                TENDANCES
              </span>
              <h2 className="text-4xl md:text-5xl font-black text-white">
                Nos Best-Sellers
              </h2>
            </div>
            <Link
              href="/shop"
              className="hidden md:inline-flex items-center text-brand-400 font-semibold hover:text-brand-300 transition-colors group mt-4 md:mt-0"
            >
              Voir Tout
              <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>

          {/* Products Grid */}
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {featuredProducts.length === 0 ? (
              <div className="col-span-full text-center py-16">
                <Sparkles className="w-12 h-12 text-brand-500/50 mx-auto mb-4" />
                <p className="text-slate-400">Découvrez notre boutique</p>
                <Link href="/shop" className="inline-flex items-center text-brand-400 font-medium mt-4 hover:text-brand-300">
                  Explorer les produits <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </div>
            ) : (
              featuredProducts.map((product) => (
                <Link
                  key={product.id}
                  href={`/product/${product.id}`}
                  className="group relative bg-slate-900/50 rounded-3xl overflow-hidden border border-white/5 hover:border-brand-500/30 transition-all duration-500"
                >
                  {/* Image */}
                  <div className="relative aspect-square overflow-hidden">
                    <img
                      src={product.imageUrl}
                      alt={product.name}
                      // loading="lazy" // Native lazy loading in Next requires Image component, keeping simple img for now
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />

                    {/* Price Badge */}
                    <div className="absolute top-4 right-4 px-3 py-1.5 bg-black/60 backdrop-blur-sm rounded-full border border-white/10">
                      <span className="text-lg font-bold text-white">{product.price}</span>
                      <span className="text-sm text-slate-400 ml-1">MAD</span>
                    </div>
                  </div>

                  {/* Content */}
                  <div className="p-6">
                    <span className="text-xs font-bold text-brand-400 uppercase tracking-wider">{product.category}</span>
                    <h3 className="text-lg font-bold text-white mt-2 mb-2 group-hover:text-brand-400 transition-colors">
                      {product.name}
                    </h3>
                    <p className="text-sm text-slate-400 line-clamp-2 mb-4">{product.description}</p>

                    <div className="flex items-center text-brand-400 font-medium text-sm group-hover:translate-x-1 transition-transform">
                      Voir Détails <ArrowRight className="ml-2 h-4 w-4" />
                    </div>
                  </div>
                </Link>
              ))
            )}
          </div>

          {/* Mobile CTA */}
          <div className="mt-12 text-center md:hidden">
            <Link href="/shop" className="inline-flex items-center text-brand-400 font-semibold">
              Voir Tous les Produits <ArrowRight className="ml-2 h-5 w-5" />
            </Link>
          </div>
        </div>
      </div>

      {/* ═══════════════════════════════════════════════════════════════════════
                🚀 FINAL CTA
            ═══════════════════════════════════════════════════════════════════════ */}
      <div className="relative py-32 overflow-hidden">
        {/* Background */}
        <div className="absolute inset-0 bg-gradient-to-r from-brand-600 via-pink-600 to-purple-600 animate-gradient_shift" style={{ backgroundSize: '400% 400%' }} />
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4xIj48cGF0aCBkPSJNMzYgMzRjMC0yIDItNCAyLTRzMiAyIDIgNC0yIDQtMiA0LTItMi0yLTR6Ii8+PC9nPjwvZz48L3N2Zz4=')] opacity-30" />

        <div className="relative z-10 max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-4xl md:text-6xl font-black text-white mb-6">
            Prêt à Explorer ?
          </h2>
          <p className="text-xl text-white/80 mb-10 max-w-2xl mx-auto">
            Rejoignez des milliers de marocains qui nous font confiance pour leur bien-être intime.
          </p>
          <Link
            href="/shop"
            className="inline-flex items-center px-12 py-5 bg-white text-brand-600 rounded-full font-bold text-xl hover:bg-white/90 transition-all duration-300 shadow-2xl hover:scale-105"
          >
            Commencer vos Achats
            <ArrowRight className="ml-3 h-6 w-6" />
          </Link>
        </div>
      </div>
    </div>
  );
}
