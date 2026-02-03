
import { Metadata } from 'next';
import Link from 'next/link';
import { ArrowLeft, CheckCircle, AlertTriangle, Book, ShieldCheck } from 'lucide-react';
import { getPseoPageBySlug, getEvidencePackByProblemId, getPseoProducts } from '@/services/api';
import { Product } from '@/types';
import { notFound } from 'next/navigation';

type Props = {
    params: { slug: string };
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
    const { slug } = params;
    const pageData = await getPseoPageBySlug(slug);

    if (!pageData) {
        return {
            title: 'Page non trouvée | Intimacy Wellness Maroc',
        };
    }

    const displayTitle = pageData.title || pageData.problem?.name || "Conseil Wellness";
    const problemDesc = pageData.problem?.description || "Conseils d'experts pour votre bien-être intime.";

    return {
        title: `${displayTitle} | Intimacy Wellness Maroc`,
        description: problemDesc.substring(0, 160),
        alternates: {
            canonical: `https://intimacywellness.ma/solution/${slug}`,
        }
    };
}

export const revalidate = 3600; // Update every hour

export default async function PseoSolutionPage({ params }: Props) {
    const { slug } = await params;

    // 1. Get Page Data
    const pageData = await getPseoPageBySlug(slug);

    if (!pageData) {
        notFound();
    }

    // 2. Parallel Fetch: Products + Evidence
    const [products, evidencePack] = await Promise.all([
        getPseoProducts(pageData.problem_id),
        getEvidencePackByProblemId(pageData.problem_id)
    ]);

    // 3. Process Evidence
    let evidence: any = null;
    if (evidencePack && evidencePack.claims) {
        try {
            const rawClaims = evidencePack.claims; // It's already parsed in api.ts getEvidencePackByProblemId if JSON, 
            // wait, api.ts lines 413: claims: JSON.parse(pack.claims_json)
            // types says claims is any.
            // Let's assume api.ts returns it parsed.
            evidence = rawClaims;

            // Double check if getEvidencePackByProblemId return type has claims
        } catch (e) {
            console.error("Error processing evidence:", e);
        }
    }

    // Fallback defaults
    const displayTitle = pageData.title || pageData.problem?.name || "Conseil Wellness";
    // If evidence is available use it, otherwise fallback to description
    const displayIntro = evidence?.intro || pageData.problem?.description || "Découvrez nos conseils d'experts pour votre bien-être intime.";
    const claims = evidence?.claims || [];
    const sources = evidence?.sources || [];

    return (
        <div className="bg-white min-h-screen">
            {/* Header */}
            <div className="bg-slate-50 border-b border-slate-100 py-12 px-4">
                <div className="max-w-4xl mx-auto">
                    <Link href="/education" className="text-slate-500 hover:text-brand-600 flex items-center mb-6 text-sm">
                        <ArrowLeft className="h-4 w-4 mr-1" /> Retour aux guides
                    </Link>
                    <span className="text-brand-600 font-bold tracking-wider text-xs uppercase bg-brand-50 px-2 py-1 rounded-md mb-4 inline-block">
                        {pageData.type === 'PROBLEM' ? 'Guide Santé' : 'Solution Ciblée'}
                    </span>
                    <h1 className="text-3xl md:text-5xl font-extrabold text-slate-900 mb-6 leading-tight">
                        {displayTitle}
                    </h1>
                    <div className="flex items-center gap-4 text-sm text-slate-500">
                        <span className="flex items-center"><ShieldCheck className="h-4 w-4 mr-1 text-green-500" /> Vérifié par l'IA Researcher</span>
                        <span>•</span>
                        <span>Temps de lecture: 3 min</span>
                    </div>
                </div>
            </div>

            <div className="max-w-4xl mx-auto px-4 py-12">
                <article className="prose prose-lg prose-slate max-w-none">
                    <p className="text-xl text-slate-600 leading-relaxed font-serif">
                        {displayIntro}
                    </p>

                    <h2 className="text-2xl font-bold text-slate-900 mt-12 mb-6 flex items-center">
                        <Book className="h-6 w-6 text-brand-500 mr-2" />
                        Points clés et recommandations
                    </h2>

                    <div className="grid gap-4 not-prose mb-12">
                        {claims.length > 0 ? claims.map((claim: any, idx: number) => (
                            <div key={idx} className={`p-4 rounded-lg border-l-4 ${claim.type === 'warning' ? 'bg-orange-50 border-orange-400' :
                                claim.type === 'advice' ? 'bg-green-50 border-green-500' :
                                    'bg-blue-50 border-blue-500'
                                }`}>
                                <div className="flex items-start">
                                    {claim.type === 'warning' && <AlertTriangle className="h-5 w-5 text-orange-500 mr-3 mt-0.5" />}
                                    {claim.type === 'advice' && <CheckCircle className="h-5 w-5 text-green-500 mr-3 mt-0.5" />}
                                    {claim.type === 'fact' && <div className="h-2 w-2 rounded-full bg-blue-500 mr-3 mt-2" />}
                                    <p className="text-slate-800 font-medium">{claim.text}</p>
                                </div>
                            </div>
                        )) : (
                            <p className="text-gray-500 italic">Analyse en cours par notre moteur de recherche...</p>
                        )}
                    </div>

                    {products.length > 0 && (
                        <>
                            <h2 className="text-2xl font-bold text-slate-900 mb-8">
                                Nos solutions recommandées
                            </h2>

                            <div className="grid sm:grid-cols-2 gap-6 not-prose">
                                {products.map((prod: Product) => (
                                    <Link href={`/product/${prod.id}`} key={prod.id} className="flex bg-white border border-gray-200 rounded-xl overflow-hidden hover:shadow-lg transition-all group">
                                        <div className="w-1/3 bg-gray-100 relative">
                                            <img
                                                src={prod.imageUrl}
                                                alt={prod.name}
                                                className="absolute inset-0 w-full h-full object-cover"
                                            />
                                        </div>
                                        <div className="p-4 flex flex-col justify-center w-2/3">
                                            <span className="text-xs text-brand-600 font-bold uppercase mb-1">Expertise {pageData.category?.name || 'Wellness'}</span>
                                            <h3 className="font-bold text-gray-900 mb-2 group-hover:text-brand-600 line-clamp-2">{prod.name}</h3>
                                            <span className="text-gray-900 font-medium">{prod.price} MAD</span>
                                        </div>
                                    </Link>
                                ))}
                            </div>
                        </>
                    )}

                    {sources.length > 0 && (
                        <div className="mt-16 pt-8 border-t border-gray-100">
                            <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-4">Sources Citées</h3>
                            <ul className="text-xs text-gray-400 space-y-1">
                                {sources.map((s: string, i: number) => <li key={i}>{s}</li>)}
                            </ul>
                        </div>
                    )}
                </article>
            </div>
        </div>
    );
}
