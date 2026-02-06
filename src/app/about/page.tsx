
import React from 'react';
import { Shield, Box, Lock, HelpCircle, CheckCircle } from 'lucide-react';
import Link from 'next/link';
import { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'À propos de nous | Intimacy Wellness Morocco',
    description: 'Votre partenaire de confiance pour le bien-être intime au Maroc. Livraison discrète, produits authentiques et confidentialité garantie.',
};

export default function AboutPage() {
    return (
        <div className="bg-white min-h-screen font-sans text-slate-800">
            {/* Hero */}
            <div className="relative bg-slate-900 py-20 overflow-hidden">
                <div className="absolute inset-0 opacity-20">
                    {/* Abstract pattern or gradient */}
                    <div className="absolute inset-0 bg-gradient-to-br from-slate-800 to-black" />
                </div>
                <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-white">
                    <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight mb-6">
                        Bien-être, Confidentialité & <span className="text-brand-400">Confiance</span>.
                    </h1>
                    <p className="text-xl text-slate-300 max-w-2xl mx-auto leading-relaxed">
                        Nous sommes la première destination au Maroc pour les produits de bien-être intime.
                        Nous croyons que la santé sexuelle doit être accessible, sûre et sans aucun jugement.
                    </p>
                </div>
            </div>

            {/* The 3 Pillars */}
            <div className="py-16 bg-white">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
                        <div className="text-center p-6 bg-white rounded-xl hover:shadow-lg transition-shadow border border-slate-100">
                            <div className="inline-flex items-center justify-center h-16 w-16 rounded-full bg-brand-50 text-brand-600 mb-6">
                                <Lock className="h-8 w-8" />
                            </div>
                            <h3 className="text-xl font-bold mb-3 text-slate-900">100% Privé</h3>
                            <p className="text-slate-600">
                                Vos données sont chiffrées. Nous ne vendons jamais vos informations. Votre historique de commande est strictement personnel.
                            </p>
                        </div>
                        <div className="text-center p-6 bg-white rounded-xl hover:shadow-lg transition-shadow border border-slate-100">
                            <div className="inline-flex items-center justify-center h-16 w-16 rounded-full bg-blue-50 text-blue-600 mb-6">
                                <Box className="h-8 w-8" />
                            </div>
                            <h3 className="text-xl font-bold mb-3 text-slate-900">Livraison Discrète</h3>
                            <p className="text-slate-600">
                                Livré dans un emballage standard opaque. L'étiquette est générique. Même le livreur ne connaît pas le contenu.
                            </p>
                        </div>
                        <div className="text-center p-6 bg-white rounded-xl hover:shadow-lg transition-shadow border border-slate-100">
                            <div className="inline-flex items-center justify-center h-16 w-16 rounded-full bg-green-50 text-green-600 mb-6">
                                <Shield className="h-8 w-8" />
                            </div>
                            <h3 className="text-xl font-bold mb-3 text-slate-900">Marques Authentiques</h3>
                            <p className="text-slate-600">
                                Revendeur agréé Durex, Manix et autres grandes marques mondiales. Pas de contrefaçons, jamais.
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Detailed Shipping Section */}
            <div className="bg-slate-50 py-16">
                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-12">
                        <h2 className="text-3xl font-bold text-slate-900">Comment marche notre livraison discrète</h2>
                        <p className="mt-4 text-slate-600">Nous comprenons que votre vie privée est la priorité n°1. Voici exactement ce qui se passe lors de votre commande.</p>
                    </div>

                    <div className="space-y-8 relative">
                        {/* Connecting Line (Desktop) */}
                        <div className="hidden md:block absolute left-[2.45rem] top-8 bottom-8 w-1 bg-slate-200 z-0"></div>

                        {/* Step 1 */}
                        <div className="relative z-10 bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex gap-4 md:items-center">
                            <div className="flex-shrink-0">
                                <div className="h-12 w-12 rounded-full bg-slate-900 text-white flex items-center justify-center font-bold text-lg shadow-lg">1</div>
                            </div>
                            <div>
                                <h4 className="text-lg font-bold text-slate-900">Emballage Neutre</h4>
                                <p className="text-slate-600">Vos articles sont emballés dans un carton standard ou une pochette opaque. Aucun logo "Intimacy Wellness", aucune image extérieure.</p>
                            </div>
                        </div>

                        {/* Step 2 */}
                        <div className="relative z-10 bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex gap-4 md:items-center">
                            <div className="flex-shrink-0">
                                <div className="h-12 w-12 rounded-full bg-brand-600 text-white flex items-center justify-center font-bold text-lg shadow-lg">2</div>
                            </div>
                            <div>
                                <h4 className="text-lg font-bold text-slate-900">Étiquette Générique</h4>
                                <p className="text-slate-600">L'expéditeur affiché est "IW Logistics" ou un nom de logistique générique. Le contenu est déclaré comme "Soins Personnels" ou "Accessoires".</p>
                            </div>
                        </div>

                        {/* Step 3 */}
                        <div className="relative z-10 bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex gap-4 md:items-center">
                            <div className="flex-shrink-0">
                                <div className="h-12 w-12 rounded-full bg-slate-900 text-white flex items-center justify-center font-bold text-lg shadow-lg">3</div>
                            </div>
                            <div>
                                <h4 className="text-lg font-bold text-slate-900">Livraison Privée</h4>
                                <p className="text-slate-600">Le livreur vous remet le paquet scellé. Nous supportons le Paiement à la Livraison (COD) pour que vous puissiez payer discrètement à la réception.</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* FAQ */}
            <div className="py-16 max-w-3xl mx-auto px-4">
                <h2 className="text-2xl font-bold text-slate-900 mb-8 text-center">Questions Fréquentes</h2>
                <div className="space-y-6">
                    <div className="bg-white border border-gray-200 rounded-lg p-6">
                        <h3 className="text-lg font-bold text-slate-900 flex items-start gap-3">
                            <HelpCircle className="h-6 w-6 text-brand-600 flex-shrink-0" />
                            Le livreur peut-il voir ce qu'il y a dedans ?
                        </h3>
                        <p className="mt-3 text-slate-600 pl-9">Absolument pas. Le paquet est scellé avant de quitter notre entrepôt. Le livreur n'a aucune information sur le contenu.</p>
                    </div>
                    <div className="bg-white border border-gray-200 rounded-lg p-6">
                        <h3 className="text-lg font-bold text-slate-900 flex items-start gap-3">
                            <HelpCircle className="h-6 w-6 text-brand-600 flex-shrink-0" />
                            Qu'est-ce qui apparaît sur mon relevé bancaire ?
                        </h3>
                        <p className="mt-3 text-slate-600 pl-9">Si vous payez en ligne (bientôt disponible), cela apparaîtra comme "IW Store". Cependant, nous utilisons principalement le Paiement à la Livraison (COD), donc aucune trace bancaire.</p>
                    </div>
                    <div className="bg-white border border-gray-200 rounded-lg p-6">
                        <h3 className="text-lg font-bold text-slate-900 flex items-start gap-3">
                            <HelpCircle className="h-6 w-6 text-brand-600 flex-shrink-0" />
                            Vendez-vous aux mineurs ?
                        </h3>
                        <p className="mt-3 text-slate-600 pl-9">Non. Nous vendons strictement aux adultes de 18 ans et plus. En utilisant notre site, vous confirmez être majeur.</p>
                    </div>
                </div>
            </div>

            {/* Quality Guarantee */}
            <div className="bg-white border-t border-slate-100 py-16">
                <div className="max-w-7xl mx-auto px-4 text-center">
                    <h2 className="text-2xl font-bold text-slate-900 mb-12">Notre Garantie Qualité</h2>
                    <div className="flex flex-wrap justify-center gap-8">
                        <div className="flex items-center gap-2 px-6 py-3 bg-gray-50 rounded-full text-gray-700 font-medium border border-gray-200">
                            <CheckCircle className="h-5 w-5 text-green-500" /> Produits Originaux
                        </div>
                        <div className="flex items-center gap-2 px-6 py-3 bg-gray-50 rounded-full text-gray-700 font-medium border border-gray-200">
                            <CheckCircle className="h-5 w-5 text-green-500" /> Dates d'Expiration Longues
                        </div>
                        <div className="flex items-center gap-2 px-6 py-3 bg-gray-50 rounded-full text-gray-700 font-medium border border-gray-200">
                            <CheckCircle className="h-5 w-5 text-green-500" /> Testé Cliniquement
                        </div>
                    </div>
                </div>
            </div>

            {/* CTA */}
            <div className="bg-slate-900 py-16 text-center">
                <div className="max-w-2xl mx-auto px-4">
                    <h2 className="text-3xl font-bold text-white mb-6">Prêt à commander en toute confiance ?</h2>
                    <Link href="/shop" className="inline-block bg-brand-600 text-white font-bold py-4 px-10 rounded-full hover:bg-brand-700 transition-all shadow-lg hover:shadow-brand-500/50 transform hover:-translate-y-1">
                        Voir la Boutique
                    </Link>
                </div>
            </div>
        </div>
    );
};
