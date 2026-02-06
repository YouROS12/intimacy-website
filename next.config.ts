import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'lacdp.ma' },
      { protocol: 'https', hostname: 'cquuanvqjupmtevrtjvl.supabase.co' },
      { protocol: 'https', hostname: 'via.placeholder.com' }
    ]
  },
  async rewrites() {
    return [
      {
        source: '/cdn/products/:path*',
        destination: 'https://cquuanvqjupmtevrtjvl.supabase.co/storage/v1/object/public/products/:path*',
      },
    ]
  }
};

export default nextConfig;
