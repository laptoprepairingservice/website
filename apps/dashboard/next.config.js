// next.config.js
/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: ["@ui/shadcn", "ui"],
  async redirects() {
    return [];
  },
};

module.exports = nextConfig;
