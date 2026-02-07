
import { Metadata } from 'next';
import { getAllPseoPages, getAllPosts } from '@/services/api';
import EducationClient from '@/components/EducationClient';

export const metadata: Metadata = {
    title: "Centre d'Expertise | Intimacy Wellness Maroc",
    description: "Le hub complet pour votre santé sexuelle : Dossiers médicaux, guides pratiques et articles d'experts.",
};

export const dynamic = 'force-dynamic';

export default async function EducationPage() {
    try {
        const [guides, posts] = await Promise.all([
            getAllPseoPages().catch(e => {
                console.error("Failed to fetch PSEO pages:", e);
                return [];
            }),
            getAllPosts().catch(e => {
                console.error("Failed to fetch posts:", e);
                return [];
            })
        ]);

        // Serialize data to avoid passing complex objects or undefineds
        const safeGuides = Array.isArray(guides) ? guides : [];
        const safePosts = Array.isArray(posts) ? posts : [];

        console.log(`Fetched ${safeGuides.length} guides and ${safePosts.length} posts`);

        return <EducationClient initialGuides={safeGuides} initialPosts={safePosts} />;
    } catch (error) {
        console.error("Critical error in EducationPage:", error);
        // Return empty state instead of crashing 
        return <EducationClient initialGuides={[]} initialPosts={[]} />;
    }
}
