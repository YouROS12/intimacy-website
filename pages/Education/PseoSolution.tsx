import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, CheckCircle, AlertTriangle, Book, ShieldCheck, Loader2 } from 'lucide-react';
import SeoHead from '../../components/SeoHead';
import { getPseoPageBySlug, getEvidencePackByProblemId, getPseoProducts } from '../../services/api';
import { Product } from '../../types';

const PseoSolution: React.FC = () => {
    const { slug } = useParams<{ slug: string }>();
    const [loading, setLoading] = useState(true);
    const [pageData, setPageData] = useState<any>(null);
    const [evidence, setEvidence] = useState<any>(null);
    const [products, setProducts] = useState<Product[]>([]);

    useEffect(() => {
        window.scrollTo(0, 0);
        const fetchData = async () => {
            if (!slug) return;
            setLoading(true);
            try {
                // 1. Get Page & Matrix Metadata
                const page = await getPseoPageBySlug(slug);
                if (!page) {
                    setLoading(false);
                    return;
                }
                setPageData(page);

                // 2. Get Products
                const linkedProducts = await getPseoProducts(page.problem_id);
                setProducts(linkedProducts);

                // 3. Get AI Research (Evidence)
                const evidencePack = await getEvidencePackByProblemId(page.problem_id);
                if (evidencePack && evidencePack.claims) {
                    // Normalize the AI output to our UI format
                    const aiContent = typeof evidencePack.claims === 'string'
                        ? JSON.parse(evidencePack.claims)
                        : evidencePack.claims;

                    setEvidence(aiContent);
                }
            } catch (err) {
                console.error("Error fetching PSEO data:", err);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [slug]);

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <Loader2 className="h-8 w-8 text-brand-600 animate-spin" />
            </div>
        );
    }

    if (!pageData) {
        return (
            <div className="min-h-screen flex items-center justify-center flex-col">
                <h1 className="text-2xl font-bold mb-4">Sujet non trouvé</h1>
                <Link to="/education" className="text-brand-600 hover:underline">Retour à l'éducation</Link>
            </div>
        );
    }

    // Map AI data or fallback to defaults
    const displayTitle = pageData.title || pageData.problem?.name || "Conseil Wellness";
    const displayIntro = evidence?.intro || pageData.problem?.description || "Découvrez nos conseils d'experts pour votre bien-être intime.";
    const claims = evidence?.claims || [];
    const sources = evidence?.sources || [];

    return (
        <div className="bg-white min-h-screen">
            <SeoHead title={displayTitle} description={displayIntro.substring(0, 160)} />

            {/* Header */}
            <div className="bg-slate-50 border-b border-slate-100 py-12 px-4">
                <div className="max-w-4xl mx-auto">
                    <Link to="/education" className="text-slate-500 hover:text-brand-600 flex items-center mb-6 text-sm">
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
                <div className="prose prose-lg prose-slate max-w-none">
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
                                    <Link to={`/product/${prod.id}`} key={prod.id} className="flex bg-white border border-gray-200 rounded-xl overflow-hidden hover:shadow-lg transition-all group">
                                        <div className="w-1/3 bg-gray-100">
                                            <img src={prod.imageUrl} alt={prod.name} className="w-full h-full object-cover" />
                                        </div>
                                        <div className="p-4 flex flex-col justify-center">
                                            <span className="text-xs text-brand-600 font-bold uppercase mb-1">Expertise {pageData.category?.name || 'Wellness'}</span>
                                            <h3 className="font-bold text-gray-900 mb-2 group-hover:text-brand-600">{prod.name}</h3>
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

                </div>
            </div>
        </div>
    );
};

export default PseoSolution;

