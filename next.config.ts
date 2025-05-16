
import type {NextConfig} from 'next';

/** @type {import('next').NextConfig} */
const nextConfig: NextConfig = {
  /* config options here */
  typescript: {
    ignoreBuildErrors: true, // Keep if needed for rapid prototyping
  },
  eslint: {
    ignoreDuringBuilds: true, // Keep if needed for rapid prototyping
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'placehold.co',
        port: '',
        pathname: '/**',
      },
    ],
  },
  // Future PWA configuration might go here if not using a separate package like next-pwa
  // For basic PWA with manifest.json and service worker, often no specific Next.js config is needed initially
  // unless advanced features like offline page caching strategy via service worker are managed by a Next.js plugin.
};

export default nextConfig;
