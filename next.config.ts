import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'lh3.googleusercontent.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'ui-avatars.com',
        port: '',
        pathname: '/**',
      },
    ],
  },
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'Cache-Control',
            value: 'no-cache, no-store, must-revalidate',
          },
          {
            key: 'Pragma',
            value: 'no-cache',
          },
          {
            key: 'Expires',
            value: '0',
          },
        ],
      },
    ];
  },
  async redirects() {
    return [
      // Redirect unauthenticated users from protected routes
      {
        source: '/profile/:path*',
        has: [
          {
            type: 'header',
            key: 'cookie',
            value: '(?!.*next-auth.session-token)',
          },
        ],
        destination: '/auth/signin',
        permanent: false,
      },
      // Redirect authenticated users from auth pages
      {
        source: '/auth/:path*',
        has: [
          {
            type: 'header',
            key: 'cookie',
            value: 'next-auth.session-token',
          },
        ],
        destination: '/',
        permanent: false,
      },
    ];
  },
};

export default nextConfig;
