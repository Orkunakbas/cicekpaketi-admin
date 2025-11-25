/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  
  i18n: {
    locales: ['tr', 'en'],
    defaultLocale: 'tr',
    localeDetection: false
  },

  images: {
    domains: ['images.unsplash.com', 'randomuser.me', 'source.unsplash.com', 'localhost'],
    unoptimized: true
  },
  
  // API proxy (sadece development için)
  async rewrites() {
    if (process.env.NODE_ENV === 'development') {
      return [
        {
          source: '/api/:path*',
          destination: 'http://localhost:3000/api/:path*',
        },
      ];
    }
    return [];
  },

  // Production build için
  ...(process.env.NODE_ENV === 'production' && {
    trailingSlash: true
  })
};

export default nextConfig;
