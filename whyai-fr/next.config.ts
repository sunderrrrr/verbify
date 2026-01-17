import type {NextConfig} from "next";

const nextConfig: NextConfig = {
    reactStrictMode: false,
    devIndicators: false,
    api: {
        responseLimit: false,
        externalResolver: true,
    },
};

export default nextConfig;
