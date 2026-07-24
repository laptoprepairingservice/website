// next.config.js
/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: ["ui"],
  async redirects() {
    return [];
  },
};

module.exports = nextConfig;
