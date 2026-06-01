/** @type {import('next').NextConfig} */
const nextConfig = {
  serverExternalPackages: ['jsonwebtoken'],
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: '**' }
    ]
  }
};

export default nextConfig;
