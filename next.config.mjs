import withPWAInit from "@ducanh2912/next-pwa";

const withPWA = withPWAInit({
    dest: "public",
    disable: process.env.NODE_ENV === "development",
    register: true,
    skipWaiting: true,
});

/** @type {import('next').NextConfig} */
const nextConfig = {
    images: {
        remotePatterns: [
            { protocol: 'https', hostname: 'lacdp.ma' },
            { protocol: 'https', hostname: 'cquuanvqjupmtevrtjvl.supabase.co' },
            { protocol: 'https', hostname: 'via.placeholder.com' },
            { protocol: 'https', hostname: 'lh3.googleusercontent.com' },
            { protocol: 'https', hostname: 'firebasestorage.googleapis.com' },
        ],
        formats: ['image/avif', 'image/webp'],
    },
    async rewrites() {
        return [
            {
                source: '/cdn/products/:path*',
                destination: 'https://cquuanvqjupmtevrtjvl.supabase.co/storage/v1/object/public/products/:path*',
            },
        ]
    },
};

import createNextIntlPlugin from 'next-intl/plugin';

const withNextIntl = createNextIntlPlugin();

export default withPWA(withNextIntl(nextConfig));
