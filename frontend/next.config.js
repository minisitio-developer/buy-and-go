const isProd = process.env.NODE_ENV === 'production'

/** @type {import('next').NextConfig} */
const nextConfig = {
    output: 'standalone',
    images: {
        remotePatterns: [
            { protocol: 'https', hostname: 'cdn.eventos.ai' },
        ],
    },
    async rewrites() {
        if (isProd) return []
        return [
            { source: '/api/:path*', destination: `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000'}/api/:path*` },
        ]
    },
}
module.exports = nextConfig
