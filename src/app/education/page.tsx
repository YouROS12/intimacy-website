
import { Metadata } from 'next';
import { getAllPseoPages, getAllPosts } from '@/services/api';
import EducationClient from '@/components/EducationClient';

export const metadata: Metadata = {
    title: "Centre d'Expertise | Intimacy Wellness Maroc",
    description: "Le hub complet pour votre santé sexuelle : Dossiers médicaux, guides pratiques et articles d'experts.",
};

export const dynamic = 'force-dynamic';

export default async function EducationPage() {
    const [guides, posts] = await Promise.all([
        getAllPseoPages(),
        getAllPosts()
    ]);

    return <EducationClient initialGuides={guides} initialPosts={posts} />;
}
