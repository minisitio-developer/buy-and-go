const path = require('path');

/** @type {import('next').NextConfig} */
const nextConfig = {
    turbopack: { root: path.resolve(__dirname) },
    images: { remotePatterns: [{ protocol: 'https', hostname: 'cdn.eventos.ai' }] },
    async rewrites() {
        return [
            { source: '/api/v1/ai/:path*', destination: `${process.env.NEXT_PUBLIC_AI_URL || 'http://localhost:8000'}/v1/ai/:path*` },
            { source: '/api/v1/mcp/:path*', destination: `${process.env.NEXT_PUBLIC_AI_URL || 'http://localhost:8000'}/v1/mcp/:path*` },
            { source: '/api/:path*', destination: `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/:path*` },
        ];
    },
};
module.exports = nextConfig;
