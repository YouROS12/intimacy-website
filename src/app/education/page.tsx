
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
        console.log("Fetching Education Page Data...");
        // Fetch data safely
        const [guides, posts] = await Promise.all([
            getAllPseoPages().catch(e => {
                console.error("PSEO fetch error:", e);
                return [];
            }),
            getAllPosts().catch(e => {
                console.error("Posts fetch error:", e);
                return [];
            })
        ]);

        return <EducationClient initialGuides={guides} initialPosts={posts} />;
    } catch (error) {
        console.error("Critical error in EducationPage:", error);
        return <EducationClient initialGuides={[]} initialPosts={[]} />;
    }
}
