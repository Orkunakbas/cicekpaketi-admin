/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  
  // Development modunda API proxy
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: 'http://localhost:3000/api/:path*',
      },
    ];
  },

  // Production build için
  ...(process.env.NODE_ENV === 'production' && {
    output: 'export',
    trailingSlash: true,
    images: {
      unoptimized: true
    },
    assetPrefix: '',
    basePath: ''
  })
};

export default nextConfig;
