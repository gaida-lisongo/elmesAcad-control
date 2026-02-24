/**  @type {import('next').NextConfig} */
const nextConfig = {
    reactStrictMode: false,
    images: {
        remotePatterns: [
            {
                protocol: 'https',
                hostname: 'res.cloudinary.com',
            },
        ],
    },
    serverActions: {
        bodySizeLimit: '5mb',
    },
};

export default nextConfig;