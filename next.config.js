/** @type {import('next').NextConfig} */
const nextConfig = {
  // Railway can handle Next.js server, so no need for static export
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=0, must-revalidate',
          },
        ],
      },
    ];
  },
}

module.exports = nextConfig
